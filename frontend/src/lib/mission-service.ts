import { supabase } from './supabase';

export interface Mission {
  id: string;
  mission_key: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  mission_type: 'daily' | 'weekly' | 'one-time';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  status: 'available' | 'in_progress' | 'completed' | 'claimed';
  started_at?: string;
  completed_at?: string;
  claimed_at?: string;
  reward_amount?: number;
  created_at: string;
  updated_at: string;
  mission?: Mission;
}

export interface MissionCompletion {
  id: string;
  user_id: string;
  mission_key: string;
  completion_date: string;
  reward_earned: number;
  created_at: string;
}

export interface EvtTransaction {
  id: string;
  user_id: string;
  transaction_type: 'mission_reward' | 'referral_bonus' | 'manual_adjustment';
  amount: number;
  description?: string;
  metadata?: any;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed' | 'rewarded';
  reward_given: boolean;
  created_at: string;
  completed_at?: string;
}

class MissionService {
  /**
   * Get all available missions
   */
  async getAllMissions(): Promise<Mission[]> {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching missions:', error);
      return [];
    }
  }

  /**
   * Get user's missions with their progress
   */
  async getUserMissions(userId: string): Promise<UserMission[]> {
    try {
      const { data, error } = await supabase
        .from('user_missions')
        .select(`
          *,
          mission:missions (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user missions:', error);
      return [];
    }
  }

  /**
   * Initialize missions for a user (first time setup)
   */
  async initializeUserMissions(userId: string): Promise<boolean> {
    try {
      // Call server route (uses service role) to bypass RLS if needed
      const res = await fetch('/api/missions/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return true;
    } catch (error) {
      console.error('Error initializing user missions:', error);
      return false;
    }
  }

  /**
   * Start a mission
   */
  async startMission(userId: string, missionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_missions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('mission_id', missionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error starting mission:', error);
      return false;
    }
  }

  /**
   * Complete a mission
   */
  async completeMission(userId: string, missionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_missions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('mission_id', missionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing mission:', error);
      return false;
    }
  }

  /**
   * Claim mission reward
   */
  async claimMissionReward(userId: string, missionId: string): Promise<{ success: boolean; reward?: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('claim_mission_reward', {
          p_user_id: userId,
          p_mission_id: missionId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error claiming mission reward:', error);
      return { success: false, error: 'Failed to claim reward' };
    }
  }

  /**
   * Check daily login
   */
  async checkDailyLogin(userId: string): Promise<{ success: boolean; streak?: number; message?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('check_daily_login', {
          p_user_id: userId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking daily login:', error);
      return { success: false, message: 'Failed to check daily login' };
    }
  }

  /**
   * Get user's EVT balance and stats
   */
  async getUserEvtStats(userId: string): Promise<{ evt_credits: number; total_evt_earned: number; login_streak: number } | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('evt_credits, total_evt_earned, login_streak')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user EVT stats:', error);
      return null;
    }
  }

  /**
   * Get user's EVT transaction history
   */
  async getEvtTransactions(userId: string, limit: number = 50): Promise<EvtTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('evt_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching EVT transactions:', error);
      return [];
    }
  }

  /**
   * Get user's mission completion history
   */
  async getMissionCompletions(userId: string, limit: number = 50): Promise<MissionCompletion[]> {
    try {
      const { data, error } = await supabase
        .from('mission_completions')
        .select('*')
        .eq('user_id', userId)
        .order('completion_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching mission completions:', error);
      return [];
    }
  }

  /**
   * Get user's referral code
   */
  async getUserReferralCode(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.referral_code || null;
    } catch (error) {
      console.error('Error fetching referral code:', error);
      return null;
    }
  }

  /**
   * Create a referral
   */
  async createReferral(referrerId: string, referredId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: referredId,
          status: 'pending'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating referral:', error);
      return false;
    }
  }

  /**
   * Get user's referrals
   */
  async getUserReferrals(userId: string): Promise<Referral[]> {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return [];
    }
  }

  /**
   * Connect X (Twitter) account
   */
  async connectXAccount(userId: string, xAccountId: string, xUsername: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          x_account_id: xAccountId,
          x_username: xUsername,
          x_connected_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Mark "Connect X Account" mission as completed
      const missions = await this.getAllMissions();
      const connectXMission = missions.find(m => m.mission_key === 'connect_x');
      
      if (connectXMission) {
        await this.completeMission(userId, connectXMission.id);
      }

      return true;
    } catch (error) {
      console.error('Error connecting X account:', error);
      return false;
    }
  }

  /**
   * Check if X account is connected
   */
  async isXAccountConnected(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('x_account_id')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return !!data?.x_account_id;
    } catch (error) {
      console.error('Error checking X account connection:', error);
      return false;
    }
  }

  /**
   * Reset daily missions (for testing purposes)
   */
  async resetDailyMissions(userId: string): Promise<boolean> {
    try {
      // Get all daily missions
      const { data: dailyMissions, error: fetchError } = await supabase
        .from('missions')
        .select('id')
        .eq('mission_type', 'daily');

      if (fetchError) throw fetchError;

      const missionIds = dailyMissions?.map(m => m.id) || [];

      // Reset user missions for daily missions
      const { error: updateError } = await supabase
        .from('user_missions')
        .update({ status: 'available', started_at: null, completed_at: null, claimed_at: null })
        .eq('user_id', userId)
        .in('mission_id', missionIds);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error resetting daily missions:', error);
      return false;
    }
  }
}

export const missionService = new MissionService();

