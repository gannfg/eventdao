// Local data types (no database)

export interface Event {
  id: string;
  title: string;
  description: string;
  event_url?: string;
  date: string;
  location: string;
  category: string;
  status: 'active' | 'completed' | 'disputed';
  authentic_stake: number;
  hoax_stake: number;
  bond: number;
  time_left: string;
  media_files: string[]; // Array of file URLs
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
  // Leaderboard tracking fields
  verification_wins: number;
  verification_losses: number;
  verification_accuracy: number; // percentage
  total_sol_bonds: number; // SOL bonds used for event submissions
  total_evt_profit: number; // EVT profit from staking
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

export interface CreateEventData {
  title: string;
  description: string;
  event_url?: string;
  date: string;
  location: string;
  category: string;
  bond: number;
  media_files?: string[];
  user_id: string;
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

// Leaderboard specific types
export interface LeaderboardVerifier {
  id: string;
  wallet_address: string;
  username?: string;
  verification_wins: number;
  verification_losses: number;
  verification_accuracy: number;
  reputation: number;
  sol_earned: number; // SOL earned from verification rewards
}

export interface LeaderboardAuthor {
  id: string;
  wallet_address: string;
  username?: string;
  total_sol_bonds: number;
  events_submitted: number;
  events_verified: number;
  reputation: number;
}

export interface LeaderboardProfitMaker {
  id: string;
  wallet_address: string;
  username?: string;
  total_evt_profit: number;
  total_stakes: number;
  win_rate: number; // percentage
  reputation: number;
}

export interface LeaderboardStats {
  total_verifiers: number;
  avg_accuracy: number;
  total_sol_bonds: number;
  total_evt_profit: number;
  total_stakes: number;
  active_authors: number;
}
