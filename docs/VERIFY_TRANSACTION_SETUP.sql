-- Verification queries for Transaction Table Setup
-- Run these queries in your Supabase SQL Editor to verify the setup

-- 1. Check if the transactions table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'transactions';

-- 2. Check the table structure (all columns)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'transactions'
ORDER BY ordinal_position;

-- 3. Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'transactions';

-- 4. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'transactions';

-- 5. Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
  AND event_object_table = 'transactions';

-- 6. Test insert (should succeed)
INSERT INTO transactions (
  user_id,
  event_id,
  transaction_type,
  stake_type,
  stake_amount,
  evt_amount,
  evt_balance_before,
  evt_balance_after,
  sol_amount,
  sol_balance_before,
  sol_balance_after,
  reputation_change,
  reputation_before,
  reputation_after,
  status,
  description
) VALUES (
  'test_user_id',
  'test_event_id',
  'stake',
  'authentic',
  100.0,
  100.0,
  500.0,
  400.0,
  0.0,
  10.5,
  10.5,
  0,
  100,
  100,
  'completed',
  'Test transaction'
);

-- 7. Verify the insert worked
SELECT * FROM transactions WHERE user_id = 'test_user_id';

-- 8. Clean up test data
DELETE FROM transactions WHERE user_id = 'test_user_id';

-- Expected Results:
-- ✅ Query 1: Should return 'transactions' table
-- ✅ Query 2: Should show 25+ columns
-- ✅ Query 3: Should show 6+ indexes
-- ✅ Query 4: Should show 3 RLS policies
-- ✅ Query 5: Should show 1 trigger (update_updated_at)
-- ✅ Query 6: Should insert successfully
-- ✅ Query 7: Should return the test transaction
-- ✅ Query 8: Should delete test data

