import { createClient } from '@supabase/supabase-js';
import env from './env.js';

// Create Supabase client
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Database types
export interface User {
  id: string;
  username: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  wallet_address: string;
}

export interface UpdateUserData {
  username?: string;
  wallet_address?: string;
}
