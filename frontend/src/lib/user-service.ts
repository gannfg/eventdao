import { supabase } from './supabase';

export interface User {
  id: string;
  username: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  wallet_address: string;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class UserService {
  async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('User not found'))) {
        return null;
      }
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('User with this username or wallet address already exists');
      }
      throw new Error(error.message);
    }

    return data;
  }

  async updateUser(id: string, userData: Partial<CreateUserRequest>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('User not found');
      }
      if (error.code === '23505') {
        throw new Error('User with this username or wallet address already exists');
      }
      throw new Error(error.message);
    }

    return data;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}

export const userService = new UserService();
