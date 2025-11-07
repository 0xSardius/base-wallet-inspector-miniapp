# Project 1: Base Wallet Inspector - Cursor Development Prompt

## Project Overview

Build a Farcaster miniapp that lets users explore any Base wallet's activity with beautiful visualizations. This is a learning project focused on mastering CDP's SQL API and Farcaster miniapp fundamentals.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Farcaster**: @farcaster/miniapp-sdk (with Quick Auth for auto-connect)
- **CDP**: SQL API for blockchain data queries
- **Auth**: Quick Auth (automatic user authentication + wallet address)
- **Styling**: Tailwind CSS (neobrutalism style with black/neon green)
- **UI Components**: shadcn/ui

## Core Features to Build

### 1. Quick Auth Integration

- Auto-authenticate user on miniapp load
- Get user's FID and connected wallet address
- Display authenticated user info (username, avatar, address)
- Allow manual wallet address input to explore any wallet (not just their own)

### 2. Transaction History

- Query last 50 transactions using CDP SQL API
- Display in a clean table with:
  - Transaction hash (truncated, clickable to Basescan)
  - From/To addresses
  - Value in ETH
  - Timestamp
  - Transaction type (Send/Receive)

### 3. Token Holdings

- Query all ERC-20 token transfers for the wallet
- Aggregate to show current holdings
- Display token balances with:
  - Token name/symbol
  - Balance amount
  - USD value (if available)

### 4. Activity Heatmap

- Analyze transaction timestamps
- Create a visual heatmap showing:
  - Most active hours of day
  - Most active days of week
- Use color intensity (black to neon green gradient)

### 5. Top Counterparties

- Identify wallets user interacts with most
- Show top 10 addresses by:
  - Number of transactions
  - Total volume exchanged
- Display with ENS names if available

## CDP SQL API Queries to Implement

### Query 1: Get Recent Transactions

```sql
SELECT
  transaction_hash,
  block_number,
  block_timestamp,
  from_address,
  to_address,
  value,
  gas_used,
  gas_price
FROM base.transactions
WHERE from_address = ? OR to_address = ?
ORDER BY block_number DESC
LIMIT 50
```

### Query 2: Get Token Transfers

```sql
SELECT
  transaction_hash,
  block_timestamp,
  contract_address,
  from_address,
  to_address,
  value,
  decoded_log
FROM base.transfers
WHERE from_address = ? OR to_address = ?
ORDER BY block_timestamp DESC
LIMIT 100
```

### Query 3: Get Transaction Count by Hour

```sql
SELECT
  toHour(block_timestamp) as hour,
  count(*) as tx_count
FROM base.transactions
WHERE from_address = ? OR to_address = ?
GROUP BY hour
ORDER BY hour
```

### Query 4: Top Counterparties

```sql
SELECT
  CASE
    WHEN from_address = ? THEN to_address
    ELSE from_address
  END as counterparty,
  count(*) as interaction_count,
  sum(value) as total_value
FROM base.transactions
WHERE from_address = ? OR to_address = ?
GROUP BY counterparty
ORDER BY interaction_count DESC
LIMIT 10
```

## File Structure

```
base-wallet-inspector/
├── app/
│   ├── page.tsx                 # Main miniapp page
│   ├── layout.tsx               # Root layout with providers
│   ├── providers.tsx            # Frame SDK provider
│   ├── globals.css              # Tailwind + custom styles
│   └── api/
│       ├── query/
│       │   └── route.ts         # CDP SQL API proxy endpoint
│       └── auth/
│           └── route.ts         # Quick Auth endpoint
├── components/
│   ├── user-profile.tsx         # Display authenticated user
│   ├── wallet-input.tsx         # Manual wallet address input
│   ├── transaction-table.tsx    # Transaction history table
│   ├── token-holdings.tsx       # Token balance cards
│   ├── activity-heatmap.tsx     # Activity visualization
│   └── top-counterparties.tsx   # Top addresses list
├── lib/
│   ├── cdp-client.ts           # CDP API client setup
│   ├── quick-auth.ts           # Quick Auth helper functions
│   └── utils.ts                # Helper functions
├── types/
│   └── index.ts                # TypeScript types
└── .env.local                  # Environment variables
```

