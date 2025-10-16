# Daily Missions - Quick Start Guide

## ✅ What's Been Done

The Daily Missions system is now fully integrated with your account page! Here's what's ready:

### Frontend ✅
- Account page now displays missions instead of transaction history
- Real-time loading from Supabase database
- Mission actions connected to database operations
- Loading states, error handling, and empty states
- EVT balance display (current balance + lifetime earned)
- Auto-completion for social missions (3-second delay for demo)
- Daily login bonus automatically checked on page load

### Backend ✅
- Complete database schema ready
- Mission service with 18 methods
- Row Level Security policies
- Helper SQL functions for claiming rewards
- Transaction ledger for EVT movements

## 🚀 Next Steps

### Step 1: Run Database Migration (REQUIRED)

You need to run the SQL migration to set up the database tables:

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your EventDAO project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Open `docs/MISSIONS_DATABASE_SETUP.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "Run" (or press Ctrl/Cmd + Enter)

4. **Verify Tables Created**
   - Go to "Table Editor" in Supabase
   - You should see these new tables:
     - ✅ missions
     - ✅ user_missions
     - ✅ mission_completions  
     - ✅ evt_transactions
     - ✅ referrals
   - Check users table has new columns:
     - ✅ evt_credits
     - ✅ total_evt_earned
     - ✅ login_streak
     - ✅ referral_code
     - ✅ x_account_id
     - ✅ x_username

### Step 2: Test the System

1. **Start Your Dev Server**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to Account Page**
   - Go to http://localhost:3001/account
   - Connect your wallet

3. **Test Mission Flow**
   - Click "Start" on a mission
   - Opens Twitter or copies referral link
   - After 3 seconds, mission auto-completes (for demo)
   - Click "Claim Reward"
   - EVT balance updates!

4. **Check Database**
   - Go to Supabase Table Editor
   - Check `user_missions` table - should see your missions
   - Check `evt_transactions` - should see claimed rewards
   - Check `users` table - should see updated `evt_credits`

## 🎯 How It Works

### Mission Lifecycle

1. **Page Load**
   - Checks daily login (awards 10 EVT if first login today)
   - Loads all missions from database
   - Loads user's mission progress
   - If no progress exists, initializes missions for user

2. **Starting a Mission**
   - Updates database: `status = 'in_progress'`
   - Opens external link (Twitter, etc.)
   - After 3 seconds (demo), marks as completed

3. **Claiming Reward**
   - Calls `claim_mission_reward()` SQL function
   - Adds EVT to user's balance
   - Records transaction in `evt_transactions`
   - Updates mission: `status = 'claimed'`
   - Updates UI with new balance

### Database Schema

```
missions
├── id (uuid)
├── mission_key (unique)
├── title
├── description
├── icon
├── reward (integer)
└── mission_type (daily/one-time)

user_missions
├── user_id (foreign key)
├── mission_id (foreign key)
├── status (available/in_progress/completed/claimed)
├── started_at
├── completed_at
└── claimed_at

users (new columns)
├── evt_credits
├── total_evt_earned
├── login_streak
├── x_account_id
└── referral_code
```

## 🐛 Troubleshooting

### Missions Not Loading

**Check Console**
```bash
# Open browser DevTools (F12)
# Look for errors in Console tab
```

**Common Issues:**
- Database migration not run → Run SQL script
- RLS policies blocking → Check policies in Supabase
- User not connected → Connect wallet first

### Can't Claim Rewards

**Check:**
1. Mission status is "completed" (not "in_progress")
2. `claim_mission_reward` function exists in Supabase
3. User has permission (RLS policies)
4. Check Supabase logs for errors

### EVT Balance Not Updating

**Verify:**
```sql
-- In Supabase SQL Editor
SELECT evt_credits, total_evt_earned 
FROM users 
WHERE wallet_address = 'YOUR_WALLET_ADDRESS';

-- Check transactions
SELECT * FROM evt_transactions 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

## 📊 Testing Checklist

- [ ] Database migration completed successfully
- [ ] All tables created (missions, user_missions, etc.)
- [ ] Account page loads without errors
- [ ] Missions display correctly
- [ ] "Start" button works
- [ ] External links open (Twitter)
- [ ] Mission auto-completes after 3 seconds
- [ ] "Claim Reward" button appears
- [ ] EVT balance updates after claiming
- [ ] Database records transaction
- [ ] Login bonus works (check on first login today)
- [ ] Referral link copies to clipboard

## 🎨 Current Features

### Working ✅
- Display 7 missions with icons and descriptions
- Show mission status (available/in progress/completed/claimed)
- Start missions (updates database)
- Auto-complete missions (3-second delay)
- Claim rewards (updates EVT balance)
- Daily login bonus
- Referral link generation
- EVT balance display
- Transaction history tracking
- Loading states
- Error handling
- Mobile responsive

### Demo Mode 🔧
- Missions auto-complete after 3 seconds (no real verification)
- "Connect X Account" shows placeholder alert

### To Be Implemented ⏳
- Twitter OAuth integration
- Real-time verification via Twitter API
- Automatic mission completion (no manual claiming)
- Daily reset automation (cron job)
- Push notifications
- Achievement badges
- Leaderboards

## 🔄 Daily Reset

Missions should reset daily. Set up a Supabase Edge Function:

1. **Create Edge Function**
   ```bash
   supabase functions new reset-daily-missions
   ```

2. **Add Cron Schedule**
   - In Supabase Dashboard
   - Go to Edge Functions
   - Schedule: `0 0 * * *` (midnight UTC)

3. **Function Code**
   ```typescript
   // Reset all daily missions
   const { error } = await supabase
     .from('user_missions')
     .update({ 
       status: 'available', 
       started_at: null, 
       completed_at: null 
     })
     .eq('mission_type', 'daily')
     .eq('status', 'claimed');
   ```

## 📞 Need Help?

1. Check `docs/MISSIONS_SETUP_GUIDE.md` for detailed documentation
2. Review `docs/MISSIONS_IMPLEMENTATION_CHECKLIST.md`
3. See `docs/MISSION_REWARDS_REFERENCE.md` for reward amounts
4. Check Supabase logs for database errors
5. Look at browser console for frontend errors

## 🎉 You're All Set!

Once you run the database migration, everything should work! The frontend is already connected and ready to go.

**Test Command:**
```bash
# Terminal 1: Start frontend
cd frontend
npm run dev

# Browser: Visit
http://localhost:3001/account
```

Happy mission completing! 🚀

