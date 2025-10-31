import { supabase } from './supabase';
import { evtCreditsService } from './evt-credits-service';

export interface Stake {
  id: string;
  user_id: string;
  event_id: string;
  stake_type: 'true' | 'false';
  evt_amount: number;
  session_type: 'stake' | 'verification';
  status: 'active' | 'won' | 'lost' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface CreateStakeParams {
  userId: string;
  eventId: string;
  stakeType: 'true' | 'false';
  evtAmount: number;
  sessionType?: 'stake' | 'verification';
}

/**
 * Staking Service
 * Handles all staking operations
 */
export class StakingService {
  /**
   * Create a stake
   */
  async createStake(params: CreateStakeParams): Promise<Stake> {
    try {
      // Check if user has sufficient credits
      const hasCredits = await evtCreditsService.hasSufficientCredits(
        params.userId,
        params.evtAmount
      );

      if (!hasCredits) {
        throw new Error('Insufficient EVT credits');
      }

      // Deduct credits
      const deducted = await evtCreditsService.deductCredits(
        params.userId,
        params.evtAmount
      );

      if (!deducted) {
        throw new Error('Failed to deduct EVT credits');
      }

      // Create stake record
      const { data, error } = await supabase
        .from('stakes')
        .insert({
          user_id: params.userId,
          event_id: params.eventId,
          stake_type: params.stakeType,
          evt_amount: params.evtAmount,
          session_type: params.sessionType || 'stake',
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        // Refund credits if stake creation failed
        await evtCreditsService.addCredits(params.userId, params.evtAmount);
        throw new Error(`Failed to create stake: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Staking failed:', error);
      throw error;
    }
  }

  /**
   * Get user's stake on an event
   */
  async getUserStake(userId: string, eventId: string): Promise<Stake | null> {
    const { data, error } = await supabase
      .from('stakes')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .eq('session_type', 'stake')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No stake found
      }
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Get all stakes for an event
   */
  async getEventStakes(eventId: string): Promise<Stake[]> {
    const { data, error } = await supabase
      .from('stakes')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching event stakes:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get user's active stakes
   */
  async getUserActiveStakes(userId: string): Promise<Stake[]> {
    const { data, error } = await supabase
      .from('stakes')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active stakes:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get user's staking history
   */
  async getUserStakingHistory(userId: string, limit: number = 50): Promise<Stake[]> {
    const { data, error } = await supabase
      .from('stakes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching staking history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get event stake totals
   */
  async getEventStakeTotals(eventId: string): Promise<{
    trueTotal: number;
    falseTotal: number;
    totalStakers: number;
  }> {
    const { data, error } = await supabase
      .from('stakes')
      .select('stake_type, evt_amount')
      .eq('event_id', eventId)
      .eq('status', 'active');

    if (error) {
      return { trueTotal: 0, falseTotal: 0, totalStakers: 0 };
    }

    let trueTotal = 0;
    let falseTotal = 0;
    const uniqueUsers = new Set<string>();

    (data || []).forEach((stake) => {
      const amount = parseFloat(stake.evt_amount.toString());
      if (stake.stake_type === 'true') {
        trueTotal += amount;
      } else {
        falseTotal += amount;
      }
    });

    return {
      trueTotal,
      falseTotal,
      totalStakers: uniqueUsers.size,
    };
  }

  /**
   * Check if user has already staked on event
   */
  async hasUserStaked(userId: string, eventId: string): Promise<boolean> {
    const stake = await this.getUserStake(userId, eventId);
    return stake !== null;
  }
}

export const stakingService = new StakingService();

