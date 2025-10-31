# Transaction Recording System Guide

## Overview

The EventDAO transaction system comprehensively tracks all blockchain and on-chain transactions, including:
- EVT balance changes
- SOL balance changes
- Reputation changes
- Stake types (authentic/hoax)
- Submission bonds
- Rewards and penalties
- Solana blockchain signatures

## Setup

### 1. Run the SQL Migration

Execute the SQL file in your Supabase SQL Editor:

```bash
# Copy the contents of docs/TRANSACTION_TABLE_SETUP.sql
# and run it in your Supabase SQL Editor
```

This will create:
- `transactions` table with all necessary columns
- Indexes for efficient querying
- RLS policies for security
- Auto-update trigger for `updated_at` timestamp

### 2. Import the Transaction Service

```typescript
import { transactionService } from '@/lib/transaction-service';
```

## Usage Examples

### Recording a Stake Transaction

When a user stakes EVT tokens on whether an event is authentic or hoax:

```typescript
// After successful Solana transaction
const transaction = await transactionService.recordStake({
  userId: user.id,
  eventId: event.id,
  stakeType: 'authentic', // or 'hoax'
  stakeAmount: 100,
  evtAmount: 100,
  walletAddress: user.wallet_address,
  solanaSignature: txSignature,
  solanaSlot: slot,
  solanaBlockTime: new Date().toISOString(),
});
```

### Recording a Submission Bond

When a user submits an event with a SOL bond:

```typescript
const transaction = await transactionService.recordSubmissionBond({
  userId: user.id,
  eventId: event.id,
  bondAmount: 2.5, // SOL
  walletAddress: user.wallet_address,
  solanaSignature: txSignature,
  solanaSlot: slot,
  solanaBlockTime: new Date().toISOString(),
});
```

### Recording a Reward

When a user correctly verifies an event and receives rewards:

```typescript
const transaction = await transactionService.recordReward({
  userId: user.id,
  eventId: event.id,
  evtReward: 150, // EVT tokens earned
  reputationChange: 10, // Reputation gained
  walletAddress: user.wallet_address,
  solanaSignature: txSignature,
  solanaSlot: slot,
  solanaBlockTime: new Date().toISOString(),
});
```

### Recording a Penalty

When a user incorrectly verifies an event:

```typescript
const transaction = await transactionService.recordPenalty({
  userId: user.id,
  eventId: event.id,
  reputationPenalty: 5, // Reputation lost
  walletAddress: user.wallet_address,
  solanaSignature: txSignature,
  solanaSlot: slot,
  solanaBlockTime: new Date().toISOString(),
});
```

### Recording a Bond Refund

When a submission bond is refunded:

```typescript
const transaction = await transactionService.recordBondRefund({
  userId: user.id,
  eventId: event.id,
  bondAmount: 2.5, // SOL refunded
  walletAddress: user.wallet_address,
  solanaSignature: txSignature,
  solanaSlot: slot,
  solanaBlockTime: new Date().toISOString(),
});
```

## Querying Transactions

### Get User Transaction History

```typescript
const transactions = await transactionService.getUserTransactions(userId, 50);
```

### Get Event Transaction History

```typescript
const transactions = await transactionService.getEventTransactions(eventId, 100);
```

### Get Transaction by Solana Signature

```typescript
const transaction = await transactionService.getTransactionBySignature(signature);
```

### Update Transaction Status

```typescript
await transactionService.updateTransactionStatus(
  transactionId,
  'confirmed',
  solanaSignature
);
```

## Transaction Types

The system supports the following transaction types:

| Type | Description |
|------|-------------|
| `stake` | User staking tokens on authentic/hoax |
| `submission` | User submitting an event with bond |
| `reward` | User receiving rewards for correct verification |
| `penalty` | User losing stakes for incorrect verification |
| `bond_refund` | Refund of submission bond |
| `evt_transfer` | EVT token transfer |
| `sol_transfer` | SOL transfer |
| `reputation` | Reputation change |
| `event_resolution` | Event resolved (affects all stakes) |

## Database Schema

