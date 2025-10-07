// Local data types (no database)

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: 'active' | 'completed' | 'disputed';
  authentic_stake: number;
  hoax_stake: number;
  bond: number;
  time_left: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface User {
  id: string;
  wallet_address: string;
  username?: string;
  reputation: number;
  total_staked: number;
  total_verified: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  event_id: string;
  type: 'stake' | 'reward' | 'penalty';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  signature: string;
  created_at: string;
}

export interface Stake {
  id: string;
  user_id: string;
  event_id: string;
  stake_type: 'authentic' | 'hoax';
  amount: number;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
