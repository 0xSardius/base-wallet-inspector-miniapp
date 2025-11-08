# Base Wallet Inspector - Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` and add your:
   - CDP API credentials (from https://portal.cdp.coinbase.com)
   - Quick Auth domain (your app's domain)
   - App URL

3. **Run the development server:**
   ```bash
   npm run dev
   ```

## CDP API Setup

1. Go to https://portal.cdp.coinbase.com
2. Create an API key with SQL API access
3. Copy the API key name and private key
4. Add them to `.env.local`:
   ```
   NEXT_PUBLIC_CDP_CLIENT_API=your_key_name
   CDP_API_SECRET=your_private_key
   ```

## CDP Authentication Note

The CDP client uses JWT signing with ES256. If you encounter authentication errors:

1. Verify your private key is in PEM format
2. Ensure the API key has SQL API permissions
3. Check that the JWT payload matches CDP's requirements

If authentication fails, you may need to adjust the JWT generation in `src/lib/cdp-client.ts` based on CDP's exact requirements.

## Testing

**Important**: You must test via ngrok tunnel in Farcaster. The SDK requires a Farcaster client context and HTTPS.

1. **Start dev server**: `npm run dev`
2. **Start ngrok** (in new terminal): `ngrok http 3000`
3. **Whitelist tunnel**: Open the ngrok HTTPS URL in your browser first
4. **Test in Farcaster**: Use the [Preview Tool](https://farcaster.xyz/~/developers/mini-apps/preview) with your ngrok URL
5. The app will auto-authenticate using Quick Auth
6. Your wallet address will be automatically loaded
7. You can also manually enter any Base wallet address to explore

See [TESTING.md](./TESTING.md) for detailed testing instructions.

## Features

- ✅ Transaction history with pagination and filters
- ✅ Token holdings sorted by USD value
- ✅ Activity heatmap (hour of day / day of week)
- ✅ Top counterparties with count/volume switching
- ✅ Mobile-first design optimized for Farcaster clients

## Troubleshooting

### CDP Query Errors
- Check that your SQL queries use ClickHouse syntax
- Verify table names: `base.transactions`, `base.transfers`, etc.
- Ensure address is lowercase and valid format

### Quick Auth Issues
- Verify `NEXT_PUBLIC_QUICK_AUTH_DOMAIN` matches your app domain
- Check that the app is running in a Farcaster client context
- Ensure `sdk.actions.ready()` is called (handled in providers)

### Styling Issues
- Neobrutalism style uses sharp corners and bold borders
- Colors: Black (#000000) and Neon Green (#00FF00)
- Adjust in `tailwind.config.ts` if needed

