# Twitter Callback URLs - Quick Setup Guide

## 🎯 Callback URLs You Need to Add

### For Local Development (localhost)

```
http://localhost:3001/api/auth/twitter/callback
```

### For Production (your domain)

```
https://yourdomain.com/api/auth/twitter/callback
```

## 📝 Step-by-Step Twitter Developer Portal Setup

### 1. Navigate to Your App Settings

1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Click on your app name
3. Click **"User authentication settings"**

### 2. Configure OAuth 2.0 Settings

Fill in these fields:

| Field | Value |
|-------|-------|
| **App permissions** | ✅ Read |
| **Type of App** | ✅ Web App, Automated App or Bot |
| **Callback URI / Redirect URL** | `http://localhost:3001/api/auth/twitter/callback` |
| **Website URL** | `http://localhost:3001` |

### 3. Advanced Settings (Optional)

| Field | Value |
|-------|-------|
| **Organization name** | EventDAO |
| **Organization URL** | https://eventdao.com (or your site) |
| **Terms of service** | https://eventdao.com/terms |
| **Privacy policy** | https://eventdao.com/privacy |

### 4. API Permissions Needed

Make sure these scopes are enabled:
- ✅ `tweet.read` - Read tweets
- ✅ `users.read` - Read user profile
- ✅ `follows.read` - Check who user follows
- ✅ `offline.access` - Keep connection active

## 🔄 OAuth Flow Diagram

```
User clicks "Connect X Account"
        ↓
Frontend → /api/auth/twitter
        ↓
Redirects to Twitter
        ↓
User authorizes app
        ↓
Twitter redirects to callback
        ↓
/api/auth/twitter/callback
        ↓
Exchanges code for token
        ↓
Gets user info from Twitter
        ↓
Stores in Supabase database
        ↓
Redirects back to /account
        ↓
Shows success toast + completes mission
```

## 🌐 Multiple Callback URLs

You can add multiple callback URLs for different environments:

### Development
```
http://localhost:3001/api/auth/twitter/callback
http://localhost:3000/api/auth/twitter/callback (if using 3000)
```

### Staging
```
https://staging.yourdomain.com/api/auth/twitter/callback
```

### Production
```
https://yourdomain.com/api/auth/twitter/callback
https://www.yourdomain.com/api/auth/twitter/callback
```

## 📋 Environment Variable Setup

For each environment, set the appropriate callback URL:

### Local Development (.env.local)
```bash
TWITTER_CALLBACK_URL=http://localhost:3001/api/auth/twitter/callback
```

### Vercel/Production (Environment Variables)
```bash
TWITTER_CALLBACK_URL=https://yourdomain.com/api/auth/twitter/callback
```

## ⚠️ Common Mistakes

### ❌ Wrong
```
http://localhost:3001/api/auth/twitter/callback/  (trailing slash)
http://localhost:3001/api/auth/twitter           (missing /callback)
https://localhost:3001/api/auth/twitter/callback (https on localhost)
```

### ✅ Correct
```
http://localhost:3001/api/auth/twitter/callback
```

## 🧪 Testing Checklist

- [ ] Callback URL added to Twitter Developer Portal
- [ ] Website URL set to `http://localhost:3001`
- [ ] App permissions set to "Read"
- [ ] OAuth 2.0 enabled
- [ ] Client ID copied to `.env.local`
- [ ] Client Secret copied to `.env.local`
- [ ] Callback URL in `.env.local` matches Twitter exactly
- [ ] Dev server restarted
- [ ] Tested OAuth flow works

## 🎬 Quick Test

```bash
# 1. Make sure .env.local is set up
cat frontend/.env.local

# 2. Restart dev server
cd frontend
npm run dev

# 3. Test the flow
# Open: http://localhost:3001/account
# Click: "Connect X Account"
# Authorize on Twitter
# Should redirect back and complete mission
```

## 📊 Expected Flow

1. **Click "Start"** → Shows blue toast
2. **Redirects to Twitter** → Twitter authorization page
3. **Click "Authorize"** → Approves connection
4. **Redirects back** → http://localhost:3001/account?twitter_connected=true
5. **Success toast** → "X Account Connected!"
6. **Mission status** → Changes to "Completed"
7. **Click "Claim Reward"** → Get 50 EVT!

## 🔒 Security Notes

- Never share your Client Secret
- Keep `.env.local` out of git
- Use HTTPS in production
- Validate state parameter (already implemented)
- Store tokens securely (already implemented)

## 📞 Help

If callback isn't working:

1. Check Twitter Developer Portal → App Settings → OAuth 2.0 Settings
2. Verify callback URL matches exactly (no typos!)
3. Check browser console for errors
4. Check server logs for authentication errors
5. Verify all environment variables are set

## ✅ Final Checklist

Before going live:

- [ ] Localhost callback works
- [ ] Production callback configured
- [ ] Environment variables set
- [ ] SSL certificate active (production)
- [ ] Error handling tested
- [ ] User can connect successfully
- [ ] Mission completes automatically
- [ ] Reward claims successfully

You're ready to go! 🚀

