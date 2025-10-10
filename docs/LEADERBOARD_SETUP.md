# Leaderboard Supabase Setup

## Database Schema Updates

Run the following SQL commands in your Supabase SQL Editor to add the leaderboard tracking fields to the `users` table:

```sql
-- Add leaderboard tracking columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_accuracy DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_sol_bonds DECIMAL(10,4) DEFAULT 0.0000,
ADD COLUMN IF NOT EXISTS total_evt_profit DECIMAL(10,4) DEFAULT 0.0000,
ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_staked DECIMAL(10,4) DEFAULT 0.0000;

-- Update existing users to have default values
UPDATE users 
SET 
  verification_wins = 0,
  verification_losses = 0,
  verification_accuracy = 0.00,
  total_sol_bonds = 0.0000,
  total_evt_profit = 0.0000,
  reputation = 0,
  total_staked = 0.0000
WHERE verification_wins IS NULL OR reputation IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_verification_wins ON users(verification_wins);
CREATE INDEX IF NOT EXISTS idx_users_verification_accuracy ON users(verification_accuracy);
CREATE INDEX IF NOT EXISTS idx_users_total_sol_bonds ON users(total_sol_bonds);
CREATE INDEX IF NOT EXISTS idx_users_total_evt_profit ON users(total_evt_profit);
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation);
CREATE INDEX IF NOT EXISTS idx_users_total_staked ON users(total_staked);

-- Update RLS policies to allow reading leaderboard data
DROP POLICY IF EXISTS "Users can read leaderboard data" ON users;
CREATE POLICY "Users can read leaderboard data" ON users
  FOR SELECT USING (true);

-- Allow users to update their own leaderboard stats
DROP POLICY IF EXISTS "Users can update own leaderboard stats" ON users;
CREATE POLICY "Users can update own leaderboard stats" ON users
  FOR UPDATE USING (auth.uid()::text = id OR auth.role() = 'service_role');
```

## Sample Data for Testing

After running the schema updates, you can add some sample data for testing:

```sql
-- Insert sample users with leaderboard data
INSERT INTO users (
  id,
  wallet_address,
  username,
  reputation,
  total_staked,
  total_verified,
  verification_wins,
  verification_losses,
  verification_accuracy,
  total_sol_bonds,
  total_evt_profit,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  'TopVerifier',
  1250,
  50.5,
  26,
  24,
  2,
  92.31,
  0.0000,
  0.0000,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  'EventAuthor',
  1100,
  25.0,
  15,
  18,
  3,
  85.71,
  12.5000,
  0.0000,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
  'ProfitMaker',
  980,
  100.0,
  20,
  22,
  1,
  95.65,
  0.0000,
  45.7500,
  NOW(),
  NOW()
);
```

## Leaderboard Service Integration

The leaderboard service will automatically:

1. **Track Verification Stats**: When users verify events correctly/incorrectly
2. **Track SOL Bonds**: When users submit events with SOL bonds
3. **Track EVT Profit**: When users earn EVT from successful stakes
4. **Calculate Accuracy**: Automatically calculate verification accuracy percentage

## Usage Examples

```typescript
// Update verification stats when user verifies an event
await leaderboardService.updateVerificationStats(userId, true); // true = win

// Update SOL bonds when user submits an event
await leaderboardService.updateSolBonds(userId, 2.5); // 2.5 SOL bond

// Update EVT profit when user earns from staking
await leaderboardService.updateEvtProfit(userId, 15.75); // 15.75 EVT profit
```

## Troubleshooting

If you encounter 400 errors:

1. **Check Column Names**: Ensure all columns exist in the users table
2. **Check Data Types**: Verify column data types match the expected types
3. **Check RLS Policies**: Ensure RLS policies allow reading the data
4. **Check Indexes**: Verify indexes are created for performance

## Performance Optimization

The leaderboard queries are optimized with:
- Indexes on frequently queried columns
- Efficient ORDER BY clauses
- LIMIT clauses to prevent large result sets
- Aggregation queries for summary statistics
