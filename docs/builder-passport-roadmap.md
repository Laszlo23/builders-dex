# Builder Passport Roadmap

**Status**: Phase 1 in progress (Devnet) | **Last Updated**: September 2026

---

## Vision

Builder Passport transforms on-chain reputation from passive NFT collections into **active proof of building**. Each passport is a Solana PDA (Program Derived Address) that accumulates points for real contributions — scout discoveries, application reviews, GitHub activity, and Terminal accuracy — creating portable, verifiable builder credentials.

The passport score isn't just a number; it's **Proof of Building** that unlocks opportunities: network access, launchpad priority, API quotas, and recognition in the builder economy.

---

## Phase 1: PDA Mint + Oracle Score (Current)

**Timeline**: Q3 2026 (Devnet) → Q4 2026 (Mainnet stabilization)

### What We're Building

- ✅ **On-chain Passport PDA**: Each wallet mints a deterministic passport account
  - Seeds: `["builder-passport", wallet_pubkey]`
  - Stores: `authority`, `score`, `level`, `last_updated`, `bump`
  - Levels: Rookie (0–99), Builder (100–249), Advanced (250–499), Expert (500–999), Genesis (1000+)

- ✅ **Config PDA**: Global oracle authority management
  - Seeds: `["config"]`
  - Stores: `authority`, `oracle`, `bump`
  - Allows secure score updates without requiring each passport owner to sign

- ✅ **Oracle-Powered Score Updates**:
  - **Scout Submissions**: +25 points per successful call (max +100/day per wallet)
  - **Application Approvals**: +100 points (once per application)
  - Server-side oracle holds keypair (`PASSPORT_ORACLE_SECRET_KEY`)
  - Enforces daily caps and deduplication

- ✅ **Devnet Network Toggle**: Users switch to Devnet mode to mint passports
- ✅ **Profile UI**: View on-chain score, level, last updated; link to Solana Explorer

### Score Policy (v1)

```typescript
// Scout submission (max 4/day = +100 total per day)
+25 points per scout call

// Application approved (once per application ID)
+100 points

// Score range: 0–10000 (clamped automatically)
// Levels recalculated on-chain by program
```

### What's Live

- **Devnet Program**: `7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD`
- **Endpoints**:
  - `POST /api/scout/submit` → triggers oracle bump
  - `POST /api/applications/:id/review` → triggers oracle bump on approval
  - `POST /api/applications` → submit project application
- **Frontend**: Network toggle, mint UI, score display

### Known Limitations

- **Devnet only** (mainnet launch after audit + multi-wallet testing)
- **In-memory daily caps** (will migrate to Redis/DB for distributed systems)
- **No retroactive score** (historical Scout calls and applications are not yet backfilled)
- **Oracle centralized** (single server keypair; Phase 2 explores multi-sig or governance)

---

## Phase 2: More Signals (Q1 2027)

### Expand Score Sources

**Goal**: Make passport score reflect the full spectrum of builder activity, not just submissions.

#### New Score Signals

1. **Earn Quest Completion**
   - Track progress through growth tasks (LP, swaps, profile setup)
   - Quest weights: onboarding quests (+10), advanced (+25), daily rituals (+5)
   - Synced from localStorage → server verification → oracle bump

2. **GitHub Proof of Building**
   - Integrate with Builder Score™ GitHub pipeline
   - Award points for repo commits, stars, contributors
   - Initially manual verification; later webhook automation
   - +50 for verified repo contribution, +100 for featured project maintainer

3. **Terminal Accuracy**
   - Track Builder Terminal predictions (pump vs. dump)
   - Reward correct calls; penalize repeated misses (soft cap, not negative score)
   - Formula: `accuracy = hits / (hits + misses)` over 30d rolling window
   - Bonus: +50 for 70%+ accuracy, +100 for 85%+

