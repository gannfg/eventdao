# Testing Transaction Recording

## ✅ SQL Migration Complete

Great! Now let's test that the transaction recording system is working correctly.

## Step 1: Verify Database Setup

Run the verification queries in Supabase:

```sql
-- Copy and run docs/VERIFY_TRANSACTION_SETUP.sql
```

Expected results:
- ✅ Table exists with 25+ columns
- ✅ 6+ indexes created
- ✅ 3 RLS policies active
- ✅ 1 trigger for auto-update

## Step 2: Test in Your Application

### Test Staking Transaction

1. **Start your development server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to Explore page**: `http://localhost:3001/explore`

3. **Connect your wallet** (if not already connected)

4. **Click "Stake Authentic" or "Stake Hoax"** on any event

5. **Check the browser console** for logs:
   ```
   Staking authentic on event <event-id> with wallet <wallet-address>
   User: <username> (<wallet-address>)
   Transaction recorded successfully
   ```

6. **Verify in Supabase**:
   ```sql
   SELECT * FROM transactions 
   WHERE transaction_type = 'stake' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

   Expected result: Should see your staking transaction with:
   - `transaction_type` = 'stake'
   - `stake_type` = 'authentic' or 'hoax'
   - `stake_amount` = 100
   - `evt_amount` = 100
   - EVT and SOL balances recorded
   - User ID and Event ID linked

### Test Submission Bond Transaction

1. **Navigate to Submit page**: `http://localhost:3001/submit`

2. **Fill out the event form**:
   - Title: "Test Event"
   - Description: "Testing transaction recording"
   - Category: Any
   - Date: Future date
   - Location: "Test Location"
   - Bond Amount: 0.1 SOL

3. **Click "Submit Event"**

4. **Check the browser console** for logs:
   ```
   Creating event with data: {...}
   Event created successfully: {...}
   Submission bond transaction recorded successfully
   ```

5. **Verify in Supabase**:
   ```sql
   SELECT * FROM transactions 
   WHERE transaction_type = 'submission' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

   Expected result: Should see your submission transaction with:
   - `transaction_type` = 'submission'
   - `bond_amount` = 0.1
   - `sol_amount` = 0.1
   - SOL balance before/after recorded
   - User ID and Event ID linked

## Step 3: Query Transaction History

### Get User's Transaction History

```typescript
// In browser console or your code
import { transactionService } from '@/lib/transaction-service';

const transactions = await transactionService.getUserTransactions('your-user-id', 10);
console.log('User transactions:', transactions);
```

### Get Event's Transaction History

```typescript
const transactions = await transactionService.getEventTransactions('your-event-id', 10);
console.log('Event transactions:', transactions);
```

## Step 4: View All Transactions in Supabase

```sql
-- View all transactions
SELECT 
  id,
  user_id,
  event_id,
  transaction_type,
  stake_type,
  stake_amount,
  bond_amount,
  evt_amount,
  sol_amount,
  reputation_change,
  status,
  description,
  created_at
FROM transactions
ORDER BY created_at DESC;
```

## Common Issues & Solutions

### Issue: "relation 'transactions' does not exist"
**Solution**: Run the SQL migration (`docs/TRANSACTION_TABLE_SETUP.sql`) in Supabase

### Issue: "Failed to create transaction"
**Solution**: Check RLS policies allow INSERT operations

### Issue: Transaction not appearing
**Solution**: 
1. Check browser console for errors
2. Verify user is logged in
3. Check Supabase logs

### Issue: Balances showing as 0
**Solution**: This is expected with placeholder signatures. Implement actual Solana integration to get real balances.

## Success Criteria

✅ Transactions table exists  
✅ Can record stake transactions  
✅ Can record submission bond transactions  
✅ Balances are recorded (before/after)  
✅ Reputation tracking works  
✅ User ID and Event ID linked correctly  
✅ Query functions work  

## Next Steps

Once testing is complete:

1. **Implement Actual Solana Transactions**
   - Replace placeholder signatures
   - Use `sendToken2022()` for EVT staking
   - Use `sendSol()` for bond submissions

2. **Implement EVT Balance Fetching**
   - Update `getEvtBalance()` in transaction-service.ts
   - Connect to your EVT Token-2022 mint

3. **Add Transaction History UI**
   - Create a page to view user's transaction history
   - Display in account page

4. **Implement Rewards/Penalties**
   - Add transaction recording when events resolve
   - Record rewards for winners
   - Record penalties for losers

## Testing Checklist

- [ ] SQL migration executed successfully
- [ ] Verification queries passed
- [ ] Can stake on events
- [ ] Can submit events
- [ ] Transactions appear in database
- [ ] Query functions work
- [ ] Balances recorded correctly
- [ ] User/Event IDs linked
- [ ] No console errors

Great job on setting up the transaction recording system! 🎉

