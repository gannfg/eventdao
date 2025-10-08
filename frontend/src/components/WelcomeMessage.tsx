'use client';

import React from 'react';
import { useWalletIntegration } from '../lib/wallet-integration';

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
    <div className={className}>
      <span className="welcome-text">
        Welcome, <span className="username">{user.username}</span>
      </span>
    </div>
  );
};

export default WelcomeMessage;
