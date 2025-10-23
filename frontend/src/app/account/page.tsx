'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Header from "../../components/Header";
import AccountInfo from "../../components/AccountInfo";
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

interface QuestTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardEvt: number;
  action: 'stake' | 'submit' | 'checkin' | 'leaderboard';
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

  // Daily check-in state
  const [checkedInToday, setCheckedInToday] = useState(false);

  useEffect(() => {
    try {
      const key = 'evt_daily_checkin';
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      const today = new Date().toISOString().slice(0, 10);
      if (stored === today) {
        setCheckedInToday(true);
      }
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const quests: QuestTask[] = [
    {
      id: 'q1',
      title: 'Daily Check-in',
      description: 'Come back each day to claim a small reward.',
      icon: '📅',
      rewardEvt: 20,
      action: 'checkin'
    },
    {
      id: 'q2',
      title: 'Stake on an Event',
      description: 'Place a stake on any active prediction market.',
      icon: '🎯',
      rewardEvt: 50,
      action: 'stake'
    },
    {
      id: 'q3',
      title: 'Submit an Event',
      description: 'Propose a new event to the community.',
      icon: '📝',
      rewardEvt: 75,
      action: 'submit'
    },
    {
      id: 'q4',
      title: 'Join the Leaderboard',
      description: 'Compete by earning reputation and EVT.',
      icon: '🏆',
      rewardEvt: 30,
      action: 'leaderboard'
    }
  ];

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

  const handleQuestAction = (action: QuestTask['action']) => {
    switch (action) {
      case 'stake':
        router.push('/explore');
        return;
      case 'submit':
        router.push('/submit');
        return;
      case 'checkin': {
        if (checkedInToday) {
          alert('You have already checked in today. Come back tomorrow!');
          return;
        }
        const today = new Date().toISOString().slice(0, 10);
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('evt_daily_checkin', today);
          }
          setCheckedInToday(true);
          alert('Daily check-in recorded! +20 EVT');
        } catch (e) {
          console.error('Failed to store check-in:', e);
          setCheckedInToday(true);
        }
        return;
      }
      case 'leaderboard':
        router.push('/leaderboard');
        return;
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
      <Header currentPage="account" />

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Account Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your profile, EVT tokens, staking, and transaction history
          </p>
        </div>

        {/* Account Information Section */}
        <AccountInfo />

        {/* Quick Actions Section */}
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

        {/* Quests Section - EVT Earnings */}
        <div className={styles.questsSection}>
          <h3 className={styles.questsTitle}>Quests to Earn EVT</h3>
          <div className={styles.questsGrid}>
            {quests.map((quest) => (
              <div key={quest.id} className={styles.questCard}>
                <div className={styles.questIcon}>{quest.icon}</div>
                <div className={styles.questContent}>
                  <div className={styles.questHeaderRow}>
                    <div className={styles.questTitle}>{quest.title}</div>
                    <div className={styles.questReward}>+{quest.rewardEvt} EVT</div>
                  </div>
                  <div className={styles.questDesc}>{quest.description}</div>
                  <button
                    className={`${styles.questActionBtn} ${quest.action === 'checkin' && checkedInToday ? styles.disabledBtn : ''}`}
                    onClick={() => handleQuestAction(quest.action)}
                    aria-label={`Start quest: ${quest.title}`}
                    disabled={quest.action === 'checkin' && checkedInToday}
                  >
                    {quest.action === 'checkin' ? (checkedInToday ? 'Checked In' : 'Check-in') : 'Start'}
                  </button>
                </div>
              </div>
            ))}
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
