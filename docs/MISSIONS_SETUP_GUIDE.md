# EventDAO Daily Missions System

## Overview

The Daily Missions system rewards users with EVT credits for completing social actions that help spread awareness and engagement around EventDAO. This gamification feature encourages users to interact with the platform daily and share it with others.

## Features

- **7 Different Mission Types**: From connecting social accounts to daily logins
- **EVT Credits System**: Off-chain points stored in Supabase
- **Daily & One-Time Missions**: Missions can reset daily or be completed once
- **Referral System**: Users can invite friends and earn rewards
- **Login Streaks**: Track consecutive daily logins
- **Transaction History**: Full ledger of all EVT credit movements

## Mission Types

### One-Time Missions
These missions can only be completed once per user:

1. **🔗 Connect X Account** - 50 EVT
   - Link your X (Twitter) account to EventDAO profile
   
2. **👥 Follow @Event_DAO** - 100 EVT
   - Follow the official EventDAO account on X
   
3. **🌐 Invite a Friend** - 200 EVT
   - Share referral link and have 1 friend complete missions

### Daily Missions
These missions reset every day:

1. **💬 Tweet About EventDAO** - 150 EVT
   - Post a tweet mentioning @Event_DAO with #EventDAO
   
2. **❤️ Engage with EventDAO Posts** - 50 EVT
   - Like or reply to any EventDAO post
   
3. **🔁 Retweet EventDAO Updates** - 100 EVT
   - Retweet one of the main announcements
   
4. **📆 Daily Login Bonus** - 10 EVT
   - Visit EventDAO site and log in each day

## Database Setup

### Step 1: Run the Migration

Execute the SQL migration script in your Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard → SQL Editor
# Copy and paste the contents of docs/MISSIONS_DATABASE_SETUP.sql
# Click "Run" to execute
```

This will:
- Add EVT credit fields to the `users` table
- Create `missions` table for storing mission definitions
- Create `user_missions` table for tracking progress
- Create `mission_completions` table for historical data
- Create `evt_transactions` table for transaction ledger
- Create `referrals` table for referral tracking
- Set up Row Level Security (RLS) policies
- Create helper functions for claiming rewards

### Step 2: Verify Tables

Check that all tables were created successfully:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('missions', 'user_missions', 'mission_completions', 'evt_transactions', 'referrals');
```

### Step 3: Initialize User Missions

For existing users, you'll need to initialize their missions:

```sql
-- For each existing user, this should be done automatically on first login
-- Or run this for all users:
INSERT INTO user_missions (user_id, mission_id, status)
SELECT u.id, m.id, 'available'
FROM users u
CROSS JOIN missions m
WHERE NOT EXISTS (
  SELECT 1 FROM user_missions um 
  WHERE um.user_id = u.id AND um.mission_id = m.id
);
```

## Frontend Integration

### Using the Mission Service

The `mission-service.ts` provides all methods needed to interact with missions:

```typescript
import { missionService } from '@/lib/mission-service';

// Get all available missions
const missions = await missionService.getAllMissions();

// Get user's missions with progress
const userMissions = await missionService.getUserMissions(userId);

// Initialize missions for new user
await missionService.initializeUserMissions(userId);

// Start a mission
await missionService.startMission(userId, missionId);

// Complete a mission
await missionService.completeMission(userId, missionId);

// Claim reward
const result = await missionService.claimMissionReward(userId, missionId);

// Check daily login
const login = await missionService.checkDailyLogin(userId);

// Get EVT stats
const stats = await missionService.getUserEvtStats(userId);

// Get transaction history
const transactions = await missionService.getEvtTransactions(userId);
```

### Account Page Integration

The account page (`frontend/src/app/account/page.tsx`) now displays the missions instead of transaction history. The missions are organized in cards showing:

- Mission icon and title
- Description of what to do
- Reward amount in EVT
- Current status (Available, In Progress, Completed, Claimed)
- Action button

### Mission Status Flow

1. **Available** → User clicks "Start" → Opens external link/action
2. **In Progress** → User completes action externally
3. **Completed** → User clicks "Claim Reward" → EVT credited
4. **Claimed** → Mission is done (shows "Claimed" badge)

## X (Twitter) Integration

### OAuth Setup (Coming Soon)

For production, you'll need to set up X OAuth:

1. Create an app at https://developer.twitter.com/
2. Get API Key and Secret
3. Set up OAuth 2.0 with PKCE
4. Store credentials in environment variables
5. Implement OAuth callback handler

### Current Implementation

Currently uses placeholder alerts and external links:
- "Connect X Account" shows an alert (OAuth to be implemented)
- Other missions open X.com in new tab for manual completion
- In production, these would verify completion via X API

## Referral System

### How It Works

