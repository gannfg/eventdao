'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Header from "../../components/Header";
import AccountInfo from "../../components/AccountInfo";
import { useWalletIntegration } from "../../lib/wallet-integration";
import { supabase } from '../../lib/supabase';
import { Transaction as DBTransaction } from '@eventdao/shared';
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

export default function WalletPage() {
  const router = useRouter();
  const { user } = useWalletIntegration();
  const [analytics] = useState<Analytics>({
    totalConnections: 0,
    uniqueSessions: 0,
    connectionFrequency: { daily: 0, weekly: 0, monthly: 0 },
    lastConnection: null
  });
  const [connections] = useState([]);
  const [connectionsLoading] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

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

  // Fetch real transactions from database
  useEffect(() => {
    if (!user?.id) {
      setTransactions([]);
      setTransactionsLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      setTransactionsLoading(true);
      try {
        // Fetch stake-related transactions only
        const { data: dbTransactions, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .in('transaction_type', ['stake', 'reward', 'penalty'])
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching stake history:', error);
          setTransactions([]);
          return;
        }

        // Fetch event titles for stake transactions
        const eventIds = [...new Set((dbTransactions || [])
          .filter(tx => tx.event_id)
          .map(tx => tx.event_id!))];

        let eventMap: Record<string, string> = {};
        if (eventIds.length > 0) {
          const { data: events } = await supabase
            .from('events')
            .select('id, title')
            .in('id', eventIds);
          
          if (events) {
            eventMap = events.reduce((acc, event) => {
              acc[event.id] = event.title;
              return acc;
            }, {} as Record<string, string>);
          }
        }

        // Map database transactions to UI format
        const mappedTransactions: Transaction[] = (dbTransactions || []).map((tx: DBTransaction) => {
          // Map transaction_type to UI type
          let type: 'Faucet' | 'Stake' | 'Reward' = 'Stake';
          if (tx.transaction_type === 'reward') {
            type = 'Reward';
          } else if (tx.transaction_type === 'stake') {
            type = 'Stake';
          } else if (tx.transaction_type === 'penalty') {
            // Penalties are shown as negative stakes
            type = 'Stake';
          }

          // Calculate amount (positive for rewards, negative for stakes/penalties)
          const amount = parseFloat((tx.evt_amount || 0).toString());
          const displayAmount = type === 'Reward' ? Math.abs(amount) : -Math.abs(amount);

          // Map status
          let status: 'Success' | 'Pending' | 'Failed' = 'Success';
          if (tx.status === 'pending') {
            status = 'Pending';
          } else if (tx.status === 'failed') {
            status = 'Failed';
          }

          // Format signature with event info if available
          let signature = tx.solana_signature || tx.id || 'N/A';
          if (tx.event_id && eventMap[tx.event_id]) {
            // Include event title in signature for context
            const eventTitle = eventMap[tx.event_id];
            signature = eventTitle.length > 20 
              ? `${eventTitle.slice(0, 20)}...` 
              : eventTitle;
          } else {
            // Truncate signature if no event
            signature = signature.length > 12 
              ? `${signature.slice(0, 4)}...${signature.slice(-4)}`
              : signature;
          }

          // Format timestamp
          const timestamp = new Date(tx.created_at).toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });

          return {
            id: tx.id,
            type,
            amount: displayAmount,
            status,
            signature,
            timestamp
          };
        });

        setTransactions(mappedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();

    // Refresh transactions every 10 seconds
    const interval = setInterval(fetchTransactions, 10000);

    // Refresh when window regains focus
    const handleFocus = () => fetchTransactions();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);

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
                <div className={styles.actionSubtitle}>Stake records</div>
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

        {/* Bottom Section - Stake History */}
        <div className={styles.historyCard}>
          <h3 className={styles.historyTitle}>Stake History</h3>
          <div className={styles.tableContainer}>
            {transactionsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
                Loading stake history...
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
                No stakes yet. Start staking on events to see your history!
              </div>
            ) : (
              <table className={styles.transactionTable}>
                <thead>
                  <tr>
                    <th>TYPE</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>EVENT</th>
                    <th>TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
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
                      <td className={styles.signature} title={transaction.signature}>
                        {transaction.signature}
                      </td>
                      <td className={styles.timestamp}>{transaction.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Stake History Modal */}
        {isHistoryModalOpen && (
          <div className={styles.modalOverlay} onClick={closeHistoryModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Stake History</h2>
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
                        <th>EVENT</th>
                        <th>TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionsLoading ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
                            Loading stake history...
                          </td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
                            No stakes yet. Start staking on events to see your history!
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction) => (
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
                            <td className={styles.signature} title={transaction.signature}>
                              {transaction.signature}
                            </td>
                            <td className={styles.timestamp}>{transaction.timestamp}</td>
                          </tr>
                        ))
                      )}
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
