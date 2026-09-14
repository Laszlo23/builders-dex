# Builder Passport Oracle Deployment Guide

This guide walks through deploying the Builder Passport oracle to Solana devnet.

## Prerequisites

### Required Tools

1. **Solana CLI** (v4.2+)
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   solana --version
   ```

2. **Anchor CLI** (v0.31+)
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
   anchor --version
   ```

3. **Node.js** (v20+) and npm
   ```bash
   node --version
   npm --version
   ```

### Funded Wallet

You need a Solana keypair with devnet SOL:

```bash
# Generate new keypair (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Get your address
solana address

# Airdrop devnet SOL
solana airdrop 2 --url devnet

# Check balance
solana balance --url devnet
```

---

## Deployment Steps

### 1. Build and Deploy Program

From the repository root:

```bash
cd programs
./scripts/deploy-devnet.sh
```

This script will:
- Build the updated program with Config PDA support
- **Upgrade** existing program at `7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD` (if possible)
- **OR deploy** a new program (if upgrade fails or program doesn't exist)

**If a new program is deployed:**
- Note the new program ID
- Update `.env`: `VITE_BUILDER_PASSPORT_PROGRAM_ID="<NEW_ID>"`
- Update `Anchor.toml`: `builder_passport = "<NEW_ID>"`
- Update `programs/programs/builder_passport/src/lib.rs`: `declare_id!("<NEW_ID>");`
- Rebuild: `anchor build`

### 2. Generate Oracle Keypair

Create a dedicated keypair for the oracle:

```bash
cd programs
solana-keygen new --outfile oracle-keypair.json

# Get the oracle public key (you'll need this)
ORACLE_PUBKEY=$(solana-keygen pubkey oracle-keypair.json)
echo "Oracle Pubkey: $ORACLE_PUBKEY"
```

**⚠️ Security**: This keypair controls all passport score updates. Keep `oracle-keypair.json` secret.

### 3. Initialize Config PDA

Initialize the on-chain Config PDA with your oracle pubkey:

```bash
cd programs
npx ts-node scripts/initialize-config.ts --oracle $ORACLE_PUBKEY --cluster devnet
```

Expected output:
```
🔧 Initializing Builder Passport Config PDA...
   Oracle: <ORACLE_PUBKEY>
   Deployer: <YOUR_WALLET>
   Config PDA: <CONFIG_PDA>
   Balance: X.XXXX SOL

📤 Sending initialize_config transaction...
✅ Config initialized!
   Tx: <TX_SIGNATURE>
   Explorer: https://explorer.solana.com/tx/<TX>?cluster=devnet

🔑 Oracle pubkey stored: <ORACLE_PUBKEY>
```

**Troubleshooting**:
- `Config PDA already initialized`: The config exists. Use `update_oracle` instruction to change the oracle.
- `Insufficient balance`: Airdrop more SOL: `solana airdrop 1 --url devnet`
- `Transaction failed`: Check program logs in the output.

### 4. Configure Server Environment

Set the oracle keypair and config in your server environment:

```bash
# Option 1: Base58 private key (recommended for production)
export PASSPORT_ORACLE_SECRET_KEY="<BASE58_PRIVATE_KEY>"

# Option 2: JSON byte array (easier for local dev)
export PASSPORT_ORACLE_SECRET_KEY="$(cat programs/oracle-keypair.json)"

# Set program ID (if you deployed a new program, use the new ID)
export BUILDER_PASSPORT_PROGRAM_ID="7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD"

# Set admin token for application reviews
export APPLICATIONS_ADMIN_TOKEN="$(openssl rand -hex 32)"

# Devnet RPC (use a paid RPC for production)
export SOLANA_DEVNET_RPC_URL="https://api.devnet.solana.com"
```

**For production**: Use environment secrets (Cursor Cloud Secrets, AWS Secrets Manager, etc.) instead of exporting directly.

### 5. Start Server

```bash
npm run dev
```

Check logs for oracle readiness:
```
[passport-oracle] Configured with oracle: <ORACLE_PUBKEY>
```

If you see `[passport-oracle] Not configured`, check your `PASSPORT_ORACLE_SECRET_KEY` environment variable.

---

## Testing

### Test Scout Oracle Bump (+25)

1. **Switch to Devnet mode** in the UI (navbar toggle)
2. **Mint a Builder Passport** (if not already minted)
3. **Submit a Scout call** via `/scout` page
4. **Check server logs**:
   ```
   [passport-oracle] Score updated to 25 for <WALLET>: <TX_SIGNATURE>
   ```
5. **Verify on-chain**:
   - Open Passport in UI → see score increased
   - Or check Solana Explorer: `https://explorer.solana.com/address/<PASSPORT_PDA>?cluster=devnet`

### Test Application Review Oracle Bump (+100)

1. **Submit an application** via `/apply` page (include wallet address)
2. **Review application** (admin only):
   ```bash
   curl -X POST http://localhost:3000/api/applications/:id/review \
     -H "Content-Type: application/json" \
     -H "x-admin-token: $APPLICATIONS_ADMIN_TOKEN" \
     -d '{"status": "approved", "reviewNotes": "Great project!"}'
   ```
3. **Check response**:
   ```json
   {
     "ok": true,
     "application": { ... },
     "oracleBump": {
       "signature": "<TX_SIGNATURE>",
       "points": 100
     }
   }
   ```
4. **Verify on-chain**: Passport score should increase by +100

### Test Daily Cap

Submit 5 Scout calls in quick succession. The 5th should fail with:
```
[passport-oracle] Scout bump skipped for <WALLET> — daily cap reached
```

---

## Monitoring

### Check Oracle Transactions

```bash
# Get Config PDA address
solana address --url devnet --keypair <(echo '[...]' | jq -c '.') # Config PDA seeds: ["config"]

# Check recent transactions
solana transaction-history <CONFIG_PDA> --url devnet
```

### Check Server Logs

```bash
# Scout bumps
grep "\[passport-oracle\] Score updated" server.log

# Application bumps
grep "\[passport-oracle\] Application .* approved" server.log

# Errors
grep "\[passport-oracle\].*failed" server.log
```

---

## Troubleshooting

### "Oracle not configured"

**Symptom**: Server logs show `[passport-oracle] Not configured`.

**Fix**: Set `PASSPORT_ORACLE_SECRET_KEY` environment variable.

```bash
export PASSPORT_ORACLE_SECRET_KEY="$(cat programs/oracle-keypair.json)"
```

### "Unauthorized: Only oracle can update scores"

**Symptom**: Transaction fails with `UnauthorizedUpdate` error.

**Cause**: The oracle keypair doesn't match the oracle pubkey stored in Config PDA.

**Fix**:
1. Check which oracle is registered:
   ```bash
   # Fetch Config PDA account data and parse
   solana account <CONFIG_PDA> --url devnet --output json
   ```
2. Either:
   - Use the correct oracle keypair, OR
   - Call `update_oracle` to change the registered oracle (requires config authority)

### "Passport not initialized"

**Symptom**: Oracle bump fails with "Passport not initialized for this wallet".

**Cause**: User hasn't minted their passport yet.

**Fix**: User must:
1. Switch to Devnet mode
2. Navigate to Profile page
3. Click "Mint Builder Passport"

### Program Upgrade Failed

**Symptom**: `anchor upgrade` fails with "insufficient account size" or "immutable program".

**Options**:
1. **Redeploy** with a new program ID (breaks existing passports)
2. **Keep old program** and deploy oracle-compatible version under new ID
3. **Create migration path** (advanced): batch-copy old passports to new program

For devnet, redeploy is fine (test data). For mainnet, migration is required.

---

## Mainnet Deployment (Phase 3)

**DO NOT deploy to mainnet yet.** Phase 3 requirements:

- [ ] Third-party security audit (Kudelski, OtterSec, Neodyme)
- [ ] HSM or multi-sig for oracle keypair
- [ ] Redis/PostgreSQL for distributed daily caps
- [ ] Paid Solana RPC (Helius, QuickNode, Triton)
- [ ] Monitoring + alerting (Datadog, Sentry)
- [ ] Retroactive score backfill script
- [ ] Mainnet SOL for deployments + transaction fees
- [ ] User communication + migration plan

Devnet is for testing only. Mainnet is gated by security review.

---

## Rollback Plan

If oracle causes issues:

1. **Stop server** (prevents new oracle bumps)
2. **Investigate** (check logs, on-chain state)
3. **Fix** (update code, rotate oracle, etc.)
4. **Redeploy** (if needed)
5. **Resume**

For critical issues:
- Close Config PDA (requires config authority)
- Deploy new program version without oracle
- Migrate passports manually

---

## Support

- **Issues**: https://github.com/Laszlo23/builders-dex/issues
- **Email**: contact@buildingcultureid.space
- **Documentation**: `docs/builder-passport-roadmap.md`

---

**Last Updated**: September 14, 2026
