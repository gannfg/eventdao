/**
 * Admin authorization utilities
 * Centralized admin access control for EventDAO
 */

// Admin wallet address - only this wallet can access admin functions
export const ADMIN_WALLET_ADDRESS = '6wWixzkisD9SDbxboz8EM66uq4QNWsC1xXcPM2Uvr6GK';

/**
 * Check if a wallet address is authorized for admin access
 * @param walletAddress - The wallet address to check
 * @returns true if the address is authorized for admin access
 */
export const isAdminWallet = (walletAddress: string | null | undefined): boolean => {
  if (!walletAddress) return false;
  return walletAddress === ADMIN_WALLET_ADDRESS;
};

/**
 * Validate admin authorization for API routes
 * @param walletAddress - The wallet address from request headers or body
 * @returns Object with authorization status and error message if unauthorized
 */
export const validateAdminAccess = (walletAddress: string | null | undefined): {
  authorized: boolean;
  error?: string;
} => {
  if (!walletAddress) {
    return {
      authorized: false,
      error: 'Wallet address is required for admin access'
    };
  }

  if (!isAdminWallet(walletAddress)) {
    return {
      authorized: false,
      error: 'Unauthorized: Only admin wallet can access this endpoint'
    };
  }

  return { authorized: true };
};

/**
 * Get admin wallet display info (first 8 and last 8 characters)
 * @param walletAddress - The full wallet address
 * @returns Formatted display string
 */
export const getAdminWalletDisplay = (walletAddress?: string): string => {
  if (!walletAddress) return 'Unknown';
  return `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`;
};
