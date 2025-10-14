'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletIntegration } from '../lib/wallet-integration';
import { userService } from '../lib/user-service';
import styles from './AccountInfo.module.css';

interface AccountInfoProps {
  className?: string;
}

interface Badge {
  name: string;
  level: number;
  color: string;
  icon: string;
  description: string;
}

const REPUTATION_BADGES: Badge[] = [
  { name: 'Bronze', level: 1, color: '#CD7F32', icon: '🥉', description: '1 Month' },
  { name: 'Silver', level: 2, color: '#C0C0C0', icon: '🥈', description: '3 Months' },
  { name: 'Gold', level: 3, color: '#FFD700', icon: '🥇', description: '6 Months' },
  { name: 'Platinum', level: 4, color: '#E5E4E2', icon: '💎', description: '1 Year' },
  { name: 'Diamond', level: 5, color: '#B9F2FF', icon: '💠', description: '2 Years' },
  { name: 'Emerald', level: 6, color: '#50C878', icon: '💚', description: '3 Years' },
  { name: 'Ruby', level: 7, color: '#E0115F', icon: '❤️', description: '5 Years' },
  { name: 'Opal', level: 8, color: '#A8E6CF', icon: '🌈', description: '6+ Years' }
];

// Default avatar placeholder
const DEFAULT_AVATAR = '/default-avatar.svg';

const AccountInfo: React.FC<AccountInfoProps> = ({ className }) => {
  const { publicKey, connected } = useWallet();
  const { user, loading } = useWalletIntegration();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(DEFAULT_AVATAR);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user's avatar from database when user data is available
  useEffect(() => {
    if (user?.avatar_url) {
      setSelectedAvatar(user.avatar_url);
    } else {
      setSelectedAvatar(DEFAULT_AVATAR);
    }
  }, [user?.avatar_url]);

  // Mock data - in real app, this would come from your backend
  const mockData = {
    availableBalance: 250.50,
    totalStaked: 25.5,
    netEarnings: 12.3,
    reputation: 850,
    memberSince: '2024-01-15'
  };

  const getCurrentBadge = (reputation: number): Badge => {
    if (reputation >= 1000) return REPUTATION_BADGES[7]; // Opal
    if (reputation >= 800) return REPUTATION_BADGES[6]; // Ruby
    if (reputation >= 600) return REPUTATION_BADGES[5]; // Emerald
    if (reputation >= 400) return REPUTATION_BADGES[4]; // Diamond
    if (reputation >= 300) return REPUTATION_BADGES[3]; // Platinum
    if (reputation >= 200) return REPUTATION_BADGES[2]; // Gold
    if (reputation >= 100) return REPUTATION_BADGES[1]; // Silver
    return REPUTATION_BADGES[0]; // Bronze
  };

  const currentBadge = getCurrentBadge(mockData.reputation);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage and update user record
      const avatarUrl = await userService.uploadAvatar(user.id, file);
      
      // Update the displayed avatar
      setSelectedAvatar(avatarUrl);
      
      console.log('Avatar uploaded successfully:', avatarUrl);
      
      // Show success message
      alert('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload avatar. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Bucket not found')) {
          errorMessage = 'Storage bucket not found. Please contact support.';
        } else if (error.message.includes('row-level security policy')) {
          errorMessage = 'Storage security policies are blocking uploads. Please disable RLS on the avatars bucket or set up proper policies. Check the RLS_POLICY_SETUP.md guide for instructions.';
        } else if (error.message.includes('File size')) {
          errorMessage = 'File is too large. Please select an image smaller than 5MB.';
        } else if (error.message.includes('MIME type')) {
          errorMessage = 'Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.';
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsUploading(false);
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!connected || !publicKey) {
    return (
      <div className={`${styles.accountInfo} ${className || ''}`}>
        <div className={styles.notConnected}>
          <div className={styles.notConnectedIcon}>🔗</div>
          <h3>Connect Your Wallet</h3>
          <p>Connect your Solana wallet to view your account information</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.accountInfo} ${className || ''}`}>
      {/* Account Header */}
      <div className={styles.accountHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarContainer} onClick={handleAvatarClick}>
            <div className={styles.avatar}>
              {isUploading ? (
                <div className={styles.uploadingSpinner}>⏳</div>
              ) : (
                <img 
                  src={selectedAvatar} 
                  alt="Profile Avatar" 
                  className={styles.avatarImage}
                  onError={(e) => {
                    // Fallback to default avatar if image fails to load
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
              )}
            </div>
            <div className={styles.avatarEditIcon}>📷</div>
          </div>
          <div className={styles.badgeContainer}>
            <div 
              className={styles.currentBadge}
              style={{ 
                background: `linear-gradient(135deg, ${currentBadge.color}22, ${currentBadge.color}44)`,
                borderColor: currentBadge.color,
                color: currentBadge.color
              }}
            >
              <span className={styles.badgeIcon}>{currentBadge.icon}</span>
              <span className={styles.badgeName}>{currentBadge.name}</span>
            </div>
          </div>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.nameSection}>
            <h2 className={styles.userName}>{user?.username || 'Anonymous User'}</h2>
          </div>
          
          <div className={styles.walletAddress}>
            <span className={styles.addressLabel}>Wallet Address:</span>
            <span className={styles.addressValue}>
              {formatAddress(publicKey.toString())}
            </span>
            <button 
              className={styles.copyBtn}
              onClick={() => navigator.clipboard.writeText(publicKey.toString())}
              title="Copy full address"
            >
              📋
            </button>
          </div>

          <div className={styles.memberSince}>
            <span className={styles.memberLabel}>Member since:</span>
            <span className={styles.memberDate}>{formatDate(mockData.memberSince)}</span>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className={styles.accountStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{mockData.availableBalance} EVT</div>
            <div className={styles.statLabel}>Available Balance</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔒</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{mockData.totalStaked} EVT</div>
            <div className={styles.statLabel}>Total Staked</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statInfo}>
            <div className={`${styles.statValue} ${styles.positiveValue}`}>
              +{mockData.netEarnings} EVT
            </div>
            <div className={styles.statLabel}>Net Earnings</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{mockData.reputation}</div>
            <div className={styles.statLabel}>Reputation Points</div>
          </div>
        </div>
      </div>

      {/* Badge Progress */}
      <div className={styles.badgeProgress}>
        <h3 className={styles.badgeProgressTitle}>Reputation Progress</h3>
        <div className={styles.badgeProgressBar}>
          <div className={styles.progressTrack}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${(mockData.reputation % 200) / 200 * 100}%`,
                background: `linear-gradient(90deg, ${currentBadge.color}, ${currentBadge.color}88)`
              }}
            />
          </div>
          <div className={styles.progressText}>
            {200 - (mockData.reputation % 200)} points to {REPUTATION_BADGES[currentBadge.level]?.name || 'Next Level'}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default AccountInfo;
