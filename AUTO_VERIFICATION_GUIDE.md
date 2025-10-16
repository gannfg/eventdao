# ✅ Auto-Verification System - How It Works

## 🎯 What's Auto-Verification?

Instead of fake 3-second delays, missions now **automatically verify** when you complete the action on Twitter! The system polls the Twitter API every 5 seconds to check if you've completed the mission.

## 🔄 How It Works

### Follow Mission (@Event_DAO)

```
User clicks "Start" → Opens Twitter
        ↓
Waits 5 seconds (gives user time to follow)
        ↓
Checks every 5 seconds: "Does user follow @Event_DAO?"
        ↓
YES → Mission completes automatically! 🎉
NO  → Keeps checking for 2 minutes
```

**API Endpoint:** `/api/missions/verify-follow`
- Checks Twitter API: `GET /users/{user_id}/following`
- Looks for @Event_DAO in following list
- Returns `{ verified: true/false }`

### Tweet Mission

```
User clicks "Start" → Opens tweet composer
        ↓
Waits 10 seconds (gives user time to post)
        ↓
Checks every 5 seconds: "Did user tweet with @Event_DAO and #EventDAO?"
        ↓
YES → Mission completes automatically! 🎉
NO  → Keeps checking for 2 minutes
```

**API Endpoint:** `/api/missions/verify-tweet`
- Checks Twitter API: `GET /users/{user_id}/tweets`
- Looks for @Event_DAO mention and #EventDAO hashtag
- Returns `{ verified: true }`

### Engage & Retweet Missions

Same polling system, checks for:
- Recent activity mentioning @Event_DAO
- Retweets of Event_DAO tweets
- Likes/replies to Event_DAO posts

## ⏱️ Timing

| Action | Initial Wait | Poll Interval | Max Duration | Total Checks |
|--------|-------------|---------------|--------------|--------------|
| **Follow** | 5 seconds | 5 seconds | 2 minutes | 24 checks |
| **Tweet** | 10 seconds | 5 seconds | 2 minutes | 24 checks |
| **Engage** | 5 seconds | 5 seconds | 2 minutes | 24 checks |
| **Retweet** | 10 seconds | 5 seconds | 2 minutes | 24 checks |

## 🎬 User Experience

### What Users See:

1. **Click "Start"** 
   - Blue toast: "Opening X (Twitter)... Follow @Event_DAO and we'll detect it automatically!"
   - Twitter opens in new tab

2. **Complete Action**
   - User follows/tweets/retweets on Twitter
   - Tab stays open or they return to EventDAO

3. **Auto-Detection**
   - System polls Twitter API in background
   - No manual action needed
   - Mission status stays "In Progress"

4. **Mission Completes**
   - Green toast: "✅ Mission Completed! Click Claim Reward to get your 100 EVT!"
   - Status changes to "Completed"
   - User can claim reward

### If Verification Takes Longer:

After 2 minutes (24 checks), if still not detected:
- Blue toast: "⏱️ Still checking... If you followed @Event_DAO, we should detect it soon. You can also refresh the page."
- Polling stops (to save API calls)
- User can refresh page to restart verification

## 🔧 Technical Implementation

### Follow Verification Function

```typescript
const startFollowVerification = (missionId: string) => {
  let attempts = 0;
  const maxAttempts = 24;
  
  const checkFollow = async () => {
    const response = await fetch('/api/missions/verify-follow', {
      method: 'POST',
      body: JSON.stringify({ 
        userId: user.id, 
        targetUsername: 'Event_DAO' 
      }),
    });
    
    const { verified } = await response.json();
    
    if (verified) {
      await markMissionCompleted(missionId);
      return true;
    }
    
    return false;
  };
  
  // Wait 5 seconds, then poll every 5 seconds
  setTimeout(() => {
    const pollInterval = setInterval(async () => {
      attempts++;
      const completed = await checkFollow();
      
      if (completed || attempts >= maxAttempts) {
        clearInterval(pollInterval);
      }
    }, 5000);
  }, 5000);
};
```

### Tweet Verification Function

