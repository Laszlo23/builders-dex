# 🚀 Deploy Builder Passport Oracle to Devnet NOW

## Quick Deploy (One Command)

### On Your Mac or mining-vps:

```bash
# Clone/pull latest
git pull origin cursor/builder-passport-oracle-roadmap-927e

# Run deployment
./DEPLOY-NOW.sh
```

That's it! The script will:
1. ✅ Check prerequisites (Solana CLI, Anchor CLI, Node.js)
2. ✅ Build the program
3. ✅ Upgrade program at `7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD` (or deploy new)
4. ✅ Generate oracle keypair
5. ✅ Initialize Config PDA
6. ✅ Show environment variables to export

---

## Prerequisites (Install Once)

### 1. Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version  # Should show v4.2+
```

### 2. Anchor CLI
```bash
# Install Rust first if needed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
anchor --version  # Should show v0.31+
```

### 3. Node.js
```bash
# Should already be installed (v20+)
node --version
npm --version
```

### 4. Solana Keypair
```bash
# Generate if you don't have one
solana-keygen new

# Or set path to existing
solana config set --keypair ~/.config/solana/id.json

# Fund with devnet SOL
solana airdrop 2 --url devnet
```

---

## Manual Deployment (If Script Fails)

### Step 1: Build & Deploy
```bash
cd programs
anchor build

# Try upgrade first
anchor upgrade target/deploy/builder_passport.so \
  --program-id 7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD \
  --provider.cluster devnet

# If upgrade fails, deploy new
anchor deploy --provider.cluster devnet
# Note the new program ID
```

### Step 2: Generate Oracle Keypair
```bash
cd programs
solana-keygen new --outfile oracle-keypair.json
ORACLE_PUBKEY=$(solana-keygen pubkey oracle-keypair.json)
echo $ORACLE_PUBKEY
```

### Step 3: Initialize Config PDA
```bash
cd programs
npm install  # If not done yet
npx ts-node scripts/initialize-config.ts --oracle $ORACLE_PUBKEY --cluster devnet
```

### Step 4: Configure Server
```bash
export PASSPORT_ORACLE_SECRET_KEY="$(cat programs/oracle-keypair.json)"
export BUILDER_PASSPORT_PROGRAM_ID="7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD"
export APPLICATIONS_ADMIN_TOKEN="$(openssl rand -hex 32)"
export SOLANA_DEVNET_RPC_URL="https://api.devnet.solana.com"
```

### Step 5: Start Server
```bash
npm run dev
```

Look for:
```
[passport-oracle] Configured with oracle: <PUBKEY>
```

---

## Testing

### Test Scout Bump (+25)
1. Open https://dex.buildingcultureid.space
2. Switch to Devnet mode (navbar toggle)
3. Connect wallet
4. Mint Builder Passport (Profile page)
5. Submit a Scout call (/scout)
6. Check server logs:
   ```
   [passport-oracle] Score updated to 25 for <WALLET>: <TX>
   ```

### Test Application Bump (+100)
```bash
# Submit application via UI first

# Then approve as admin
curl -X POST http://localhost:3000/api/applications/:id/review \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $APPLICATIONS_ADMIN_TOKEN" \
  -d '{"status": "approved"}'

# Check response for oracleBump.signature
# Check logs for +100 bump
```

---

## Troubleshooting

### "anchor: command not found"
```bash
# Add Cargo bin to PATH
export PATH="$HOME/.cargo/bin:$PATH"
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
```

### "solana: command not found"
```bash
# Add Solana to PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
```

### "Insufficient funds"
```bash
solana airdrop 2 --url devnet
```

### "Config PDA already initialized"
This is fine! It means config was already set up. Skip to Step 4 (configure server).

### "Program upgrade failed"
Deploy as new program:
```bash
anchor deploy --provider.cluster devnet
NEW_ID=$(solana-keygen pubkey target/deploy/builder_passport-keypair.json)
echo "New Program ID: $NEW_ID"
# Update .env with new ID
```

---

## Where to Run

### Option 1: Mac (Recommended for First Deploy)
- Install prerequisites
- Run `./DEPLOY-NOW.sh`
- Test locally

### Option 2: mining-vps
- SSH into mining-vps
- Install prerequisites
- Run `./DEPLOY-NOW.sh`
- Server already running there

### Option 3: Cloud Agent (Not Supported)
- Cloud Agent VMs don't have Solana/Anchor CLI
- Must run on local machine or VPS

---

## After Deployment

### Update Production Server
```bash
# SSH to production server
ssh mining-vps

# Pull latest code
cd /path/to/builders-dex
git pull origin cursor/builder-passport-oracle-roadmap-927e

# Set environment variables
export PASSPORT_ORACLE_SECRET_KEY="$(cat programs/oracle-keypair.json)"
export BUILDER_PASSPORT_PROGRAM_ID="7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD"
export APPLICATIONS_ADMIN_TOKEN="your-secure-token"

# Restart server
pm2 restart builders-dex
# OR
systemctl restart builders-dex

# Check logs
pm2 logs builders-dex
# Look for: [passport-oracle] Configured with oracle: <PUBKEY>
```

### Announce
Post in Discord/Telegram:
```
🚀 Builder Passport oracle is now LIVE on devnet!

✨ What's new:
- Scout submissions now add +25 points to your on-chain Passport
- Application approvals add +100 points
- Scores are now verifiable Proof of Building

📍 Try it:
1. Switch to Devnet mode (navbar toggle)
2. Mint your Builder Passport on Profile page
3. Submit a Scout call
4. Watch your score grow on-chain!

🔗 Explorer: https://explorer.solana.com/address/7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD?cluster=devnet
```

---

## Support

- **Script issues**: Check DEPLOYMENT.md for manual steps
- **Program errors**: See programs/target/deploy/*.log
- **Server issues**: Check server logs for `[passport-oracle]` entries

---

**Ready to ship!** Run `./DEPLOY-NOW.sh` now 🚀
