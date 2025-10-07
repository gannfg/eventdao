// Export all shared types
export * from './database';
export * from './solana';

// Common utility types
export type Status = 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
export type StakeType = 'authentic' | 'hoax';
export type TransactionType = 'stake' | 'reward' | 'penalty';
export type EventStatus = 'active' | 'completed' | 'disputed';

// Form types
export interface EventFormData {
  title: string;
  description: string;
  eventUrl: string;
  category: string;
  eventDate: string;
  location: string;
  bondAmount: number;
  photos: File[];
}

// UI State types
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface SubmitStatus {
  type: 'success' | 'error' | null;
  message: string;
}
