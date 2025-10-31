'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { evtCreditsService } from '../lib/evt-credits-service';
import { stakingService } from '../lib/staking-service';
import styles from './VerificationModal.module.css';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  userId: string;
  onVoteSuccess: () => void;
}

export default function VerificationModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  userId,
  onVoteSuccess,
}: VerificationModalProps) {
  const [vote, setVote] = useState<'true' | 'false' | null>(null);
  const [evtAmount, setEvtAmount] = useState<string>('50');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [eventStatus, setEventStatus] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserCredits();
      checkExistingVote();
      fetchEventStatus();
    }
  }, [isOpen, userId, eventId]);

  const fetchUserCredits = async () => {
    try {
      const credits = await evtCreditsService.getUserCredits(userId);
      setUserCredits(credits?.balance || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const checkExistingVote = async () => {
    try {
      const { data } = await supabase
        .from('verification_votes')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .single();

      if (data) {
        setHasVoted(true);
        setVote(data.vote as 'true' | 'false');
      }
    } catch (error) {
      // No vote found
      setHasVoted(false);
    }
  };

  const fetchEventStatus = async () => {
    try {
      const { data } = await supabase
        .from('events')
        .select('resolution_status, final_result, verification_window_open')
        .eq('id', eventId)
        .single();

      setEventStatus(data);
    } catch (error) {
      console.error('Error fetching event status:', error);
    }
  };

  const handleVote = async () => {
    if (!vote) {
      setError('Please select your vote');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amount = parseFloat(evtAmount);
      
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
      const deducted = await evtCreditsService.deductCredits(userId, amount);
      if (!deducted) {
        throw new Error('Failed to deduct EVT credits');
      }

      // Record verification vote
      const { error: voteError } = await supabase
        .from('verification_votes')
        .insert({
          user_id: userId,
          event_id: eventId,
          vote: vote,
          evt_stake: amount,
        });

      if (voteError) {
        // Refund credits if vote failed
        await evtCreditsService.addCredits(userId, amount);
        throw new Error(`Failed to record vote: ${voteError.message}`);
      }

      // Create a verification stake
      await stakingService.createStake({
        userId,
        eventId,
        stakeType: vote,
        evtAmount: amount,
        sessionType: 'verification',
      });

      onVoteSuccess();
      onClose();
      setVote(null);
      setEvtAmount('50');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voting failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEventResolved = eventStatus?.resolution_status === 'resolved';
  const isVerifiedClosed = !eventStatus?.verification_window_open;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Verify Event</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.eventInfo}>
            <h3 className={styles.eventTitle}>{eventTitle}</h3>
            <div className={styles.statusBadge}>
              {isEventResolved 
                ? `✓ RESOLVED: ${eventStatus?.final_result?.toUpperCase()}`
                : 'Verification Phase'}
            </div>
          </div>

          {isEventResolved && (
            <div className={styles.notice}>
              This event has been resolved. You can view the results below.
            </div>
          )}

          {isVerifiedClosed && !isEventResolved && (
            <div className={styles.notice}>
              Verification window is closed. Waiting for resolution.
            </div>
          )}

          {hasVoted && (
            <div className={styles.successBox}>
              ✓ You have already voted: <strong>{vote?.toUpperCase()}</strong>
            </div>
          )}

          {!isEventResolved && !isVerifiedClosed && (
            <>
              <div className={styles.creditsInfo}>
                <div className={styles.creditsLabel}>Your EVT Credits:</div>
                <div className={styles.creditsAmount}>{userCredits.toFixed(2)} EVT</div>
              </div>

              <div className={styles.voteSection}>
                <div className={styles.voteLabel}>Your Verdict:</div>
                <div className={styles.voteButtons}>
                  <button
                    className={`${styles.voteButton} ${vote === 'true' ? styles.selected : ''} ${styles.trueButton}`}
                    onClick={() => setVote('true')}
                    disabled={loading || hasVoted}
                  >
                    ✓ TRUE
                  </button>
                  <button
                    className={`${styles.voteButton} ${vote === 'false' ? styles.selected : ''} ${styles.falseButton}`}
                    onClick={() => setVote('false')}
                    disabled={loading || hasVoted}
                  >
                    ✗ FALSE
                  </button>
                </div>
              </div>

              <div className={styles.amountInput}>
                <label htmlFor="evtAmount" className={styles.label}>
                  Stake Amount (EVT)
                </label>
                <input
                  id="evtAmount"
                  type="number"
                  value={evtAmount}
                  onChange={(e) => setEvtAmount(e.target.value)}
                  min="1"
                  max={userCredits}
                  step="0.01"
                  className={styles.input}
                  disabled={loading || hasVoted}
                />
                <div className={styles.quickAmounts}>
                  <button
                    type="button"
                    onClick={() => setEvtAmount('25')}
                    className={styles.quickButton}
                    disabled={loading || hasVoted}
                  >
                    25
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvtAmount('50')}
                    className={styles.quickButton}
                    disabled={loading || hasVoted}
                  >
                    50
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvtAmount('100')}
                    className={styles.quickButton}
                    disabled={loading || hasVoted}
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
                  <strong>Verification Phase</strong>: Vote whether this event actually occurred.
                </p>
                <p className={styles.infoText}>
                  Your vote will be counted towards the final resolution.
                </p>
                <p className={styles.infoText}>
                  If you're correct, you'll earn rewards when the event is resolved.
                </p>
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
          {!isEventResolved && !isVerifiedClosed && !hasVoted && (
            <button
              className={styles.voteButtonLarge}
              onClick={handleVote}
              disabled={loading || !vote || parseFloat(evtAmount) <= 0}
            >
              {loading ? 'Submitting...' : 'Submit Vote'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

