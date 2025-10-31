import { supabase } from './supabase';
import { Transaction, CreateTransactionData } from '@eventdao/shared';
import { PublicKey } from '@solana/web3.js';
import { getSolanaConnection, getAccountBalance } from './solana-utils';

export class TransactionService {
  /**
   * Get current EVT balance (placeholder - would need actual EVT token integration)
   */
  private async getEvtBalance(walletAddress: string): Promise<number> {
    // TODO: Implement actual EVT token balance fetching
    // This would interact with your EVT Token-2022 mint
    return 0;
  }

  /**
   * Get current SOL balance
   */
  private async getSolBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      return await getAccountBalance(publicKey);
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      return 0;
    }
  }

  /**
   * Get current reputation from user record
   */
  private async getReputation(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('reputation')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching reputation:', error);
        return 0;
      }

      return data?.reputation || 0;
    } catch (error) {
      console.error('Error fetching reputation:', error);
      return 0;
    }
  }

  /**
   * Create a new transaction record
   */
  async createTransaction(txData: CreateTransactionData): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([txData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create transaction: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Record a stake transaction (authentic or hoax)
   */
  async recordStake(params: {
    userId: string;
    eventId: string;
    stakeType: 'authentic' | 'hoax';
    stakeAmount: number;
    evtAmount: number;
    walletAddress: string;
    solanaSignature?: string;
    solanaSlot?: number;
    solanaBlockTime?: string;
  }): Promise<Transaction> {
    try {
      // Get current balances
      const evtBalanceBefore = await this.getEvtBalance(params.walletAddress);
      const solBalanceBefore = await this.getSolBalance(params.walletAddress);
      const reputationBefore = await this.getReputation(params.userId);

      // Calculate after balances
      const evtBalanceAfter = evtBalanceBefore - params.evtAmount;
      const solBalanceAfter = solBalanceBefore; // Staking doesn't change SOL balance

      // Create transaction record
      const transaction = await this.createTransaction({
        user_id: params.userId,
        event_id: params.eventId,
        transaction_type: 'stake',
        stake_type: params.stakeType,
        stake_amount: params.stakeAmount,
        evt_amount: params.evtAmount,
        evt_balance_before: evtBalanceBefore,
        evt_balance_after: evtBalanceAfter,
        sol_amount: 0,
        sol_balance_before: solBalanceBefore,
        sol_balance_after: solBalanceAfter,
        reputation_change: 0,
        reputation_before: reputationBefore,
        reputation_after: reputationBefore,
        solana_signature: params.solanaSignature,
        solana_slot: params.solanaSlot,
        solana_block_time: params.solanaBlockTime,
        status: params.solanaSignature ? 'confirmed' : 'pending',
        description: `Staked ${params.evtAmount} EVT on ${params.stakeType}`,
      });

      return transaction;
    } catch (error) {
      console.error('Error recording stake:', error);
      throw error;
    }
  }

  /**
   * Record a submission bond transaction
   */
  async recordSubmissionBond(params: {
    userId: string;
    eventId: string;
    bondAmount: number;
    walletAddress: string;
    solanaSignature?: string;
    solanaSlot?: number;
    solanaBlockTime?: string;
  }): Promise<Transaction> {
    try {
      // Get current balances
      const solBalanceBefore = await this.getSolBalance(params.walletAddress);
      const reputationBefore = await this.getReputation(params.userId);

      // Calculate after balances
      const solBalanceAfter = solBalanceBefore - params.bondAmount;

      // Create transaction record
      const transaction = await this.createTransaction({
        user_id: params.userId,
        event_id: params.eventId,
        transaction_type: 'submission',
        bond_amount: params.bondAmount,
        evt_amount: 0,
        evt_balance_before: 0,
        evt_balance_after: 0,
        sol_amount: params.bondAmount,
        sol_balance_before: solBalanceBefore,
        sol_balance_after: solBalanceAfter,
        reputation_change: 0,
        reputation_before: reputationBefore,
        reputation_after: reputationBefore,
        solana_signature: params.solanaSignature,
        solana_slot: params.solanaSlot,
        solana_block_time: params.solanaBlockTime,
        status: params.solanaSignature ? 'confirmed' : 'pending',
        description: `Submitted event with ${params.bondAmount} SOL bond`,
      });

      return transaction;
    } catch (error) {
      console.error('Error recording submission bond:', error);
      throw error;
    }
  }

  /**
   * Record a reward transaction (for correct verification)
   */
  async recordReward(params: {
    userId: string;
    eventId: string;
    evtReward: number;
    reputationChange: number;
    walletAddress: string;
    solanaSignature?: string;
    solanaSlot?: number;
    solanaBlockTime?: string;
  }): Promise<Transaction> {
    try {
      // Get current balances
      const evtBalanceBefore = await this.getEvtBalance(params.walletAddress);
      const solBalanceBefore = await this.getSolBalance(params.walletAddress);
      const reputationBefore = await this.getReputation(params.userId);

      // Calculate after balances
      const evtBalanceAfter = evtBalanceBefore + params.evtReward;
      const reputationAfter = reputationBefore + params.reputationChange;

      // Create transaction record
      const transaction = await this.createTransaction({
        user_id: params.userId,
        event_id: params.eventId,
        transaction_type: 'reward',
        evt_amount: params.evtReward,
        evt_balance_before: evtBalanceBefore,
        evt_balance_after: evtBalanceAfter,
        sol_amount: 0,
        sol_balance_before: solBalanceBefore,
        sol_balance_after: solBalanceBefore,
        reputation_change: params.reputationChange,
        reputation_before: reputationBefore,
        reputation_after: reputationAfter,
        solana_signature: params.solanaSignature,
        solana_slot: params.solanaSlot,
        solana_block_time: params.solanaBlockTime,
        status: params.solanaSignature ? 'confirmed' : 'pending',
        description: `Received ${params.evtReward} EVT reward and ${params.reputationChange} reputation`,
      });

      return transaction;
    } catch (error) {
      console.error('Error recording reward:', error);
      throw error;
    }
  }

  /**
   * Record a penalty transaction (for incorrect verification)
   */
  async recordPenalty(params: {
    userId: string;
    eventId: string;
    reputationPenalty: number;
    walletAddress: string;
    solanaSignature?: string;
    solanaSlot?: number;
    solanaBlockTime?: string;
  }): Promise<Transaction> {
    try {
      // Get current balances
      const solBalanceBefore = await this.getSolBalance(params.walletAddress);
      const reputationBefore = await this.getReputation(params.userId);

      // Calculate after balances
      const reputationAfter = Math.max(0, reputationBefore - params.reputationPenalty);

      // Create transaction record
      const transaction = await this.createTransaction({
        user_id: params.userId,
        event_id: params.eventId,
        transaction_type: 'penalty',
        evt_amount: 0,
        evt_balance_before: 0,
        evt_balance_after: 0,
        sol_amount: 0,
        sol_balance_before: solBalanceBefore,
        sol_balance_after: solBalanceBefore,
        reputation_change: -params.reputationPenalty,
        reputation_before: reputationBefore,
        reputation_after: reputationAfter,
        solana_signature: params.solanaSignature,
        solana_slot: params.solanaSlot,
        solana_block_time: params.solanaBlockTime,
        status: params.solanaSignature ? 'confirmed' : 'pending',
        description: `Penalty: lost ${params.reputationPenalty} reputation`,
      });

      return transaction;
    } catch (error) {
      console.error('Error recording penalty:', error);
      throw error;
    }
  }

  /**
   * Record a bond refund transaction
   */
  async recordBondRefund(params: {
    userId: string;
    eventId: string;
    bondAmount: number;
    walletAddress: string;
    solanaSignature?: string;
    solanaSlot?: number;
    solanaBlockTime?: string;
  }): Promise<Transaction> {
    try {
      // Get current balances
      const solBalanceBefore = await this.getSolBalance(params.walletAddress);
      const reputationBefore = await this.getReputation(params.userId);

      // Calculate after balances
      const solBalanceAfter = solBalanceBefore + params.bondAmount;

      // Create transaction record
      const transaction = await this.createTransaction({
        user_id: params.userId,
        event_id: params.eventId,
        transaction_type: 'bond_refund',
        bond_amount: params.bondAmount,
        evt_amount: 0,
        evt_balance_before: 0,
        evt_balance_after: 0,
        sol_amount: params.bondAmount,
        sol_balance_before: solBalanceBefore,
        sol_balance_after: solBalanceAfter,
        reputation_change: 0,
        reputation_before: reputationBefore,
        reputation_after: reputationBefore,
        solana_signature: params.solanaSignature,
        solana_slot: params.solanaSlot,
        solana_block_time: params.solanaBlockTime,
        status: params.solanaSignature ? 'confirmed' : 'pending',
        description: `Refunded ${params.bondAmount} SOL bond`,
      });

      return transaction;
    } catch (error) {
      console.error('Error recording bond refund:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for a user
   */
  async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for an event
   */
  async getEventTransactions(eventId: string, limit: number = 100): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch event transactions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching event transactions:', error);
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'completed' | 'failed' | 'confirmed',
    solanaSignature?: string
  ): Promise<void> {
    try {
      const updateData: any = { status };
      
      if (solanaSignature) {
        updateData.solana_signature = solanaSignature;
        updateData.confirmed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) {
        throw new Error(`Failed to update transaction status: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  /**
   * Get transaction by Solana signature
   */
  async getTransactionBySignature(signature: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('solana_signature', signature)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Transaction not found
        }
        throw new Error(`Failed to fetch transaction: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching transaction by signature:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();

