# Transaction Recording System - Setup Summary

## ✅ What Was Created

### 1. Database Schema (`docs/TRANSACTION_TABLE_SETUP.sql`)
A comprehensive SQL migration file that creates the `transactions` table with:
- **Balance Tracking**: EVT and SOL balances (before/after)
- **Reputation Tracking**: Reputation changes with before/after values
- **Stake Information**: Stake type (authentic/hoax) and amounts
- **Submission Bonds**: Bond amounts for event submissions
- **Solana Integration**: Blockchain signatures, slots, and block times
- **Transaction Types**: 9 different transaction types
- **Indexes**: Optimized indexes for fast queries
- **RLS Policies**: Row-level security policies
- **Auto-update Triggers**: Automatic timestamp updates

### 2. TypeScript Types (`shared/types/database.ts`)
Updated TypeScript interfaces including:
- `Transaction` - Complete transaction interface
- `CreateTransactionData` - Helper type for creating transactions
- Updated `Stake` interface with EVT and SOL amounts

### 3. Transaction Service (`frontend/src/lib/transaction-service.ts`)
A comprehensive service class with methods for:
- Recording stake transactions
- Recording submission bonds
- Recording rewards
- Recording penalties
- Recording bond refunds
- Querying user transaction history
- Querying event transaction history
- Updating transaction status
- Finding transactions by Solana signature

### 4. Documentation (`docs/TRANSACTION_SYSTEM_GUIDE.md`)
Complete usage guide with:
- Setup instructions
- Usage examples for all transaction types
- Integration points
- Best practices
- Error handling
- Troubleshooting

## 📋 Next Steps

### 1. Run the SQL Migration
Execute the SQL file in your Supabase SQL Editor:
```sql
-- Copy contents from docs/TRANSACTION_TABLE_SETUP.sql
-- Run in Supabase SQL Editor
```

### 2. Implement EVT Token Balance Fetching
Update the `getEvtBalance` method in `transaction-service.ts` to fetch actual EVT token balances from your Token-2022 mint.

### 3. Integrate with Your Staking Flow
Add transaction recording to your staking components:
```typescript
import { transactionService } from '@/lib/transaction-service';

// After successful Solana transaction
await transactionService.recordStake({
  userId: user.id,
  eventId: event.id,
  stakeType: 'authentic',
  stakeAmount: 100,
  evtAmount: 100,
  walletAddress: user.wallet_address,
  solanaSignature: signature,
});
```

### 4. Integrate with Event Submission
Add transaction recording when users submit events:
```typescript
await transactionService.recordSubmissionBond({
  userId: user.id,
  eventId: event.id,
  bondAmount: 2.5,
  walletAddress: user.wallet_address,
  solanaSignature: signature,
});
```

### 5. Integrate with Event Resolution
Add transaction recording when events resolve:
```typescript
// For winners
await transactionService.recordReward({
  userId: stake.user_id,
  eventId: event.id,
  evtReward: 150,
  reputationChange: 10,
  walletAddress: stake.wallet_address,
  solanaSignature: signature,
});

// For losers
await transactionService.recordPenalty({
  userId: stake.user_id,
  eventId: event.id,
  reputationPenalty: 5,
  walletAddress: stake.wallet_address,
});
```

## 📊 Transaction Types Supported

1. **stake** - User staking tokens on authentic/hoax
2. **submission** - User submitting an event with bond
3. **reward** - User receiving rewards for correct verification
4. **penalty** - User losing stakes for incorrect verification
5. **bond_refund** - Refund of submission bond
6. **evt_transfer** - EVT token transfer
7. **sol_transfer** - SOL transfer
8. **reputation** - Reputation change
9. **event_resolution** - Event resolved (affects all stakes)

## 🔍 What Gets Tracked

### For Each Transaction:
- ✅ EVT balance (before and after)
- ✅ SOL balance (before and after)
- ✅ Reputation (before and after)
- ✅ Stake type (authentic or hoax)
- ✅ Submission bond amount
- ✅ Solana blockchain signature
- ✅ Solana slot and block time
- ✅ Transaction status
- ✅ Timestamps
- ✅ Metadata (JSON)

## 📁 Files Created/Modified

```
docs/
  ├── TRANSACTION_TABLE_SETUP.sql          (NEW - Database schema)
  ├── TRANSACTION_SYSTEM_GUIDE.md          (NEW - Usage guide)
  └── TRANSACTION_SETUP_SUMMARY.md         (NEW - This file)

shared/types/
  └── database.ts                           (MODIFIED - Updated types)

frontend/src/lib/
  └── transaction-service.ts                (NEW - Service class)
```

## 🎯 Key Features

1. **Comprehensive Tracking**: Every aspect of a transaction is recorded
2. **Balance Audit Trail**: Before/after balances for complete transparency
3. **Blockchain Integration**: Links to Solana blockchain transactions
4. **Flexible Metadata**: JSON field for additional data
5. **Status Tracking**: Track transaction lifecycle
6. **Performance Optimized**: Indexes on key columns
7. **Secure**: RLS policies for data access control
8. **Type-Safe**: Full TypeScript support

## 🔧 Database Fields Reference

### Transaction Types
- `stake` - Staking on authentic/hoax
- `submission` - Event submission with bond
- `reward` - Rewards for correct verification
- `penalty` - Penalties for incorrect verification
- `bond_refund` - Bond refunds
- `evt_transfer` - EVT transfers
- `sol_transfer` - SOL transfers
- `reputation` - Reputation changes
- `event_resolution` - Event resolution

### Status Values
- `pending` - Transaction created but not confirmed
- `confirmed` - Confirmed on blockchain
- `completed` - Fully processed
- `failed` - Transaction failed

### Stake Types
- `authentic` - Staking on event being authentic
- `hoax` - Staking on event being a hoax

## 📝 Example Transaction Record

```json
{
  "id": "uuid",
  "user_id": "user_id",
  "event_id": "event_id",
  "transaction_type": "stake",
  "stake_type": "authentic",
  "stake_amount": 100,
  "evt_amount": 100,
  "evt_balance_before": 500,
  "evt_balance_after": 400,
  "sol_amount": 0,
  "sol_balance_before": 10.5,
  "sol_balance_after": 10.5,
  "reputation_change": 0,
  "reputation_before": 100,
  "reputation_after": 100,
  "solana_signature": "5j7s...",
  "solana_slot": 123456,
  "solana_block_time": "2024-01-01T00:00:00Z",
  "status": "confirmed",
  "description": "Staked 100 EVT on authentic",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## 🚀 Getting Started

1. Run the SQL migration in Supabase
2. Import the transaction service in your components
3. Call the appropriate record method after Solana transactions
4. Query transaction history using the service methods

For detailed usage instructions, see `docs/TRANSACTION_SYSTEM_GUIDE.md`.

