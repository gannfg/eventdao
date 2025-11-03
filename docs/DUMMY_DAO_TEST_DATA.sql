-- Dummy Data for Testing DAO Voting Phase
-- This script creates test events with AI verification completed

-- ==========================================
-- 1. CREATE TEST EVENT WITH AI VERIFICATION
-- ==========================================

-- First, get an existing event or create a test one
-- Option A: Update an existing event
-- Replace 'your_event_id_here' with an actual event ID from your events table

-- Update existing event to have AI verification
UPDATE events 
SET 
  ai_verification_result = 'true',
  ai_verification_confidence = 87.5,
  ai_verification_timestamp = NOW() - INTERVAL '1 hour',
  verification_window_open = true,
  resolution_status = 'ai_verifying',
  date = NOW() - INTERVAL '50 hours' -- 50 hours ago (past 48-hour mark)
WHERE id IN (
  SELECT id FROM events LIMIT 1
);

-- Option B: Create a new test event (if you want a dedicated test event)
-- Note: Adjust columns based on your events table schema
INSERT INTO events (
  id,
  title,
  description,
  event_url,
  date,
  location,
  category,
  status,
  authentic_stake,
  hoax_stake,
  bond,
  media_files,
  user_id,
  created_at,
  updated_at,
  -- New columns for staking/verification
  start_time,
  end_time,
  verification_end_time,
  resolution_status,
  true_votes,
  false_votes,
  true_stake_total,
  false_stake_total,
  ai_verification_result,
  ai_verification_confidence,
  ai_verification_timestamp,
  final_result,
  staking_window_open,
  verification_window_open
)
SELECT 
  gen_random_uuid(),
  'Test Event for DAO Voting',
  'This is a test event to verify the DAO voting functionality. The AI has analyzed this event and determined it is TRUE with 87.5% confidence.',
  'https://example.com/test-event',
  NOW() - INTERVAL '50 hours', -- Event date was 50 hours ago
  'Test Location',
  'Conference',
  'active',
  150.00,
  50.00,
  0.1,
  ARRAY[]::TEXT[],
  COALESCE((SELECT id FROM users LIMIT 1), 'test-user-id'),
  NOW() - INTERVAL '3 days',
  NOW(),
  -- New columns
  NOW() - INTERVAL '50 hours',
  NOW() - INTERVAL '48 hours', -- End time 48 hours ago
  NOW() + INTERVAL '7 days', -- Verification window ends in 7 days
  'ai_verifying', -- AI has verified, now waiting for DAO votes
  0, -- No votes yet
  0,
  150.00,
  50.00,
  'true', -- AI verification result
  87.5, -- Confidence level
  NOW() - INTERVAL '1 hour', -- Verified 1 hour ago
  'pending', -- Not yet resolved
  false, -- Staking closed (past event date)
  true -- Verification window open for DAO votes
WHERE NOT EXISTS (
  SELECT 1 FROM events WHERE title = 'Test Event for DAO Voting'
)
RETURNING id;

-- ==========================================
-- 2. CREATE DUMMY EVT CREDITS FOR TESTING
-- ==========================================

