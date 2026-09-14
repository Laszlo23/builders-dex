# Builders DEX — The Quality Layer of Solana

Where the best Solana builders get discovered.

Not another DEX — a curated discovery and trading protocol with **Builder Score™**, **Builder Passport™**, and **Builders Intelligence™**. Approved assets trade via Jupiter Swap API V2.

## Features

- Discovery-first Home, Explore, Rankings, Passport, Apply
- Builder Score™ (7 dimensions) on every curated project
- **On-chain Builder Passport** — Solana program anchoring Builder Score™ on-chain
- **Network mode toggle** — Switch between Mainnet (trading) and Devnet (passport minting)
- Apply for Listing → pending review (not instantly tradeable)
- Builder Passport™ levels: Rookie → Genesis
- Builders Intelligence™ research assistant (Gemini)
- Real Solana wallet + Jupiter swaps for allowlisted mints only
- Brand assets, OG image, SEO meta / sitemap / robots

## Network Mode: Mainnet vs Devnet

The DEX supports **Mainnet** (default) and **Devnet** modes, selectable via the navbar toggle.

### Mainnet Mode (Default)
- Jupiter swaps and trading for approved tokens
- Production RPC endpoint
- Normal wallet operations

### Devnet Mode
- **Builder Passport minting** — Initialize your on-chain Passport PDA
- Devnet RPC endpoint (`VITE_SOLANA_DEVNET_RPC_URL`)
- Limited swap functionality (devnet tokens only)
- Clear amber banner: "Devnet mode — Passport minting available · Swaps may be limited"

### Network Toggle
- Desktop: Chip in navbar (amber when Devnet, neutral when Mainnet)
- Mobile: Toggle in wallet dropdown menu
- **Persistent**: Network choice saved in `localStorage` across sessions
- **Scroll reset**: All navigation changes scroll to top (`behavior: instant`)

### Minting Your Builder Passport

**Requirements:**
- `VITE_BUILDER_PASSPORT_PROGRAM_ID` set in `.env` (currently `7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD` on devnet)
- Network mode set to **Devnet**
- Wallet connected with devnet SOL for transaction fees

**Steps:**
1. Click the network toggle in navbar to switch to **Devnet**
2. Connect your wallet (ensure it's funded on devnet)
3. Navigate to **Profile / Passport™** page
4. Click **"Mint Builder Passport"** button in the On-Chain Passport section
5. Approve the transaction in your wallet
6. View your minted passport data: Level, Score, Last Updated
7. Click **"View on Explorer"** to see your PDA on Solana Explorer (`?cluster=devnet`)

**PDA Derivation**: `["builder-passport", walletPublicKey]`

**Note**: The Builder Passport program is currently deployed to **devnet only**. Mainnet swaps continue to work normally when on Mainnet mode.

## Brand assets

| File | Use |
|------|-----|
| [`public/brand-mark.png`](public/brand-mark.png) | Logo / favicon / PWA icon |
| [`public/og-image.png`](public/og-image.png) | Open Graph + Twitter card |
| [`public/hero-poster.png`](public/hero-poster.png) | Video poster fallback |

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies:

```bash
npm install
```

2. Copy env and set keys:

```bash
cp .env.example .env
```

| Variable | Required | Notes |
|----------|----------|--------|
| `JUPITER_API_KEY` | Recommended | From [portal.jup.ag](https://portal.jup.ag). Keyless works at very low RPS for prototypes. |
| `GEMINI_API_KEY` | Optional | Only for Builder AI features |
| `VITE_SOLANA_RPC_URL` | Optional | Mainnet RPC endpoint (defaults to `https://api.mainnet-beta.solana.com`) |
| `VITE_SOLANA_DEVNET_RPC_URL` | Optional | Devnet RPC endpoint (defaults to `https://api.devnet.solana.com`) |
| `VITE_BUILDER_PASSPORT_PROGRAM_ID` | Optional | Passport program ID. Set to `7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD` for devnet |

3. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Default view is **Swap**.

## Curated tokens

Edit [`src/data/curatedTokens.ts`](src/data/curatedTokens.ts) to add/remove allowlisted mints. The Express proxy rejects order/token requests outside this list.

Link Explore projects by setting `mint` on a project in [`src/data/projects.ts`](src/data/projects.ts).

## Apply / Builder Applications

The `/apply` page collects full builder application packets (problem, description, deck, demo, socials, etc.) and persists them server-side.

**API:**
- `POST /api/applications` — Submit a builder application (rate-limited to 10/hour)
- `GET /api/applications` — Admin endpoint to view all applications (requires `FEEDBACK_ADMIN_TOKEN`)

**Storage:** Applications are appended to `data/applications.jsonl` as JSON Lines (one application per line). Each entry includes:
- `id` — Unique application ID (e.g., `app_1234567890_abc123`)
- `createdAt` — ISO timestamp
- `ip` — Submitter IP (optionally hashed)
- `payload` — Full application data (name, ticker, problem, description, contactEmail, whyBuildersDex, etc.)

PM2 restarts and server reboots keep all submissions because they're written to disk.

## Scripts

- `npm run dev` — Express + Vite middleware
- `npm run build` — production client + server bundle
- `npm run start` — serve production build
- `npm run lint` — TypeScript check

## On-Chain Programs

The Builder Passport Solana program is located in [`programs/`](programs/). This Anchor program stores Builder Scores and Passport data on-chain.

📋 **Roadmap**: See [`docs/builder-passport-roadmap.md`](docs/builder-passport-roadmap.md) for the full Builder Passport vision, including Phase 1 (PDA mint + oracle), Phase 2 (more signals), Phase 3 (mainnet), and Phase 4 (Solana Attestation Service spike).

### Quick Start (Solana Programs)

**Prerequisites:** Rust 1.98+, Solana CLI 4.2+, Anchor CLI 0.31+

1. Build the program:
   ```bash
   cd programs
   anchor build
   ```

2. Run tests:
   ```bash
   anchor test
   ```

3. Deploy to devnet:
   ```bash
   ./scripts/deploy-devnet.sh
   ```

4. Update `.env` with the deployed program ID:
   ```bash
   VITE_BUILDER_PASSPORT_PROGRAM_ID=<YOUR_PROGRAM_ID>
   ```

See [`programs/README.md`](programs/README.md) for full documentation, deployment instructions, and mainnet deployment guide.

### Program Features

- **PDA-based storage**: Each wallet gets a deterministic passport account
- **Score tracking**: On-chain Builder Scores (0-10000 range)
- **Level system**: Automatic level calculation (Rookie → Genesis)
- **Admin-gated updates**: Secure score updates via authorized keys
- **Frontend integration**: React hooks and utilities provided

### Architecture

```
programs/
├── programs/builder_passport/    # Anchor program source
├── tests/                        # Integration tests
├── scripts/                      # Deployment scripts
└── target/                       # Build artifacts & IDL
```

Frontend integration files:
- `src/lib/builderPassport.ts` - Core utilities
- `src/hooks/useBuilderPassport.ts` - React hooks
- `src/providers/NetworkProvider.tsx` - Network mode context (Mainnet/Devnet)

**Program ID (Devnet)**: `7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD`

Set `VITE_BUILDER_PASSPORT_PROGRAM_ID=7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD` in your `.env` to enable on-chain passport minting on devnet.
