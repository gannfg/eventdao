-- EventDAO EVT Staking and Verification System Setup
-- This creates all necessary tables for the staking and verification system

-- ==========================================
-- 1. EVT CREDITS TABLE (Off-chain points)
-- ==========================================
CREATE TABLE IF NOT EXISTS evt_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evt_credits_user_id ON evt_credits(user_id);
CREATE INDEX idx_evt_credits_balance ON evt_credits(balance DESC);

-- ==========================================
-- 2. STAKES TABLE (Individual stakes)
-- ==========================================
CREATE TABLE IF NOT EXISTS stakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  stake_type TEXT NOT NULL CHECK (stake_type IN ('true', 'false')),
  evt_amount DECIMAL(10,2) NOT NULL,
  session_type TEXT DEFAULT 'stake' CHECK (session_type IN ('stake', 'verification')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate stakes per user/event
  UNIQUE(user_id, event_id, session_type)
);

CREATE INDEX idx_stakes_user_id ON stakes(user_id);
CREATE INDEX idx_stakes_event_id ON stakes(event_id);
CREATE INDEX idx_stakes_status ON stakes(status);
CREATE INDEX idx_stakes_created_at ON stakes(created_at DESC);

-- ==========================================
-- 3. UPDATE EVENTS TABLE
-- ==========================================
-- Add new columns to existing events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resolution_status TEXT DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'collecting_votes', 'ai_verifying', 'resolved', 'disputed')),
ADD COLUMN IF NOT EXISTS true_votes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS false_votes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS true_stake_total DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS false_stake_total DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS ai_verification_result TEXT,
ADD COLUMN IF NOT EXISTS ai_verification_confidence DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS ai_verification_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS final_result TEXT CHECK (final_result IN ('true', 'false', 'disputed', 'pending')),
ADD COLUMN IF NOT EXISTS staking_window_open BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS verification_window_open BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_events_resolution_status ON events(resolution_status);
CREATE INDEX IF NOT EXISTS idx_events_final_result ON events(final_result);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);

-- ==========================================
-- 4. VERIFICATION VOTES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS verification_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('true', 'false')),
  evt_stake DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate votes per user/event
  UNIQUE(user_id, event_id)
);

CREATE INDEX idx_verification_votes_user_id ON verification_votes(user_id);
CREATE INDEX idx_verification_votes_event_id ON verification_votes(event_id);
CREATE INDEX idx_verification_votes_vote ON verification_votes(vote);

-- ==========================================
-- 5. RESOLUTION HISTORY TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS resolution_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  resolution_type TEXT NOT NULL CHECK (resolution_type IN ('ai', 'dao', 'manual')),
  result TEXT NOT NULL CHECK (result IN ('true', 'false', 'disputed')),
  ai_verification_used BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(5,2),
  ai_response JSONB,
  dao_vote_majority TEXT,
  winning_side TEXT NOT NULL,
  total_rewards_distributed DECIMAL(10,2) DEFAULT 0.00,
  total_users_rewarded INTEGER DEFAULT 0,
  resolved_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resolution_history_event_id ON resolution_history(event_id);
CREATE INDEX idx_resolution_history_created_at ON resolution_history(created_at DESC);

-- ==========================================
-- 6. RLS POLICIES
-- ==========================================

-- EVT Credits
ALTER TABLE evt_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read evt credits" ON evt_credits FOR SELECT USING (true);
CREATE POLICY "Anyone can insert evt credits" ON evt_credits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update evt credits" ON evt_credits FOR UPDATE USING (true);

-- Stakes
ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read stakes" ON stakes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert stakes" ON stakes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update stakes" ON stakes FOR UPDATE USING (true);

-- Verification Votes
ALTER TABLE verification_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read verification votes" ON verification_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert verification votes" ON verification_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update verification votes" ON verification_votes FOR UPDATE USING (true);

-- Resolution History
ALTER TABLE resolution_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read resolution history" ON resolution_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert resolution history" ON resolution_history FOR INSERT WITH CHECK (true);

-- ==========================================
-- 7. FUNCTIONS AND TRIGGERS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_evt_credits_updated_at BEFORE UPDATE ON evt_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stakes_updated_at BEFORE UPDATE ON stakes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update event stake totals when stake is created
CREATE OR REPLACE FUNCTION update_event_stake_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stake_type = 'true' THEN
    UPDATE events 
    SET true_stake_total = true_stake_total + NEW.evt_amount,
        authentic_stake = authentic_stake + NEW.evt_amount
    WHERE id::TEXT = NEW.event_id;
  ELSIF NEW.stake_type = 'false' THEN
    UPDATE events 
    SET false_stake_total = false_stake_total + NEW.evt_amount,
        hoax_stake = hoax_stake + NEW.evt_amount
    WHERE id::TEXT = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_stakes AFTER INSERT ON stakes
  FOR EACH ROW EXECUTE FUNCTION update_event_stake_totals();

-- Auto-update event vote counts when verification vote is created
CREATE OR REPLACE FUNCTION update_event_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vote = 'true' THEN
    UPDATE events SET true_votes = true_votes + 1 WHERE id::TEXT = NEW.event_id;
  ELSIF NEW.vote = 'false' THEN
    UPDATE events SET false_votes = false_votes + 1 WHERE id::TEXT = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_votes AFTER INSERT ON verification_votes
  FOR EACH ROW EXECUTE FUNCTION update_event_vote_counts();

-- ==========================================
-- 8. INITIAL DATA SETUP
-- ==========================================

-- Grant default EVT credits to existing users
-- Note: This will only insert for users who don't already have credits
-- The WHERE clause prevents duplicates, so ON CONFLICT is not needed
INSERT INTO evt_credits (user_id, balance, total_earned)
SELECT id, 100.00, 100.00
FROM users
WHERE id NOT IN (SELECT user_id FROM evt_credits);

-- ==========================================
-- 9. VIEWS FOR ANALYTICS
-- ==========================================

-- View: User staking summary
CREATE OR REPLACE VIEW user_staking_summary AS
SELECT 
  s.user_id,
  COUNT(*) as total_stakes,
  SUM(CASE WHEN s.status = 'won' THEN s.evt_amount ELSE 0 END) as total_winnings,
  SUM(CASE WHEN s.status = 'lost' THEN s.evt_amount ELSE 0 END) as total_losses,
  SUM(CASE WHEN s.status = 'active' THEN s.evt_amount ELSE 0 END) as active_stakes,
  COUNT(CASE WHEN s.status = 'won' THEN 1 END) as wins,
  COUNT(CASE WHEN s.status = 'lost' THEN 1 END) as losses
FROM stakes s
GROUP BY s.user_id;

-- View: Event resolution summary
CREATE OR REPLACE VIEW event_resolution_summary AS
SELECT 
  e.id,
  e.title,
  e.resolution_status,
  e.final_result,
  e.true_votes,
  e.false_votes,
  e.true_stake_total,
  e.false_stake_total,
  rh.total_rewards_distributed,
  rh.total_users_rewarded,
  rh.created_at as resolved_at
FROM events e
LEFT JOIN resolution_history rh ON e.id::TEXT = rh.event_id
WHERE e.resolution_status = 'resolved';

COMMENT ON TABLE evt_credits IS 'Off-chain EVT credit balances for users';
COMMENT ON TABLE stakes IS 'Individual stakes made by users on events';
COMMENT ON TABLE verification_votes IS 'Votes cast during verification phase';
COMMENT ON TABLE resolution_history IS 'History of event resolutions';