## Environment Variables Needed

```env
# CDP API Keys (get from https://portal.cdp.coinbase.com)
CDP_API_KEY_NAME=your_api_key_name
CDP_API_KEY_PRIVATE_KEY=your_private_key

# Quick Auth Configuration
NEXT_PUBLIC_QUICK_AUTH_DOMAIN=your-app-url.com

# Network
NEXT_PUBLIC_NETWORK=base

# App Configuration
NEXT_PUBLIC_APP_NAME=Base Wallet Inspector
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

## Key Implementation Details

### 1. Quick Auth Integration

Quick Auth provides automatic authentication and returns a verified JWT with user data:

```typescript
// app/page.tsx
"use client";

import { useQuickAuth } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    async function authenticate() {
      const { fid, username, custody_address, verified_addresses } =
        await sdk.auth.quickAuth();

      setUser({
        fid,
        username,
        custody_address,
        verified_addresses,
      });

      // Use their first verified address or custody address
      setAddress(verified_addresses?.[0] || custody_address);
    }

    authenticate();
  }, []);

  return (
    <div>
      {user && (
        <div>
          <p>Welcome, @{user.username}!</p>
          <p>Analyzing: {address}</p>
        </div>
      )}
    </div>
  );
}
```

### 2. Server-Side JWT Verification

Verify the Quick Auth JWT on your backend:

```typescript
// app/api/auth/route.ts
import { verifyQuickAuthJWT } from "@farcaster/miniapp-sdk/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  try {
    const { fid, username, custody_address, verified_addresses } =
      await verifyQuickAuthJWT(token, {
        domain: process.env.NEXT_PUBLIC_QUICK_AUTH_DOMAIN!,
      });

    // User is verified! Store session, etc.
    return Response.json({
      success: true,
      user: { fid, username, custody_address, verified_addresses },
    });
  } catch (error) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}
```

### 3. CDP SQL API Integration

Create a server-side API route that:

- Accepts SQL queries from the frontend
- Authenticates with CDP using API keys
- Executes queries against CDP SQL API
- Returns formatted results

```typescript
// app/api/query/route.ts
export async function POST(req: Request) {
  const { sql } = await req.json();

  // Call CDP SQL API
  const response = await fetch(
    "https://api.cdp.coinbase.com/platform/v2/data/query/run",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${generateBearerToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql }),
    }
  );

  const data = await response.json();
  return Response.json(data);
}
```

### 4. Farcaster Frame SDK Setup

Initialize the SDK with Quick Auth:

```typescript
// app/providers.tsx
"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";

export function Providers({ children }) {
  useEffect(() => {
    // Signal that miniapp is ready
    sdk.actions.ready();
  }, []);

  return <>{children}</>;
}
```

```typescript
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 5. Data Fetching Pattern

Use React Query or SWR for efficient data fetching:

```typescript
// Example with React Query
const { data: transactions, isLoading } = useQuery({
  queryKey: ["transactions", address],
  queryFn: async () => {
    const response = await fetch("/api/query", {
      method: "POST",
      body: JSON.stringify({
        sql: `SELECT * FROM base.transactions WHERE from_address = '${address}' OR to_address = '${address}' ORDER BY block_number DESC LIMIT 50`,
      }),
    });
    return response.json();
  },
  enabled: !!address,
});
```

### 6. Styling Guidelines

