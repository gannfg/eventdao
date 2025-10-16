# X (Twitter) OAuth Integration Guide

## Overview

This guide will help you connect real X (Twitter) account verification to your Daily Missions system. Currently, the "Connect X Account" mission shows a placeholder message. Follow these steps to implement real OAuth.

## Prerequisites

- X (Twitter) Developer Account
- Approved App (can take 1-2 weeks)
- Basic understanding of OAuth 2.0

## Step 1: Create X Developer Account

1. **Go to X Developer Portal**
   - Visit: https://developer.twitter.com/
   - Sign in with your X account

2. **Apply for Developer Access**
   - Click "Apply" or "Developer Portal"
   - Fill out the application form
   - Describe your use case: "User authentication for EventDAO platform"
   - Wait for approval (usually 1-2 days)

3. **Create a Project & App**
   - Once approved, go to Developer Portal
   - Create a new Project (e.g., "EventDAO")
   - Create an App under that project (e.g., "EventDAO Authentication")

## Step 2: Configure App Settings

1. **Get Your Credentials**
   - Go to your app's "Keys and tokens" tab
   - Note down:
     - API Key (Client ID)
     - API Key Secret (Client Secret)

2. **Set OAuth 2.0 Settings**
   - Go to "User authentication settings"
   - Click "Set up"
   - Type of App: **Web App**
   - App permissions: **Read**
   - Callback URLs:
     ```
     http://localhost:3001/api/auth/twitter/callback
     https://yourdomain.com/api/auth/twitter/callback
     ```
   - Website URL: `https://yourdomain.com`

3. **Save Your Settings**
   - Copy the Client ID and Client Secret

## Step 3: Add Environment Variables

Add to your `.env.local` file:

```bash
# Twitter OAuth
NEXT_PUBLIC_TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
TWITTER_CALLBACK_URL=http://localhost:3001/api/auth/twitter/callback

# For production
# TWITTER_CALLBACK_URL=https://yourdomain.com/api/auth/twitter/callback
```

## Step 4: Install Dependencies

```bash
cd frontend
npm install next-auth @auth/core
```

## Step 5: Create OAuth API Routes

Create `frontend/src/app/api/auth/twitter/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
  const redirectUri = process.env.TWITTER_CALLBACK_URL;
  
  // Generate state for CSRF protection
  const state = Math.random().toString(36).substring(7);
  
  // Store state in session/cookie for verification
  const response = NextResponse.redirect(
    `https://twitter.com/i/oauth2/authorize?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri!)}&` +
    `scope=tweet.read%20users.read&` +
    `state=${state}&` +
    `code_challenge=challenge&` +
    `code_challenge_method=plain`
  );
  
  response.cookies.set('twitter_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
  });
  
  return response;
}
```

Create `frontend/src/app/api/auth/twitter/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { missionService } from '@/lib/mission-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('twitter_oauth_state')?.value;
  
  // Verify state
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL('/account?error=invalid_state', request.url)
    );
  }
  
  if (!code) {
    return NextResponse.redirect(
      new URL('/account?error=no_code', request.url)
    );
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TWITTER_CALLBACK_URL!,
        code_verifier: 'challenge',
      }),
    });
    
    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }
    
    // Get user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    
    const userData = await userResponse.json();
    
    // Store in database
    const userId = request.cookies.get('user_id')?.value; // You'll need to store this
    if (userId) {
      await missionService.connectXAccount(
        userId,
        userData.data.id,
        userData.data.username
      );
    }
    
    // Redirect back to account page with success
    return NextResponse.redirect(
      new URL('/account?twitter_connected=true', request.url)
    );
  } catch (error) {
    console.error('Twitter OAuth error:', error);
    return NextResponse.redirect(
      new URL('/account?error=oauth_failed', request.url)
    );
  }
}
```

## Step 6: Update Mission Action Handler

Update the "Connect X Account" case in `handleMissionAction`:

```typescript
case 'Connect X Account':
  // Start OAuth flow
  window.location.href = '/api/auth/twitter';
  break;
```

## Step 7: Handle OAuth Response

Add to the account page's `useEffect`:

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  
  if (params.get('twitter_connected') === 'true') {
    success('🔗 X Account Connected!\n\nYour X account has been linked successfully!');
    // Mark mission as completed
    const connectXMission = missions.find(m => m.title === 'Connect X Account');
    if (connectXMission && user?.id) {
      markMissionCompleted(connectXMission.id);
    }
    // Clean up URL
    window.history.replaceState({}, '', '/account');
  }
  
  if (params.get('error')) {
    showError('Failed to connect X account. Please try again.');
    window.history.replaceState({}, '', '/account');
  }
}, []);
```

## Step 8: Verify Other Missions

### Follow Verification

