# Base Wallet Inspector

A Farcaster miniapp that lets users explore any Base wallet's activity with beautiful visualizations. Built to learn CDP's SQL API and Farcaster miniapp fundamentals.

## Features

- 🔐 **Quick Auth Integration** - Auto-authenticate users and get their wallet address
- 📊 **Transaction History** - View transactions with pagination, filters, and date grouping
- 💰 **Token Holdings** - See all token balances sorted by USD value
- 📈 **Activity Heatmap** - GitHub-style grid showing activity by hour and day
- 👥 **Top Counterparties** - Discover most interacted addresses with count/volume switching

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Farcaster**: @farcaster/miniapp-sdk (Quick Auth)
- **CDP**: SQL API for blockchain data queries
- **Styling**: Tailwind CSS (neobrutalism style)
- **Data Fetching**: React Query (@tanstack/react-query)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your CDP API keys and configuration.

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Test in Farcaster client:**
   - Use the [Mini App Preview Tool](https://farcaster.xyz/~/developers/mini-apps/preview)
   - Or deploy and open in Warpcast

## Setup Details

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Current Status

See [STATUS.md](./STATUS.md) for current implementation status and known issues.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (CDP proxy, auth)
│   ├── app.tsx            # Main app entry
│   └── providers.tsx       # SDK & React Query providers
├── components/            # React components
│   ├── WalletInspector.tsx    # Main app component
│   ├── wallet/            # Wallet-related components
│   ├── transactions/     # Transaction components
│   ├── tokens/           # Token components
│   ├── activity/          # Activity visualization
│   └── counterparties/    # Counterparty components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and clients
└── types/                 # TypeScript types
```

## Post-MVP Features

See [progress-tracker.md](./progress-tracker.md) for planned features.

## License

MIT
