# Transaction System - Quick Reference

## 🚀 Quick Setup

### 1. Run SQL Migration
Execute `docs/TRANSACTION_TABLE_SETUP.sql` in Supabase SQL Editor

### 2. Import Service
```typescript
import { transactionService } from '@/lib/transaction-service';
```

## 📝 Common Use Cases

### Record a Stake
```typescript
await transactionService.recordStake({
  userId: user.id,
  eventId: event.id,
  stakeType: 'authentic', // or 'hoax'
  stakeAmount: 100,
  evtAmount: 100,
  walletAddress: user.wallet_address,
  solanaSignature: signature,
});
```

### Record Submission Bond
```typescript
await transactionService.recordSubmissionBond({
  userId: user.id,
  eventId: event.id,
  bondAmount: 2.5,
  walletAddress: user.wallet_address,
  solanaSignature: signature,
});
```

### Record Reward
```typescript
await transactionService.recordReward({
  userId: user.id,
  eventId: event.id,
  evtReward: 150,
  reputationChange: 10,
  walletAddress: user.wallet_address,
  solanaSignature: signature,
});
```

### Record Penalty
```typescript
await transactionService.recordPenalty({
  userId: user.id,
  eventId: event.id,
  reputationPenalty: 5,
  walletAddress: user.wallet_address,
});
```

## 🔍 Query Transactions

### Get User History
```typescript
const transactions = await transactionService.getUserTransactions(userId, 50);
```

### Get Event History
```typescript
const transactions = await transactionService.getEventTransactions(eventId, 100);
```

### Find by Signature
```typescript
const transaction = await transactionService.getTransactionBySignature(signature);
```

## 📊 What Gets Tracked

✅ EVT balance (before/after)  
✅ SOL balance (before/after)  
✅ Reputation (before/after)  
✅ Stake type (authentic/hoax)  
✅ Submission bond  
✅ Solana signature  
✅ Timestamps  

## 🎯 Transaction Types

- `stake` - Staking on authentic/hoax
- `submission` - Event submission
- `reward` - Correct verification reward
- `penalty` - Incorrect verification penalty
- `bond_refund` - Bond refund
- `evt_transfer` - EVT transfer
- `sol_transfer` - SOL transfer
- `reputation` - Reputation change
- `event_resolution` - Event resolution

## 📖 Full Documentation

See `docs/TRANSACTION_SYSTEM_GUIDE.md` for complete documentation.