Create `frontend/src/app/api/missions/verify-follow/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId, targetUsername } = await request.json();
  
  // Get user's X access token from database
  const userToken = await getUserTwitterToken(userId);
  
  if (!userToken) {
    return NextResponse.json({ error: 'X account not connected' }, { status: 401 });
  }
  
  try {
    // Check if user follows @Event_DAO
    const response = await fetch(
      `https://api.twitter.com/2/users/by/username/${targetUsername}/following`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    
    const data = await response.json();
    const isFollowing = data.data?.some((u: any) => u.username === 'Event_DAO');
    
    return NextResponse.json({ verified: isFollowing });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
```

### Tweet Verification

Create `frontend/src/app/api/missions/verify-tweet/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  
  const userToken = await getUserTwitterToken(userId);
  
  if (!userToken) {
    return NextResponse.json({ error: 'X account not connected' }, { status: 401 });
  }
  
  try {
    // Get user's recent tweets
    const response = await fetch(
      'https://api.twitter.com/2/users/me/tweets?max_results=10',
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    
    const data = await response.json();
    
    // Check if any recent tweet mentions @Event_DAO and #EventDAO
    const hasTweet = data.data?.some((tweet: any) => 
      tweet.text.includes('@Event_DAO') && tweet.text.includes('#EventDAO')
    );
    
    return NextResponse.json({ verified: hasTweet });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
```

## Step 9: Auto-Verify Missions

Replace the 3-second timeout with real verification:

```typescript
case 'Follow @Event_DAO':
  window.open('https://twitter.com/Event_DAO', '_blank');
  info('📱 Opening X (Twitter)...\n\nFollow @Event_DAO!');
  
  // Poll for verification
  const followInterval = setInterval(async () => {
    const response = await fetch('/api/missions/verify-follow', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, targetUsername: 'Event_DAO' }),
    });
    const { verified } = await response.json();
    
    if (verified) {
      clearInterval(followInterval);
      await markMissionCompleted(missionId);
    }
  }, 5000); // Check every 5 seconds
  
  // Stop after 5 minutes
  setTimeout(() => clearInterval(followInterval), 300000);
  break;
```

## Step 10: Security Best Practices

1. **Store Tokens Securely**
   ```sql
   -- Add to users table
   ALTER TABLE users ADD COLUMN x_access_token TEXT;
   ALTER TABLE users ADD COLUMN x_refresh_token TEXT;
   ALTER TABLE users ADD COLUMN x_token_expires_at TIMESTAMP;
   ```

2. **Encrypt Tokens**
   ```typescript
   import { encrypt, decrypt } from '@/lib/encryption';
   
   // Store encrypted
   await supabase
     .from('users')
     .update({ 
       x_access_token: encrypt(token),
       x_token_expires_at: new Date(Date.now() + 7200000) // 2 hours
     })
     .eq('id', userId);
   ```

3. **Rate Limiting**
   - Limit verification checks to prevent API abuse
   - Use Redis or database to track API calls per user

4. **Token Refresh**
   - Implement automatic token refresh
   - Store refresh tokens securely
   - Handle expired token errors gracefully

## Testing

1. **Local Testing**
   ```bash
   # Start dev server
   npm run dev
   
   # Navigate to account page
   open http://localhost:3001/account
   
   # Click "Connect X Account"
   # Complete OAuth flow
   # Verify connection in database
   ```

2. **Check Database**
   ```sql
   SELECT username, x_account_id, x_username, x_connected_at
   FROM users
   WHERE x_account_id IS NOT NULL;
   ```

## Troubleshooting

### "App not authorized"
- Check your app's permission settings
- Make sure callback URL matches exactly

### "Invalid client"
- Verify Client ID and Secret are correct
- Check they're not swapped

### "Redirect URI mismatch"
- Callback URL must match exactly what's in Twitter settings
- Include protocol (http:// or https://)

### Tokens expire quickly
- Implement token refresh flow
- Store refresh tokens
- Handle 401 errors by refreshing

## Cost & Limits

**X API Free Tier:**
- 1,500 tweets per month
- Basic access only
- Good for small apps

**X API Basic ($100/month):**
- 10,000 tweets per month
- Better rate limits
- Good for growing apps

**X API Pro ($5,000/month):**
- 1,000,000 tweets per month
- Full access
- For production apps

## Alternative: Manual Verification

If OAuth is too expensive, use manual verification:

1. User submits their X username
2. Admin checks manually
3. Admin approves mission completion

## Support

- X API Documentation: https://developer.twitter.com/en/docs
- OAuth 2.0 Guide: https://developer.twitter.com/en/docs/authentication/oauth-2-0
- Rate Limits: https://developer.twitter.com/en/docs/rate-limits

## Summary

✅ Created developer account
✅ Created app and got credentials
✅ Set up OAuth flow
✅ Added API routes
✅ Implemented verification
✅ Tested connection

Once implemented, users will be able to actually connect their X accounts and have missions auto-verified in real-time!

