'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Header from "../../components/Header";
// import { useWalletIntegration } from "../../lib/wallet-integration";
import styles from './page.module.css';

interface Transaction {
  id: string;
  type: 'Faucet' | 'Stake' | 'Reward';
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  signature: string;
  timestamp: string;
}

interface LastConnection {
  connected_at: string;
}

interface Analytics {
  totalConnections: number;
  uniqueSessions: number;
  connectionFrequency: { daily: number; weekly: number; monthly: number };
  lastConnection: LastConnection | null;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'Faucet',
    amount: 100,
    status: 'Success',
    signature: 'matpie...xsnpn5',
    timestamp: '10/7/2025, 10:08:04 AM'
  },
  {
    id: '2',
    type: 'Faucet',
    amount: 100,
    status: 'Success',
    signature: '5K7...8H2',
    timestamp: '10/7/2025, 9:07:48 AM'
  },
  {
    id: '3',
    type: 'Stake',
    amount: -5,
    status: 'Success',
    signature: '3M9...2L5',
    timestamp: '10/7/2025, 8:07:48 AM'
  },
  {
    id: '4',
    type: 'Reward',
    amount: 2.5,
    status: 'Success',
    signature: '7N4...9K1',
    timestamp: '10/7/2025, 7:07:48 AM'
  }
];

