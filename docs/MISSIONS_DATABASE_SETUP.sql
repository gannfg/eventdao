-- =====================================================
-- EventDAO Daily Missions Database Setup
-- =====================================================
-- This script adds fields and tables for the daily missions system
-- to track EVT credits and mission completions

-- Add EVT credits field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS evt_credits INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_evt_earned INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS x_account_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS x_username VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS x_connected_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;

-- Create missions table to track available missions
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  reward INTEGER NOT NULL,
  mission_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'one-time'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_missions table to track user progress
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'available', -- 'available', 'in_progress', 'completed', 'claimed'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  claimed_at TIMESTAMP,
  reward_amount INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- Create mission_completions table for historical tracking
CREATE TABLE IF NOT EXISTS mission_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_key VARCHAR(100) NOT NULL,
  completion_date DATE NOT NULL,
  reward_earned INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create evt_transactions table to track all EVT credit movements
CREATE TABLE IF NOT EXISTS evt_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- 'mission_reward', 'referral_bonus', 'manual_adjustment'
  amount INTEGER NOT NULL,
  description TEXT,
  metadata JSONB, -- Store additional data like mission_id, referral_id, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create referrals table to track referral system
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'rewarded'
  reward_given BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(referred_id)
);

-- Insert default missions
INSERT INTO missions (mission_key, title, description, icon, reward, mission_type) VALUES
  ('connect_x', 'Connect X Account', 'Link your X (Twitter) account to EventDAO profile.', '🔗', 50, 'one-time'),
  ('follow_eventdao', 'Follow @Event_DAO', 'Follow the official EventDAO account on X.', '👥', 100, 'one-time'),
  ('tweet_eventdao', 'Tweet About EventDAO', 'Post a tweet mentioning @Event_DAO and use hashtag #EventDAO.', '💬', 150, 'daily'),
  ('engage_posts', 'Engage with EventDAO Posts', 'Like or reply to any EventDAO post.', '❤️', 50, 'daily'),
  ('retweet_updates', 'Retweet EventDAO Updates', 'Retweet one of our main announcements.', '🔁', 100, 'daily'),
  ('invite_friend', 'Invite a Friend', 'Share your referral link and have 1 friend complete connect + follow missions.', '🌐', 200, 'one-time'),
  ('daily_login', 'Daily Login Bonus', 'Visit EventDAO site and log in each day.', '📆', 10, 'daily')
ON CONFLICT (mission_key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);
CREATE INDEX IF NOT EXISTS idx_mission_completions_user_id ON mission_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_completions_date ON mission_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_evt_transactions_user_id ON evt_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_missions_updated_at ON missions;
CREATE TRIGGER update_missions_updated_at
    BEFORE UPDATE ON missions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_missions_updated_at ON user_missions;
CREATE TRIGGER update_user_missions_updated_at
    BEFORE UPDATE ON user_missions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for referral code generation
DROP TRIGGER IF EXISTS generate_user_referral_code ON users;
CREATE TRIGGER generate_user_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evt_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Missions table policies (public read)
CREATE POLICY "Missions are viewable by everyone"
  ON missions FOR SELECT
  USING (true);

-- User missions policies
CREATE POLICY "Users can view their own missions"
  ON user_missions FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert their own missions"
  ON user_missions FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update their own missions"
  ON user_missions FOR UPDATE
  USING (auth.uid()::uuid = user_id);

-- Mission completions policies
CREATE POLICY "Users can view their own completions"
  ON mission_completions FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert their own completions"
  ON mission_completions FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

-- EVT transactions policies
CREATE POLICY "Users can view their own transactions"
  ON evt_transactions FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON evt_transactions FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

-- Referrals policies
CREATE POLICY "Users can view referrals they created"
  ON referrals FOR SELECT
  USING (auth.uid()::uuid = referrer_id);

