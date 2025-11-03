'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { evtCreditsService } from '../lib/evt-credits-service';
import { stakingService } from '../lib/staking-service';
import { useWalletIntegration } from '../lib/wallet-integration';
import styles from './DAOVotingModal.module.css';

interface DAOVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  onVoteSuccess?: () => void;
}

interface AIVerification {
  result: 'true' | 'false' | 'uncertain';
  confidence: number;
  timestamp: string;
}

interface VotingStats {
  trueVotes: number;
  falseVotes: number;
  totalVotes: number;
  trueStakeTotal: number;
  falseStakeTotal: number;
  userVote: 'true' | 'false' | null;
  userHasVoted: boolean;
}

export default function DAOVotingModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onVoteSuccess,
}: DAOVotingModalProps) {
  const { user: walletUser } = useWalletIntegration();
  const [aiVerification, setAiVerification] = useState<AIVerification | null>(null);
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [selectedVote, setSelectedVote] = useState<'true' | 'false' | null>(null);
  const [voteAmount, setVoteAmount] = useState<string>('50');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isOpen && walletUser) {
      fetchDAOData();
      fetchUserCredits();
    }
  }, [isOpen, eventId, walletUser?.id]);

  const fetchDAOData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch event with AI verification
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('ai_verification_result, ai_verification_confidence, ai_verification_timestamp, verification_window_open, resolution_status')
        .eq('id', eventId)
        .maybeSingle();

      if (eventError) {
        console.error('Error fetching event:', eventError);
      }

      if (event?.ai_verification_result) {
        setAiVerification({
          result: event.ai_verification_result as 'true' | 'false' | 'uncertain',
          confidence: event.ai_verification_confidence || 50,
          timestamp: event.ai_verification_timestamp || new Date().toISOString(),
        });
      }

      // Fetch voting statistics
      const { data: votes, error: votesError } = await supabase
        .from('verification_votes')
        .select('vote, evt_stake, user_id')
        .eq('event_id', eventId);

      if (votesError) {
        console.error('Error fetching votes:', votesError);
      }

      const trueVotes = votes?.filter(v => v.vote === 'true').length || 0;
      const falseVotes = votes?.filter(v => v.vote === 'false').length || 0;
      const trueStakeTotal = votes?.filter(v => v.vote === 'true')
        .reduce((sum, v) => sum + parseFloat(v.evt_stake.toString()), 0) || 0;
      const falseStakeTotal = votes?.filter(v => v.vote === 'false')
        .reduce((sum, v) => sum + parseFloat(v.evt_stake.toString()), 0) || 0;

      // Check if user has voted
      const userVote = votes?.find(v => v.user_id === walletUser?.id);
      
      setVotingStats({
        trueVotes,
        falseVotes,
        totalVotes: trueVotes + falseVotes,
        trueStakeTotal,
        falseStakeTotal,
        userVote: userVote?.vote as 'true' | 'false' | null || null,
        userHasVoted: !!userVote,
      });

      if (userVote) {
        setSelectedVote(userVote.vote as 'true' | 'false');
        setVoteAmount(userVote.evt_stake.toString());
      }
    } catch (err) {
      console.error('Error fetching DAO data:', err);
      setError('Failed to load DAO data');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUserCredits = async () => {
    if (!walletUser?.id) return;
    
    try {
      const credits = await evtCreditsService.getUserCredits(walletUser.id);
      setUserCredits(credits?.balance || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleVote = async () => {
    if (!walletUser?.id || !selectedVote) {
      setError('Please connect your wallet and select a vote');
      return;
    }

    if (votingStats?.userHasVoted) {
      setError('You have already voted on this event');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amount = parseFloat(voteAmount);
      
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      if (amount > userCredits) {
        setError('Insufficient EVT credits');
        setLoading(false);
        return;
      }

      // Deduct credits
      const deducted = await evtCreditsService.deductCredits(walletUser.id, amount);
      if (!deducted) {
        throw new Error('Failed to deduct EVT credits');
      }

      // Record DAO vote
      const { error: voteError } = await supabase
        .from('verification_votes')
        .insert({
          user_id: walletUser.id,
          event_id: eventId,
          vote: selectedVote,
          evt_stake: amount,
        });

      if (voteError) {
        // Refund credits if vote failed
        await evtCreditsService.addCredits(walletUser.id, amount);
        
        if (voteError.code === '23505') {
          throw new Error('You have already voted on this event');
        }
        throw new Error(`Failed to record vote: ${voteError.message || 'Unknown error'}`);
      }

      // Create a verification stake
      await stakingService.createStake({
        userId: walletUser.id,
        eventId,
        stakeType: selectedVote,
        evtAmount: amount,
        sessionType: 'verification',
      });

      // Refresh data
      await fetchDAOData();
      await fetchUserCredits();

      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voting failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalStaked = (votingStats?.trueStakeTotal || 0) + (votingStats?.falseStakeTotal || 0);
  const truePercentage = votingStats?.totalVotes ? (votingStats.trueVotes / votingStats.totalVotes) * 100 : 0;
  const falsePercentage = votingStats?.totalVotes ? (votingStats.falseVotes / votingStats.totalVotes) * 100 : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>🤝 DAO Voting Phase</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.eventInfo}>
            <h3 className={styles.eventTitle}>{eventTitle}</h3>
            <div className={styles.phaseBadge}>Verification Phase</div>
          </div>

          {loadingData ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>Loading DAO data...</span>
            </div>
          ) : (
            <>
              {/* AI Verification Section */}
              {aiVerification && (
                <div className={styles.aiSection}>
                  <div className={styles.aiHeader}>
                    <span className={styles.aiIcon}>🤖</span>
                    <h4 className={styles.aiTitle}>AI Verification Result</h4>
                  </div>
                  <div className={styles.aiResultCard}>
                    <div className={styles.aiResultRow}>
                      <span className={styles.aiLabel}>Result:</span>
                      <span className={`${styles.aiResultBadge} ${styles[aiVerification.result]}`}>
                        {aiVerification.result.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.aiResultRow}>
                      <span className={styles.aiLabel}>Confidence:</span>
                      <span className={styles.aiConfidence}>{aiVerification.confidence}%</span>
                    </div>
                    <div className={styles.aiResultRow}>
                      <span className={styles.aiLabel}>Verified:</span>
                      <span className={styles.aiTimestamp}>
                        {new Date(aiVerification.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.aiNotice}>
                    💡 Use this AI analysis to inform your vote. The final resolution will combine AI verification with community consensus.
                  </div>
                </div>
              )}

              {/* Voting Statistics */}
              <div className={styles.statsSection}>
                <h4 className={styles.sectionTitle}>Current Votes</h4>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statValue}>{votingStats?.totalVotes || 0}</div>
                    <div className={styles.statLabel}>Total Votes</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statValue}>{votingStats?.trueVotes || 0}</div>
                    <div className={styles.statLabel}>Voted TRUE</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statValue}>{votingStats?.falseVotes || 0}</div>
                    <div className={styles.statLabel}>Voted FALSE</div>
                  </div>
                </div>

                {/* Vote Breakdown */}
                <div className={styles.voteBreakdown}>
                  <div className={styles.voteBarContainer}>
                    <div className={styles.voteBarLabel}>
                      <span>TRUE</span>
                      <span>{truePercentage.toFixed(1)}%</span>
                    </div>
                    <div className={styles.voteBar}>
                      <div 
                        className={`${styles.voteBarFill} ${styles.trueFill}`}
                        style={{ width: `${truePercentage}%` }}
                      ></div>
                    </div>
                    <div className={styles.voteBarValue}>
                      {votingStats?.trueVotes || 0} votes • {votingStats?.trueStakeTotal.toFixed(2) || 0} EVT
                    </div>
                  </div>

                  <div className={styles.voteBarContainer}>
                    <div className={styles.voteBarLabel}>
                      <span>FALSE</span>
                      <span>{falsePercentage.toFixed(1)}%</span>
                    </div>
                    <div className={styles.voteBar}>
                      <div 
                        className={`${styles.voteBarFill} ${styles.falseFill}`}
                        style={{ width: `${falsePercentage}%` }}
                      ></div>
                    </div>
                    <div className={styles.voteBarValue}>
                      {votingStats?.falseVotes || 0} votes • {votingStats?.falseStakeTotal.toFixed(2) || 0} EVT
                    </div>
                  </div>
                </div>
              </div>

              {/* User Voting Section */}
              {votingStats?.userHasVoted ? (
                <div className={styles.userVoteSection}>
                  <div className={styles.userVoteCard}>
                    <div className={styles.userVoteHeader}>
                      <span className={styles.checkIcon}>✓</span>
                      <span>You've Already Voted</span>
                    </div>
                    <div className={styles.userVoteDetails}>
                      <span className={styles.userVoteLabel}>Your Vote:</span>
                      <span className={`${styles.userVoteBadge} ${styles[votingStats.userVote || 'true']}`}>
                        {votingStats.userVote?.toUpperCase()}
                      </span>
                      <span className={styles.userVoteAmount}>{voteAmount} EVT</span>
                    </div>
                  </div>
                </div>
              ) : walletUser ? (
                <div className={styles.votingSection}>
                  <h4 className={styles.sectionTitle}>Cast Your Vote</h4>
                  
                  <div className={styles.creditsInfo}>
                    <span className={styles.creditsLabel}>Your EVT Credits:</span>
                    <span className={styles.creditsAmount}>{userCredits.toFixed(2)} EVT</span>
                  </div>

                  <div className={styles.voteSelection}>
                    <div className={styles.voteLabel}>Select Your Vote:</div>
                    <div className={styles.voteButtons}>
                      <button
                        className={`${styles.voteOption} ${selectedVote === 'true' ? styles.selected : ''} ${styles.trueOption}`}
                        onClick={() => setSelectedVote('true')}
                        disabled={loading}
                      >
                        <span className={styles.voteIcon}>✓</span>
                        <span>TRUE</span>
                        <span className={styles.voteSubtext}>Event Occurred</span>
                      </button>
                      <button
                        className={`${styles.voteOption} ${selectedVote === 'false' ? styles.selected : ''} ${styles.falseOption}`}
                        onClick={() => setSelectedVote('false')}
                        disabled={loading}
                      >
                        <span className={styles.voteIcon}>✗</span>
                        <span>FALSE</span>
                        <span className={styles.voteSubtext}>Event Did Not Occur</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.amountInput}>
                    <label htmlFor="voteAmount" className={styles.label}>
                      Stake Amount (EVT)
                    </label>
                    <input
                      id="voteAmount"
                      type="number"
                      value={voteAmount}
                      onChange={(e) => setVoteAmount(e.target.value)}
                      min="1"
                      max={userCredits}
                      step="0.01"
                      className={styles.input}
                      disabled={loading}
                    />
                    <div className={styles.quickAmounts}>
                      <button
                        type="button"
                        onClick={() => setVoteAmount('25')}
                        className={styles.quickButton}
                        disabled={loading || 25 > userCredits}
                      >
                        25
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoteAmount('50')}
                        className={styles.quickButton}
                        disabled={loading || 50 > userCredits}
                      >
                        50
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoteAmount('100')}
                        className={styles.quickButton}
                        disabled={loading || 100 > userCredits}
                      >
                        100
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className={styles.error}>{error}</div>
                  )}

                  <div className={styles.infoBox}>
                    <p className={styles.infoText}>
                      <strong>DAO Voting:</strong> Your vote will be combined with the AI verification and other community votes to reach the final resolution.
                    </p>
                    <p className={styles.infoText}>
                      If your vote aligns with the final resolution, you'll earn rewards based on your stake.
                    </p>
                  </div>

                  <button
                    className={styles.submitButton}
                    onClick={handleVote}
                    disabled={loading || !selectedVote || parseFloat(voteAmount) <= 0 || parseFloat(voteAmount) > userCredits}
                  >
                    {loading ? 'Submitting Vote...' : 'Submit DAO Vote'}
                  </button>
                </div>
              ) : (
                <div className={styles.connectWallet}>
                  <p>Please connect your wallet to participate in DAO voting.</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