- Use neobrutalism design principles:
  - Bold black borders (border-4)
  - Neon green accents (#00FF00)
  - Sharp corners (no rounded borders)
  - Strong shadows
  - High contrast

```css
/* Example component styling */
.card {
  @apply border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)];
}

.button-primary {
  @apply border-4 border-black bg-[#00FF00] px-6 py-3 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px];
}
```

## Development Steps

### Phase 1: Setup (30 mins)

1. Initialize Next.js app with TypeScript
2. Install all dependencies
3. Set up environment variables
4. Configure Wagmi and Frame SDK
5. Test basic miniapp detection

### Phase 2: Quick Auth Integration (1 hour)

1. Implement Quick Auth on page load
2. Display authenticated user info (username, avatar)
3. Extract and display wallet address
4. Add manual address input for exploring other wallets
5. Handle auth errors gracefully

### Phase 3: CDP Integration (2 hours)

1. Create CDP API client
2. Build API proxy route
3. Test SQL queries in playground first
4. Implement query functions
5. Add error handling

### Phase 4: Core Features (3-4 hours)

1. Transaction history table
2. Token holdings display
3. Activity heatmap
4. Top counterparties list

### Phase 5: Polish (1 hour)

1. Loading states
2. Error messages
3. Empty states
4. Responsive design
5. Performance optimization

## Testing Checklist

- [ ] Miniapp detected in Farcaster client
- [ ] Quick Auth authenticates user automatically
- [ ] User profile displays (username, FID, address)
- [ ] Manual address input works for exploring other wallets
- [ ] Transactions load correctly
- [ ] Token balances calculate properly
- [ ] Heatmap displays accurately
- [ ] Top counterparties show correct data
- [ ] All links to Basescan work
- [ ] Loading states show appropriately
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Performance is smooth

## Common Pitfalls to Avoid

1. **CDP API Authentication**: Make sure to generate bearer tokens correctly server-side
2. **CORS Issues**: Use API routes (Next.js server) to call CDP, not client-side
3. **Frame Detection**: Always call `sdk.actions.ready()` when miniapp loads
4. **Address Validation**: Validate and lowercase all addresses before querying
5. **Rate Limiting**: Implement debouncing for address input queries
6. **Big Numbers**: Use BigInt or bn.js for handling wei values correctly
7. **Timestamp Formatting**: Convert Unix timestamps properly to readable dates

## Success Criteria

You'll know you're done when:

1. ✅ App runs inside Farcaster without errors
2. ✅ Quick Auth authenticates user automatically on load
3. ✅ User can explore their own wallet or input any address
4. ✅ All 5 core features display real data
5. ✅ UI is clean and matches neobrutalism style
6. ✅ No console errors
7. ✅ Loads in under 3 seconds
8. ✅ Mobile responsive

## Resources & References

### CDP Documentation

- SQL API Quickstart: https://docs.cdp.coinbase.com/data/sql-api/quickstart
- SQL Schema Reference: https://docs.cdp.coinbase.com/data/sql-api/schema
- Authentication: https://docs.cdp.coinbase.com/api-reference/v2/authentication

### Farcaster Miniapps

- Getting Started: https://miniapps.farcaster.xyz/docs/getting-started
- Quick Auth Guide: https://miniapps.farcaster.xyz/docs/sdk/quick-auth
- SDK Reference: https://miniapps.farcaster.xyz/docs/sdk/overview
- Publishing: https://miniapps.farcaster.xyz/docs/guides/publishing

### Tools

- CDP Portal (get API keys): https://portal.cdp.coinbase.com
- SQL Playground (test queries): https://portal.cdp.coinbase.com/products/sql-api
- Basescan: https://basescan.org

## Extension Ideas (After MVP)

Once you have the basics working, consider adding:

- Transaction filtering by type (swaps, transfers, contracts)
- Export data to CSV
- Compare multiple wallets
- NFT holdings display
- DeFi position tracking
- Wallet labels/tags
- Share wallet report as a cast
- Historical balance chart

## Getting Help

If you get stuck:

1. Check CDP docs for SQL API examples
2. Test queries in CDP SQL Playground first
3. Review Farcaster miniapp examples
4. Check console for Frame SDK errors
5. Verify environment variables are set correctly

---

## Quick Start Commands

```bash
# Create Next.js app
npx create-next-app@latest base-wallet-inspector --typescript --tailwind --app

# Install dependencies
npm install @farcaster/miniapp-sdk @tanstack/react-query

# Add shadcn/ui (optional)
npx shadcn@latest init
npx shadcn@latest add button card table

# Run development server
npm run dev
```

## Final Note

This is a learning project - focus on understanding how CDP SQL API works and how Farcaster miniapps integrate wallets. Don't over-engineer! Ship a working MVP first, then iterate.

Good luck! 🚀
