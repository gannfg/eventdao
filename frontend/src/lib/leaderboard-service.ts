import { supabase } from './supabase';
import { 
  LeaderboardVerifier, 
  LeaderboardAuthor, 
  LeaderboardProfitMaker, 
  LeaderboardStats 
} from '@eventdao/shared';

export class LeaderboardService {
  async getTopVerifiers(limit: number = 10, timeFilter: string = 'all'): Promise<LeaderboardVerifier[]> {
    try {
      // First check if the leaderboard columns exist
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Error connecting to users table:', testError);
        throw new Error('Database connection failed');
      }

      // Try to select the leaderboard columns
      let query = supabase
        .from('users')
        .select(`
          id,
          wallet_address,
          username,
          reputation
        `)
        .order('reputation', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching top verifiers:', error);
        // Return mock data if columns don't exist
        return this.getMockVerifiers(limit);
      }

      // Check if leaderboard columns exist by trying to select them
      const { data: columnTest } = await supabase
        .from('users')
        .select('verification_wins')
        .limit(1);

      if (!columnTest) {
        // Columns don't exist, return mock data
        return this.getMockVerifiers(limit);
      }

      // If columns exist, fetch real data
      const { data: realData, error: realError } = await supabase
        .from('users')
        .select(`
          id,
          wallet_address,
          username,
          verification_wins,
          verification_losses,
          verification_accuracy
        `)
        .order('verification_wins', { ascending: false })
        .limit(limit);

      if (realError) {
        console.error('Error fetching real verifier data:', realError);
        return this.getMockVerifiers(limit);
      }

      return (realData || []).map(user => ({
        ...user,
        verification_wins: user.verification_wins || 0,
        verification_losses: user.verification_losses || 0,
        verification_accuracy: user.verification_accuracy || 0,
        reputation: 100 + (user.verification_wins || 0) * 10, // Calculate reputation based on wins
        sol_earned: Math.round(((user.verification_wins || 0) * 0.5 + (user.verification_accuracy || 0) * 0.1) * 100) / 100
      }));
    } catch (error) {
      console.error('Error in getTopVerifiers:', error);
      return this.getMockVerifiers(limit);
    }
  }

  private getMockVerifiers(limit: number): LeaderboardVerifier[] {
    return [
      {
        id: '1',
        wallet_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        username: 'TopVerifier',
        verification_wins: 24,
        verification_losses: 2,
        verification_accuracy: 92.31,
        reputation: 1250,
        sol_earned: 12.5
      },
      {
        id: '2',
        wallet_address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        username: 'EventAuthor',
        verification_wins: 18,
        verification_losses: 3,
        verification_accuracy: 85.71,
        reputation: 1100,
        sol_earned: 8.7
      },
      {
        id: '3',
        wallet_address: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
        username: 'ProfitMaker',
        verification_wins: 22,
        verification_losses: 1,
        verification_accuracy: 95.65,
        reputation: 980,
        sol_earned: 15.2
      }
    ].slice(0, limit);
  }

  async getTopAuthors(limit: number = 10, timeFilter: string = 'all'): Promise<LeaderboardAuthor[]> {
    try {
      // Check if total_sol_bonds column exists
      const { data: columnTest } = await supabase
        .from('users')
        .select('total_sol_bonds')
        .limit(1);

      if (!columnTest) {
        // Column doesn't exist, return mock data
        return this.getMockAuthors(limit);
      }

      let query = supabase
        .from('users')
        .select(`
          id,
          wallet_address,
          username,
          total_sol_bonds
        `)
        .order('total_sol_bonds', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching top authors:', error);
        return this.getMockAuthors(limit);
      }

      // Get event counts for each user
      const usersWithEventCounts = await Promise.all(
        (data || []).map(async (user) => {
          try {
            const { count: submittedCount } = await supabase
              .from('events')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);

            const { count: verifiedCount } = await supabase
              .from('events')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('status', 'completed');

            return {
              ...user,
              total_sol_bonds: user.total_sol_bonds || 0,
              events_submitted: submittedCount || 0,
              events_verified: verifiedCount || 0,
              reputation: 100 + (user.total_sol_bonds || 0) * 5 // Calculate reputation based on bonds
            };
          } catch (err) {
            return {
              ...user,
              total_sol_bonds: user.total_sol_bonds || 0,
              events_submitted: 0,
              events_verified: 0,
              reputation: 100 + (user.total_sol_bonds || 0) * 5
            };
          }
        })
      );

      return usersWithEventCounts;
    } catch (error) {
      console.error('Error in getTopAuthors:', error);
      return this.getMockAuthors(limit);
    }
  }

  private getMockAuthors(limit: number): LeaderboardAuthor[] {
    return [
      {
        id: '1',
        wallet_address: '4kM9nL2pQ4rS7tU1vW3xY6zA9bE5cF2gH8jK4mN7pQ1s',
        username: 'EventAuthor',
        total_sol_bonds: 12.5,
        events_submitted: 8,
        events_verified: 7,
        reputation: 1100
      },
      {
        id: '2',
        wallet_address: '6xJLu2g5qLxW8vQZ9mNpR7sT6uY4iE2wA1bC5dF8gH3j',
        username: 'ContentCreator',
        total_sol_bonds: 8.7,
        events_submitted: 6,
        events_verified: 5,
        reputation: 950
      },
      {
        id: '3',
        wallet_address: '2Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
        username: 'EventSubmitter',
        total_sol_bonds: 6.2,
        events_submitted: 5,
        events_verified: 4,
        reputation: 820
      }
    ].slice(0, limit);
  }

  async getTopProfitMakers(limit: number = 10, timeFilter: string = 'all'): Promise<LeaderboardProfitMaker[]> {
    try {
      // Check if total_evt_profit column exists
      const { data: columnTest } = await supabase
        .from('users')
        .select('total_evt_profit')
        .limit(1);

      if (!columnTest) {
        // Column doesn't exist, return mock data
        return this.getMockProfitMakers(limit);
      }

      let query = supabase
        .from('users')
        .select(`
          id,
          wallet_address,
          username,
          total_evt_profit
        `)
        .order('total_evt_profit', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching top profit makers:', error);
        return this.getMockProfitMakers(limit);
      }

      // Calculate win rate and total stakes
      return (data || []).map(user => ({
        ...user,
        total_evt_profit: user.total_evt_profit || 0,
        total_stakes: Math.max((user.total_evt_profit || 0) * 2, 10), // Estimate total stakes
        win_rate: Math.round(((user.total_evt_profit || 0) / Math.max((user.total_evt_profit || 0) * 2, 10)) * 100 * 100) / 100,
        reputation: 100 + (user.total_evt_profit || 0) * 3 // Calculate reputation based on profit
      }));
    } catch (error) {
      console.error('Error in getTopProfitMakers:', error);
      return this.getMockProfitMakers(limit);
    }
  }

  private getMockProfitMakers(limit: number): LeaderboardProfitMaker[] {
    return [
      {
        id: '1',
        wallet_address: '8kM9nL2pQ4rS7tU1vW3xY6zA9bE5cF2gH8jK4mN7pQ1s',
        username: 'ProfitMaker',
        total_evt_profit: 45.75,
        total_stakes: 100.0,
        win_rate: 45.75,
        reputation: 1250
      },
      {
        id: '2',
        wallet_address: '3xJLu2g5qLxW8vQZ9mNpR7sT6uY4iE2wA1bC5dF8gH3j',
        username: 'StakeMaster',
        total_evt_profit: 32.50,
        total_stakes: 75.0,
        win_rate: 43.33,
        reputation: 1100
      },
      {
        id: '3',
        wallet_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        username: 'EVTEarner',
        total_evt_profit: 28.25,
        total_stakes: 60.0,
        win_rate: 47.08,
        reputation: 980
      }
    ].slice(0, limit);
  }

  async getLeaderboardStats(): Promise<LeaderboardStats> {
    try {
      // Check if leaderboard columns exist
      const { data: columnTest } = await supabase
        .from('users')
        .select('verification_wins')
        .limit(1);

      if (!columnTest) {
        // Columns don't exist, return mock stats
        return this.getMockStats();
      }

      // Get total users (as verifiers)
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const totalVerifiers = totalUsers || 0;

      // Get average accuracy from verification_wins data
      const { data: accuracyData } = await supabase
        .from('users')
        .select('verification_accuracy, verification_wins');

      let avgAccuracy = 0;
      if (accuracyData && accuracyData.length > 0) {
        const usersWithData = accuracyData.filter(user => (user.verification_wins || 0) > 0);
        if (usersWithData.length > 0) {
          avgAccuracy = usersWithData.reduce((sum, user) => sum + (user.verification_accuracy || 0), 0) / usersWithData.length;
        }
      }

      // Get total SOL bonds
      const { data: bondsData } = await supabase
        .from('users')
        .select('total_sol_bonds');

      const totalSolBonds = bondsData?.reduce((sum, user) => sum + (user.total_sol_bonds || 0), 0) || 0;

      // Get total EVT profit
      const { data: profitData } = await supabase
        .from('users')
        .select('total_evt_profit');

      const totalEvtProfit = profitData?.reduce((sum, user) => sum + (user.total_evt_profit || 0), 0) || 0;

      // Estimate total stakes from EVT profit data
      const totalStakes = Math.max(totalEvtProfit * 2, (totalUsers || 0) * 10);

      // Get active authors (users with any SOL bonds)
      const { count: activeAuthors } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('total_sol_bonds', 0);

      return {
        total_verifiers: totalVerifiers || 0,
        avg_accuracy: Math.round(avgAccuracy * 100) / 100,
        total_sol_bonds: Math.round(totalSolBonds * 100) / 100,
        total_evt_profit: Math.round(totalEvtProfit * 100) / 100,
        total_stakes: Math.round(totalStakes * 100) / 100,
        active_authors: activeAuthors || 0
      };
    } catch (error) {
      console.error('Error in getLeaderboardStats:', error);
      return this.getMockStats();
    }
  }

  private getMockStats(): LeaderboardStats {
    return {
      total_verifiers: 156,
      avg_accuracy: 89.2,
      total_sol_bonds: 2847.5,
      total_evt_profit: 1250.75,
      total_stakes: 5420.0,
      active_authors: 45
    };
  }

  // Helper method to update user verification stats
  async updateVerificationStats(userId: string, isWin: boolean): Promise<void> {
    try {
      // Check if columns exist first
      const { data: columnTest } = await supabase
        .from('users')
        .select('verification_wins')
        .limit(1);

      if (!columnTest) {
        console.warn('Leaderboard columns not found, skipping verification stats update');
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('verification_wins, verification_losses')
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      const newWins = isWin ? (user.verification_wins || 0) + 1 : (user.verification_wins || 0);
      const newLosses = isWin ? (user.verification_losses || 0) : (user.verification_losses || 0) + 1;
      const totalAttempts = newWins + newLosses;
      const newAccuracy = totalAttempts > 0 ? (newWins / totalAttempts) * 100 : 0;

      await supabase
        .from('users')
        .update({
          verification_wins: newWins,
          verification_losses: newLosses,
          verification_accuracy: Math.round(newAccuracy * 100) / 100
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating verification stats:', error);
      // Don't throw error to prevent breaking the main flow
    }
  }

  // Helper method to update user SOL bonds
  async updateSolBonds(userId: string, bondAmount: number): Promise<void> {
    try {
      // Check if columns exist first
      const { data: columnTest } = await supabase
        .from('users')
        .select('total_sol_bonds')
        .limit(1);

      if (!columnTest) {
        console.warn('Leaderboard columns not found, skipping SOL bonds update');
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('total_sol_bonds')
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      await supabase
        .from('users')
        .update({
          total_sol_bonds: (user.total_sol_bonds || 0) + bondAmount
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating SOL bonds:', error);
      // Don't throw error to prevent breaking the main flow
    }
  }

  // Helper method to update user EVT profit
  async updateEvtProfit(userId: string, profitAmount: number): Promise<void> {
    try {
      // Check if columns exist first
      const { data: columnTest } = await supabase
        .from('users')
        .select('total_evt_profit')
        .limit(1);

      if (!columnTest) {
        console.warn('Leaderboard columns not found, skipping EVT profit update');
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('total_evt_profit')
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      await supabase
        .from('users')
        .update({
          total_evt_profit: (user.total_evt_profit || 0) + profitAmount
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating EVT profit:', error);
      // Don't throw error to prevent breaking the main flow
    }
  }
}

export const leaderboardService = new LeaderboardService();
