import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletUser } from '@eventdao/shared';
import { userService, User } from './user-service';
import { useRouter } from 'next/navigation';

// Helper function to convert Supabase User to WalletUser
const convertToWalletUser = (user: User): WalletUser => ({
  id: user.id,
  wallet_address: user.wallet_address,
  username: user.username,
  reputation: 0,
  total_staked: 0,
  total_verified: 0,
  created_at: user.created_at,
  updated_at: user.updated_at
});

export const walletService = {
  // Get or create user from Supabase database
  async getOrCreateUser(walletAddress: string, connectionMetadata?: {
    userAgent?: string;
    ipAddress?: string;
    walletType?: string;
  }): Promise<WalletUser | null> {
    try {
      // First, try to get existing user
      const existingUser = await userService.getUserByWallet(walletAddress);
      if (existingUser) {
        console.log('✅ Existing user found:', {
          walletAddress,
          userId: existingUser.id,
          username: existingUser.username
        });
        return convertToWalletUser(existingUser);
      }

      // User doesn't exist, return null to trigger username modal
      console.log('❌ User not found, username required:', walletAddress);
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to check user status');
    }
  },

  // Create user with username
  async createUserWithUsername(walletAddress: string, username: string): Promise<WalletUser> {
    try {
      const newUser = await userService.createUser({
        username,
        wallet_address: walletAddress
      });

      console.log('✅ New user created:', {
        walletAddress,
        userId: newUser.id,
        username: newUser.username
      });

      return convertToWalletUser(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Record wallet connection locally (no database)
  async recordWalletConnection(walletAddress: string, metadata?: {
    userAgent?: string;
    ipAddress?: string;
    walletType?: string;
  }): Promise<void> {
    // Just log the connection locally
    console.log('✅ Wallet connection recorded locally:', {
      wallet_address: walletAddress,
      connected_at: new Date().toISOString(),
      user_agent: metadata?.userAgent || 'Unknown',
      ip_address: metadata?.ipAddress || 'Unknown',
      wallet_type: metadata?.walletType || 'Unknown',
      session_id: this.generateSessionId()
    });
  },

  // Generate a unique session ID
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Get wallet connection history (local only)
  async getWalletConnectionHistory(walletAddress: string) {
    // Return empty array since we're not using database
    console.log('Wallet connection history requested for:', walletAddress);
    return [];
  },

  // Update user profile (local only)
  async updateUserProfile(userId: string, updates: Partial<WalletUser>): Promise<WalletUser> {
    // Return a mock updated user
    const updatedUser: WalletUser = {
      id: userId,
      wallet_address: 'local_wallet',
      username: 'UpdatedUser',
      reputation: 0,
      total_staked: 0,
      total_verified: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates
    };

    console.log('✅ User profile updated locally:', updatedUser);
    return updatedUser;
  },

  // Get user by wallet address (local only)
  async getUserByWallet(walletAddress: string): Promise<WalletUser | null> {
    // Return null since we're not using database
    console.log('User lookup requested for wallet:', walletAddress);
    return null;
  },

  // Get user stats (local only)
  async getUserStats(userId: string) {
    // Return mock stats
    const mockStats = {
      user: {
        id: userId,
        wallet_address: 'local_wallet',
        username: 'LocalUser',
        reputation: 0,
        total_staked: 0,
        total_verified: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      stats: {
        eventsCreated: 0,
        totalStaked: 0,
        totalEarned: 0,
        activeStakes: 0,
        totalTransactions: 0
      }
    };

    console.log('✅ User stats requested locally:', mockStats);
    return mockStats;
  }
};

// React hook for wallet integration
export const useWalletIntegration = () => {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [user, setUser] = useState<WalletUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWalletToUser = async () => {
    if (!publicKey || !connected) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletAddress = publicKey.toString();
      
      // Collect connection metadata
      const connectionMetadata = {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        ipAddress: 'Unknown', // Will be handled by backend if needed
        walletType: 'Solana' // Default wallet type
      };

      const userData = await walletService.getOrCreateUser(walletAddress, connectionMetadata);
      
      if (userData) {
        // User exists, set user data
        setUser(userData);
        console.log('Wallet connected successfully:', {
          walletAddress,
          userId: userData.id,
          username: userData.username
        });
      } else {
        // User doesn't exist, redirect to username setup page
        console.log('User not found, redirecting to username setup:', walletAddress);
        router.push('/setup-username');
      }
    } catch (err) {
      console.error('Wallet integration error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        code: (err as any)?.code,
        details: (err as any)?.details,
        hint: (err as any)?.hint,
        stack: err instanceof Error ? err.stack : undefined,
        walletAddress: publicKey?.toString()
      });
      
      let errorMessage = 'Failed to connect wallet to user';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Handle Supabase errors
        if ('message' in err) {
          errorMessage = String(err.message);
        } else if ('details' in err) {
          errorMessage = String(err.details);
        } else if ('hint' in err) {
          errorMessage = String(err.hint);
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (connected && publicKey) {
      connectWalletToUser();
    } else {
      setUser(null);
    }
  }, [connected, publicKey]);

  return {
    user,
    loading,
    error,
    connectWalletToUser,
    isConnected: connected && !!publicKey,
    walletAddress: publicKey?.toString()
  };
};
