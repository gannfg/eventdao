# Storage Setup Guide - Fixing RLS Policy Error

## The Problem
You're getting this error: `Failed to create avatars bucket: new row violates row-level security policy`

This happens because Supabase storage buckets have Row Level Security (RLS) policies that prevent programmatic creation from the client side.

## Quick Fix (Recommended)

### Step 1: Create the Bucket Manually
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **Create bucket**
5. Fill in the details:
   - **Name**: `avatars`
   - **Public**: ✅ **Check this box** (very important!)
   - **File size limit**: `5MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`
6. Click **Create bucket**

### Step 2: Test the Avatar Upload
1. Go back to your app
2. Try uploading an avatar
3. It should now work! 🎉

## Alternative: Using the Setup Page

1. Visit `http://localhost:3000/setup-storage`
2. Click "Check Bucket Status" to see if the bucket exists
3. If it doesn't exist, follow the manual setup instructions on that page

## Why This Happens

Supabase storage buckets are protected by Row Level Security (RLS) policies by default. These policies prevent unauthorized creation of storage buckets from the client side for security reasons.

The automatic bucket creation in the code will work in some Supabase configurations, but not all. Manual creation through the dashboard is the most reliable method.

## Verification

After creating the bucket, you can verify it works by:

1. **Check in Dashboard**: Go to Storage → You should see the "avatars" bucket listed
2. **Test Upload**: Try uploading an avatar in your app
3. **Check Console**: Look for success messages in the browser console

## Troubleshooting

### If you still get errors:

1. **Check Bucket Name**: Make sure it's exactly `avatars` (lowercase)
2. **Check Public Setting**: The bucket MUST be public for avatars to display
3. **Check File Types**: Make sure you're uploading JPEG, PNG, GIF, or WebP files
4. **Check File Size**: Keep files under 5MB

### Common Issues:

- **"Bucket not found"**: The bucket wasn't created or has a different name
- **"Access denied"**: The bucket is not set to public
- **"File too large"**: The image is larger than 5MB
- **"Invalid file type"**: The file is not a supported image format

## Next Steps

Once the bucket is created, the avatar system will work automatically:
- Users can upload profile pictures
- Avatars persist across sessions
- Images are served from Supabase CDN for fast loading
- Only users can change their own avatars

The system is now ready for production use! 🚀
