'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import styles from './ResolutionResults.module.css';

interface ResolutionResultsProps {
  eventId: string;
  eventTitle: string;
}

interface ResolutionData {
  event: any;
  trueVotes: number;
  falseVotes: number;
  trueStakeTotal: number;
  falseStakeTotal: number;
  totalUsers: number;
  resolution: any;
  userStake: any;
}

export default function ResolutionResults({ eventId, eventTitle }: ResolutionResultsProps) {
  const [data, setData] = useState<ResolutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResolutionData();
  }, [eventId]);

  const fetchResolutionData = async () => {
    try {
      setLoading(true);

      // Fetch event data
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!event) {
        throw new Error('Event not found');
      }

      // Fetch voting statistics
      const { data: votes } = await supabase
        .from('verification_votes')
        .select('vote')
        .eq('event_id', eventId);

      const trueVotes = votes?.filter(v => v.vote === 'true').length || 0;
      const falseVotes = votes?.filter(v => v.vote === 'false').length || 0;

      // Fetch stake totals
      const { data: stakes } = await supabase
        .from('stakes')
        .select('stake_type, evt_amount')
        .eq('event_id', eventId)
        .eq('status', 'active');

      const trueStakeTotal = stakes?.filter(s => s.stake_type === 'true')
        .reduce((sum, s) => sum + parseFloat(s.evt_amount.toString()), 0) || 0;
      const falseStakeTotal = stakes?.filter(s => s.stake_type === 'false')
        .reduce((sum, s) => sum + parseFloat(s.evt_amount.toString()), 0) || 0;

      // Fetch resolution history
      const { data: resolution } = await supabase
        .from('resolution_history')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Count unique users
      const uniqueUsers = new Set(votes?.map(v => v.vote));
      const totalUsers = uniqueUsers.size;

      setData({
        event,
        trueVotes,
        falseVotes,
        trueStakeTotal,
        falseStakeTotal,
        totalUsers,
        resolution,
        userStake: null, // Will be populated if user is logged in
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resolution data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading resolution data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Failed to load data'}</div>
      </div>
    );
  }

  const { event, trueVotes, falseVotes, trueStakeTotal, falseStakeTotal, resolution } = data;
  const isResolved = event.resolution_status === 'resolved';
  const winningSide = event.final_result === 'true' ? 'TRUE' : 'FALSE';
  const totalVotes = trueVotes + falseVotes;
  const truePercentage = totalVotes > 0 ? (trueVotes / totalVotes) * 100 : 0;
  const falsePercentage = totalVotes > 0 ? (falseVotes / totalVotes) * 100 : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Resolution Results</h2>
        <div className={`${styles.statusBadge} ${styles[event.resolution_status]}`}>
          {isResolved ? '✓ RESOLVED' : event.resolution_status.toUpperCase()}
        </div>
      </div>

      <div className={styles.content}>
        {/* Event Info */}
        <div className={styles.eventInfo}>
          <h3 className={styles.eventTitle}>{eventTitle}</h3>
          <div className={styles.eventMeta}>
            <span className={styles.metaItem}>📅 {new Date(event.date).toLocaleDateString()}</span>
            <span className={styles.metaItem}>📍 {event.location}</span>
          </div>
        </div>

        {/* Final Result */}
        {isResolved && (
          <div className={styles.finalResult}>
            <div className={styles.resultLabel}>Final Verdict</div>
            <div className={`${styles.resultValue} ${styles[event.final_result]}`}>
              {winningSide} WINS
            </div>
            {resolution && (
              <div className={styles.resultReasoning}>
                {resolution.ai_response?.reasoning || 'Event verified by community and AI'}
              </div>
            )}
          </div>
        )}

        {/* AI Verification */}
        {event.ai_verification_result && (
          <div className={styles.aiVerification}>
            <div className={styles.aiHeader}>
              <span className={styles.aiIcon}>🤖</span>
              <span className={styles.aiTitle}>AI Verification</span>
            </div>
            <div className={styles.aiDetails}>
              <div className={styles.aiResult}>
                Result: <strong>{event.ai_verification_result.toUpperCase()}</strong>
              </div>
              <div className={styles.aiConfidence}>
                Confidence: <strong>{event.ai_verification_confidence}%</strong>
              </div>
              {event.ai_verification_timestamp && (
                <div className={styles.aiTimestamp}>
                  Verified: {new Date(event.ai_verification_timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voting Statistics */}
        <div className={styles.votingStats}>
          <h4 className={styles.sectionTitle}>Voting Statistics</h4>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{totalVotes}</div>
              <div className={styles.statLabel}>Total Votes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{data.totalUsers}</div>
              <div className={styles.statLabel}>Voters</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {isResolved ? data.totalUsers : '-'}
              </div>
              <div className={styles.statLabel}>Rewarded</div>
            </div>
          </div>
        </div>

        {/* Vote Breakdown */}
        <div className={styles.voteBreakdown}>
          <h4 className={styles.sectionTitle}>Vote Breakdown</h4>
          <div className={styles.voteBars}>
            <div className={styles.voteBar}>
              <div className={styles.voteBarHeader}>
                <span className={styles.voteBarLabel}>TRUE</span>
                <span className={styles.voteBarPercentage}>{truePercentage.toFixed(1)}%</span>
              </div>
              <div className={styles.voteBarBg}>
                <div 
                  className={`${styles.voteBarFill} ${styles.trueFill}`}
                  style={{ width: `${truePercentage}%` }}
                />
              </div>
              <div className={styles.voteBarDetails}>
                {trueVotes} votes • {trueStakeTotal.toFixed(2)} EVT staked
              </div>
            </div>

            <div className={styles.voteBar}>
              <div className={styles.voteBarHeader}>
                <span className={styles.voteBarLabel}>FALSE</span>
                <span className={styles.voteBarPercentage}>{falsePercentage.toFixed(1)}%</span>
              </div>
              <div className={styles.voteBarBg}>
                <div 
                  className={`${styles.voteBarFill} ${styles.falseFill}`}
                  style={{ width: `${falsePercentage}%` }}
                />
              </div>
              <div className={styles.voteBarDetails}>
                {falseVotes} votes • {falseStakeTotal.toFixed(2)} EVT staked
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Info */}
        {isResolved && resolution && (
          <div className={styles.rewardsInfo}>
            <h4 className={styles.sectionTitle}>Rewards Distributed</h4>
            <div className={styles.rewardsGrid}>
              <div className={styles.rewardCard}>
                <div className={styles.rewardIcon}>💰</div>
                <div className={styles.rewardValue}>
                  {resolution.total_rewards_distributed?.toFixed(2) || '0.00'} EVT
                </div>
                <div className={styles.rewardLabel}>Total Rewards</div>
              </div>
              <div className={styles.rewardCard}>
                <div className={styles.rewardIcon}>👥</div>
                <div className={styles.rewardValue}>
                  {resolution.total_users_rewarded || 0}
                </div>
                <div className={styles.rewardLabel}>Winners</div>
              </div>
              <div className={styles.rewardCard}>
                <div className={styles.rewardIcon}>⏰</div>
                <div className={styles.rewardValue}>
                  {new Date(resolution.created_at).toLocaleDateString()}
                </div>
                <div className={styles.rewardLabel}>Resolved Date</div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Resolution Message */}
        {!isResolved && (
          <div className={styles.pendingMessage}>
            <div className={styles.pendingIcon}>⏳</div>
            <div className={styles.pendingText}>
              This event is awaiting resolution. Results will be available after verification completes.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

