-- Correct way to fix RLS for Supabase Storage
-- Run this in your Supabase SQL editor

-- Create storage policies for the avatars bucket
-- These policies will allow all operations on the avatars bucket

-- Allow public to view avatars (SELECT)
CREATE POLICY "Allow public to view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars (INSERT)
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update avatars (UPDATE)
CREATE POLICY "Allow authenticated users to update avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to delete avatars (DELETE)
CREATE POLICY "Allow authenticated users to delete avatars" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%avatar%';
