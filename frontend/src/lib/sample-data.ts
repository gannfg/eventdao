// Local mode - no database dependency

// Sample users with Solana wallet addresses
export const sampleUsers = [
  {
    wallet_address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    username: 'CryptoEventPro',
    reputation: 850,
    total_staked: 25.5,
    total_verified: 12
  },
  {
    wallet_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    username: 'EventVerifier',
    reputation: 720,
    total_staked: 18.2,
    total_verified: 8
  },
  {
    wallet_address: '5J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D',
    username: 'SolanaEvents',
    reputation: 650,
    total_staked: 15.8,
    total_verified: 6
  },
  {
    wallet_address: '3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y',
    username: 'Web3Validator',
    reputation: 580,
    total_staked: 12.3,
    total_verified: 4
  }
];

// Sample events
export const sampleEvents = [
  {
    title: 'Coldplay Concert - Jakarta',
    description: 'Coldplay performing their Music of the Spheres World Tour at Gelora Bung Karno Stadium. Expected attendance: 50,000+ fans.',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    location: 'Gelora Bung Karno Stadium, Jakarta',
    category: 'Concert',
    status: 'active',
    authentic_stake: 45.2,
    hoax_stake: 8.7,
    bond: 2.5,
    time_left: '14d 6h',
    user_id: '00000000-0000-0000-0000-000000000000' // Will be updated with real user ID
  },
  {
    title: 'Solana Breakpoint 2024',
    description: 'Annual Solana conference featuring keynotes, workshops, and networking. Major announcements expected.',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
    location: 'Singapore Convention Centre',
    category: 'Conference',
    status: 'active',
    authentic_stake: 78.9,
    hoax_stake: 3.2,
    bond: 5.0,
    time_left: '21d 12h',
    user_id: '00000000-0000-0000-0000-000000000000'
  },
  {
    title: 'FIFA World Cup 2026 - Opening Match',
    description: 'Opening match of FIFA World Cup 2026. First match of the tournament with massive global viewership.',
    date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days from now
    location: 'MetLife Stadium, New Jersey',
    category: 'Sports',
    status: 'active',
    authentic_stake: 156.8,
    hoax_stake: 12.4,
    bond: 10.0,
    time_left: '180d 0h',
    user_id: '00000000-0000-0000-0000-000000000000'
  },
  {
    title: 'Tesla Cybertruck Delivery Event',
    description: 'First public delivery event for Tesla Cybertruck. Elon Musk expected to attend and make announcements.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    location: 'Tesla Gigafactory, Texas',
    category: 'Conference',
    status: 'active',
    authentic_stake: 89.3,
    hoax_stake: 15.6,
    bond: 3.0,
    time_left: '7d 18h',
    user_id: '00000000-0000-0000-0000-000000000000'
  },
  {
    title: 'Taylor Swift Eras Tour - Tokyo',
    description: 'Taylor Swift performing her Eras Tour at Tokyo Dome. Sold out show with 55,000 capacity.',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    location: 'Tokyo Dome, Japan',
    category: 'Concert',
    status: 'active',
    authentic_stake: 67.4,
    hoax_stake: 5.1,
    bond: 4.0,
    time_left: '30d 3h',
    user_id: '00000000-0000-0000-0000-000000000000'
  },
  {
    title: 'Bitcoin Halving Event 2024',
    description: 'Bitcoin network halving event reducing block rewards from 6.25 to 3.125 BTC. Major milestone for crypto.',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
    location: 'Global Bitcoin Network',
    category: 'Conference',
    status: 'active',
    authentic_stake: 234.7,
    hoax_stake: 2.1,
    bond: 15.0,
    time_left: '45d 9h',
    user_id: '00000000-0000-0000-0000-000000000000'
  }
];

// Sample transactions
export const sampleTransactions = [
  {
    user_id: '00000000-0000-0000-0000-000000000000',
    event_id: '00000000-0000-0000-0000-000000000000',
    amount: 5.0,
    type: 'stake',
    status: 'completed'
  },
  {
    user_id: '00000000-0000-0000-0000-000000000000',
    event_id: '00000000-0000-0000-0000-000000000000',
    amount: 2.5,
    type: 'reward',
    status: 'completed'
  }
];

// Sample stakes
export const sampleStakes = [
  {
    user_id: '00000000-0000-0000-0000-000000000000',
    event_id: '00000000-0000-0000-0000-000000000000',
    amount: 5.0,
    stake_type: 'authentic'
  },
  {
    user_id: '00000000-0000-0000-0000-000000000000',
    event_id: '00000000-0000-0000-0000-000000000000',
    amount: 2.0,
    stake_type: 'hoax'
  }
];

// Local mode - return sample data without database operations
export const getSampleData = () => {
  console.log('🌱 Loading sample data for local mode...');
  
  // Generate mock IDs for local mode
  const usersWithIds = sampleUsers.map((user, index) => ({
    ...user,
    id: `user-${index + 1}`,
    created_at: new Date().toISOString()
  }));

  const eventsWithIds = sampleEvents.map((event, index) => ({
    ...event,
    id: `event-${index + 1}`,
    user_id: usersWithIds[index % usersWithIds.length].id,
    created_at: new Date().toISOString()
  }));

  const transactionsWithIds = sampleTransactions.map((transaction, index) => ({
    ...transaction,
    id: `transaction-${index + 1}`,
    user_id: usersWithIds[index % usersWithIds.length].id,
    event_id: eventsWithIds[index % eventsWithIds.length].id,
    created_at: new Date().toISOString()
  }));

  const stakesWithIds = sampleStakes.map((stake, index) => ({
    ...stake,
    id: `stake-${index + 1}`,
    user_id: usersWithIds[index % usersWithIds.length].id,
    event_id: eventsWithIds[index % eventsWithIds.length].id,
    created_at: new Date().toISOString()
  }));

  console.log('🎉 Sample data loaded successfully for local mode!');
  
  return {
    users: usersWithIds,
    events: eventsWithIds,
    transactions: transactionsWithIds,
    stakes: stakesWithIds
  };
};

// Local mode - no database clearing needed
export const clearDatabase = async () => {
  console.log('🧹 Local mode - no database to clear');
  console.log('✅ Local mode operation completed successfully!');
  return { success: true };
};