1. Each user gets a unique referral code on signup
2. Users share their referral link: `https://eventdao.com?ref=ABC12345`
3. When a new user signs up with the link, a referral is created
4. When referred user completes "Connect X" and "Follow" missions, referrer gets reward

### Implementation

```typescript
// Get user's referral code
const code = await missionService.getUserReferralCode(userId);

// Create referral link
const referralLink = `${window.location.origin}?ref=${code}`;

// On signup, check for referral code
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref');

if (refCode) {
  // Find referrer and create referral
  // This should be done in signup flow
}
```

## EVT Credits System

### How EVT Credits Work

- **Off-Chain Points**: Stored in Supabase, not on blockchain
- **Earning**: Complete missions to earn EVT
- **Tracking**: All movements logged in `evt_transactions` table
- **Balance**: Users see current balance and total earned

### Use Cases for EVT

EVT credits can be used for:
- Unlocking premium features
- Boosting event visibility
- Participating in special events
- Converting to on-chain tokens (future feature)
- Leaderboard rankings

## Daily Reset System

### Automatic Reset

Daily missions should automatically reset. You can set up a Supabase Edge Function or cron job:

```sql
-- Reset daily missions (run at midnight UTC)
UPDATE user_missions um
SET status = 'available', 
    started_at = NULL, 
    completed_at = NULL, 
    claimed_at = NULL
FROM missions m
WHERE um.mission_id = m.id
  AND m.mission_type = 'daily'
  AND um.status = 'claimed';
```

### Supabase Edge Function

Create a scheduled Edge Function:

```typescript
// supabase/functions/reset-daily-missions/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Reset daily missions
  const { error } = await supabase.rpc('reset_daily_missions')
  
  if (error) throw error

  return new Response(
    JSON.stringify({ message: 'Daily missions reset' }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

Schedule it in Supabase Dashboard → Edge Functions → Cron Jobs:
```
0 0 * * * # Daily at midnight UTC
```

## Testing

### Test Mission Flow

1. Start development server: `npm run dev`
2. Navigate to `/account` page
3. Try clicking missions:
   - "Start" should mark as in progress
   - "Claim Reward" should add EVT and mark as claimed
4. Check console for any errors

### Reset Missions (for testing)

```typescript
// Reset all missions for a user
await missionService.resetDailyMissions(userId);
```

### Check Database

```sql
-- Check user's EVT balance
SELECT evt_credits, total_evt_earned, login_streak 
FROM users 
WHERE id = 'user-uuid';

-- Check user's missions
SELECT um.*, m.title, m.reward 
FROM user_missions um
JOIN missions m ON um.mission_id = m.id
WHERE um.user_id = 'user-uuid';

-- Check EVT transactions
SELECT * 
FROM evt_transactions 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

## Security Considerations

### Row Level Security (RLS)

All tables have RLS policies:
- Users can only see their own missions
- Users can only claim their own rewards
- Mission definitions are publicly readable
- All writes require authentication

### Validation

Server-side validation should include:
- Verify mission exists and is active
- Check user hasn't already claimed one-time missions
- Validate external actions (X posts, follows) via API
- Rate limiting to prevent abuse

### External Verification (Future)

For production, implement:
- X API integration to verify follows/tweets
- Webhook handlers for real-time verification
- Cooldown periods between claims
- Fraud detection for suspicious patterns

## Troubleshooting

### Missions Not Loading

Check:
1. Database migration ran successfully
2. RLS policies are set up correctly
3. User is authenticated
4. Supabase client is configured properly

### Rewards Not Crediting

Check:
1. `claim_mission_reward` function exists
2. User has permission to call the function
3. Mission status is "completed"
4. Check `evt_transactions` table for errors

### Daily Login Not Working

Check:
1. `check_daily_login` function exists
2. User's `last_login_date` field exists
3. Function is being called on login
4. Check function logs in Supabase

## Future Enhancements

### Planned Features

1. **Weekly Missions**: Higher rewards for weekly challenges
2. **Mission Categories**: Group missions by type
3. **Achievement Badges**: Visual rewards for milestones
4. **Mission Chains**: Sequential missions with bonus rewards
5. **Social Verification**: Automated verification via X API
6. **EVT Marketplace**: Spend EVT on platform features
7. **Leaderboards**: Compete with other users
8. **Seasonal Events**: Limited-time special missions
9. **Mission Creator**: Let admins create custom missions
10. **Mobile App**: Push notifications for mission reminders

### EVT to Token Conversion

Future feature to convert EVT credits to on-chain EVT tokens:
- Set conversion rate (e.g., 100 EVT credits = 1 EVT token)
- Implement burn mechanism for credits
- Mint tokens to user's wallet
- Track conversions in database

## Support

For questions or issues:
- Check the Supabase logs for errors
- Review RLS policies if permissions issues occur
- Verify all migration scripts ran successfully
- Contact the development team

## License

This feature is part of the EventDAO platform.