4. **Community Endorsements** (exploration spike)
   - Allow Genesis builders to endorse others (+10 to recipient, once per endorser)
   - Requires on-chain endorsement instruction (not in v1 program)

### Multi-Source Oracle

- Migrate from single server oracle to **multi-oracle aggregation**
  - Scout oracle (existing)
  - GitHub oracle (reads commits via verified GitHub App)
  - Terminal oracle (Telegram bot or dex backend)
- Each oracle writes to a shared `score_queue` → aggregator batches updates

---

## Phase 3: Mainnet Deploy (active checklist)

**Goal**: Launch Builder Passport on Solana mainnet after Devnet Config + oracle caps are proven.

### Pre-Mainnet Requirements

- [x] **Program source + IDL committed** (`programs/idl/builder_passport.json`)
- [x] **SQLite oracle caps** (scout daily + application dedupe)
- [x] **Tests rewritten** for Config + oracle model (`programs/tests/builder-passport.ts`)
- [x] **Healthy SBF deploy** on Devnet (Config PDA init + mint + oracle score verified 2026-09-15)
- [ ] **Security Review**: Third-party or internal review of passport program
- [ ] **Mainnet Oracle Keypair**: HSM / 1Password / multisig — not only laptop key
- [ ] **Mainnet RPC**: Paid tier (Helius, Triton, QuickNode)
- [ ] **Canary flag**: `VITE_PASSPORT_MAINNET_MINT=true` only after Config exists

### Mainnet Features

- **Token-Gated Access**: Genesis passports unlock premium features
  - Priority launchpad slots (Accelerator early access)
  - Builder API higher rate limits
  - Exclusive Builder Network channels
- **Public Leaderboard**: On-chain passport rankings (sortable by score, level, recent activity)
- **Passport Explorer**: Dedicated page to browse/search all passports
- **Badges & Achievements**: Milestone badges (e.g., "First 100 Scouts", "Genesis Founder")
- **AURA bind**: Base-canonical AURA + Solana wrap via Base↔Solana Bridge (`docs/onchain-inventory.md`)

### Migration Path

- Devnet passports **do not migrate** (addresses may collide, scores unverified)
- Users re-mint on mainnet (free if they hold devnet passport as proof of early participation)
- Offer "Pioneer" badge for devnet passport holders

---

## Phase 4 Spike: Solana Attestation Service (SAS)

**Motivation**: Builder Passport PDA is powerful for Builders DEX, but other platforms (wallets, DAOs, hiring platforms) need **portable, verifiable credentials** without parsing raw PDA data or trusting our oracle.

### What is SAS?

