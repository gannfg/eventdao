-- Fix Row-Level Security (RLS) policies for staking and EVT credits tables
-- Since the app uses custom user IDs (not Supabase Auth), we need to allow anon role access

-- ============================================
-- EVT CREDITS TABLE POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.evt_credits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "evt_credits_select_anon" ON public.evt_credits;
DROP POLICY IF EXISTS "evt_credits_insert_anon" ON public.evt_credits;
DROP POLICY IF EXISTS "evt_credits_update_anon" ON public.evt_credits;

-- Allow anonymous users to SELECT their own credits
-- Note: In a production app, you might want to restrict this more, but since
-- user_id is a UUID from the users table (not auth.uid()), we allow broader access
CREATE POLICY "evt_credits_select_anon"
ON public.evt_credits
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to INSERT new credit records
CREATE POLICY "evt_credits_insert_anon"
ON public.evt_credits
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users to UPDATE their own credits
CREATE POLICY "evt_credits_update_anon"
ON public.evt_credits
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- ============================================
-- STAKES TABLE POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.stakes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "stakes_select_anon" ON public.stakes;
DROP POLICY IF EXISTS "stakes_insert_anon" ON public.stakes;
DROP POLICY IF EXISTS "stakes_update_anon" ON public.stakes;

-- Allow anonymous users to SELECT stakes
CREATE POLICY "stakes_select_anon"
ON public.stakes
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to INSERT new stakes
CREATE POLICY "stakes_insert_anon"
ON public.stakes
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users to UPDATE stakes
CREATE POLICY "stakes_update_anon"
ON public.stakes
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- ============================================
-- NOTES
-- ============================================
-- These policies allow the 'anon' role (public/anonymous users) to:
-- - Read all records (SELECT)
-- - Insert new records (INSERT)
-- - Update records (UPDATE)
--
-- This is necessary because:
-- 1. The app uses custom user IDs (UUIDs from users table), not Supabase Auth
-- 2. The app uses the anon key, not authenticated Supabase Auth tokens
-- 3. We can't use auth.uid() checks since users aren't authenticated via Supabase Auth
--
-- For enhanced security in production, consider:
-- 1. Implementing server-side validation to ensure users can only modify their own data
-- 2. Using Supabase Auth with wallet-based authentication
-- 3. Adding service role key for backend operations
-- 4. Implementing rate limiting

