# RLS Policy Setup for Avatars Bucket

## The Problem
You're getting this error: `Failed to upload avatar: new row violates row-level security policy`

This happens because the Supabase storage bucket has Row Level Security (RLS) policies that are blocking file uploads.

## Quick Fix - Disable RLS (Easiest)

### Option 1: Disable RLS for the avatars bucket
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** → **avatars** bucket
4. Click on the **Settings** tab
5. Find **Row Level Security** section
6. **Uncheck** "Enable RLS" 
7. Click **Save**

This will allow all users to upload and view avatars without restrictions.

## Advanced Fix - Set Up Proper RLS Policies

If you want to keep RLS enabled for security, you need to create specific policies:

### Step 1: Create Upload Policy
1. Go to **Storage** → **avatars** bucket
2. Click on the **Policies** tab
3. Click **New Policy**
4. Select **For full customization**
5. Fill in the details:
   - **Policy name**: `Allow authenticated users to upload avatars`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **Policy definition**:
   ```sql
   (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
6. Click **Save**

### Step 2: Create View Policy
1. Click **New Policy** again
2. Fill in the details:
   - **Policy name**: `Allow public to view avatars`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **Policy definition**:
   ```sql
   (bucket_id = 'avatars')
   ```
3. Click **Save**

### Step 3: Create Update Policy (Optional)
1. Click **New Policy** again
2. Fill in the details:
   - **Policy name**: `Allow users to update their own avatars`
   - **Allowed operation**: `UPDATE`
   - **Target roles**: `authenticated`
   - **Policy definition**:
   ```sql
   (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
3. Click **Save**

### Step 4: Create Delete Policy (Optional)
1. Click **New Policy** again
2. Fill in the details:
   - **Policy name**: `Allow users to delete their own avatars`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **Policy definition**:
   ```sql
   (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
3. Click **Save**

## Alternative: SQL Commands

If you prefer to use SQL, run these commands in your Supabase SQL editor:

```sql
-- Enable RLS on the avatars bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public to view avatars
CREATE POLICY "Allow public to view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Allow users to update their own avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatars
CREATE POLICY "Allow users to delete their own avatars" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## How the Policies Work

- **Upload Policy**: Only authenticated users can upload files, and they can only upload files with their user ID in the filename
- **View Policy**: Everyone (including anonymous users) can view avatar images
- **Update/Delete Policies**: Users can only modify their own avatar files

## Testing

After setting up the policies:

1. Try uploading an avatar in your app
2. Check the browser console for success messages
3. Verify the avatar appears and persists after page refresh

## Troubleshooting

### If uploads still fail:
1. **Check Policy Names**: Make sure policy names are unique
2. **Check SQL Syntax**: Ensure the SQL in policies is correct
3. **Check User Authentication**: Make sure users are properly authenticated
4. **Check File Naming**: The upload code uses `userId-timestamp.extension` format

### Common Issues:
- **"Policy already exists"**: Delete existing policies and recreate them
- **"Invalid SQL"**: Check the SQL syntax in the policy definitions
- **"Permission denied"**: Make sure the user is authenticated

## Security Notes

- **Public View**: Avatars are publicly viewable (needed for display)
- **User-Specific Upload**: Users can only upload files with their own user ID
- **No Cross-User Access**: Users cannot modify other users' avatars

The RLS policies ensure that while avatars are publicly viewable, only the owner can upload/update/delete their own avatar files.
