import { supabase } from './supabase';
import { Event } from '@eventdao/shared';

export interface AIVerificationResult {
  result: 'true' | 'false' | 'uncertain';
  confidence: number;
  reasoning: string;
  sources?: string[];
}

export interface ResolutionResult {
  success: boolean;
  winningSide: 'true' | 'false';
  aiResult?: AIVerificationResult;
  rewardsDistributed: number;
  usersRewarded: number;
  error?: string;
}

/**
 * AI Resolution Service
 * Handles AI-powered event verification and resolution
 */
export class AIResolutionService {
  /**
   * Verify event using AI
   * Uses OpenAI API to analyze event and determine truth
   */
  async verifyEventWithAI(event: Event): Promise<AIVerificationResult> {
    try {
      // TODO: Replace with actual OpenAI API call
      // For now, using mock implementation
      
      const prompt = this.buildVerificationPrompt(event);
      
      // Mock AI response - Replace with actual API call
      const mockResponse = await this.mockAIResponse(event);
      
      return mockResponse;
      
      /* Actual OpenAI implementation:
      const response = await fetch('/api/ai/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, prompt })
      });
      
      const result = await response.json();
      return result;
      */
    } catch (error) {
      console.error('AI verification failed:', error);
      return {
        result: 'uncertain',
        confidence: 0,
        reasoning: 'AI verification failed. Using community vote.',
      };
    }
  }

  /**
   * Build verification prompt for AI
   */
  private buildVerificationPrompt(event: Event): string {
    return `
Analyze the following event claim and determine if it is TRUE or FALSE:

Event Title: ${event.title}
Description: ${event.description}
Date: ${event.date}
Location: ${event.location}
Category: ${event.category}
URL: ${event.event_url || 'N/A'}

Please verify:
1. Did this event actually occur?
2. Are there credible sources confirming this event?
3. Is the information accurate?

Respond with:
- result: 'true' or 'false' or 'uncertain'
- confidence: 0-100 (percentage)
- reasoning: Brief explanation
- sources: Any credible sources found

Response format: JSON
`;
  }

