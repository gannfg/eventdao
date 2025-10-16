'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Header from "../../components/Header";
import AccountInfo from "../../components/AccountInfo";
import Toast from "../../components/Toast";
import { useWalletIntegration } from "../../lib/wallet-integration";
import { missionService, UserMission } from "../../lib/mission-service";
import { useToast } from "../../hooks/useToast";
import styles from './page.module.css';

interface Mission {
  id: string;
  icon: string;
  title: string;
  description: string;
  reward: number;
  status: 'available' | 'in_progress' | 'completed' | 'claimed';
  action?: () => void;
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

const dailyMissions: Mission[] = [
  {
    id: '1',
    icon: '🔗',
    title: 'Connect X Account',
    description: 'Link your X (Twitter) account to EventDAO profile.',
    reward: 50,
    status: 'available'
  },
  {
    id: '2',
    icon: '👥',
    title: 'Follow @Event_DAO',
    description: 'Follow the official EventDAO account on X.',
    reward: 100,
    status: 'available'
  },
  {
    id: '3',
    icon: '💬',
    title: 'Tweet About EventDAO',
    description: 'Post a tweet mentioning @Event_DAO and use hashtag #EventDAO.',
    reward: 150,
    status: 'available'
  },
  {
    id: '4',
    icon: '❤️',
    title: 'Engage with EventDAO Posts',
    description: 'Like or reply to any EventDAO post.',
    reward: 50,
    status: 'completed'
  },
  {
    id: '5',
    icon: '🔁',
    title: 'Retweet EventDAO Updates',
    description: 'Retweet one of our main announcements.',
    reward: 100,
    status: 'available'
  },
  {
    id: '6',
    icon: '🌐',
    title: 'Invite a Friend',
    description: 'Share your referral link and have 1 friend complete connect + follow missions.',
    reward: 200,
    status: 'available'
  },
  {
    id: '7',
    icon: '📆',
    title: 'Daily Login Bonus',
    description: 'Visit EventDAO site and log in each day.',
    reward: 10,
    status: 'completed'
  }
];

export default function WalletPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useWalletIntegration();
  const { toasts, success, error: showError, warning, info, hideToast } = useToast();
  
  const [analytics] = useState<Analytics>({
    totalConnections: 0,
    uniqueSessions: 0,
    connectionFrequency: { daily: 0, weekly: 0, monthly: 0 },
    lastConnection: null
  });
  
  const [missions, setMissions] = useState<Mission[]>(dailyMissions);
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [totalEvtEarned, setTotalEvtEarned] = useState(0);
  const [evtCredits, setEvtCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'stake':
        router.push('/explore');
        break;
      case 'submit':
        router.push('/submit');
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  const handleMissionAction = async (missionId: string) => {
    if (!user?.id) {
      warning('Please connect your wallet first');
      return;
    }

    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    // Update mission status based on current status
    if (mission.status === 'available') {
      // Start the mission in database
      const started = await missionService.startMission(user.id, missionId);
      
      if (started) {
        // Update UI
        setMissions(missions.map(m => 
          m.id === missionId ? { ...m, status: 'in_progress' as const } : m
        ));
        
        // Open external link based on mission type
        switch (mission.title) {
          case 'Connect X Account':
            // Start real OAuth flow
            info('🔗 Connecting to X...\n\nYou will be redirected to Twitter to authorize the connection.', 3000);
            setTimeout(() => {
              window.location.href = '/api/auth/twitter';
            }, 500);
            break;
          case 'Follow @Event_DAO':
            window.open('https://twitter.com/Event_DAO', '_blank');
            info('📱 Opening X (Twitter)...\n\nFollow @Event_DAO and we\'ll detect it automatically!');
            
            // Start auto-verification polling
            startFollowVerification(missionId);
            break;
            
          case 'Tweet About EventDAO':
            const tweetText = encodeURIComponent('Just joined @Event_DAO - the future of decentralized event verification! 🚀 #EventDAO #Web3');
            window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
            info('💬 Opening tweet composer...\n\nPost your tweet and we\'ll detect it automatically!');
            
            // Start auto-verification polling
            startTweetVerification(missionId, '@Event_DAO', '#EventDAO');
            break;
            
          case 'Engage with EventDAO Posts':
            window.open('https://twitter.com/Event_DAO', '_blank');
            info('❤️ Opening EventDAO posts...\n\nLike or reply and we\'ll detect it!');
            
            // Start auto-verification polling (same as follow for now)
            startFollowVerification(missionId);
            break;
            
          case 'Retweet EventDAO Updates':
            window.open('https://twitter.com/Event_DAO', '_blank');
            info('🔁 Opening EventDAO updates...\n\nRetweet and we\'ll detect it!');
            
            // Start auto-verification polling (checks recent activity)
            startTweetVerification(missionId, '@Event_DAO', '');
            break;
          case 'Invite a Friend':
            // Get user's referral code
            const referralCode = await missionService.getUserReferralCode(user.id);
            const referralLink = `${window.location.origin}?ref=${referralCode || 'signup'}`;
            navigator.clipboard.writeText(referralLink);
            success(`🌐 Referral Link Copied!\n\n${referralLink}\n\nShare this link to invite friends!`, 7000);
            break;
        }
      }
    } else if (mission.status === 'completed') {
      // Claim the reward from database
      const result = await missionService.claimMissionReward(user.id, missionId);
      
      if (result.success) {
        // Update UI
        setMissions(missions.map(m => 
          m.id === missionId ? { ...m, status: 'claimed' as const } : m
        ));
        
        // Update EVT balance
        const rewardAmount = result.reward || mission.reward;
        const newTotal = totalEvtEarned + rewardAmount;
        const newBalance = evtCredits + rewardAmount;
        setTotalEvtEarned(newTotal);
        setEvtCredits(newBalance);
        
        success(`🎉 Claimed ${rewardAmount} EVT!\n\nNew Balance: ${newBalance} EVT\nLifetime Earned: ${newTotal} EVT`, 6000);
      } else {
        showError('Failed to claim reward: ' + (result.error || 'Unknown error'));
      }
    }
  };

  // Helper function to mark mission as completed
  const markMissionCompleted = async (missionId: string) => {
    if (!user?.id) return;
    
    const mission = missions.find(m => m.id === missionId);
    const completed = await missionService.completeMission(user.id, missionId);
    
    if (completed) {
      setMissions(missions.map(m => 
        m.id === missionId ? { ...m, status: 'completed' as const } : m
      ));
      
      success(`✅ Mission Completed!\n\n${mission?.title} is done!\nClick "Claim Reward" to get your ${mission?.reward} EVT!`, 6000);
    }
  };

  // Auto-verification for Follow mission
  const startFollowVerification = (missionId: string) => {
    if (!user?.id) return;
    
    let attempts = 0;
    const maxAttempts = 24; // 24 attempts = 2 minutes at 5-second intervals
    
    const checkFollow = async () => {
      try {
        const response = await fetch('/api/missions/verify-follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            targetUsername: 'Event_DAO' 
          }),
        });
        
        if (!response.ok) {
          console.error('Follow verification failed:', await response.text());
          return false;
        }
        
        const { verified } = await response.json();
        
        if (verified) {
          await markMissionCompleted(missionId);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Follow verification error:', error);
        return false;
      }
    };
    
