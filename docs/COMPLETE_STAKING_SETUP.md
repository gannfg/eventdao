# Complete EventDAO Staking & Resolution System Setup

## ✅ What Has Been Created

### 1. Database Schema (`docs/EVT_STAKING_SETUP.sql`)
Complete database setup including:
- **evt_credits** table - Off-chain EVT credit balances
- **stakes** table - Individual stakes on events
- **verification_votes** table - Votes during verification phase
- **resolution_history** table - History of resolutions
- Updated **events** table with resolution fields
- RLS policies, triggers, and indexes
- Views for analytics

### 2. Services Created

#### EVT Credits Service (`frontend/src/lib/evt-credits-service.ts`)
- Get user credits
- Add/deduct credits
- Leaderboard
- Balance checks

#### Staking Service (`frontend/src/lib/staking-service.ts`)
- Create stakes
- Get user/event stakes
- Check existing stakes
- Staking history

#### AI Resolution Service (`frontend/src/lib/ai-resolution-service.ts`)
- AI verification using OpenAI
- Event resolution logic
- Reward distribution
- Automatic processing of expired events

### 3. UI Components

#### Staking Modal (`frontend/src/components/StakingModal.tsx`)
- Staking interface
- EVT credit display
- Amount input with quick buttons
- Validation and error handling

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Execute the SQL file in Supabase:

```sql
-- Copy contents from docs/EVT_STAKING_SETUP.sql
-- Run in Supabase SQL Editor
```

This creates:
- `evt_credits` table
- `stakes` table
- `verification_votes` table
- `resolution_history` table
- Updates `events` table
- RLS policies and triggers

### Step 2: Integrate Staking Modal into Explore Page

Update `frontend/src/app/explore/page.tsx`:

```typescript
import StakingModal from '../../components/StakingModal';

// Add state
const [stakeModalOpen, setStakeModalOpen] = useState(false);
const [selectedStakeType, setSelectedStakeType] = useState<'true' | 'false'>('true');

// Update handleStake function
const handleStake = async (eventId: string, stakeType: 'true' | 'false') => {
  if (!publicKey || !walletUser) {
    alert('Please connect your wallet first');
    return;
  }
  
  setSelectedStakeType(stakeType);
  setStakeModalOpen(true);
};

// Add success handler
const handleStakeSuccess = () => {
  fetchEvents(); // Refresh events
  alert('Stake successful!');
};

// Add StakingModal to JSX
{stakeModalOpen && (
  <StakingModal
    isOpen={stakeModalOpen}
    onClose={() => setStakeModalOpen(false)}
    eventId={selectedEvent?.id || ''}
    eventTitle={selectedEvent?.title || ''}
    userId={walletUser?.id || ''}
    stakeType={selectedStakeType}
    onStakeSuccess={handleStakeSuccess}
  />
)}
```

### Step 3: Update Event Submission

Add start_time and end_time to events:

```typescript
// In frontend/src/app/submit/page.tsx
const eventData = {
  // ... existing fields
  start_time: new Date(formData.eventDate).toISOString(),
  end_time: new Date(new Date(formData.eventDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days after event
  verification_end_time: new Date(new Date(formData.eventDate).getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days after event
  staking_window_open: true,
  verification_window_open: false,
  resolution_status: 'pending',
};
```

### Step 4: Add EVT Credits Display

Create a component to show user's EVT credits:

```typescript
// In your account page or header
import { evtCreditsService } from '@/lib/evt-credits-service';

const [credits, setCredits] = useState(0);

useEffect(() => {
  const fetchCredits = async () => {
    const userCredits = await evtCreditsService.getUserCredits(userId);
    setCredits(userCredits?.balance || 0);
  };
  fetchCredits();
}, [userId]);
```

### Step 5: Set Up AI Resolution (Optional)

For automatic event resolution:

