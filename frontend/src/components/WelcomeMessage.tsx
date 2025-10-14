'use client';

import React from 'react';
import { useWalletIntegration } from '../lib/wallet-integration';
import styles from './WelcomeMessage.module.css';

interface WelcomeMessageProps {
  className?: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ className }) => {
  const { user, loading, isConnected } = useWalletIntegration();

  // Don't render anything if wallet is not connected or still loading
  if (!isConnected || loading) {
    return null;
  }

  // Don't render if user data is not available
  if (!user || !user.username) {
    return null;
  }

  return (
    <div className={`${styles.userInfo} ${className || ''}`}>
      <div className={styles.avatarContainer}>
        <img 
          src={user.avatar_url || '/default-avatar.svg'} 
          alt="Profile Avatar" 
          className={styles.avatar}
          onError={(e) => {
            e.currentTarget.src = '/default-avatar.svg';
          }}
        />
      </div>
      <span className={styles.username}>{user.username}</span>
    </div>
  );
};

export default WelcomeMessage;