    // Wait 5 seconds before first check (give user time to follow)
    setTimeout(() => {
      const pollInterval = setInterval(async () => {
        attempts++;
        
        const completed = await checkFollow();
        
        if (completed) {
          clearInterval(pollInterval);
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          info('⏱️ Still checking...\n\nIf you followed @Event_DAO, we should detect it soon. You can also refresh the page.', 5000);
        }
      }, 5000); // Check every 5 seconds
    }, 5000);
  };

  // Auto-verification for Tweet mission
  const startTweetVerification = (missionId: string, requiredMention: string, requiredHashtag: string) => {
    if (!user?.id) return;
    
    let attempts = 0;
    const maxAttempts = 24; // 24 attempts = 2 minutes at 5-second intervals
    
    const checkTweet = async () => {
      try {
        const response = await fetch('/api/missions/verify-tweet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id,
            requiredMention,
            requiredHashtag
          }),
        });
        
        if (!response.ok) {
          console.error('Tweet verification failed:', await response.text());
          return false;
        }
        
        const { verified } = await response.json();
        
        if (verified) {
          await markMissionCompleted(missionId);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Tweet verification error:', error);
        return false;
      }
    };
    
    // Wait 10 seconds before first check (give user time to tweet)
    setTimeout(() => {
      const pollInterval = setInterval(async () => {
        attempts++;
        
        const completed = await checkTweet();
        
        if (completed) {
          clearInterval(pollInterval);
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          info('⏱️ Still checking...\n\nIf you tweeted, we should detect it soon. Twitter API can take a few minutes to update.', 5000);
        }
      }, 5000); // Check every 5 seconds
    }, 10000);
  };

  const getMissionButtonText = (status: Mission['status']) => {
    switch (status) {
      case 'available': return 'Start';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Claim Reward';
      case 'claimed': return 'Claimed';
    }
  };

  const getMissionStatusClass = (status: Mission['status']) => {
    switch (status) {
      case 'available': return styles.availableBadge;
      case 'in_progress': return styles.inProgressBadge;
      case 'completed': return styles.completedBadge;
      case 'claimed': return styles.claimedBadge;
    }
  };

  // Handle Twitter OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('twitter_connected') === 'true') {
      success('🔗 X Account Connected!\n\nYour X account has been linked successfully!');
      // Find and complete the Connect X Account mission
      const connectXMission = missions.find(m => m.title === 'Connect X Account');
      if (connectXMission && user?.id) {
        markMissionCompleted(connectXMission.id);
      }
      // Clean up URL
      window.history.replaceState({}, '', '/account');
    }
    
    if (params.get('error')) {
      const errorType = params.get('error');
      let errorMessage = 'Failed to connect X account. Please try again.';
      
      switch (errorType) {
        case 'twitter_denied':
          errorMessage = 'X authorization was denied. Please try again and approve the connection.';
          break;
        case 'invalid_state':
          errorMessage = 'Invalid session. Please try connecting again.';
          break;
        case 'token_exchange_failed':
          errorMessage = 'Failed to exchange authorization code. Please try again.';
          break;
      }
      
      showError(errorMessage);
      window.history.replaceState({}, '', '/account');
    }
  }, [user?.id]);

  // Load missions and EVT data when user is available
  useEffect(() => {
    const loadMissionData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check daily login (awards bonus if first login today)
        await missionService.checkDailyLogin(user.id);

        // Get user's EVT stats
        const stats = await missionService.getUserEvtStats(user.id);
        if (stats) {
          setEvtCredits(stats.evt_credits || 0);
          setTotalEvtEarned(stats.total_evt_earned || 0);
        }

        // Get all missions
        const allMissions = await missionService.getAllMissions();
        
        // Get user's mission progress
        let userMissionData = await missionService.getUserMissions(user.id);
        
        // If no user missions exist, initialize them
        if (userMissionData.length === 0) {
          await missionService.initializeUserMissions(user.id);
          userMissionData = await missionService.getUserMissions(user.id);
        }

        setUserMissions(userMissionData);

        // Convert database missions to UI missions
        const uiMissions: Mission[] = allMissions.map(mission => {
          const userMission = userMissionData.find(um => um.mission_id === mission.id);
          
          return {
            id: mission.id,
            icon: mission.icon,
            title: mission.title,
            description: mission.description,
            reward: mission.reward,
            status: (userMission?.status || 'available') as Mission['status']
          };
        });

        setMissions(uiMissions);
      } catch (err) {
        console.error('Error loading mission data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load missions');
      } finally {
        setLoading(false);
      }
    };

    loadMissionData();
  }, [user?.id]);

  return (
    <div className={styles.page}>
      <Header currentPage="account" />

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Account Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your profile, complete daily missions, and earn EVT credits
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
          </div>
        </div>

        {/* Daily Missions Section */}
        <div className={styles.missionsCard}>
          <div className={styles.missionsHeader}>
            <div>
              <h3 className={styles.missionsTitle}>⚙️ Daily Missions</h3>
              <p className={styles.missionsSubtitle}>
                Complete social actions to earn EVT credits and help spread awareness about EventDAO
              </p>
            </div>
            <div className={styles.evtStats}>
              <div className={styles.totalEarned}>
                <div className={styles.totalEarnedLabel}>Current Balance</div>
                <div className={styles.totalEarnedValue}>{evtCredits} EVT</div>
              </div>
              {totalEvtEarned > 0 && (
                <div className={styles.totalEarned} style={{marginTop: '8px'}}>
                  <div className={styles.totalEarnedLabel}>Lifetime Earned</div>
                  <div className={styles.totalEarnedValue}>+{totalEvtEarned} EVT</div>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}>⏳</div>
              <p>Loading missions...</p>
        </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className={styles.errorState}>
              <div className={styles.errorIcon}>⚠️</div>
              <p>{error}</p>
              <button 
                className={styles.retryBtn}
                onClick={() => window.location.reload()}
              >
                Retry
                </button>
            </div>
          )}

          {/* Not Connected State */}
          {!user && !userLoading && !loading && (
            <div className={styles.notConnectedState}>
              <div className={styles.notConnectedIcon}>🔗</div>
              <h4>Connect Your Wallet</h4>
              <p>Connect your wallet to view and complete missions</p>
            </div>
          )}

          {/* Mission Grid - Only show when missions are loaded */}
          {!loading && !error && user && missions.length > 0 && (
            <div className={styles.missionsGrid}>
              {missions.map((mission) => (
              <div key={mission.id} className={styles.missionCard}>
                <div className={styles.missionHeader}>
                  <div className={styles.missionIconLarge}>{mission.icon}</div>
                  <div className={styles.missionInfo}>
                    <h4 className={styles.missionTitle}>{mission.title}</h4>
                    <p className={styles.missionDescription}>{mission.description}</p>
                  </div>
                </div>

                <div className={styles.missionFooter}>
                  <div className={styles.missionReward}>
                    <span className={styles.rewardIcon}>💰</span>
                    <span className={styles.rewardAmount}>+{mission.reward} EVT</span>
              </div>

                  <button
                    className={`${styles.missionBtn} ${getMissionStatusClass(mission.status)}`}
                    onClick={() => handleMissionAction(mission.id)}
                    disabled={mission.status === 'in_progress' || mission.status === 'claimed'}
                  >
                    {getMissionButtonText(mission.status)}
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Reward Mechanism */}
          {!loading && !error && user && (
            <div className={styles.rewardMechanism}>
            <h4 className={styles.mechanismTitle}>💰 Reward Mechanism</h4>
            <ul className={styles.mechanismList}>
              <li>All missions reward EVT credits (off-chain points)</li>
              <li>EVT credits are stored in Supabase as part of your user profile</li>
              <li>Accumulate EVT to unlock special features and benefits</li>
              <li>Missions reset daily - come back tomorrow for more rewards!</li>
            </ul>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
