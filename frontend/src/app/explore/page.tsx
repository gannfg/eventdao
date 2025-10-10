'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletIntegration } from "../../lib/wallet-integration";
import { EventService } from "../../lib/event-service";
import { Event } from '@eventdao/shared';
import styles from './page.module.css';

// Use the Event type from shared types

const categories = ['All', 'Concert', 'Conference', 'Sports'];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const { publicKey } = useWallet();
  const { user: walletUser } = useWalletIntegration();

  // Fetch events from Supabase
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await EventService.getEvents();
      setEvents(fetchedEvents);
      console.log('Events fetched from Supabase:', fetchedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const refetch = () => {
    fetchEvents();
  };

  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'stake-high':
        return (b.authentic_stake + b.hoax_stake) - (a.authentic_stake + a.hoax_stake);
      case 'stake-low':
        return (a.authentic_stake + a.hoax_stake) - (b.authentic_stake + b.hoax_stake);
      default:
        return 0;
    }
  });

  const handleStake = async (eventId: string, stakeType: 'authentic' | 'hoax') => {
    if (!publicKey || !walletUser) {
      alert('Please connect your wallet first');
      return;
    }
    
    try {
      // TODO: Implement actual staking logic with Solana program
      console.log(`Staking ${stakeType} on event ${eventId} with wallet ${publicKey.toString()}`);
      console.log(`User: ${walletUser.username} (${walletUser.wallet_address})`);
      alert(`Staking ${stakeType} on event ${eventId} as ${walletUser.username}`);
    } catch (error) {
      console.error('Staking failed:', error);
      alert('Staking failed. Please try again.');
    }
  };

  const handleCardClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleImageError = (eventId: string) => {
    setImageErrors(prev => new Set(prev).add(eventId));
  };

  return (
    <div className={styles.page}>
      <Header currentPage="explore" />

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Explore Events</h1>
          <p className={styles.subtitle}>
            Browse and stake on events for verification
          </p>
        </div>

        <div className={styles.filters}>
          <div className={styles.categoryFilters}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryBtn} ${
                  selectedCategory === category ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className={styles.sortContainer}>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="stake-high">Highest Stake</option>
              <option value="stake-low">Lowest Stake</option>
            </select>
            <button
              className={styles.refreshBtn}
              onClick={refetch}
              disabled={loading}
              title="Refresh events"
            >
              {loading ? '⟳' : '↻'}
            </button>
          </div>
        </div>

        {loading && (
          <div className={styles.loading}>
            <p>Loading events...</p>
          </div>
        )}
        
        {error && (
          <div className={styles.error}>
            <p>Error loading events: {error}</p>
          </div>
        )}
        
        {!loading && !error && sortedEvents.length === 0 && (
          <div className={styles.noEvents}>
            <p>No events found. Be the first to submit an event!</p>
          </div>
        )}

        <div className={styles.eventsGrid}>
          {sortedEvents.map((event) => (
            <div 
              key={event.id} 
              className={styles.eventCard}
              onClick={() => handleCardClick(event)}
            >
              {/* Image Preview */}
              <div className={styles.imagePreview}>
                {event.media_files && event.media_files.length > 0 && !imageErrors.has(event.id) ? (
                  <Image
                    src={event.media_files[0]}
                    alt={event.title}
                    width={400}
                    height={200}
                    className={styles.previewImage}
                    onError={() => handleImageError(event.id)}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <div className={styles.placeholderIcon}>
                      {event.category === 'Concert' ? '🎵' :
                       event.category === 'Conference' ? '🎤' :
                       event.category === 'Sports' ? '⚽' :
                       event.category === 'Workshop' ? '🔧' :
                       event.category === 'Meetup' ? '👥' :
                       '📅'}
                    </div>
                    <div className={styles.placeholderText}>{event.category}</div>
                  </div>
                )}
              </div>

              <div className={styles.cardHeader}>
                <span className={`${styles.statusBadge} ${styles[event.status]}`}>
                  {event.status}
                </span>
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.eventTitle}>{event.title}</h3>

                <div className={styles.stakingInfo}>
                  <div className={styles.stakeItem}>
                    <div className={styles.stakeAmount}>{event.authentic_stake} SOL</div>
                    <div className={styles.stakeLabel}>Authentic</div>
                  </div>
                  <div className={styles.stakeItem}>
                    <div className={styles.stakeAmount}>{event.hoax_stake} SOL</div>
                    <div className={styles.stakeLabel}>Hoax</div>
                  </div>
                </div>

                <div className={styles.bondInfo}>
                  Bond: {event.bond} SOL
                </div>

                <div className={styles.timeLeft}>
                  Time left: {event.time_left}
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.stakeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStake(event.id, 'authentic');
                  }}
                >
                  Stake Authentic
                </button>
                <button
                  className={`${styles.stakeBtn} ${styles.hoaxBtn}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStake(event.id, 'hoax');
                  }}
                >
                  Stake Hoax
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedEvent.title}</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Modal Image Preview */}
              {selectedEvent.media_files && selectedEvent.media_files.length > 0 && !imageErrors.has(selectedEvent.id) ? (
                <div className={styles.modalImagePreview}>
                  <Image
                    src={selectedEvent.media_files[0]}
                    alt={selectedEvent.title}
                    width={600}
                    height={300}
                    className={styles.modalImage}
                    onError={() => handleImageError(selectedEvent.id)}
                  />
                </div>
              ) : (
                <div className={styles.modalImagePreview}>
                  <div className={styles.modalImagePlaceholder}>
                    <div className={styles.modalPlaceholderIcon}>
                      {selectedEvent.category === 'Concert' ? '🎵' :
                       selectedEvent.category === 'Conference' ? '🎤' :
                       selectedEvent.category === 'Sports' ? '⚽' :
                       selectedEvent.category === 'Workshop' ? '🔧' :
                       selectedEvent.category === 'Meetup' ? '👥' :
                       '📅'}
                    </div>
                    <div className={styles.modalPlaceholderText}>{selectedEvent.category}</div>
                  </div>
                </div>
              )}

              <div className={styles.modalDescription}>
                <p>{selectedEvent.description}</p>
              </div>

              <div className={styles.modalDetails}>
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailIcon}>📅</span>
                  <span>{selectedEvent.date}</span>
                </div>
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailIcon}>📍</span>
                  <span>{selectedEvent.location}</span>
                </div>
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailIcon}>🎫</span>
                  <span>{selectedEvent.category}</span>
                </div>
                {selectedEvent.event_url && (
                  <div className={styles.modalDetailItem}>
                    <span className={styles.modalDetailIcon}>🔗</span>
                    <a href={selectedEvent.event_url} target="_blank" rel="noopener noreferrer">
                      Event Website
                    </a>
                  </div>
                )}
              </div>

              <div className={styles.modalStakingInfo}>
                <div className={styles.modalStakeItem}>
                  <div className={styles.modalStakeAmount}>{selectedEvent.authentic_stake} SOL</div>
                  <div className={styles.modalStakeLabel}>Authentic</div>
                </div>
                <div className={styles.modalStakeItem}>
                  <div className={styles.modalStakeAmount}>{selectedEvent.hoax_stake} SOL</div>
                  <div className={styles.modalStakeLabel}>Hoax</div>
                </div>
              </div>

              <div className={styles.modalBondInfo}>
                Bond: {selectedEvent.bond} SOL
              </div>

              <div className={styles.modalTimeLeft}>
                Time left: {selectedEvent.time_left}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.modalStakeBtn}
                onClick={() => {
                  handleStake(selectedEvent.id, 'authentic');
                  closeModal();
                }}
              >
                Stake Authentic
              </button>
              <button
                className={`${styles.modalStakeBtn} ${styles.modalHoaxBtn}`}
                onClick={() => {
                  handleStake(selectedEvent.id, 'hoax');
                  closeModal();
                }}
              >
                Stake Hoax
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
