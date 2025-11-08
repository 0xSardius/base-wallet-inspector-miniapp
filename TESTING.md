# Testing Guide

## Testing Strategy

**You MUST test via ngrok tunnel in Farcaster** because:

- Farcaster clients require HTTPS (localhost won't work)
- The SDK (`sdk.context`, `sdk.actions.ready()`) only works in Farcaster client context
- Quick Auth requires the app to run in a Farcaster client

## Step-by-Step Testing Process

### 1. Start Local Development Server

```bash
npm run dev
```

This starts Next.js on `http://localhost:3000` (or your specified port).

### 2. Set Up ngrok Tunnel

**Install ngrok** (if not already installed):

- Download from https://ngrok.com/download
- Or install via package manager: `npm install -g ngrok`

**Start ngrok** in a **NEW terminal window**:

```bash
ngrok http 3000
```

You'll see output like:

```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### 3. Important: Whitelist the Tunnel URL

**Before testing in Farcaster**, open the ngrok URL directly in your browser:

1. Visit `https://abc123.ngrok-free.app` in your browser
2. Accept any ngrok warnings/interstitial pages
3. This whitelists the domain for iframe usage

### 4. Test in Farcaster Preview Tool

1. Go to: https://farcaster.xyz/~/developers/mini-apps/preview
2. Paste your ngrok URL (e.g., `https://abc123.ngrok-free.app`)
3. Click "Preview"
4. Your app should load in the preview tool

### 5. What to Test

#### ✅ Core Features (Work with ngrok):

- Quick Auth - User should auto-authenticate
- Wallet address loading - Should fetch from Farcaster API
- Manual address input - Should validate and work
- Transaction history - Should load and display
- Token holdings - Should aggregate and display
- Activity heatmap - Should render GitHub-style grid
- Top counterparties - Should show list with sorting

#### ⚠️ Limitations with ngrok:

- `addMiniApp()` action won't work (requires production domain)
- Manifest features may be limited
- Some SDK actions may not work

### 6. Testing Checklist

- [ ] App loads without infinite splash screen
- [ ] `sdk.actions.ready()` is called (check console)
- [ ] User profile displays (FID, username, avatar)
- [ ] Wallet address loads automatically
- [ ] Manual address input works
- [ ] Transactions load and display
- [ ] Token holdings show correctly
- [ ] Activity heatmap renders
- [ ] Top counterparties display
- [ ] Pagination works
- [ ] Filters work
- [ ] Error states show user-friendly messages
- [ ] Retry buttons work
- [ ] Mobile layout looks good

## Troubleshooting

### "Infinite loading screen"

- Check that `sdk.actions.ready()` is being called
- Check browser console for errors
- Verify ngrok URL is accessible

### "SDK context not available"

- Make sure you're testing in Farcaster preview tool, not just browser
- Verify ngrok URL was whitelisted (opened in browser first)

### "CDP API errors"

- Check `.env.local` has correct variable names:
  - `NEXT_PUBLIC_CDP_CLIENT_API`
  - `CDP_API_SECRET`
- Verify API keys are valid
- Check server logs for authentication errors

### "Tunnel URL blocked"

- Open ngrok URL directly in browser first
- Accept any ngrok warnings
- Then use in preview tool

## Testing CDP Queries Locally (Optional)

Before testing in Farcaster, you can test CDP queries directly:

1. Go to CDP SQL Playground: https://portal.cdp.coinbase.com/products/sql-api
2. Test your SQL queries there first
3. Verify they return expected data
4. Then test in the app

## Next Steps After Testing

### Phase 1: Fix Issues Found During Testing

1. **Document bugs/issues** found during ngrok testing
2. **Fix critical bugs** (app crashes, data not loading, etc.)
3. **Fix UI/UX issues** (layout problems, mobile responsiveness, etc.)
4. **Optimize performance** (slow queries, large data sets, etc.)
5. **Test fixes** again with ngrok before deploying

### Phase 2: Deploy to Production

#### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already):

   ```bash
   npm install -g vercel
   ```

2. **Deploy**:

   ```bash
   npm run deploy:vercel
   # OR manually:
   vercel --prod
   ```

3. **Set environment variables** in Vercel dashboard:

   - `NEXT_PUBLIC_CDP_CLIENT_API`
   - `CDP_API_SECRET`
   - `NEXT_PUBLIC_QUICK_AUTH_DOMAIN` (your production domain)
   - `NEXT_PUBLIC_APP_URL` (your production URL)

4. **Get your production URL** (e.g., `your-app.vercel.app`)

#### Option B: Deploy to Other Platforms

- **Netlify**: Similar process, set env vars in dashboard
- **Railway**: Set env vars in project settings
- **Custom server**: Deploy Next.js build and set env vars

### Phase 3: Set Up Farcaster Manifest

1. **Go to Manifest Tool**: https://farcaster.xyz/~/developers/mini-apps/manifest

2. **Enter your domain** (e.g., `your-app.vercel.app`)

3. **Fill in app details**:

   - App name: "Base Wallet Inspector"
   - Icon URL: Upload an icon (200x200px recommended)
   - Home URL: Your production URL
   - Description: Brief description of your app
   - Splash image/color: For loading screen

4. **Sign the manifest** using the tool (requires wallet connection)

5. **Choose hosting method**:
   - **Hosted Manifest** (Recommended): Farcaster hosts it, you just redirect
   - **Self-hosted**: Create `/.well-known/farcaster.json` file

#### If Using Hosted Manifest:

Add redirect in `next.config.js`:

```js
async redirects() {
  return [
    {
      source: '/.well-known/farcaster.json',
      destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/YOUR_MANIFEST_ID',
      permanent: false,
    },
  ];
}
```

#### If Self-hosting:

Create `public/.well-known/farcaster.json` with the signed manifest from the tool.

### Phase 4: Production Testing

1. **Test in Farcaster Preview Tool** with production URL
2. **Test `addMiniApp()` action** (only works on production domain)
3. **Test all features** in production environment
4. **Test on mobile** Farcaster client (Warpcast mobile app)
5. **Test share functionality** (share a cast with your app embed)

### Phase 5: Launch & Iterate

1. **Share your app**:

   - Post about it on Farcaster
   - Share in relevant channels
   - Get initial users

2. **Monitor usage**:

   - Check Vercel analytics
   - Monitor CDP API usage
   - Watch for errors in logs

3. **Gather feedback**:

   - Listen to user feedback
   - Track feature requests
   - Identify pain points

4. **Iterate**:
   - Fix bugs as they come up
   - Add improvements based on feedback
   - Consider post-MVP features (see `progress-tracker.md`)

### Phase 6: Post-MVP Features

Once MVP is stable, consider adding features from `progress-tracker.md`:

- Enhanced visualizations
- Data export/sharing
- Advanced analytics
- Performance optimizations
- User experience improvements

## Quick Checklist

- [ ] All features work in ngrok testing
- [ ] Critical bugs fixed
- [ ] Deployed to production
- [ ] Environment variables set in production
- [ ] Manifest created and signed
- [ ] Manifest accessible at `/.well-known/farcaster.json`
- [ ] Tested in production Farcaster client
- [ ] `addMiniApp()` works
- [ ] Mobile experience tested
- [ ] Ready to share!
