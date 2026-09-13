# Builders DEX — The Quality Layer of Solana

Where the best Solana builders get discovered.

Not another DEX — a curated discovery and trading protocol with **Builder Score™**, **Builder Passport™**, and **Builders Intelligence™**. Approved assets trade via Jupiter Swap API V2.

## Features

- Discovery-first Home, Explore, Rankings, Passport, Apply
- Builder Score™ (7 dimensions) on every curated project
- **On-chain Builder Passport** — Solana program anchoring Builder Score™ on-chain
- Apply for Listing → pending review (not instantly tradeable)
- Builder Passport™ levels: Rookie → Genesis
- Builders Intelligence™ research assistant (Gemini)
- Real Solana wallet + Jupiter swaps for allowlisted mints only
- Brand assets, OG image, SEO meta / sitemap / robots

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
| `VITE_SOLANA_RPC_URL` | Optional | Defaults to public mainnet RPC |

3. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Default view is **Swap**.

## Curated tokens

Edit [`src/data/curatedTokens.ts`](src/data/curatedTokens.ts) to add/remove allowlisted mints. The Express proxy rejects order/token requests outside this list.

Link Explore projects by setting `mint` on a project in [`src/data/projects.ts`](src/data/projects.ts).

## Scripts

- `npm run dev` — Express + Vite middleware
- `npm run build` — production client + server bundle
- `npm run start` — serve production build
- `npm run lint` — TypeScript check

## On-Chain Programs

The Builder Passport Solana program is located in [`programs/`](programs/). This Anchor program stores Builder Scores and Passport data on-chain.

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

**Program ID**: `HM1CaGZRzdNC7pJxtj2jNwuxhYDbMQGt3xGAJk9iKakD` (update after deploying)
