-- Quick DAO Voting Test Setup
-- Run this to quickly set up test data for DAO voting

-- ==========================================
-- OPTION 1: Update First Available Event
-- ==========================================
-- This will update the first event in your database to be ready for DAO voting

UPDATE events 
SET 
  -- Set event date to 50 hours ago (past 48-hour auto-verification threshold)
  date = NOW() - INTERVAL '50 hours',
  
  -- Add AI verification results
  ai_verification_result = 'true',
  ai_verification_confidence = 87.5,
  ai_verification_timestamp = NOW() - INTERVAL '1 hour',
  
  -- Open verification window for DAO votes
  verification_window_open = true,
  resolution_status = 'ai_verifying',
  
  -- Set end time for staking
  end_time = NOW() - INTERVAL '48 hours',
  
  -- Initialize vote counts
  true_votes = 0,
  false_votes = 0
WHERE id IN (
  SELECT id FROM events 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- ==========================================
-- OPTION 2: Add Sample Votes (Optional)
-- ==========================================
-- Uncomment this section to add some dummy votes to see voting statistics

/*
-- Get the event ID we just updated
DO $$
DECLARE
  test_event_id TEXT;
  first_user_id TEXT;
BEGIN
  -- Get the updated event
  SELECT id INTO test_event_id
  FROM events
  WHERE ai_verification_result = 'true'
  ORDER BY ai_verification_timestamp DESC
  LIMIT 1;

  -- Get a user ID
  SELECT id INTO first_user_id
  FROM users
  LIMIT 1;

  IF test_event_id IS NOT NULL AND first_user_id IS NOT NULL THEN
    -- Insert a sample vote (will be ignored if user already voted)
    INSERT INTO verification_votes (user_id, event_id, vote, evt_stake)
    VALUES (first_user_id, test_event_id, 'true', 50.00)
    ON CONFLICT (user_id, event_id) DO NOTHING;

    -- Update vote counts
    UPDATE events
    SET 
      true_votes = (SELECT COUNT(*) FROM verification_votes WHERE event_id = test_event_id AND vote = 'true'),
      false_votes = (SELECT COUNT(*) FROM verification_votes WHERE event_id = test_event_id AND vote = 'false')
    WHERE id = test_event_id;

    RAISE NOTICE 'Added sample vote to event: %', test_event_id;
  END IF;
END $$;
*/

-- ==========================================
-- VERIFY TEST DATA
-- ==========================================
-- Run this query to see which events are ready for DAO voting:

SELECT 
  id,
  title,
  date as event_date,
  ai_verification_result as ai_result,
  ai_verification_confidence as ai_confidence,
  verification_window_open,
  resolution_status,
  true_votes,
  false_votes,
  (SELECT COUNT(*) FROM verification_votes WHERE event_id = e.id) as total_dao_votes,
  ai_verification_timestamp as verified_at
FROM events e
WHERE ai_verification_result IS NOT NULL
  AND verification_window_open = true
ORDER BY ai_verification_timestamp DESC;

-- ==========================================
-- QUICK RESET (Optional)
-- ==========================================
-- Uncomment to reset an event back to pending state:

/*
UPDATE events 
SET 
  ai_verification_result = NULL,
  ai_verification_confidence = NULL,
  ai_verification_timestamp = NULL,
  verification_window_open = false,
  resolution_status = 'pending',
  true_votes = 0,
  false_votes = 0
WHERE title = 'Your Event Title Here';
*/

