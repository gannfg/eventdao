'use client';

import { useState } from 'react';
import { setupAvatarsBucket, checkAvatarsBucket } from '../../lib/setup-storage';
import Header from '../../components/Header';
import styles from './page.module.css';

export default function SetupStoragePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);

  const handleSetupBucket = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await setupAvatarsBucket();
      setMessage('✅ Avatars bucket setup completed successfully!');
      setBucketExists(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('row-level security policy')) {
        setMessage('❌ Automatic setup failed due to security policies. Please use the manual setup instructions below.');
      } else {
        setMessage(`❌ Setup failed: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckBucket = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const exists = await checkAvatarsBucket();
      setBucketExists(exists);
      setMessage(exists ? '✅ Avatars bucket exists' : '❌ Avatars bucket not found');
    } catch (error) {
      setMessage(`❌ Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header currentPage="setup-storage" />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Storage Setup</h1>
          <p>Initialize the avatars storage bucket for profile pictures</p>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={handleCheckBucket}
            disabled={isLoading}
            className={styles.checkBtn}
          >
            {isLoading ? 'Checking...' : 'Check Bucket Status'}
          </button>
          
          <button 
            onClick={handleSetupBucket}
            disabled={isLoading || bucketExists === true}
            className={styles.setupBtn}
          >
            {isLoading ? 'Setting up...' : 'Setup Avatars Bucket'}
          </button>
        </div>

        {message && (
          <div className={styles.message}>
            {message}
          </div>
        )}

        <div className={styles.info}>
          <h3>What this does:</h3>
          <ul>
            <li>Creates a public storage bucket named "avatars"</li>
            <li>Sets up file type restrictions (JPEG, PNG, GIF, WebP)</li>
            <li>Sets maximum file size to 5MB</li>
            <li>Enables public access for avatar images</li>
          </ul>
          
          <h3>Manual Setup (Required if automatic setup fails):</h3>
          <p>Due to security policies, you may need to create the bucket manually in your Supabase dashboard:</p>
          <ol>
            <li>Go to your Supabase project dashboard</li>
            <li>Navigate to <strong>Storage</strong> → <strong>Create bucket</strong></li>
            <li>Bucket name: <code>avatars</code></li>
            <li>Public: <code>true</code> (important for avatar display)</li>
            <li>File size limit: <code>5MB</code></li>
            <li>Allowed MIME types: <code>image/jpeg, image/png, image/gif, image/webp</code></li>
            <li>Click <strong>Create bucket</strong></li>
          </ol>
          
          <div className={styles.warning}>
            <strong>⚠️ Important:</strong> Make sure the bucket is set to <strong>Public</strong> so that avatar images can be displayed to other users.
          </div>
        </div>
      </div>
    </div>
  );
}
