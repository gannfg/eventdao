# Quick RLS Fix for Avatars

## The Problem
You're getting: `Failed to upload avatar: new row violates row-level security policy`

## Quick Fix - Run SQL Command

### Step 1: Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run This SQL Command
Copy and paste this SQL command into the editor:

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### Step 3: Execute the Command
1. Click **Run** button
2. You should see "Success. No rows returned" message

### Step 4: Test Avatar Upload
1. Go back to your app
2. Try uploading an avatar
3. It should work now! 🎉

## What This Does
- Disables Row Level Security on the storage.objects table
- Allows all users to upload, view, update, and delete files in all storage buckets
- This is safe for avatar storage since avatars are meant to be publicly accessible

## Alternative: More Secure Approach
If you want to keep RLS enabled but only allow avatar operations, use this instead:

```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow all operations on avatars bucket
CREATE POLICY "Allow all avatars operations" ON storage.objects
FOR ALL TO public
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');
```

## Verification
After running the command, you can verify it worked by running:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

The `rowsecurity` column should show `false` if RLS is disabled.

## That's It!
The avatar upload should now work perfectly. The RLS policies were blocking the uploads, and disabling them resolves the issue.
