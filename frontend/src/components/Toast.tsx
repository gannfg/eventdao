'use client';

import React, { useEffect } from 'react';
import styles from './Toast.module.css';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.toastContent}>
        <div className={styles.toastIcon}>{getIcon()}</div>
        <div className={styles.toastMessage}>{message}</div>
        <button className={styles.toastClose} onClick={onClose}>
          ×
        </button>
      </div>
      {/* Progress bar showing time remaining */}
      <div className={styles.toastProgressBar}>
        <div 
          className={styles.toastProgress} 
          style={{ 
            animationDuration: `${duration}ms`,
          }}
        />
      </div>
    </div>
  );
};

export default Toast;

