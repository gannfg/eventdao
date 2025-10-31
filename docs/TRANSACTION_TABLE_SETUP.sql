-- Create comprehensive transactions table for EventDAO
-- This table tracks all blockchain and on-chain transactions

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User and Event references
  user_id TEXT NOT NULL,
  event_id TEXT,
  
  -- Transaction type and category
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'stake',           -- User staking tokens on authentic/hoax
    'submission',      -- User submitting an event with bond
    'reward',          -- User receiving rewards for correct verification
    'penalty',         -- User losing stakes for incorrect verification
    'bond_refund',     -- Refund of submission bond
    'evt_transfer',    -- EVT token transfer
    'sol_transfer',    -- SOL transfer
    'reputation',      -- Reputation change
    'event_resolution' -- Event resolved (affects all stakes)
  )),
  
  -- Stake information (if applicable)
  stake_type TEXT CHECK (stake_type IN ('authentic', 'hoax')),
  stake_amount DECIMAL(10,4) DEFAULT 0.0000,
  
  -- Submission bond information (if applicable)
  bond_amount DECIMAL(10,4) DEFAULT 0.0000,
  
  -- Token amounts (EVT)
  evt_amount DECIMAL(10,4) DEFAULT 0.0000,
  evt_balance_before DECIMAL(10,4) DEFAULT 0.0000,
  evt_balance_after DECIMAL(10,4) DEFAULT 0.0000,
  
  -- SOL amounts
  sol_amount DECIMAL(10,4) DEFAULT 0.0000,
  sol_balance_before DECIMAL(10,4) DEFAULT 0.0000,
  sol_balance_after DECIMAL(10,4) DEFAULT 0.0000,
  
  -- Reputation tracking
  reputation_change INTEGER DEFAULT 0,
  reputation_before INTEGER DEFAULT 0,
  reputation_after INTEGER DEFAULT 0,
  
  -- Solana blockchain info
  solana_signature TEXT,
  solana_slot BIGINT,
  solana_block_time TIMESTAMPTZ,
  
  -- Transaction status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'confirmed')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_solana_signature ON transactions(solana_signature);
CREATE INDEX IF NOT EXISTS idx_transactions_stake_type ON transactions(stake_type);

-- Add RLS policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read transactions (for transparency)
CREATE POLICY "Anyone can read transactions" ON transactions
  FOR SELECT USING (true);

-- Allow anyone to insert transactions (user can record their own transactions)
CREATE POLICY "Anyone can insert transactions" ON transactions
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update transactions (for status updates)
CREATE POLICY "Anyone can update transactions" ON transactions
  FOR UPDATE USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_transactions_updated_at_trigger
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE transactions IS 'Comprehensive transaction tracking for EventDAO platform';
COMMENT ON COLUMN transactions.transaction_type IS 'Type of transaction: stake, submission, reward, penalty, etc.';
COMMENT ON COLUMN transactions.stake_type IS 'Whether stake is for authentic or hoax';
COMMENT ON COLUMN transactions.evt_balance_before IS 'EVT token balance before transaction';
COMMENT ON COLUMN transactions.evt_balance_after IS 'EVT token balance after transaction';
COMMENT ON COLUMN transactions.sol_balance_before IS 'SOL balance before transaction';
COMMENT ON COLUMN transactions.sol_balance_after IS 'SOL balance after transaction';
COMMENT ON COLUMN transactions.reputation_change IS 'Change in reputation (+ or -)';
COMMENT ON COLUMN transactions.solana_signature IS 'Solana blockchain transaction signature';
COMMENT ON COLUMN transactions.metadata IS 'Additional transaction metadata in JSON format';

