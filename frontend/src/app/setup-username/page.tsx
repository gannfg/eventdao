'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { userService } from '../../lib/user-service';
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import styles from './page.module.css';

export default function SetupUsernamePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if wallet is not connected
  useEffect(() => {
    if (!connected || !publicKey) {
      router.push('/');
    }
  }, [connected, publicKey, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setError(null);
    setLocalError(null);
    
    // Basic validation
    if (!username.trim()) {
      setLocalError('Username is required');
      return;
    }
    
    if (username.length < 3) {
      setLocalError('Username must be at least 3 characters long');
      return;
    }
    
    if (username.length > 50) {
      setLocalError('Username must be less than 50 characters');
      return;
    }
    
    // Check for valid characters (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setLocalError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }
    
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);

    try {
      const walletAddress = publicKey.toString();
      const userData = await userService.createUser({
        username: username.trim(),
        wallet_address: walletAddress
      });
      
      console.log('User created successfully:', userData);
      
      // Redirect to the main app or dashboard
      router.push('/');
    } catch (err) {
      console.error('Username creation error:', err);
      
      let errorMessage = 'Failed to create user account';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  // Show loading if wallet is not connected
  if (!connected || !publicKey) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Connecting wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <div className={styles.setupCard}>
          <div className={styles.setupHeader}>
            <div className={styles.setupIcon}>
              <svg className={styles.iconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className={styles.setupTitle}>Complete Your Account</h1>
            <p className={styles.setupSubtitle}>
              Choose a username to finish setting up your EventDAO account
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.setupForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.inputLabel}>
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className={styles.usernameInput}
                placeholder="Enter your username"
                maxLength={50}
                autoFocus
              />
              <p className={styles.characterCount}>
                {username.length}/50 characters
              </p>
            </div>
            
            {(localError || error) && (
              <div className={styles.errorBox}>
                <div className={styles.errorContent}>
                  <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className={styles.errorMessage}>
                    {localError || error}
                  </p>
                </div>
              </div>
            )}
            
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                {loading && (
                  <svg className={styles.loadingSpinner} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
          
          <div className={styles.walletInfo}>
            <p className={styles.walletAddress}>
              Wallet: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
