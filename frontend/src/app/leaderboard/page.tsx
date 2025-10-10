'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import { leaderboardService } from "../../lib/leaderboard-service";
import { 
  LeaderboardVerifier, 
  LeaderboardAuthor, 
  LeaderboardProfitMaker, 
  LeaderboardStats 
} from '@eventdao/shared';
import styles from './page.module.css';

const timeFilters = ['All Time', 'This Month', 'This Week'];

export default function LeaderboardPage() {
  const [selectedFilter, setSelectedFilter] = useState('All Time');
  const [verifiers, setVerifiers] = useState<LeaderboardVerifier[]>([]);
  const [authors, setAuthors] = useState<LeaderboardAuthor[]>([]);
  const [profitMakers, setProfitMakers] = useState<LeaderboardProfitMaker[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedFilter]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [verifiersData, authorsData, profitMakersData, statsData] = await Promise.all([
        leaderboardService.getTopVerifiers(10, selectedFilter.toLowerCase().replace(' ', '_')),
        leaderboardService.getTopAuthors(10, selectedFilter.toLowerCase().replace(' ', '_')),
        leaderboardService.getTopProfitMakers(10, selectedFilter.toLowerCase().replace(' ', '_')),
        leaderboardService.getLeaderboardStats()
      ]);

      setVerifiers(verifiersData);
      setAuthors(authorsData);
      setProfitMakers(profitMakersData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading leaderboard data...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button className={styles.retryButton} onClick={fetchLeaderboardData}>
              Retry
            </button>
          </div>
        ) : (
          <div className={styles.leaderboardGrid}>
            <div className={styles.leaderboardSection}>
              <h2 className={styles.sectionTitle}>Top Verifiers</h2>
              <div className={styles.leaderboardList}>
                {verifiers.length > 0 ? verifiers.map((verifier, index) => (
                  <div key={verifier.id} className={styles.leaderboardItem}>
                    <div className={styles.rankContainer}>
                      <div className={`${styles.rankBadge} ${getRankColor(index + 1)}`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.address}>
                        {verifier.username || formatAddress(verifier.wallet_address)}
                      </div>
                      <div className={styles.stats}>
                        <span>{verifier.verification_wins}W/{verifier.verification_losses}L</span>
                        <span>•</span>
                        <span>{verifier.verification_accuracy}% accuracy</span>
                      </div>
                    </div>
                    <div className={styles.earnings}>
                      <div className={styles.solAmount}>{verifier.sol_earned} SOL</div>
                      <div className={styles.reputation}>{verifier.reputation} rep</div>
                    </div>
                  </div>
                )) : (
                  <div className={styles.emptyState}>No verifiers found</div>
                )}
              </div>
            </div>

            <div className={styles.leaderboardSection}>
              <h2 className={styles.sectionTitle}>Top Authors</h2>
              <div className={styles.leaderboardList}>
                {authors.length > 0 ? authors.map((author, index) => (
                  <div key={author.id} className={styles.leaderboardItem}>
                    <div className={styles.rankContainer}>
                      <div className={`${styles.rankBadge} ${getRankColor(index + 1)}`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.address}>
                        {author.username || formatAddress(author.wallet_address)}
                      </div>
                      <div className={styles.stats}>
                        <span>{author.events_submitted} submitted</span>
                        <span>•</span>
                        <span>{author.events_verified} verified</span>
                      </div>
                    </div>
                    <div className={styles.earnings}>
                      <div className={styles.solAmount}>{author.total_sol_bonds} SOL</div>
                      <div className={styles.reputation}>{author.reputation} rep</div>
                    </div>
                  </div>
                )) : (
                  <div className={styles.emptyState}>No authors found</div>
                )}
              </div>
            </div>

            <div className={styles.leaderboardSection}>
              <h2 className={styles.sectionTitle}>Top Profit Makers</h2>
              <div className={styles.leaderboardList}>
                {profitMakers.length > 0 ? profitMakers.map((profitMaker, index) => (
                  <div key={profitMaker.id} className={styles.leaderboardItem}>
                    <div className={styles.rankContainer}>
                      <div className={`${styles.rankBadge} ${getRankColor(index + 1)}`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.address}>
                        {profitMaker.username || formatAddress(profitMaker.wallet_address)}
                      </div>
                      <div className={styles.stats}>
                        <span>{profitMaker.total_stakes} stakes</span>
                        <span>•</span>
                        <span>{profitMaker.win_rate}% win rate</span>
                      </div>
                    </div>
                    <div className={styles.earnings}>
                      <div className={styles.evtAmount}>{profitMaker.total_evt_profit} EVT</div>
                      <div className={styles.reputation}>{profitMaker.reputation} rep</div>
                    </div>
                  </div>
                )) : (
                  <div className={styles.emptyState}>No profit makers found</div>
                )}
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className={styles.summaryStats}>
            <div className={`${styles.statCard} ${styles.blueCard}`}>
              <div className={styles.statNumber}>{stats.total_verifiers}</div>
              <div className={styles.statLabel}>Total Verifiers</div>
            </div>
            <div className={`${styles.statCard} ${styles.greenCard}`}>
              <div className={styles.statNumber}>{stats.avg_accuracy}%</div>
              <div className={styles.statLabel}>Avg Accuracy</div>
            </div>
            <div className={`${styles.statCard} ${styles.purpleCard}`}>
              <div className={styles.statNumber}>{stats.total_sol_bonds}</div>
              <div className={styles.statLabel}>Total SOL Bonds</div>
            </div>
            <div className={`${styles.statCard} ${styles.orangeCard}`}>
              <div className={styles.statNumber}>{stats.total_evt_profit}</div>
              <div className={styles.statLabel}>Total EVT Profit</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
