import { supabase } from './supabase';

/**
 * Setup script to create the avatars storage bucket
 * Run this once to initialize the storage bucket
 */
export async function setupAvatarsBucket(): Promise<void> {
  try {
    console.log('🔧 Setting up avatars storage bucket...');

    // Check if the avatars bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list storage buckets: ${listError.message}`);
    }

    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (avatarsBucket) {
      console.log('✅ Avatars bucket already exists');
      return;
    }

    // Create the avatars bucket
    const { data: createData, error: createError } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB in bytes
    });

    if (createError) {
      throw new Error(`Failed to create avatars bucket: ${createError.message}`);
    }

    console.log('✅ Successfully created avatars storage bucket');
    console.log('📋 Bucket configuration:');
    console.log('   - Public: true');
    console.log('   - Allowed types: JPEG, PNG, GIF, WebP');
    console.log('   - Max file size: 5MB');
    
  } catch (error) {
    console.error('❌ Failed to setup avatars bucket:', error);
    throw error;
  }
}

/**
 * Check if the avatars bucket exists
 */
export async function checkAvatarsBucket(): Promise<boolean> {
  try {
    // Try to list files from the avatars bucket to check if it exists
    const { data: files, error } = await supabase.storage
      .from('avatars')
      .list('', { limit: 1 });
    
    if (error) {
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return false;
      }
      console.error('Error checking avatars bucket:', error);
      return false;
    }

    return true; // If we can list files, the bucket exists
  } catch (error) {
    console.error('Error checking avatars bucket:', error);
    return false;
  }
}
