/**
 * Environment detection utilities
 */

/**
 * Check if the application is running in development/devnet mode
 * This can be determined by:
 * 1. NODE_ENV being 'development'
 * 2. A custom environment variable indicating devnet mode
 * 3. The presence of devnet-specific configuration
 */
export const isDevnetEnvironment = (): boolean => {
  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Check for custom devnet environment variable
  if (process.env.NEXT_PUBLIC_DEVNET_MODE === 'true') {
    return true;
  }

  // Check if we're running locally (localhost/127.0.0.1)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('devnet')) {
      return true;
    }
  }

  return false;
};

/**
 * Check if admin features should be enabled
 * Admin features are only available in devnet/development environments
 */
export const isAdminEnabled = (): boolean => {
  return isDevnetEnvironment();
};

/**
 * Get the current environment name
 */
export const getEnvironmentName = (): string => {
  if (isDevnetEnvironment()) {
    return 'devnet';
  }
  return 'production';
};
