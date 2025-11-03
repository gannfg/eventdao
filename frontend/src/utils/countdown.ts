import { useState, useEffect } from 'react';

/**
 * Calculate time left until event with real-time formatting
 * Returns time left in format: "Xd Xh Xm Xs" or "Verifying"
 */
export function calculateTimeLeft(eventDate: string): {
  formatted: string;
  isExpired: boolean;
  milliseconds: number;
} {
  const now = new Date();
  const event = new Date(eventDate);
  const diffTime = event.getTime() - now.getTime();

  if (diffTime <= 0) {
    return {
      formatted: 'Verifying',
      isExpired: true,
      milliseconds: 0,
    };
  }

  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

  let formatted = '';
  if (days > 0) {
    formatted = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    formatted = `${minutes}m ${seconds}s`;
  } else {
    formatted = `${seconds}s`;
  }

  return {
    formatted,
    isExpired: false,
    milliseconds: diffTime,
  };
}

/**
 * React hook for real-time countdown
 */
export function useCountdown(eventDate: string) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(eventDate));

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(eventDate));
    
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(eventDate));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [eventDate]);

  return timeLeft;
}

