# 🚀 Vercel Deployment Guide

## ✅ Git Push Complete!

Your code is now on GitHub! Here's how to deploy to Vercel:

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:
- [ ] Supabase project URL and Anon Key
- [ ] Twitter API credentials (Client ID, Client Secret, Access Token, Access Token Secret)
- [ ] Run the database migration in Supabase
- [ ] Tested locally with `npm run dev`

## 🌐 Deploy to Vercel

### Option 1: Automatic Deployment (Recommended)

If your GitHub repo is already connected to Vercel:

1. **Vercel will auto-deploy** when you push to main
2. Check: https://vercel.com/dashboard
3. Look for your EventDAO project
4. Wait for build to complete (~2-3 minutes)
5. ✅ Done! Your site is live!

### Option 2: Manual Deployment

If not connected yet:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `gannfg/eventdao`
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: ./frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variables** (CRITICAL!)
   
   Click "Environment Variables" and add these:

   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # Twitter OAuth
   NEXT_PUBLIC_TWITTER_CLIENT_ID=your_client_id_here
   TWITTER_CLIENT_SECRET=your_client_secret_here
   TWITTER_ACCESS_TOKEN=1977571871802712064-vwtimOoR6eX2GULT3TdVW3BJFnwPSS
   TWITTER_ACCESS_TOKEN_SECRET=WhXlDrJgXjTNAFlytfWtApjhwplfVymcwuYjOjeBRrUCH

   # Callback URL (IMPORTANT - update with your Vercel domain)
   TWITTER_CALLBACK_URL=https://your-project.vercel.app/api/auth/twitter/callback
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - ✅ Your site is live!

## 🔧 Post-Deployment Setup

### 1. Update Twitter Callback URL

Once deployed, you need to update Twitter Developer Portal:

1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Select your app
3. Go to "User authentication settings"
4. Add your Vercel URL to callback URLs:
   ```
   https://your-project.vercel.app/api/auth/twitter/callback
   ```
5. Save changes

### 2. Update Vercel Environment Variable

Update the callback URL in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `TWITTER_CALLBACK_URL`
3. Update to: `https://your-project.vercel.app/api/auth/twitter/callback`
4. Click "Save"
5. Redeploy: Deployments → ... → Redeploy

### 3. Run Database Migration

If you haven't already:

1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Copy contents of `docs/MISSIONS_DATABASE_SETUP.sql`
4. Paste and Run
5. Verify all tables created

### 4. Test Your Deployment

Visit your site:
```
https://your-project.vercel.app/account
```

Test:
- [ ] Page loads without errors
- [ ] Can connect wallet
- [ ] Missions display
- [ ] Toast notifications work
- [ ] "Connect X Account" redirects to Twitter
- [ ] OAuth callback works
- [ ] Missions auto-verify
- [ ] Rewards claimable

## 🎯 Your Vercel URLs

After deployment, you'll have:

- **Production**: `https://your-project.vercel.app`
- **Preview (PR)**: `https://your-project-git-branch.vercel.app`
- **Development**: `http://localhost:3001`

## 🔒 Security Checklist

- [ ] All environment variables set in Vercel
- [ ] `.env.local` NOT committed to git
- [ ] Twitter callback URL uses HTTPS
- [ ] Supabase RLS policies enabled
- [ ] API keys not exposed in client code

## 📊 Monitoring

After deployment, monitor:

1. **Vercel Dashboard**
   - Build logs
   - Function logs
   - Analytics

2. **Supabase Dashboard**
   - Database queries
   - API usage
   - Error logs

3. **Twitter Developer Portal**
   - API usage
   - Rate limits
   - OAuth success rate

## 🐛 Common Issues

### Issue: Build fails
**Solution:**
- Check Vercel build logs
- Ensure `frontend/` is root directory
- Verify all dependencies in `package.json`

### Issue: Environment variables not working
**Solution:**
- Redeploy after adding/changing env vars
- Vercel → Settings → Environment Variables
- Make sure to redeploy (not just save)

### Issue: Twitter OAuth fails
**Solution:**
- Check callback URL matches exactly
- Use HTTPS (not HTTP) for production
- Verify in Twitter Developer Portal

### Issue: Database connection fails
**Solution:**
- Check Supabase URL and Key are correct
- Verify RLS policies are set up
- Check Supabase logs for errors

### Issue: Functions timeout
**Solution:**
- Check Vercel function logs
- Twitter API might be slow
- Consider increasing timeout in `vercel.json`

## ⚡ Performance Tips

### 1. Enable Edge Functions (Optional)

Create `vercel.json` in frontend:
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### 2. Configure Caching

Add to `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/missions/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};
```

### 3. Monitor Performance

- Use Vercel Analytics
- Check Core Web Vitals
- Monitor function execution time

## 🔄 Continuous Deployment

Every push to main will:
1. Trigger Vercel build
2. Run tests (if configured)
3. Deploy to production
4. Update live site

To disable auto-deploy:
- Vercel Dashboard → Settings → Git → Disable

## 📞 Support

If deployment fails:
1. Check Vercel build logs
2. Review environment variables
3. Test locally first
4. Check Supabase connection
5. Verify Twitter API credentials

## 🎊 You're Live!

Once deployed, your Daily Missions system is live at:
```
https://your-project.vercel.app
```

Share it with users and start earning EVT! 🚀

---

## Quick Commands

```bash
# View deployment status
vercel

# View logs
vercel logs

# List deployments
vercel ls

# Open project in browser
vercel open
```

## Next Steps

- [ ] Deploy to Vercel
- [ ] Update Twitter callback URLs
- [ ] Test production site
- [ ] Share with users
- [ ] Monitor analytics
- [ ] Collect feedback

**Congratulations on your deployment!** 🎉

