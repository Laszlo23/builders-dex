# Mainnet readiness — test report

**Date:** 2026-09-15  
**Program:** `7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD`  
**Upgrade authority (devnet):** `6XitbmLNPGzsvGo6aNTbMG3uvwqdbmssy8g4zhbJrUTr`

## Automated results (this run)

| Suite | Result |
|-------|--------|
| Local Anchor mocha (10 tests) | **PASS** — config, mint, levels Rookie→Genesis, unauthorized reject, close/reinit, oracle rotate |
| Devnet E2E (`programs/scripts/e2e-devnet.ts`) | **PASS** — 8/8 including 3 real wallets mint+score, unauthorized reject, close/reinit |
| Daily share XP cap (5×40=200) | **PASS** |
| Curated mint allowlist (SOL on / fake off) | **PASS** |
| Live site HTTP 200 | **PASS** |
| Live `/api/cross-chain/registry` | **PASS** |
| Live `/api/daily-radar` | **PASS** |
| Mainnet program account | **Absent** (expected — not deployed yet) |

### Devnet sample txs (this run)

- Wallet 1 score 100 — mint `iYR1FdUmUrUs…` / score `nPbKKiFhZ3oJ…`
- Wallet 2 score 150 — mint `3MQRoB7JpNjZ…` / score `81gQySBj1WnN…`
- Wallet 3 score 200 — mint `22Joeb1hBfBS…` / score `4wqLHEzfwHno…`

Config PDA `hQzS6P…58eT` oracle matches local `programs/.keys/oracle-keypair.json` (`6uVub24…`).

---

## Go / No-Go for mainnet Passport deploy

### Ready (technical)

- [x] Program logic verified local + Devnet
- [x] Config PDA model + oracle auth works
- [x] Deploy scripts use `cargo-build-sbf --arch v1`
- [x] Mainnet mint UI gated by `VITE_PASSPORT_MAINNET_MINT`
- [x] IDL committed under `programs/idl/`

### Where to send SOL (mainnet)

Send **3–5 SOL** (mainnet-beta) to the deploy / upgrade authority:

```
6XitbmLNPGzsvGo6aNTbMG3uvwqdbmssy8g4zhbJrUTr
```

That is the same pubkey as `~/.config/solana/id.json` (CLI wallet) and the Devnet program upgrade authority.  
**Do not** send to the Program ID (`7MWC…`) or the Oracle (`6uVub…`) for deploy rent.

Current mainnet balance of that address: **0 SOL** (checked 2026-09-15).

2. **Paid RPC** — set `SOLANA_RPC_URL` / `VITE_SOLANA_RPC_URL` (Helius etc.); public RPC 429’d during Devnet E2E.
3. **Oracle secret on VPS** — `PASSPORT_ORACLE_SECRET_KEY` from `programs/.keys/oracle.secret.base58.txt` (never commit).
4. **Security review** — recommend at least internal review / second pair of eyes before public mint; upgrade authority → multisig when practical.
5. **Confirm Aura OS Base address** — before enabling `TRADEABLE_AURA` (unrelated to Passport deploy, but product gate).

### Recommended mainnet sequence

```bash
# 1) Fund + paid RPC
export SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=..."
export CONFIRM_MAINNET=yes
bash programs/scripts/deploy-mainnet.sh

# 2) Init config (same oracle pubkey as Devnet or a fresh production oracle)
CONFIRM_MAINNET=yes ORACLE_PUBKEY=6uVub24LhGxGUGmKFqeKqeKTToCT8SgJQiSvBzMJQ2S7 \
  npx tsx programs/scripts/initialize-config.ts --cluster mainnet-beta

# 3) Re-run a slim mainnet canary (1 wallet mint + score) — write e2e-mainnet when funded
# 4) VPS: PASSPORT_ORACLE_SECRET_KEY + VITE_PASSPORT_MAINNET_MINT=true + rebuild
# 5) Internal wallets only for 24–48h, then announce
```

### Verdict

**Passport program: GO for mainnet deploy** once blockers 1–3 are satisfied.  
**Public mint / marketing: HOLD** until canary (internal wallets) + optional review (blocker 4).

Re-run Devnet suite anytime:

```bash
cd programs && npx tsx scripts/e2e-devnet.ts
```
