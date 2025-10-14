-- Fix RLS policies for avatars bucket
-- Run this in your Supabase SQL editor

-- First, let's check if RLS is enabled on storage.objects
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Disable RLS on storage.objects (this will allow all operations)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled but allow avatar operations,
-- you can create specific policies instead:

-- Enable RLS (uncomment if you want to use policies instead of disabling RLS)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for avatars bucket (if any)
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;

-- Create policies for avatars bucket (uncomment if you want to use policies)
-- Allow authenticated users to upload avatars
-- CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
-- FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'avatars');

-- Allow public to view avatars
-- CREATE POLICY "Allow public to view avatars" ON storage.objects
-- FOR SELECT TO public
-- USING (bucket_id = 'avatars');

-- Allow authenticated users to update avatars
-- CREATE POLICY "Allow users to update avatars" ON storage.objects
-- FOR UPDATE TO authenticated
-- USING (bucket_id = 'avatars');

-- Allow authenticated users to delete avatars
-- CREATE POLICY "Allow users to delete avatars" ON storage.objects
-- FOR DELETE TO authenticated
-- USING (bucket_id = 'avatars');

-- Verify the changes
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';
