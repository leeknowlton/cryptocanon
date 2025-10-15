# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Farcaster Mini App (formerly Frames v2) built with Next.js 15, React 19, and TypeScript. The mini app is designed to display the Bitcoin paper in an interactive format within the Farcaster ecosystem.

## Development Commands

### Running the Dev Server

```bash
npm run dev
```

This runs a custom development script that:
- Starts Next.js on port 3000 (configurable with `--port` or `-p` flag)
- Optionally creates a localtunnel for mobile testing (if `USE_TUNNEL=true` in `.env.local`)
- Automatically injects `NEXT_PUBLIC_URL` environment variable
- Kills any existing processes on the port before starting

**Port configuration:**
```bash
npm run dev -- --port=3001
# or
npm run dev -- -p 3001
```

### Building and Deployment

```bash
npm run build          # Build with .env generation from .env.local
npm run build:raw      # Build without env setup
npm run start          # Start production server
npm run lint           # Run ESLint
```

### Deployment to Vercel

```bash
npm run deploy:vercel  # Interactive deployment script
npm run deploy:raw     # Direct Vercel deployment
```

### Cleanup

```bash
npm run cleanup        # Kill processes using port 3000
```

## Architecture

### Provider Hierarchy

The app uses a layered provider structure (from outermost to innermost):

1. **WagmiProvider** (`src/components/providers/WagmiProvider.tsx`)
   - Configures blockchain connections (Base, Optimism, Mainnet, Degen, Unichain, Celo)
   - Sets up wallet connectors: Farcaster Frame connector, Coinbase Wallet, MetaMask
   - Auto-connects Coinbase Wallet when detected

2. **MiniAppProvider** (from `@neynar/react`)
   - Provides Farcaster Mini App context
   - Manages SDK loading state and mini app lifecycle
   - Handles tab navigation and safe area insets

3. **SafeFarcasterSolanaProvider** (`src/components/providers/SafeFarcasterSolanaProvider.tsx`)
   - Provides Solana wallet integration
   - Configured via `SOLANA_RPC_ENDPOINT` environment variable

### Authentication Flow

**QuickAuth (In-Memory):**
- Hook: `useQuickAuth()` in `src/hooks/useQuickAuth.ts`
- SDK: `@farcaster/quick-auth` via `@farcaster/miniapp-sdk`
- Token validation endpoint: `/api/auth/validate` (POST)
- Server-side JWT verification using `@farcaster/quick-auth` client
- No local storage - tokens exist only in memory
- Signing out of Farcaster client automatically signs out of mini app

**Key implementation details:**
- Tokens are validated on mount and after sign-in via `/api/auth/validate`
- Domain extraction from `NEXT_PUBLIC_URL` or request headers
- Returns user FID (Farcaster ID) on successful validation

### Data Storage (KV Store)

The app uses a flexible storage system (`src/lib/kv.ts`) that:
- Prefers Upstash Redis if `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
- Falls back to in-memory Map storage for development
- Primary use: storing notification details per user FID

**Storage keys pattern:** `${APP_NAME}:user:${fid}`

### Notification System

Two modes depending on Neynar configuration:

1. **Neynar-enabled** (if `NEYNAR_API_KEY` and `NEYNAR_CLIENT_ID` set):
   - Webhooks handled by Neynar: `https://api.neynar.com/f/app/${NEYNAR_CLIENT_ID}/event`
   - Notifications sent via `NeynarAPIClient.publishFrameNotifications()`

2. **Self-hosted** (without Neynar credentials):
   - Webhook endpoint: `/api/webhook` (POST)
   - Validates app signatures using `verifyAppKeyWithNeynar`
   - Handles events: `miniapp_added`, `miniapp_removed`, `notifications_enabled`, `notifications_disabled`

### API Routes Structure

Key endpoints:

- `/api/auth/validate` - Validate QuickAuth JWT tokens
- `/api/auth/nonce` - Get nonce for SIWE authentication
- `/api/auth/signer` - Create new signer
- `/api/auth/signers` - Get user's signers
- `/api/webhook` - Handle Farcaster mini app lifecycle events
- `/api/opengraph-image` - Dynamic OG image generation
- `/api/send-notification` - Send push notifications to users

### Component Architecture

