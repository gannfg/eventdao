-- Migration to add avatar_url column to users table
-- Run this in your Supabase SQL editor

-- Add avatar_url column to users table
ALTER TABLE users 
ADD COLUMN avatar_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN users.avatar_url IS 'URL to user profile avatar image stored in Supabase Storage';

-- Create storage bucket for avatars (run this in Supabase Storage)
-- Note: You'll need to create this bucket manually in the Supabase dashboard
-- Bucket name: 'avatars'
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

-- Set up RLS (Row Level Security) for the avatars bucket
-- This allows users to upload their own avatars but not others
-- Note: You'll need to set this up in the Supabase dashboard under Storage > Policies

-- Example policy for avatars bucket:
-- Policy name: "Users can upload their own avatars"
-- Policy type: INSERT
-- Policy definition: 
--   (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])

-- Policy name: "Users can view all avatars"
-- Policy type: SELECT  
-- Policy definition:
--   (bucket_id = 'avatars')

-- Policy name: "Users can update their own avatars"
-- Policy type: UPDATE
-- Policy definition:
--   (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])

-- Policy name: "Users can delete their own avatars"  
-- Policy type: DELETE
-- Policy definition:
--   (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
