'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import styles from './page.module.css';

interface Verifier {
  id: string;
  address: string;
  wins: number;
  losses: number;
  accuracy: number;
  solEarned: number;
  reputation: number;
}

interface Author {
  id: string;
  address: string;
  submitted: number;
  verified: number;
  solEarned: number;
  reputation: number;
}

const mockVerifiers: Verifier[] = [
  {
    id: '1',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    wins: 24,
    losses: 2,
    accuracy: 95.2,
    solEarned: 12.5,
    reputation: 1250
  },
  {
    id: '2',
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    wins: 18,
    losses: 3,
    accuracy: 92.1,
    solEarned: 8.7,
    reputation: 980
  },
  {
    id: '3',
    address: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    wins: 22,
    losses: 1,
    accuracy: 97.8,
    solEarned: 15.2,
    reputation: 920
  },
  {
    id: '4',
    address: '3xJLu2g5qLxW8vQZ9mNpR7sT6uY4iE2wA1bC5dF8gH3j',
    wins: 15,
    losses: 4,
    accuracy: 88.9,
    solEarned: 6.8,
    reputation: 850
  },
  {
    id: '5',
    address: '8kM9nL2pQ4rS7tU1vW3xY6zA9bE5cF2gH8jK4mN7pQ1s',
    wins: 20,
    losses: 2,
    accuracy: 94.3,
    solEarned: 9.3,
    reputation: 780
  }
];

const mockAuthors: Author[] = [
  {
    id: '1',
    address: '4kM9nL2pQ4rS7tU1vW3xY6zA9bE5cF2gH8jK4mN7pQ1s',
    submitted: 8,
    verified: 7,
    solEarned: 4.2,
    reputation: 1100
  },
  {
    id: '2',
    address: '6xJLu2g5qLxW8vQZ9mNpR7sT6uY4iE2wA1bC5dF8gH3j',
    submitted: 6,
    verified: 5,
    solEarned: 3.1,
    reputation: 950
  },
  {
    id: '3',
    address: '2Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    submitted: 5,
    verified: 4,
    solEarned: 2.8,
    reputation: 820
  }
];

const timeFilters = ['All Time', 'This Month', 'This Week'];

export default function LeaderboardPage() {
  const [selectedFilter, setSelectedFilter] = useState('All Time');

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return styles.gold;
      case 2: return styles.silver;
      case 3: return styles.bronze;
      default: return styles.gray;
    }
  };

  return (
    <div className={styles.page}>
      <Header currentPage="leaderboard" />

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Leaderboard</h1>
          <p className={styles.subtitle}>
            Top verifiers and event authors in the EventDAO community
          </p>
        </div>

        <div className={styles.filters}>
          {timeFilters.map((filter) => (
            <button
              key={filter}
              className={`${styles.filterBtn} ${
                selectedFilter === filter ? styles.active : ''
              }`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className={styles.leaderboardGrid}>
          <div className={styles.leaderboardSection}>
            <h2 className={styles.sectionTitle}>Top Verifiers</h2>
            <div className={styles.leaderboardList}>
              {mockVerifiers.map((verifier, index) => (
                <div key={verifier.id} className={styles.leaderboardItem}>
                  <div className={styles.rankContainer}>
                    <div className={`${styles.rankBadge} ${getRankColor(index + 1)}`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.address}>
                      {formatAddress(verifier.address)}
                    </div>
                    <div className={styles.stats}>
                      <span>{verifier.wins}W/{verifier.losses}L</span>
                      <span>•</span>
                      <span>{verifier.accuracy}% accuracy</span>
                    </div>
                  </div>
                  <div className={styles.earnings}>
                    <div className={styles.solAmount}>{verifier.solEarned} SOL</div>
                    <div className={styles.reputation}>{verifier.reputation} rep</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.leaderboardSection}>
            <h2 className={styles.sectionTitle}>Top Authors</h2>
            <div className={styles.leaderboardList}>
              {mockAuthors.map((author, index) => (
                <div key={author.id} className={styles.leaderboardItem}>
                  <div className={styles.rankContainer}>
                    <div className={`${styles.rankBadge} ${getRankColor(index + 1)}`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.address}>
                      {formatAddress(author.address)}
                    </div>
                    <div className={styles.stats}>
                      <span>{author.submitted} submitted</span>
                      <span>•</span>
                      <span>{author.verified} verified</span>
                    </div>
                  </div>
                  <div className={styles.earnings}>
                    <div className={styles.solAmount}>{author.solEarned} SOL</div>
                    <div className={styles.reputation}>{author.reputation} rep</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.summaryStats}>
          <div className={`${styles.statCard} ${styles.blueCard}`}>
            <div className={styles.statNumber}>156</div>
            <div className={styles.statLabel}>Total Verifiers</div>
          </div>
          <div className={`${styles.statCard} ${styles.greenCard}`}>
            <div className={styles.statNumber}>89.2%</div>
            <div className={styles.statLabel}>Avg Accuracy</div>
          </div>
          <div className={`${styles.statCard} ${styles.purpleCard}`}>
            <div className={styles.statNumber}>2,847</div>
            <div className={styles.statLabel}>Total Stakes</div>
          </div>
          <div className={`${styles.statCard} ${styles.orangeCard}`}>
            <div className={styles.statNumber}>45</div>
            <div className={styles.statLabel}>Active Authors</div>
          </div>
        </div>
      </div>
    </div>
  );
}