```typescript
const startTweetVerification = (missionId, mention, hashtag) => {
  let attempts = 0;
  const maxAttempts = 24;
  
  const checkTweet = async () => {
    const response = await fetch('/api/missions/verify-tweet', {
      method: 'POST',
      body: JSON.stringify({ 
        userId: user.id,
        requiredMention: mention,
        requiredHashtag: hashtag
      }),
    });
    
    const { verified } = await response.json();
    
    if (verified) {
      await markMissionCompleted(missionId);
      return true;
    }
    
    return false;
  };
  
  // Wait 10 seconds, then poll every 5 seconds
  setTimeout(() => {
    const pollInterval = setInterval(async () => {
      attempts++;
      const completed = await checkTweet();
      
      if (completed || attempts >= maxAttempts) {
        clearInterval(pollInterval);
      }
    }, 5000);
  }, 10000);
};
```

## 📊 Mission-Specific Behavior

### 1. Connect X Account
- **Verification:** OAuth flow
- **Auto-complete:** On successful OAuth callback
- **No polling needed**

### 2. Follow @Event_DAO
- **Verification:** Checks `/users/{id}/following`
- **Looks for:** @Event_DAO in following list
- **Polling:** Every 5 seconds for 2 minutes

### 3. Tweet About EventDAO
- **Verification:** Checks `/users/{id}/tweets`
- **Looks for:** @Event_DAO AND #EventDAO
- **Polling:** Every 5 seconds for 2 minutes

### 4. Engage with Posts
- **Verification:** Checks recent activity
- **Looks for:** Any interaction with @Event_DAO
- **Polling:** Every 5 seconds for 2 minutes

### 5. Retweet Updates
- **Verification:** Checks recent tweets
- **Looks for:** Retweets of @Event_DAO content
- **Polling:** Every 5 seconds for 2 minutes

### 6. Invite a Friend
- **Verification:** Database check
- **Auto-complete:** When referred user completes missions
- **No polling needed**

### 7. Daily Login Bonus
- **Verification:** Server-side on page load
- **Auto-complete:** Immediately if first login today
- **No polling needed**

## 🎯 Advantages

### Real Verification ✅
- No fake delays
- Actually checks Twitter
- Accurate mission completion

### Better UX ✅
- Seamless experience
- No manual claiming needed
- Instant feedback when detected

### Prevents Cheating ✅
- Must actually complete action
- Can't game the system
- API verification required

## ⚡ Performance Considerations

### API Rate Limits

Twitter API Free Tier:
- **1,500 requests/month**
- Each verification = 1 request
- 24 checks per mission = 24 requests max
- Can verify ~62 missions per month on free tier

### Optimization

1. **Stagger checks** - Wait before first check
2. **Stop after success** - Clear interval immediately
3. **Max attempts** - Stop after 2 minutes
4. **Smart polling** - Only check active missions

### Scaling

For production with many users:
- Upgrade to Basic tier ($100/month) = 10,000 requests
- Or Pro tier ($5,000/month) = 1,000,000 requests
- Implement server-side caching
- Use webhooks instead of polling (advanced)

## 🔍 Debugging

### Check Verification Status

```javascript
// Browser console
// Check if follow verification is working
fetch('/api/missions/verify-follow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userId: 'your-user-id', 
    targetUsername: 'Event_DAO' 
  })
}).then(r => r.json()).then(console.log);

// Check if tweet verification is working
fetch('/api/missions/verify-tweet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userId: 'your-user-id',
    requiredMention: '@Event_DAO',
    requiredHashtag: '#EventDAO'
  })
}).then(r => r.json()).then(console.log);
```

### Common Issues

**Issue:** Verification not working
- Check Twitter API credentials in `.env.local`
- Verify X account is connected
- Check console for errors
- Ensure Twitter API access is active

**Issue:** Takes too long
- Twitter API can cache up to 5 minutes
- Increase polling duration if needed
- Check rate limit status

**Issue:** False negatives
- Twitter username case-sensitive
- Hashtag must match exactly
- Tweet must be recent (within last 10 tweets)

## 📝 Testing Checklist

- [ ] X account connected via OAuth
- [ ] Follow mission auto-verifies
- [ ] Tweet mission auto-verifies
- [ ] Engage mission auto-verifies
- [ ] Retweet mission auto-verifies
- [ ] Missions complete automatically
- [ ] Success toasts appear
- [ ] Can claim rewards after completion
- [ ] No console errors
- [ ] Polling stops after detection

## 🎊 Summary

✅ **Real-time verification** with Twitter API
✅ **Polls every 5 seconds** for up to 2 minutes
✅ **Automatic completion** when action detected
✅ **No fake delays** - uses actual Twitter data
✅ **Better UX** - seamless and automatic
✅ **Prevents cheating** - must complete real actions

Your missions now have **real auto-verification**! 🚀

