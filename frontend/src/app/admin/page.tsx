'use client';

import { useEffect, useState } from 'react';
// Removed unused imports flagged by linter
import Header from "../../components/Header";
import { useWalletIntegration } from "../../lib/wallet-integration";
import { isAdminEnabled } from "../../utils/environment";
import { Event } from '@eventdao/shared';
import { EventService } from '../../lib/event-service';
// import SolanaDashboard from "../../components/SolanaDashboard";
import styles from './page.module.css';

type AdminTab = 'configuration' | 'event-management' | 'user-management' | 'analytics';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('configuration');
  const { user: walletUser } = useWalletIntegration();
  // Configuration state (must be declared before any conditional return)
  const [config, setConfig] = useState({
    resolutionWindow: 48,
    protocolFee: 2,
    minimumBond: 0.1,
    maxStakePerUser: 100,
    rpcEndpoint: 'https://api.devnet.solana.com',
    programId: '8fESbva8KnNirFj6EoyS5ep6Y6XMPMTJgyPufvphV1HK'
  });

  const adminEnabled = isAdminEnabled();
  console.log('Admin user:', walletUser); // TODO: Use walletUser in admin functionality
  // Event management state
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await EventService.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events', err);
      alert('Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'event-management') {
      loadEvents();
    }
  }, [activeTab]);

  const handleRemoveEvent = async (eventId: string, title: string) => {
    const confirmed = confirm(`Remove event "${title}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      setDeletingId(eventId);
      await EventService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      alert('Event removed');
    } catch (err) {
      console.error('Failed to delete event', err);
      alert('Failed to delete event');
    } finally {
      setDeletingId(null);
    }
  };

  const tabs = [
    { id: 'configuration' as AdminTab, label: 'Configuration', icon: '⚙️' },
    { id: 'event-management' as AdminTab, label: 'Event Management', icon: '📅' },
    { id: 'user-management' as AdminTab, label: 'User Management', icon: '👥' },
    { id: 'analytics' as AdminTab, label: 'Analytics', icon: '📊' }
  ];

  const handleConfigUpdate = () => {
    console.log('Configuration updated:', config);
    alert('Configuration updated successfully!');
  };

  const handleConfigChange = (field: string, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'configuration':
        return (
          <div className={styles.configContent}>
            {/* System Configuration */}
            <div className={styles.configPanel}>
              <h3 className={styles.configTitle}>System Configuration</h3>
              <div className={styles.configGrid}>
                <div className={styles.configColumn}>
                  <div className={styles.configField}>
                    <label className={styles.configLabel}>Resolution Window (hours)</label>
                    <input
                      type="number"
                      value={config.resolutionWindow}
                      onChange={(e) => handleConfigChange('resolutionWindow', parseInt(e.target.value))}
                      className={styles.configInput}
                    />
                  </div>
                  <div className={styles.configField}>
                    <label className={styles.configLabel}>Protocol Fee (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.protocolFee}
                      onChange={(e) => handleConfigChange('protocolFee', parseFloat(e.target.value))}
                      className={styles.configInput}
                    />
                  </div>
                </div>
                <div className={styles.configColumn}>
                  <div className={styles.configField}>
                    <label className={styles.configLabel}>Minimum Bond (EVT)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.minimumBond}
                      onChange={(e) => handleConfigChange('minimumBond', parseFloat(e.target.value))}
                      className={styles.configInput}
                    />
                  </div>
                  <div className={styles.configField}>
                    <label className={styles.configLabel}>Max Stake per User (EVT)</label>
                    <input
                      type="number"
                      value={config.maxStakePerUser}
                      onChange={(e) => handleConfigChange('maxStakePerUser', parseInt(e.target.value))}
                      className={styles.configInput}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.configActions}>
                <button onClick={handleConfigUpdate} className={styles.updateButton}>
                  Update Configuration
                </button>
              </div>
            </div>

            {/* Network Settings */}
            <div className={styles.configPanel}>
              <h3 className={styles.configTitle}>Network Settings</h3>
              <div className={styles.networkFields}>
                <div className={styles.configField}>
                  <label className={styles.configLabel}>RPC Endpoint</label>
                  <input
                    type="text"
                    value={config.rpcEndpoint}
                    onChange={(e) => handleConfigChange('rpcEndpoint', e.target.value)}
                    className={styles.configInput}
                  />
                </div>
                <div className={styles.configField}>
                  <label className={styles.configLabel}>Program ID</label>
                  <input
                    type="text"
                    value={config.programId}
                    onChange={(e) => handleConfigChange('programId', e.target.value)}
                    className={styles.configInput}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'event-management':
        return (
          <div className={styles.managementContent}>
            <h3 className={styles.managementTitle}>Event Management</h3>
            <div className={styles.managementGrid}>
              <div className={styles.managementCard}>
                <h4 className={styles.managementCardTitle}>Active Events</h4>
                <div className={styles.managementStat}>{events.filter(e => e.status === 'active').length}</div>
                <p className={styles.managementDescription}>Events currently being verified</p>
              </div>
              <div className={styles.managementCard}>
                <h4 className={styles.managementCardTitle}>Pending Events</h4>
                <div className={styles.managementStat}>{events.filter(e => e.status === 'disputed').length}</div>
                <p className={styles.managementDescription}>Events awaiting review</p>
              </div>
              <div className={styles.managementCard}>
                <h4 className={styles.managementCardTitle}>Resolved Events</h4>
                <div className={styles.managementStat}>{events.filter(e => e.status === 'completed').length}</div>
                <p className={styles.managementDescription}>Events with final resolution</p>
              </div>
            </div>

            <div className={styles.configPanel}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
                <h4 className={styles.managementCardTitle}>All Events</h4>
                <button className={styles.updateButton} onClick={loadEvents} disabled={loadingEvents}>
                  {loadingEvents ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <div style={{overflowX:'auto'}}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>EVT Authentic</th>
                      <th>EVT Hoax</th>
                      <th>Bond (SOL)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(ev => (
                      <tr key={ev.id}>
                        <td>{ev.title}</td>
                        <td>{ev.status}</td>
                        <td>{ev.category}</td>
                        <td>{new Date(ev.date).toLocaleDateString()}</td>
                        <td>{ev.authentic_stake}</td>
                        <td>{ev.hoax_stake}</td>
                        <td>{ev.bond}</td>
                        <td style={{textAlign:'right'}}>
                          <button
                            className={styles.dangerButton}
                            onClick={() => handleRemoveEvent(ev.id, ev.title)}
                            disabled={deletingId === ev.id}
                            title="Remove event"
                          >
                            {deletingId === ev.id ? 'Removing...' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && !loadingEvents && (
                      <tr>
                        <td colSpan={8} style={{textAlign:'center', opacity:0.8, padding:'12px 0'}}>
                          No events found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'user-management':
        return (
          <div className={styles.managementContent}>
            <h3 className={styles.managementTitle}>User Management</h3>
            <div className={styles.managementGrid}>
              <div className={styles.managementCard}>
                <h4 className={styles.managementCardTitle}>Total Users</h4>
                <div className={styles.managementStat}>1,234</div>
                <p className={styles.managementDescription}>Registered users</p>
              </div>
              <div className={styles.managementCard}>
                <h4 className={styles.managementCardTitle}>Active Users</h4>
                <div className={styles.managementStat}>892</div>
                <p className={styles.managementDescription}>Users active in last 30 days</p>
              </div>
              <div className={styles.managementCard}>
                <h4 className={styles.managementCardTitle}>Top Verifiers</h4>
                <div className={styles.managementStat}>156</div>
                <p className={styles.managementDescription}>Users with high reputation</p>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className={styles.managementContent}>
            <h3 className={styles.managementTitle}>Analytics</h3>
            <div className={styles.managementGrid}>
              <div className={styles.managementCard}>
                <h4 className={styles.managementCardTitle}>Total Volume</h4>
                <div className={styles.managementStat}>2,456 EVT</div>
                <p className={styles.managementDescription}>Total staked across all events</p>
              </div>
              <div className={styles.managementCard}>
                <h4 className={styles.managementCardTitle}>Success Rate</h4>
                <div className={styles.managementStat}>87%</div>
                <p className={styles.managementDescription}>Events verified as authentic</p>
              </div>
              <div className={styles.managementCard}>
                <h4 className={styles.managementCardTitle}>Avg Resolution</h4>
                <div className={styles.managementStat}>2.3 days</div>
                <p className={styles.managementDescription}>Average time to resolve events</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={styles.configContent}>
            <div className={styles.configPanel}>
              <h3 className={styles.configTitle}>System Configuration</h3>
              <p className={styles.configDescription}>Configure system parameters and network settings.</p>
            </div>
          </div>
        );
    }
  };

  if (!adminEnabled) {
    return (
      <div className={styles.page}>
        <Header currentPage="admin" />
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Access Denied</h1>
            <p className={styles.subtitle}>
              Admin panel is only available in devnet/development environment
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header currentPage="admin" />

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Admin Panel</h1>
          <p className={styles.subtitle}>
            Manage Solana integration, run tests, and configure system settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
