'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import WalletButton from "../../components/WalletButton";
import { useWalletIntegration } from "../../lib/wallet-integration";
import styles from './page.module.css';

interface Transaction {
  id: string;
  type: 'Faucet' | 'Stake' | 'Reward';
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  signature: string;
  timestamp: string;
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
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const { user: walletUser, loading: walletLoading, isConnected, walletAddress } = useWalletIntegration();
  const [transactions] = useState(mockTransactions); // Use mock transactions
  const [transactionsLoading] = useState(false);
  const [analytics] = useState({
    totalConnections: 0,
    uniqueSessions: 0,
    connectionFrequency: { daily: 0, weekly: 0, monthly: 0 },
    lastConnection: null
  });
  const [connections] = useState([]);
  const [connectionsLoading] = useState(false);

  const handleQuickAction = (action: string) => {
    setSelectedAction(action);
    console.log(`Quick action: ${action}`);
    // TODO: Implement quick action logic
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
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image
            src="/eventdao_letter.png"
            alt="EventDAO Logo"
            width={160}
            height={53}
            className={styles.brandLogo}
          />
          <span className={styles.brandSubtitle}>Solana Web3 Events</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <a href="/submit" className={styles.navLink}>Submit</a>
          <a href="/explore" className={styles.navLink}>Explore</a>
          <a href="/leaderboard" className={styles.navLink}>Leaderboard</a>
          <a href="/wallet" className={`${styles.navLink} ${styles.active}`}>Wallet</a>
          <a href="/admin" className={styles.navLink}>Admin</a>
          <a href="/about" className={styles.navLink}>About</a>
        </nav>
        <div className={styles.actions}>
          <button className={styles.initializeBtn}>Initialize DAO</button>
          <WalletButton className={styles.walletBtn} />
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Wallet Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your EVT tokens, staking, and transaction history (Local Mode - No Database)
          </p>
        </div>

        {/* Top Section - Balance Cards */}
        <div className={styles.balanceGrid}>
          <div className={styles.balanceCard}>
            <div className={styles.cardTitle}>Available Balance</div>
            <div className={styles.cardValue}>250.50 EVT</div>
            <div className={styles.cardSubtitle}>EVT Tokens</div>
          </div>
          
          <div className={styles.balanceCard}>
            <div className={styles.cardTitle}>SOL Balance</div>
            <div className={styles.cardValue}>1.0000 SOL</div>
            <div className={styles.cardSubtitle}>Network Fee</div>
          </div>
          
          <div className={styles.balanceCard}>
            <div className={styles.cardTitle}>Total Staked</div>
            <div className={styles.cardValue}>25.5 EVT</div>
            <div className={styles.cardSubtitle}>In Active Events</div>
          </div>
          
          <div className={styles.balanceCard}>
            <div className={styles.cardTitle}>Net Earnings</div>
            <div className={`${styles.cardValue} ${styles.positiveValue}`}>+12.3 EVT</div>
            <div className={styles.cardSubtitle}>Total Rewards</div>
          </div>
        </div>

        {/* Middle Section - Stats and Actions */}
        <div className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>Staking Stats</h3>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <span>Total Staked:</span>
                <span>25.5 EVT</span>
              </div>
              <div className={styles.statItem}>
                <span>Total Earned:</span>
                <span className={styles.positiveText}>+12.3 EVT</span>
              </div>
              <div className={styles.statItem}>
                <span>Total Lost:</span>
                <span className={styles.negativeText}>-2.1 EVT</span>
              </div>
            </div>
          </div>

          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>Reputation</h3>
            <div className={styles.reputationContent}>
              <div className={styles.reputationScore}>850</div>
              <div className={styles.reputationLabel}>Reputation Points</div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill}></div>
              </div>
              <div className={styles.progressText}>85% to next level</div>
            </div>
          </div>

          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>Wallet Connections</h3>
            <div className={styles.connectionStats}>
              {connectionsLoading ? (
                <div className={styles.loadingText}>Loading connection data...</div>
              ) : (
                <>
                  <div className={styles.statItem}>
                    <span>Total Connections:</span>
                    <span>{analytics.totalConnections}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span>Unique Sessions:</span>
                    <span>{analytics.uniqueSessions}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span>This Week:</span>
                    <span>{analytics.connectionFrequency.weekly}</span>
                  </div>
                  {analytics.lastConnection && (
                    <div className={styles.statItem}>
                      <span>Last Connected:</span>
                      <span>{new Date(analytics.lastConnection.connected_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>Quick Actions</h3>
            <div className={styles.actionsList}>
              <button 
                className={`${styles.actionBtn} ${styles.primaryBtn}`}
                onClick={() => handleQuickAction('stake')}
              >
                Stake on Event
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                onClick={() => handleQuickAction('submit')}
              >
                Submit Event
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.tertiaryBtn}`}
                onClick={() => handleQuickAction('history')}
              >
                View History
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
      </div>
    </div>
  );
}