-- Grant EVT credits to existing users (if they don't have any)
INSERT INTO evt_credits (user_id, balance, total_earned)
SELECT 
  id,
  500.00, -- Start with 500 EVT for testing
  500.00
FROM users
WHERE id NOT IN (SELECT user_id FROM evt_credits)
LIMIT 10; -- Limit to first 10 users

-- ==========================================
-- 3. CREATE DUMMY VERIFICATION VOTES
-- ==========================================

-- Get the event ID we just created/updated
-- Add some sample votes to show voting statistics

-- First, let's get an event ID that has AI verification
DO $$
DECLARE
  test_event_id TEXT;
  test_user_ids TEXT[];
BEGIN
  -- Get an event with AI verification
  SELECT id INTO test_event_id
  FROM events
  WHERE ai_verification_result IS NOT NULL
  LIMIT 1;

  -- Get some user IDs
  SELECT ARRAY_AGG(id) INTO test_user_ids
  FROM users
  LIMIT 5;

  -- Insert sample TRUE votes
  IF test_event_id IS NOT NULL AND test_user_ids IS NOT NULL THEN
    -- Delete existing votes for this event first (optional)
    DELETE FROM verification_votes WHERE event_id = test_event_id;

    -- Insert TRUE votes
    INSERT INTO verification_votes (user_id, event_id, vote, evt_stake)
    SELECT 
      unnest(test_user_ids[1:3]), -- First 3 users vote TRUE
      test_event_id,
      'true',
      50.00
    ON CONFLICT (user_id, event_id) DO NOTHING;

    -- Insert FALSE votes (if we have more users)
    IF array_length(test_user_ids, 1) >= 5 THEN
      INSERT INTO verification_votes (user_id, event_id, vote, evt_stake)
      SELECT 
        unnest(test_user_ids[4:5]), -- Last 2 users vote FALSE
        test_event_id,
        'false',
        25.00
      ON CONFLICT (user_id, event_id) DO NOTHING;
    END IF;

    -- Update event vote counts
    UPDATE events
    SET 
      true_votes = (SELECT COUNT(*) FROM verification_votes WHERE event_id = test_event_id AND vote = 'true'),
      false_votes = (SELECT COUNT(*) FROM verification_votes WHERE event_id = test_event_id AND vote = 'false')
    WHERE id = test_event_id;

    RAISE NOTICE 'Test event ID: %', test_event_id;
    RAISE NOTICE 'Added sample votes to test event';
  ELSE
    RAISE NOTICE 'No test event or users found. Please create events and users first.';
  END IF;
END $$;

-- ==========================================
-- 4. CREATE TEST STAKES FOR VERIFICATION
-- ==========================================

-- Add verification stakes for the votes we just created
DO $$
DECLARE
  test_event_id TEXT;
BEGIN
  SELECT id INTO test_event_id
  FROM events
  WHERE ai_verification_result IS NOT NULL
  LIMIT 1;

  IF test_event_id IS NOT NULL THEN
    -- Create verification stakes for existing votes
    INSERT INTO stakes (user_id, event_id, stake_type, evt_amount, session_type, status)
    SELECT 
      v.user_id,
      v.event_id,
      v.vote,
      v.evt_stake,
      'verification',
      'active'
    FROM verification_votes v
    WHERE v.event_id = test_event_id
      AND NOT EXISTS (
        SELECT 1 FROM stakes s
        WHERE s.user_id = v.user_id
          AND s.event_id = v.event_id
          AND s.session_type = 'verification'
      );

    RAISE NOTICE 'Created verification stakes for test event';
  END IF;
END $$;

-- ==========================================
-- 5. VIEW TEST DATA
-- ==========================================

-- View events ready for DAO voting
SELECT 
  id,
  title,
  date,
  ai_verification_result,
  ai_verification_confidence,
  ai_verification_timestamp,
  verification_window_open,
  resolution_status,
  true_votes,
  false_votes,
  (SELECT COUNT(*) FROM verification_votes WHERE event_id = e.id) as total_votes
FROM events e
WHERE ai_verification_result IS NOT NULL
  AND verification_window_open = true
ORDER BY ai_verification_timestamp DESC;

-- View verification votes for test event
SELECT 
  v.*,
  u.username,
  u.wallet_address
FROM verification_votes v
LEFT JOIN users u ON v.user_id = u.id
WHERE v.event_id IN (
  SELECT id FROM events 
  WHERE ai_verification_result IS NOT NULL 
  LIMIT 1
)
ORDER BY v.created_at DESC;

-- ==========================================
-- 6. CLEANUP (Optional - Run this to reset test data)
-- ==========================================

-- Uncomment below to clean up test data:

-- DELETE FROM verification_votes WHERE event_id IN (
--   SELECT id FROM events WHERE title = 'Test Event for DAO Voting'
-- );
-- 
-- DELETE FROM stakes WHERE event_id IN (
--   SELECT id FROM events WHERE title = 'Test Event for DAO Voting'
-- );
-- 
-- UPDATE events 
-- SET 
--   ai_verification_result = NULL,
--   ai_verification_confidence = NULL,
--   ai_verification_timestamp = NULL,
--   verification_window_open = false,
--   resolution_status = 'pending'
-- WHERE title = 'Test Event for DAO Voting';

