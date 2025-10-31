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
  // New staking and resolution fields
  start_time?: string;
  end_time?: string;
  verification_end_time?: string;
  resolution_status?: 'pending' | 'collecting_votes' | 'ai_verifying' | 'resolved' | 'disputed';
  true_votes?: number;
  false_votes?: number;
  true_stake_total?: number;
  false_stake_total?: number;
  ai_verification_result?: string;
  ai_verification_confidence?: number;
  ai_verification_timestamp?: string;
  final_result?: 'true' | 'false' | 'disputed' | 'pending';
  staking_window_open?: boolean;
  verification_window_open?: boolean;
}

export interface User {
  id: string;
  wallet_address: string;
  username?: string;
  avatar_url?: string;
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
  event_id?: string;
  
  // Transaction type and category
  transaction_type: 'stake' | 'submission' | 'reward' | 'penalty' | 'bond_refund' | 'evt_transfer' | 'sol_transfer' | 'reputation' | 'event_resolution';
  
  // Stake information (if applicable)
  stake_type?: 'authentic' | 'hoax';
  stake_amount: number;
  
  // Submission bond information (if applicable)
  bond_amount: number;
  
  // Token amounts (EVT)
  evt_amount: number;
  evt_balance_before: number;
  evt_balance_after: number;
  
  // SOL amounts
  sol_amount: number;
  sol_balance_before: number;
  sol_balance_after: number;
  
  // Reputation tracking
  reputation_change: number;
  reputation_before: number;
  reputation_after: number;
  
  // Solana blockchain info
  solana_signature?: string;
  solana_slot?: number;
  solana_block_time?: string;
  
  // Transaction status
  status: 'pending' | 'completed' | 'failed' | 'confirmed';
  
  // Metadata
  metadata?: Record<string, any>;
  description?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
}

export interface Stake {
  id: string;
  user_id: string;
  event_id: string;
  stake_type: 'authentic' | 'hoax';
  amount: number;
  evt_amount: number;
  sol_amount: number;
  created_at: string;
  updated_at: string;
}

// Helper types for creating transactions
export interface CreateTransactionData {
  user_id: string;
  event_id?: string;
  transaction_type: Transaction['transaction_type'];
  stake_type?: 'authentic' | 'hoax';
  stake_amount?: number;
  bond_amount?: number;
  evt_amount?: number;
  evt_balance_before?: number;
  evt_balance_after?: number;
  sol_amount?: number;
  sol_balance_before?: number;
  sol_balance_after?: number;
  reputation_change?: number;
  reputation_before?: number;
  reputation_after?: number;
  solana_signature?: string;
  solana_slot?: number;
  solana_block_time?: string;
  status?: 'pending' | 'completed' | 'failed' | 'confirmed';
  metadata?: Record<string, any>;
  description?: string;
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
