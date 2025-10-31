'use client';

import styles from './PageLoader.module.css';

export default function PageLoader() {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      <p className={styles.loadingText}>Loading...</p>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className={styles.inlineLoader}>
      <div className={styles.spinnerDot}></div>
      <div className={styles.spinnerDot}></div>
      <div className={styles.spinnerDot}></div>
    </div>
  );
}

