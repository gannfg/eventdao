# Correct Storage RLS Fix

## The Problem
You got: `must be owner of table objects` - this means you can't directly modify storage table RLS policies.

## The Solution
Use Supabase's storage policy system instead of trying to modify the table directly.

## Method 1: Use SQL Editor (Recommended)

### Step 1: Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run This SQL Command
Copy and paste this into the SQL editor:

```sql
-- Allow public to view avatars
CREATE POLICY "Allow public to view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update avatars
CREATE POLICY "Allow authenticated users to update avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to delete avatars
CREATE POLICY "Allow authenticated users to delete avatars" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars');
```

### Step 3: Execute
1. Click **Run** button
2. You should see "Success. No rows returned" for each policy

### Step 4: Test Avatar Upload
1. Go back to your app
2. Try uploading an avatar
3. It should work now! 🎉

## Method 2: Use Storage Policies UI (Alternative)

If the SQL doesn't work, try the UI approach:

### Step 1: Go to Storage Policies
1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Policies**
3. Look for the **avatars** bucket policies

### Step 2: Create Policies
1. Click **New Policy**
2. Select **For full customization**
3. Create these policies one by one:

**Policy 1: View Avatars**
- Policy name: `Allow public to view avatars`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition: `(bucket_id = 'avatars')`

**Policy 2: Upload Avatars**
- Policy name: `Allow authenticated users to upload avatars`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy definition: `(bucket_id = 'avatars')`

**Policy 3: Update Avatars**
- Policy name: `Allow authenticated users to update avatars`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- Policy definition: `(bucket_id = 'avatars')`

**Policy 4: Delete Avatars**
- Policy name: `Allow authenticated users to delete avatars`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- Policy definition: `(bucket_id = 'avatars')`

## What These Policies Do

- **View Policy**: Anyone can view avatar images (needed for display)
- **Upload Policy**: Only authenticated users can upload avatars
- **Update Policy**: Only authenticated users can update avatars
- **Delete Policy**: Only authenticated users can delete avatars

## Verification

After creating the policies, you can verify they exist by running:

```sql
SELECT policyname, cmd, roles, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%avatar%';
```

You should see 4 policies listed.

## That's It!

The avatar upload should now work perfectly. The policies allow the necessary operations while maintaining security.
