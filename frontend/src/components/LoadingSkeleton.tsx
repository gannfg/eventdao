'use client';

import styles from './LoadingSkeleton.module.css';

interface LoadingSkeletonProps {
  type?: 'text' | 'avatar' | 'image' | 'card' | 'button';
  width?: string;
  height?: string;
  className?: string;
}

export default function LoadingSkeleton({ 
  type = 'text', 
  width, 
  height, 
  className 
}: LoadingSkeletonProps) {
  const style: React.CSSProperties = {};
  
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div 
      className={`${styles.skeleton} ${styles[type]} ${className || ''}`}
      style={style}
    />
  );
}

// Pre-configured skeleton components
export function AvatarSkeleton() {
  return <LoadingSkeleton type="avatar" width="32px" height="32px" />;
}

export function TextSkeleton({ lines = 1 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton 
          key={i} 
          type="text" 
          width={i === lines - 1 ? '60%' : '100%'} 
          height="16px"
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className={styles.cardContainer}>
      <LoadingSkeleton type="image" width="100%" height="200px" />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <LoadingSkeleton type="text" width="80%" height="20px" />
        <LoadingSkeleton type="text" width="60%" height="16px" />
        <LoadingSkeleton type="text" width="40%" height="16px" />
      </div>
    </div>
  );
}

export function ButtonSkeleton() {
  return <LoadingSkeleton type="button" width="120px" height="40px" />;
}