### Key Fields

- **Balances**: `evt_balance_before`, `evt_balance_after`, `sol_balance_before`, `sol_balance_after`
- **Reputation**: `reputation_before`, `reputation_after`, `reputation_change`
- **Stake Info**: `stake_type` (authentic/hoax), `stake_amount`
- **Bond Info**: `bond_amount`
- **Blockchain**: `solana_signature`, `solana_slot`, `solana_block_time`
- **Status**: `pending`, `completed`, `failed`, `confirmed`

## Integration Points

### 1. When User Stakes

```typescript
// In your staking component/function
try {
  // Execute Solana transaction
  const signature = await sendStakeTransaction(amount, stakeType);
  
  // Record in database
  await transactionService.recordStake({
    userId: user.id,
    eventId: event.id,
    stakeType: stakeType,
    stakeAmount: amount,
    evtAmount: amount,
    walletAddress: user.wallet_address,
    solanaSignature: signature,
  });
} catch (error) {
  console.error('Staking failed:', error);
}
```

### 2. When Event is Submitted

```typescript
// In your submission function
try {
  // Execute Solana transaction for bond
  const signature = await sendBondTransaction(bondAmount);
  
  // Record in database
  await transactionService.recordSubmissionBond({
    userId: user.id,
    eventId: event.id,
    bondAmount: bondAmount,
    walletAddress: user.wallet_address,
    solanaSignature: signature,
  });
} catch (error) {
  console.error('Submission failed:', error);
}
```

### 3. When Event Resolves

```typescript
// When resolving an event
const winningStakes = getWinningStakes(event);

for (const stake of winningStakes) {
  // Calculate rewards
  const evtReward = calculateReward(stake);
  const reputationGain = calculateReputationGain(stake);
  
  // Execute Solana transaction
  const signature = await sendRewardTransaction(evtReward);
  
  // Record reward
  await transactionService.recordReward({
    userId: stake.user_id,
    eventId: event.id,
    evtReward: evtReward,
    reputationChange: reputationGain,
    walletAddress: stake.wallet_address,
    solanaSignature: signature,
  });
}

// Record penalties for losing stakes
const losingStakes = getLosingStakes(event);
for (const stake of losingStakes) {
  await transactionService.recordPenalty({
    userId: stake.user_id,
    eventId: event.id,
    reputationPenalty: 5,
    walletAddress: stake.wallet_address,
  });
}
```

## Transaction Status Flow

1. **pending** - Transaction created but not yet confirmed on blockchain
2. **confirmed** - Transaction confirmed on Solana blockchain
3. **completed** - Transaction fully processed and balances updated
4. **failed** - Transaction failed or was rejected

## Best Practices

1. **Always Record Transactions**: Record transactions immediately after Solana transaction
2. **Update Status**: Update status to 'confirmed' when blockchain confirms
3. **Handle Failures**: If Solana transaction fails, record with 'failed' status
4. **Balance Consistency**: Always include before/after balances for audit trail
5. **Metadata**: Use metadata field for additional context

## Error Handling

```typescript
try {
  const transaction = await transactionService.recordStake({...});
} catch (error) {
  if (error instanceof Error) {
    console.error('Transaction recording failed:', error.message);
    // Handle error appropriately
  }
}
```

## Performance Considerations

- Indexes are created on frequently queried columns
- Use `limit` parameter when fetching large histories
- Consider pagination for very large transaction histories
- Transaction status updates are optimized with indexes

## Troubleshooting

### Transaction Not Recording

1. Check RLS policies allow INSERT
2. Verify user_id and event_id are valid
3. Check Supabase connection

### Balance Inconsistencies

1. Verify `getEvtBalance` and `getSolBalance` functions
2. Check for concurrent transactions
3. Review transaction history for missing records

### Performance Issues

1. Ensure indexes are created
2. Add additional indexes if needed
3. Consider archiving old transactions

## Future Enhancements

- Webhook integration for real-time updates
- Transaction aggregation for reporting
- Export functionality for accounting
- Advanced filtering and search
- Transaction analytics dashboard

