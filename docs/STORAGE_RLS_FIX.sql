-- Correct Supabase Storage RLS Fix
-- Run this in your Supabase SQL editor

-- For Supabase Storage, we need to work with the storage.objects table
-- but use the correct storage policy syntax

-- First, let's check what policies exist
SELECT * FROM storage.objects LIMIT 1;

-- Create storage policies for the avatars bucket
-- These are the correct policies for Supabase Storage

-- Policy 1: Allow public to view avatars
CREATE POLICY "avatars_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Policy 2: Allow authenticated users to upload avatars
CREATE POLICY "avatars_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to update avatars
CREATE POLICY "avatars_update_policy" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete avatars
CREATE POLICY "avatars_delete_policy" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Alternative: If the above doesn't work, try this simpler approach
-- This allows all operations on the avatars bucket for authenticated users

-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "avatars_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_policy" ON storage.objects;

-- Create a single policy that allows all operations
CREATE POLICY "avatars_all_policy" ON storage.objects
FOR ALL USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
