import { supabase } from './supabase';

export interface EVTCredits {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

/**
 * EVT Credits Service
 * Manages off-chain EVT credit balances
 */
export class EVTCreditsService {
  /**
   * Get user's EVT credits
   */
  async getUserCredits(userId: string): Promise<EVTCredits | null> {
    try {
      const { data, error } = await supabase
        .from('evt_credits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }) // Get most recent if duplicates exist
        .limit(1) // Limit to 1 row to handle duplicates
        .maybeSingle(); // Use maybeSingle() to avoid 406 when no row exists

      if (error) {
        // Only log actual errors
        console.error('Error fetching EVT credits:', error);
        throw new Error(error.message);
      }

      // If no record exists, create one
      if (!data) {
        return await this.createUserCredits(userId);
      }

      return data;
    } catch (error) {
      console.error('Error fetching EVT credits:', error);
      return null;
    }
  }

  /**
   * Create EVT credits for a new user
   */
  async createUserCredits(userId: string, initialBalance: number = 100): Promise<EVTCredits> {
    const { data, error } = await supabase
      .from('evt_credits')
      .insert({
        user_id: userId,
        balance: initialBalance,
        total_earned: initialBalance,
        total_spent: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create EVT credits: ${error.message}`);
    }

    return data;
  }

  /**
   * Add EVT credits to user
   */
  async addCredits(userId: string, amount: number): Promise<void> {
    const credits = await this.getUserCredits(userId);
    
    if (!credits) {
      await this.createUserCredits(userId, amount);
      return;
    }

    const { error } = await supabase
      .from('evt_credits')
      .update({
        balance: credits.balance + amount,
        total_earned: credits.total_earned + amount,
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to add EVT credits: ${error.message}`);
    }
  }

  /**
   * Deduct EVT credits from user
   */
  async deductCredits(userId: string, amount: number): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    
    if (!credits || credits.balance < amount) {
      return false; // Insufficient balance
    }

    const { error } = await supabase
      .from('evt_credits')
      .update({
        balance: credits.balance - amount,
        total_spent: credits.total_spent + amount,
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to deduct EVT credits: ${error.message}`);
    }

    return true;
  }

  /**
   * Get credits leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<EVTCredits[]> {
    const { data, error } = await supabase
      .from('evt_credits')
      .select('*')
      .order('balance', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if user has sufficient credits
   */
  async hasSufficientCredits(userId: string, amount: number): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    return credits ? credits.balance >= amount : false;
  }
}

export const evtCreditsService = new EVTCreditsService();

