'use client';

import { useState, useEffect } from 'react';
import { stakingService } from '../lib/staking-service';
import { evtCreditsService } from '../lib/evt-credits-service';
import styles from './StakingModal.module.css';

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  userId: string;
  stakeType: 'true' | 'false';
  onStakeSuccess: () => void;
}

export default function StakingModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  userId,
  stakeType,
  onStakeSuccess,
}: StakingModalProps) {
  const [evtAmount, setEvtAmount] = useState<string>('100');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [hasStaked, setHasStaked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUserCredits();
      checkExistingStake();
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

  const checkExistingStake = async () => {
    try {
      const stake = await stakingService.getUserStake(userId, eventId);
      setHasStaked(stake !== null);
    } catch (error) {
      console.error('Error checking stake:', error);
    }
  };

  const handleStake = async () => {
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

      await stakingService.createStake({
        userId,
        eventId,
        stakeType,
        evtAmount: amount,
      });

      onStakeSuccess();
      onClose();
      setEvtAmount('100');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Staking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Stake on Event</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.eventInfo}>
            <h3 className={styles.eventTitle}>{eventTitle}</h3>
            <div className={styles.stakeTypeInfo}>
              <span className={`${styles.stakeTypeBadge} ${styles[stakeType]}`}>
                {stakeType === 'true' ? 'TRUE ✓' : 'FALSE ✗'}
              </span>
            </div>
          </div>

          {hasStaked && (
            <div className={styles.warning}>
              ⚠️ You have already staked on this event
            </div>
          )}

          <div className={styles.creditsInfo}>
            <div className={styles.creditsLabel}>Your EVT Credits:</div>
            <div className={styles.creditsAmount}>{userCredits.toFixed(2)} EVT</div>
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
              disabled={loading || hasStaked}
            />
            <div className={styles.quickAmounts}>
              <button
                type="button"
                onClick={() => setEvtAmount('50')}
                className={styles.quickButton}
                disabled={loading || hasStaked}
              >
                50
              </button>
              <button
                type="button"
                onClick={() => setEvtAmount('100')}
                className={styles.quickButton}
                disabled={loading || hasStaked}
              >
                100
              </button>
              <button
                type="button"
                onClick={() => setEvtAmount('500')}
                className={styles.quickButton}
                disabled={loading || hasStaked}
              >
                500
              </button>
              <button
                type="button"
                onClick={() => setEvtAmount(userCredits.toString())}
                className={styles.quickButton}
                disabled={loading || hasStaked}
              >
                All
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              {stakeType === 'true' 
                ? 'You are staking that this event is TRUE'
                : 'You are staking that this event is FALSE'}
            </p>
            <p className={styles.infoText}>
              If you are correct, you'll earn your stake back plus rewards from the losing side.
            </p>
            <p className={styles.infoText}>
              If you are wrong, you'll lose your stake.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={styles.stakeButton}
            onClick={handleStake}
            disabled={loading || hasStaked || parseFloat(evtAmount) <= 0}
          >
            {loading ? 'Staking...' : 'Confirm Stake'}
          </button>
        </div>
      </div>
    </div>
  );
}

