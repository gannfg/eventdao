# Solana Devnet Integration

This directory contains the Solana integration for EventDAO, specifically configured for the devnet environment.

## Files Overview

### `solana-utils.ts`
Core utility functions for interacting with Solana devnet:
- **Connection Management**: `getSolanaConnection()` - Creates connection to Solana devnet
- **Balance Operations**: `getAccountBalance()`, `formatSolAmount()`
- **Transactions**: `sendSol()`, `requestAirdrop()` (devnet only)
- **Account Info**: `getAccountInfo()`, `getTransactionHistory()`
- **Network Info**: `getNetworkInfo()` - Get current network status
- **Validation**: `isValidSolanaAddress()`

### `wallet-integration.ts` (existing)
Integrates Solana wallet with Supabase user management:
- User creation/lookup by wallet address
- Profile management
- Statistics tracking

## React Hooks

### `useSolanaDevnet.ts`
A comprehensive React hook that combines wallet functionality with Solana operations:
- **State Management**: Balance, transactions, network info, loading states
- **Actions**: Send SOL, request airdrop, refresh data
- **Auto-refresh**: Balance updates every 30 seconds when connected

## Components

### `SolanaDashboard.tsx`
Full-featured dashboard component with:
- Account balance display
- Network information
- SOL transfer functionality
- Airdrop requests (devnet only)
- Transaction history
- Real-time updates


## Configuration

The integration is configured for **Solana Devnet**:
- **RPC Endpoint**: `https://api.devnet.solana.com`
- **WebSocket**: `wss://api.devnet.solana.com`
- **Network**: Devnet (free SOL available via airdrop)

## Usage Examples

### Basic Hook Usage
```tsx
import { useSolanaDevnet } from '../hooks/useSolanaDevnet';

function MyComponent() {
  const {
    isConnected,
    balance,
    formattedBalance,
    requestDevnetAirdrop,
    sendSolTransaction
  } = useSolanaDevnet();

  const handleAirdrop = () => {
    requestDevnetAirdrop(1); // Request 1 SOL
  };

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Balance: {formattedBalance} SOL</p>
          <button onClick={handleAirdrop}>Get Free SOL</button>
        </div>
      ) : (
        <p>Connect wallet to start</p>
      )}
    </div>
  );
}
```

### Direct Utility Usage
```tsx
import { getAccountBalance, requestAirdrop } from '../lib/solana-utils';
import { PublicKey } from '@solana/web3.js';

// Get balance
const publicKey = new PublicKey('your-wallet-address');
const balance = await getAccountBalance(publicKey);

// Request airdrop (devnet only)
const signature = await requestAirdrop(publicKey, 1); // 1 SOL
```

## Wallet Support

The integration supports:
- **Phantom Wallet**
- Auto-connection on page load
- Modal wallet selection

## Pages

- **`/solana`** - Full Solana dashboard
- **Home page** - Quick actions component integrated

## Development Notes

- All transactions are confirmed before returning
- Error handling is comprehensive with user-friendly messages
- Network info is fetched automatically on connection
- Balance refreshes every 30 seconds when connected
- Transaction history is limited to recent transactions for performance

## Testing

For testing on devnet:
1. Connect your wallet (Phantom)
2. Use the airdrop function to get free SOL
3. Test sending SOL between addresses
4. Check transaction history in the dashboard

The integration is production-ready for devnet and can be easily adapted for mainnet by changing the network configuration.
