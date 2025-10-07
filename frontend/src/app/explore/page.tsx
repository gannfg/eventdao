'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import styles from './page.module.css';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: 'active' | 'completed' | 'disputed';
  authenticStake: number;
  hoaxStake: number;
  bond: number;
  timeLeft: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Coldplay Concert Jakarta 2025',
    description: 'Coldplay will perform at Jakarta International Stadium on March 15, 2025',
    date: '2025-03-15',
    location: 'Jakarta, Indonesia',
    category: 'Concert',
    status: 'active',
    authenticStake: 2.5,
    hoaxStake: 0.8,
    bond: 1,
    timeLeft: '2d 14h'
  },
  {
    id: '2',
    title: 'Web3 Conference Bali 2025',
    description: 'Annual Web3 conference featuring top blockchain speakers',
    date: '2025-04-20',
    location: 'Bali, Indonesia',
    category: 'Conference',
    status: 'active',
    authenticStake: 1.2,
    hoaxStake: 0.3,
    bond: 0.5,
    timeLeft: '5d 8h'
  },
  {
    id: '3',
    title: 'Indonesia vs Malaysia Football Match',
    description: 'International friendly match at Gelora Bung Karno Stadium',
    date: '2025-02-28',
    location: 'Jakarta, Indonesia',
    category: 'Sports',
    status: 'active',
    authenticStake: 3.1,
    hoaxStake: 0.2,
    bond: 1.5,
    timeLeft: '1d 6h'
  },
  {
    id: '4',
    title: 'Tech Summit Singapore 2025',
    description: 'Leading technology conference with AI and blockchain focus',
    date: '2025-05-10',
    location: 'Singapore',
    category: 'Conference',
    status: 'active',
    authenticStake: 0.9,
    hoaxStake: 0.1,
    bond: 0.8,
    timeLeft: '12d 3h'
  }
];

const categories = ['All', 'Concert', 'Conference', 'Sports'];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const filteredEvents = selectedCategory === 'All' 
    ? mockEvents 
    : mockEvents.filter(event => event.category === selectedCategory);

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'stake-high':
        return (b.authenticStake + b.hoaxStake) - (a.authenticStake + a.hoaxStake);
      case 'stake-low':
        return (a.authenticStake + a.hoaxStake) - (b.authenticStake + b.hoaxStake);
      default:
        return 0;
    }
  });

  const handleStake = (eventId: string, stakeType: 'authentic' | 'hoax') => {
    console.log(`Staking ${stakeType} on event ${eventId}`);
    // TODO: Implement staking logic
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
          <a href="/explore" className={`${styles.navLink} ${styles.active}`}>Explore</a>
          <a href="/leaderboard" className={styles.navLink}>Leaderboard</a>
          <a href="/wallet" className={styles.navLink}>Wallet</a>
          <a href="#" className={styles.navLink}>Admin</a>
          <a href="/about" className={styles.navLink}>About</a>
        </nav>
        <div className={styles.actions}>
          <button className={styles.initializeBtn}>Initialize DAO</button>
          <button className={styles.walletBtn}>
            <span className={styles.walletIcon}>👻</span>
            <span>6vWi...r6GK</span>
          </button>
        </div>
      </header>

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
          </div>
        </div>

        <div className={styles.eventsGrid}>
          {sortedEvents.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.cardHeader}>
                <span className={`${styles.statusBadge} ${styles[event.status]}`}>
                  {event.status}
                </span>
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.eventDescription}>{event.description}</p>

                <div className={styles.eventDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📅</span>
                    <span>{event.date}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📍</span>
                    <span>{event.location}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🎫</span>
                    <span>{event.category}</span>
                  </div>
                </div>

                <div className={styles.stakingInfo}>
                  <div className={styles.stakeItem}>
                    <div className={styles.stakeAmount}>{event.authenticStake} SOL</div>
                    <div className={styles.stakeLabel}>Authentic</div>
                  </div>
                  <div className={styles.stakeItem}>
                    <div className={styles.stakeAmount}>{event.hoaxStake} SOL</div>
                    <div className={styles.stakeLabel}>Hoax</div>
                  </div>
                </div>

                <div className={styles.bondInfo}>
                  Bond: {event.bond} SOL
                </div>

                <div className={styles.timeLeft}>
                  Time left: {event.timeLeft}
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.stakeBtn}
                  onClick={() => handleStake(event.id, 'authentic')}
                >
                  Stake Authentic
                </button>
                <button
                  className={`${styles.stakeBtn} ${styles.hoaxBtn}`}
                  onClick={() => handleStake(event.id, 'hoax')}
                >
                  Stake Hoax
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