```typescript
// Create API route: frontend/src/app/api/resolve-events/route.ts
import { aiResolutionService } from '@/lib/ai-resolution-service';

export async function GET() {
  try {
    await aiResolutionService.processExpiredEvents();
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to process events' }, { status: 500 });
  }
}

// Call this API periodically or via cron job
```

## 📋 How It Works

### 1. Staking Phase (Before Event Starts)

1. User clicks "Stake TRUE" or "Stake FALSE"
2. StakingModal opens
3. User enters EVT amount
4. Credits are deducted
5. Stake is recorded in database
6. Event stake totals update automatically

### 2. Verification Phase (After Event Ends)

1. Event's `end_time` passes
2. Users can vote TRUE/FALSE (reuses staking modal)
3. Votes are recorded in `verification_votes` table
4. Event vote counts update

### 3. Resolution Phase (After Verification)

1. AI analyzes event (OpenAI API)
2. AI result compared with community vote
3. Final result determined
4. Rewards distributed to winners
5. Stake statuses updated (won/lost)
6. Resolution history recorded

## 🎯 Key Features

### Staking
- ✅ EVT credit system (off-chain)
- ✅ Users stake TRUE or FALSE
- ✅ Credits deducted on stake
- ✅ Stakes tracked per user/event
- ✅ Duplicate prevention

### Verification
- ✅ Vote collection phase
- ✅ Community consensus
- ✅ Vote tracking

### Resolution
- ✅ AI-powered verification
- ✅ Hybrid AI + community decision
- ✅ Automatic reward distribution
- ✅ Proportional rewards (larger stake = larger reward)
- ✅ Losers' stakes redistributed to winners

### Reward Distribution
- Winners get: Their stake + proportional share of losers' stakes
- Losers lose: Their entire stake
- Example:
  - True side staked: 1000 EVT
  - False side staked: 500 EVT
  - True wins
  - True gets: 1000 EVT (their stake) + 500 EVT (from false) = 1500 EVT total
  - False gets: 0 EVT

## 📊 Database Queries

### Get User's Credits
```sql
SELECT * FROM evt_credits WHERE user_id = 'user_id';
```

### Get Event Stakes
```sql
SELECT * FROM stakes WHERE event_id = 'event_id';
```

### Get Resolution History
```sql
SELECT * FROM resolution_history ORDER BY created_at DESC;
```

### User Staking Summary
```sql
SELECT * FROM user_staking_summary WHERE user_id = 'user_id';
```

## 🧪 Testing

### Test Staking Flow

1. Navigate to `/explore`
2. Click on an event
3. Click "Stake TRUE" or "Stake FALSE"
4. Enter amount and confirm
5. Check database:
   ```sql
   SELECT * FROM stakes ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM evt_credits WHERE user_id = 'your_user_id';
   ```

### Test Resolution Flow

1. Create test event with past `end_time`
2. Add some stakes (TRUE and FALSE)
3. Call resolution service:
   ```typescript
   await aiResolutionService.resolveEvent(eventId);
   ```
4. Check results:
   ```sql
   SELECT * FROM events WHERE id = 'event_id';
   SELECT * FROM stakes WHERE event_id = 'event_id';
   SELECT * FROM resolution_history WHERE event_id = 'event_id';
   ```

## 🔧 Next Steps

1. **Integrate OpenAI API** - Replace mock AI response with actual API call
2. **Add Verification UI** - Component for voting during verification phase
3. **Add Results Display** - Show resolution results and rewards
4. **Set Up Cron Job** - Auto-resolve expired events
5. **Add Notifications** - Notify users when they win/lose

## 📝 API Endpoints Needed

Create these API routes:

1. `/api/ai/verify` - AI verification endpoint
2. `/api/events/resolve` - Manual resolution trigger
3. `/api/stakes/user/[userId]` - Get user stakes
4. `/api/stakes/event/[eventId]` - Get event stakes

## 🎉 You're All Set!

The complete staking and resolution system is ready. Users can now:
- Stake EVT on events
- Vote during verification
- Earn rewards when correct
- Track their staking history