export default function WalletPage() {
  const router = useRouter();
  const [analytics] = useState<Analytics>({
    totalConnections: 0,
    uniqueSessions: 0,
    connectionFrequency: { daily: 0, weekly: 0, monthly: 0 },
    lastConnection: null
  });
  const [connections] = useState([]);
  const [connectionsLoading] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'stake':
        router.push('/explore');
        break;
      case 'submit':
        router.push('/submit');
        break;
      case 'history':
        setIsHistoryModalOpen(true);
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount} EVT`;
  };

  const getTransactionTypeClass = (type: string) => {
    switch (type) {
      case 'Faucet': return styles.blueBadge;
      case 'Stake': return styles.purpleBadge;
      case 'Reward': return styles.greenBadge;
      default: return styles.grayBadge;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Success': return styles.successBadge;
      case 'Pending': return styles.pendingBadge;
      case 'Failed': return styles.failedBadge;
      default: return styles.grayBadge;
    }
  };

  return (
    <div className={styles.page}>
      <Header currentPage="wallet" />

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Wallet Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your EVT tokens, staking, and transaction history (Local Mode - No Database)
          </p>
        </div>

        {/* Primary Metrics Section */}
        <div className={styles.primaryMetrics}>
          <div className={styles.primaryCard}>
            <div className={styles.primaryCardHeader}>
              <div className={styles.primaryCardTitle}>Available Balance</div>
              <div className={styles.primaryCardIcon}>💰</div>
            </div>
            <div className={styles.primaryCardValue}>250.50 EVT</div>
            <div className={styles.primaryCardSubtitle}>Ready to stake</div>
          </div>
          
          <div className={styles.primaryCard}>
            <div className={styles.primaryCardHeader}>
              <div className={styles.primaryCardTitle}>Total Staked</div>
              <div className={styles.primaryCardIcon}>🔒</div>
            </div>
            <div className={styles.primaryCardValue}>25.5 EVT</div>
            <div className={styles.primaryCardSubtitle}>In active events</div>
          </div>
          
          <div className={styles.primaryCard}>
            <div className={styles.primaryCardHeader}>
              <div className={styles.primaryCardTitle}>Net Earnings</div>
              <div className={styles.primaryCardIcon}>📈</div>
            </div>
            <div className={`${styles.primaryCardValue} ${styles.positiveValue}`}>+12.3 EVT</div>
            <div className={styles.primaryCardSubtitle}>Total rewards</div>
          </div>
        </div>

        {/* Secondary Metrics and Actions */}
        <div className={styles.secondarySection}>
          <div className={styles.secondaryMetrics}>
            <div className={styles.reputationCard}>
              <div className={styles.reputationHeader}>
                <h3 className={styles.reputationTitle}>Reputation</h3>
                <div className={styles.reputationIcon}>⭐</div>
              </div>
              <div className={styles.reputationContent}>
                <div className={styles.circularProgress}>
                  <svg className={styles.progressSvg} viewBox="0 0 120 120">
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#9c27b0" />
                        <stop offset="100%" stopColor="#ba68c8" />
                      </linearGradient>
                    </defs>
                    {/* Background dashed circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="8"
                      strokeDasharray="8 4"
                      strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="314.16"
                      strokeDashoffset="47.12"
                      className={styles.progressPath}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className={styles.reputationCenter}>
                    <div className={styles.reputationIconCenter}>⭐</div>
                    <div className={styles.reputationScore}>850</div>
                    <div className={styles.reputationLabel}>Points</div>
                  </div>
                </div>
                <div className={styles.progressText}>85% to next level</div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricCardHeader}>
                <h3 className={styles.metricCardTitle}>Staking Stats</h3>
                <div className={styles.metricCardIcon}>📊</div>
              </div>
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <span>Total Earned:</span>
                  <span className={styles.positiveText}>+12.3 EVT</span>
                </div>
                <div className={styles.statItem}>
                  <span>Total Lost:</span>
                  <span className={styles.negativeText}>-2.1 EVT</span>
                </div>
                <div className={styles.statItem}>
                  <span>Success Rate:</span>
                  <span className={styles.positiveText}>92%</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.quickActionsSection}>
            <h3 className={styles.quickActionsTitle}>Quick Actions</h3>
            <div className={styles.quickActionsGrid}>
              <button 
                className={`${styles.quickActionBtn} ${styles.primaryAction}`}
                onClick={() => handleQuickAction('stake')}
              >
                <div className={styles.actionIcon}>🎯</div>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>Stake on Event</div>
                  <div className={styles.actionSubtitle}>Join prediction markets</div>
                </div>
              </button>
              
              <button 
                className={`${styles.quickActionBtn} ${styles.secondaryAction}`}
                onClick={() => handleQuickAction('submit')}
              >
                <div className={styles.actionIcon}>📝</div>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>Submit Event</div>
                  <div className={styles.actionSubtitle}>Create new prediction</div>
                </div>
              </button>
              
              <button 
                className={`${styles.quickActionBtn} ${styles.tertiaryAction}`}
                onClick={() => handleQuickAction('history')}
              >
                <div className={styles.actionIcon}>📋</div>
                <div className={styles.actionText}>
                  <div className={styles.actionTitle}>View History</div>
                  <div className={styles.actionSubtitle}>Transaction records</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Transaction History */}
        <div className={styles.historyCard}>
          <h3 className={styles.historyTitle}>Transaction History</h3>
          <div className={styles.tableContainer}>
            <table className={styles.transactionTable}>
              <thead>
                <tr>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>SIGNATURE</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <span className={`${styles.typeBadge} ${getTransactionTypeClass(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={transaction.amount >= 0 ? styles.positiveAmount : styles.negativeAmount}>
                      {formatAmount(transaction.amount)}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className={styles.signature}>{transaction.signature}</td>
                    <td className={styles.timestamp}>{transaction.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction History Modal */}
        {isHistoryModalOpen && (
          <div className={styles.modalOverlay} onClick={closeHistoryModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Transaction History</h2>
                <button className={styles.closeButton} onClick={closeHistoryModal}>
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalTableContainer}>
                  <table className={styles.modalTransactionTable}>
                    <thead>
                      <tr>
                        <th>TYPE</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                        <th>SIGNATURE</th>
                        <th>TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <span className={`${styles.typeBadge} ${getTransactionTypeClass(transaction.type)}`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className={transaction.amount >= 0 ? styles.positiveAmount : styles.negativeAmount}>
                            {formatAmount(transaction.amount)}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className={styles.signature}>{transaction.signature}</td>
                          <td className={styles.timestamp}>{transaction.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