  /**
   * Mock AI response for testing
   * TODO: Replace with actual OpenAI API call
   */
  private async mockAIResponse(event: Event): Promise<AIVerificationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock logic: Randomly determine result
    const random = Math.random();
    const result = random > 0.3 ? 'true' : 'false';
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    return {
      result: result as 'true' | 'false',
      confidence,
      reasoning: `After analyzing ${event.title}, I found credible sources confirming this event.`,
      sources: ['Mock Source 1', 'Mock Source 2'],
    };
  }

  /**
   * Resolve event (AI verification + reward distribution)
   */
  async resolveEvent(eventId: string): Promise<ResolutionResult> {
    try {
      // 1. Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found');
      }

      // 2. Check if event is ready for resolution
      const eventAny = event as any;
      if (eventAny.resolution_status === 'resolved') {
        return {
          success: false,
          winningSide: (eventAny.final_result || 'true') as 'true' | 'false',
          rewardsDistributed: 0,
          usersRewarded: 0,
          error: 'Event already resolved',
        };
      }

      // 3. Determine winning side based on votes
      const trueVotes = eventAny.true_votes || 0;
      const falseVotes = eventAny.false_votes || 0;
      const winningSide = trueVotes > falseVotes ? 'true' : 'false';
      
      // 4. Verify with AI
      const aiResult = await this.verifyEventWithAI(event);
      
      // 5. Confirm final result (AI + community vote)
      const finalResult = this.determineFinalResult(
        winningSide,
        aiResult.result,
        aiResult.confidence
      );

      // 6. Update event status
      await this.updateEventResolution(eventId, finalResult, aiResult);

      // 7. Distribute rewards
      const distributionResult = await this.distributeRewards(eventId, finalResult);

      // 8. Record resolution history
      await this.recordResolutionHistory(eventId, finalResult, aiResult, distributionResult);

      return {
        success: true,
        winningSide: finalResult,
        aiResult,
        rewardsDistributed: distributionResult.totalRewards,
        usersRewarded: distributionResult.usersRewarded,
      };
    } catch (error) {
      console.error('Resolution failed:', error);
      return {
        success: false,
        winningSide: 'true',
        rewardsDistributed: 0,
        usersRewarded: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Determine final result based on AI and community vote
   */
  private determineFinalResult(
    winningSide: 'true' | 'false',
    aiResult: 'true' | 'false' | 'uncertain',
    aiConfidence: number
  ): 'true' | 'false' {
    // If AI confidence is high (>80%), trust AI over community vote
    if (aiConfidence > 80 && aiResult !== 'uncertain') {
      return aiResult;
    }
    
    // Otherwise, trust community vote
    return winningSide;
  }

  /**
   * Update event with resolution results
   */
  private async updateEventResolution(
    eventId: string,
    finalResult: 'true' | 'false',
    aiResult: AIVerificationResult
  ): Promise<void> {
    const { error } = await supabase
      .from('events')
      .update({
        resolution_status: 'resolved',
        final_result: finalResult,
        ai_verification_result: aiResult.result,
        ai_verification_confidence: aiResult.confidence,
        ai_verification_timestamp: new Date().toISOString(),
        status: 'completed',
      })
      .eq('id', eventId);

    if (error) {
      throw new Error(`Failed to update event resolution: ${error.message}`);
    }
  }

  /**
   * Distribute rewards to winners
   */
  private async distributeRewards(
    eventId: string,
    winningSide: 'true' | 'false'
  ): Promise<{ totalRewards: number; usersRewarded: number }> {
    try {
      // Get all winning stakes
      const { data: winningStakes, error: stakesError } = await supabase
        .from('stakes')
        .select('*')
        .eq('event_id', eventId)
        .eq('stake_type', winningSide)
        .eq('status', 'active');

      if (stakesError || !winningStakes || winningStakes.length === 0) {
        return { totalRewards: 0, usersRewarded: 0 };
      }

      // Get losing stakes to calculate reward pool
      const { data: losingStakes } = await supabase
        .from('stakes')
        .select('*')
        .eq('event_id', eventId)
        .neq('stake_type', winningSide)
        .eq('status', 'active');

      const losingStakeTotal = losingStakes?.reduce((sum, s) => sum + parseFloat(s.evt_amount.toString()), 0) || 0;
      const totalRewardPool = losingStakeTotal; // Winners get the losers' stakes

      // Calculate reward per winner (proportional to their stake)
      const winningStakeTotal = winningStakes.reduce((sum, s) => sum + parseFloat(s.evt_amount.toString()), 0);
      
      let totalRewardsDistributed = 0;
      const userIds: string[] = [];

      for (const stake of winningStakes) {
        const stakeAmount = parseFloat(stake.evt_amount.toString());
        const reward = (stakeAmount / winningStakeTotal) * totalRewardPool;
        
        // Add reward to user's EVT credits
        await this.addEVTCredits(stake.user_id, stakeAmount + reward);
        
        // Update stake status
        await supabase
          .from('stakes')
          .update({ status: 'won' })
          .eq('id', stake.id);

        totalRewardsDistributed += reward;
        if (!userIds.includes(stake.user_id)) {
          userIds.push(stake.user_id);
        }
      }

      // Mark losing stakes as lost
      if (losingStakes) {
        for (const stake of losingStakes) {
          await supabase
            .from('stakes')
            .update({ status: 'lost' })
            .eq('id', stake.id);
        }
      }

      return {
        totalRewards: totalRewardsDistributed,
        usersRewarded: userIds.length,
      };
    } catch (error) {
      console.error('Reward distribution failed:', error);
      return { totalRewards: 0, usersRewarded: 0 };
    }
  }

  /**
   * Add EVT credits to user
   */
  private async addEVTCredits(userId: string, amount: number): Promise<void> {
    const { error } = await supabase.rpc('add_evt_credits', {
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) {
      // Fallback: Direct update
      const { data: credits } = await supabase
        .from('evt_credits')
        .select('balance')
        .eq('user_id', userId)
        .single();

      const newBalance = (credits?.balance || 0) + amount;

      await supabase
        .from('evt_credits')
        .upsert({
          user_id: userId,
          balance: newBalance,
          total_earned: newBalance,
        });
    }
  }

  /**
   * Record resolution history
   */
  private async recordResolutionHistory(
    eventId: string,
    finalResult: 'true' | 'false',
    aiResult: AIVerificationResult,
    distributionResult: { totalRewards: number; usersRewarded: number }
  ): Promise<void> {
    await supabase
      .from('resolution_history')
      .insert({
        event_id: eventId,
        resolution_type: 'ai',
        result: finalResult,
        ai_verification_used: true,
        ai_confidence: aiResult.confidence,
        ai_response: {
          reasoning: aiResult.reasoning,
          sources: aiResult.sources,
        },
        winning_side: finalResult,
        total_rewards_distributed: distributionResult.totalRewards,
        total_users_rewarded: distributionResult.usersRewarded,
      });
  }

  /**
   * Get events ready for resolution
   */
  async getEventsReadyForResolution(): Promise<any[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('resolution_status', 'pending')
      .lt('end_time', new Date().toISOString())
      .order('end_time', { ascending: true });

    if (error) {
      console.error('Error fetching events ready for resolution:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Trigger automatic resolution for events past end time
   */
  async processExpiredEvents(): Promise<void> {
    const events = await this.getEventsReadyForResolution();
    
    for (const event of events) {
      try {
        console.log(`Resolving event: ${event.title}`);
        await this.resolveEvent(event.id);
      } catch (error) {
        console.error(`Failed to resolve event ${event.id}:`, error);
      }
    }
  }
}

export const aiResolutionService = new AIResolutionService();