**Main App Flow:**
```
src/app/page.tsx (generateMetadata + Home component)
  └─> src/app/app.tsx (dynamic import wrapper, ssr: false)
      └─> src/components/App.tsx (main app logic)
          ├─> Header (displays user info)
          ├─> Tab content (Home, Actions, Context, Wallet)
          └─> Footer (tab navigation)
```

**Why dynamic import:** Components using `@farcaster/miniapp-sdk` must be client-side only (`ssr: false`) as the SDK requires browser APIs.

**Tab System:**
- Tabs are enum-based: `Tab.Home`, `Tab.Actions`, `Tab.Context`, `Tab.Wallet`
- Managed via `useMiniApp()` hook from `@neynar/react`
- Wallet tab visibility controlled by `USE_WALLET` constant

### Configuration (src/lib/constants.ts)

All app configuration is centralized in `constants.ts`:
- `APP_NAME`, `APP_DESCRIPTION`, `APP_URL` - App metadata
- `APP_ICON_URL`, `APP_OG_IMAGE_URL`, `APP_SPLASH_URL` - Asset URLs
- `USE_WALLET` - Toggle wallet functionality
- `ANALYTICS_ENABLED` - Toggle Neynar analytics
- `APP_REQUIRED_CHAINS` - CAIP-2 chain identifiers for required blockchain support
- `RETURN_URL` - URL for back button navigation

**Important:** This file is auto-updated by the Neynar init script. Manual changes may be overwritten.

### Safe Area Insets

The app respects platform safe areas via `context.client.safeAreaInsets`:
```tsx
paddingTop: context?.client.safeAreaInsets?.top ?? 0
```
Applied in `src/components/App.tsx`.

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_URL=         # App URL (auto-injected by npm run dev)
NEYNAR_API_KEY=          # Neynar API key (optional)
NEYNAR_CLIENT_ID=        # Neynar client ID (optional)
KV_REST_API_URL=         # Upstash Redis URL (optional)
KV_REST_API_TOKEN=       # Upstash Redis token (optional)
SOLANA_RPC_ENDPOINT=     # Solana RPC (defaults to publicnode.com)
USE_TUNNEL=              # Set to 'true' for localtunnel in dev
```

## Testing the Mini App

**Desktop (Warpcast Developer Tools):**
1. Visit https://warpcast.com/~/developers
2. Enter mini app URL in "Preview Mini App" tool
3. Click "Preview"

**Mobile (Warpcast App):**
1. Open Warpcast > Settings > Developer > Mini Apps
2. Enter mini app URL
3. Click "Preview"

**With Localtunnel (for mobile testing without deployment):**
1. Set `USE_TUNNEL=true` in `.env.local`
2. Run `npm run dev`
3. When localtunnel URL appears, open it in browser
4. Enter your IP address in the password field
5. Use the tunnel URL in Warpcast

## Key Dependencies

- `@farcaster/miniapp-sdk` - Core mini app SDK
- `@farcaster/quick-auth` - QuickAuth authentication
- `@neynar/react` - Neynar React hooks and components
- `wagmi` - Ethereum wallet connection
- `@solana/wallet-adapter-react` - Solana wallet support
- `@upstash/redis` - Redis KV storage
- `next` v15 - Framework
- `react` v19 - UI library

## Common Patterns

### Adding a New Tab

1. Create tab component in `src/components/ui/tabs/`
2. Add to `src/components/ui/tabs/index.ts`
3. Add enum value to `Tab` in `src/components/App.tsx`
4. Add conditional render in App component
5. Update Footer to show new tab

### Adding API Route with Authentication

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  // Validate token with QuickAuth endpoint
  const validation = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  if (!validation.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { user } = await validation.json();
  // ... rest of handler
}
```

### Using Neynar Client

```typescript
import { getNeynarClient } from '~/lib/neynar';

const client = getNeynarClient();
const user = await client.lookupUserByFid(fid);
```

## Gotchas

- Always use dynamic imports with `ssr: false` for components using mini app SDK
- The `dev.js` script kills processes on the port before starting - this is intentional
- QuickAuth tokens are memory-only by design
- Environment variables are injected at runtime by `dev.js` script
- Localtunnel requires IP address submission before mini app loads
- Mini app metadata uses `fc:frame` in OpenGraph tags for Farcaster discovery