CREATE POLICY "Users can view referrals they were referred by"
  ON referrals FOR SELECT
  USING (auth.uid()::uuid = referred_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid()::uuid = referrer_id);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to claim mission reward
CREATE OR REPLACE FUNCTION claim_mission_reward(
  p_user_id UUID,
  p_mission_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_mission_record RECORD;
  v_reward_amount INTEGER;
  v_result JSONB;
BEGIN
  -- Get mission details
  SELECT um.*, m.reward, m.mission_key
  INTO v_mission_record
  FROM user_missions um
  JOIN missions m ON um.mission_id = m.id
  WHERE um.user_id = p_user_id
    AND um.mission_id = p_mission_id
    AND um.status = 'completed';

  -- Check if mission exists and is completed
  IF v_mission_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Mission not found or not completed'
    );
  END IF;

  -- Update mission status to claimed
  UPDATE user_missions
  SET status = 'claimed',
      claimed_at = NOW(),
      reward_amount = v_mission_record.reward
  WHERE id = v_mission_record.id;

  -- Update user's EVT credits
  UPDATE users
  SET evt_credits = evt_credits + v_mission_record.reward,
      total_evt_earned = total_evt_earned + v_mission_record.reward
  WHERE id = p_user_id;

  -- Record EVT transaction
  INSERT INTO evt_transactions (user_id, transaction_type, amount, description, metadata)
  VALUES (
    p_user_id,
    'mission_reward',
    v_mission_record.reward,
    'Reward for completing mission: ' || v_mission_record.mission_key,
    jsonb_build_object('mission_id', p_mission_id, 'mission_key', v_mission_record.mission_key)
  );

  -- Record completion
  INSERT INTO mission_completions (user_id, mission_key, completion_date, reward_earned)
  VALUES (p_user_id, v_mission_record.mission_key, CURRENT_DATE, v_mission_record.reward);

  RETURN jsonb_build_object(
    'success', true,
    'reward', v_mission_record.reward,
    'message', 'Mission reward claimed successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award daily login bonus
CREATE OR REPLACE FUNCTION check_daily_login(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_last_login DATE;
  v_current_streak INTEGER;
  v_mission_id UUID;
BEGIN
  -- Get user's last login date
  SELECT last_login_date, login_streak
  INTO v_last_login, v_current_streak
  FROM users
  WHERE id = p_user_id;

  -- Check if already logged in today
  IF v_last_login = CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Already logged in today'
    );
  END IF;

  -- Update streak
  IF v_last_login = CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  ELSE
    v_current_streak := 1;
  END IF;

  -- Update user record
  UPDATE users
  SET last_login_date = CURRENT_DATE,
      login_streak = v_current_streak
  WHERE id = p_user_id;

  -- Get daily login mission
  SELECT id INTO v_mission_id
  FROM missions
  WHERE mission_key = 'daily_login';

  -- Mark mission as completed
  INSERT INTO user_missions (user_id, mission_id, status, completed_at)
  VALUES (p_user_id, v_mission_id, 'completed', NOW())
  ON CONFLICT (user_id, mission_id) DO UPDATE
  SET status = 'completed',
      completed_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'streak', v_current_streak,
    'message', 'Daily login recorded'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE missions IS 'Stores all available missions in the system';
COMMENT ON TABLE user_missions IS 'Tracks individual user progress on missions';
COMMENT ON TABLE mission_completions IS 'Historical record of completed missions';
COMMENT ON TABLE evt_transactions IS 'Ledger of all EVT credit movements';
COMMENT ON TABLE referrals IS 'Tracks user referrals and their status';

COMMENT ON COLUMN users.evt_credits IS 'Current EVT credit balance';
COMMENT ON COLUMN users.total_evt_earned IS 'Lifetime total EVT credits earned';
COMMENT ON COLUMN users.login_streak IS 'Number of consecutive days logged in';
COMMENT ON COLUMN users.referral_code IS 'Unique referral code for this user';

