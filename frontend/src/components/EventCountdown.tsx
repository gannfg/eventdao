'use client';

import { useCountdown } from '../utils/countdown';
import styles from './EventCountdown.module.css';

interface EventCountdownProps {
  eventDate: string;
  className?: string;
}

export default function EventCountdown({ eventDate, className }: EventCountdownProps) {
  const { formatted, isExpired } = useCountdown(eventDate);

  return (
    <div className={`${styles.countdown} ${isExpired ? styles.expired : ''} ${className || ''}`}>
      <span className={styles.label}>Time left:</span>
      <span className={styles.time}>{formatted}</span>
    </div>
  );
}