[Solana Attestation Service](https://attest.solana.com) is a Solana Foundation-backed standard for **verifiable credentials**. Think of it as "on-chain verified checkmarks" that any app can read and trust.

SAS allows issuers (like Builders DEX) to attest facts about accounts:
- "This wallet completed 50+ Scout calls" → `sas://scout-champion`
- "This wallet is Genesis level" → `sas://genesis-builder`
- "This wallet's GitHub verified" → `sas://github-verified`

### How SAS Complements Passport

| Feature | Builder Passport PDA | SAS Attestation |
|---------|---------------------|-----------------|
| **Owned by** | Wallet (self-sovereign) | Issuer (Builders DEX signs) |
| **Granularity** | Single score + level | Multiple attestations (badges) |
| **Updateable** | Yes (score increases) | Immutable (new attestation for updates) |
| **Portable** | PDA parsing required | Standard schema (wallets auto-display) |
| **Revocable** | No (account owned by user) | Yes (issuer can revoke) |

**Use Case**: A wallet shows "✓ Builders DEX Verified" badge via SAS, but the detailed score lives in the Passport PDA. The badge is social proof; the PDA is the underlying ledger.

### Phase 4 Scope (Spike)

This phase is **exploratory**. We won't build full SAS integration immediately, but we'll:

1. **Research SAS APIs**
   - Review SAS issuer SDK: https://github.com/solana-foundation/attestation-service
   - Understand attestation schemas (JSON-LD, schema.org)
   - Identify which Builder Passport milestones map to attestations

2. **Define Builder Attestation Schema**
   - Example attestations:
     - `BuildersScoutChampion`: 50+ scout calls
     - `BuildersGenesisLevel`: Passport score ≥1000
     - `BuildersGitHubVerified`: GitHub linked + verified repo
     - `BuildersApplicationApproved`: At least one approved project application

3. **Mock Attestation Issuance** (off-chain JSON)
   - Generate sample attestation JWTs locally
   - Test how Phantom/Backpack/Solflare display them (if supported)

4. **Document Decision**
   - Write `docs/sas-integration-plan.md` with:
     - Pros/cons of SAS vs. PDA-only
     - Cost analysis (SAS issuance fees vs. oracle txs)
     - User friction (do users want badges or just score?)
     - Recommendation: adopt, defer, or skip

### Not in Scope (Yet)

- ❌ **Full SAS integration** (no live issuer contract in this PR)
- ❌ **Attestation revocation** (requires issuer key management)
- ❌ **Multi-chain attestations** (SAS is Solana-only; cross-chain later)

### Decision Timeline

- **Q2 2027**: Spike complete, decision documented
- **Q3 2027**: If adopted, build SAS issuer service
- **Q4 2027**: Launch SAS attestations alongside mainnet

---

## Long-Term Vision (2028+)

- **Cross-Platform Portability**: Use passport score in other Solana dapps (lending, governance, airdrops)
- **Decentralized Oracle**: Replace centralized oracle with DAO-governed multi-sig or Chainlink-style network
- **Passport NFTs**: Optionally mint visual NFT representation of passport (Metaplex Core)
- **Interoperability**: Bridge Builder Passport data to Ethereum/Polygon via Wormhole or LayerZero
- **API Marketplace**: Let third-party apps query passport scores via Builder API (paid tier)

---

## FAQ

**Q: Why Devnet first?**  
A: Mainnet deployments are expensive and irreversible. Devnet lets us iterate on score policy, test oracle performance, and gather user feedback before committing to mainnet.

**Q: What if my Devnet passport gets wiped?**  
A: Devnet is a testnet — accounts can be pruned by validators. That's why we're not on mainnet yet. Your progress is also synced to the reputation ledger (SQLite) as a backup.

**Q: Can I see my score without minting?**  
A: Not yet on-chain, but the `/api/reputation/:wallet` endpoint shows your synced XP and completed quests. Minting makes it permanent and verifiable.

**Q: What if the oracle keypair leaks?**  
A: Phase 1 uses a single server key for speed. In mainnet, we'll use HSM or multi-sig. If compromised, we can rotate via `update_oracle` instruction (config authority only).

**Q: How does SAS differ from the Passport PDA?**  
A: The PDA is the **source of truth** for your score. SAS attestations are **portable badges** that other apps recognize without parsing PDA data. Think "verified checkmark" vs. "full profile."

**Q: Is this just an on-chain leaderboard?**  
A: No. Passports unlock real utility: launchpad priority, API quotas, network access. The score is a **building reputation**, not a vanity metric.

---

## Get Involved

- **Try it now**: Switch to Devnet mode and mint your passport at [dex.buildingcultureid.space](https://dex.buildingcultureid.space)
- **Scout for points**: Submit calls via [Scout page](https://dex.buildingcultureid.space/scout)
- **Apply to list a project**: [Apply here](https://dex.buildingcultureid.space/apply)
- **Questions**: [contact@buildingcultureid.space](mailto:contact@buildingcultureid.space)

---

**Program ID (Devnet)**: `7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD`  
**Explorer**: https://explorer.solana.com/address/7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD?cluster=devnet  
**GitHub**: https://github.com/Laszlo23/builders-dex

---

*Last Updated: September 14, 2026*
