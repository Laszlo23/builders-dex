#!/bin/bash
set -e
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

echo "========================================="
echo " Builder Passport - Devnet Deployment"
echo "========================================="

solana config set --url https://api.devnet.solana.com

BALANCE=$(solana balance 2>/dev/null || echo "0")
echo "Current balance: $BALANCE"

cd "$(dirname "$0")/.."

echo "Building SBF (explicit arch for cluster compatibility)..."
# platform-tools may default to an SBPF version some validators reject;
# v1 has been verified against current Devnet + local --clone-feature-set.
(
  cd programs/builder_passport
  cargo-build-sbf --arch v1
)

PROGRAM_ID=$(solana address -k target/deploy/builder_passport-keypair.json)
echo "Program ID: $PROGRAM_ID"

echo "Deploying to devnet..."
solana program deploy target/deploy/builder_passport.so \
  --program-id target/deploy/builder_passport-keypair.json \
  --url https://api.devnet.solana.com

echo ""
echo "Sync committed IDL..."
cp -f target/idl/builder_passport.json idl/builder_passport.json 2>/dev/null || true

echo ""
echo "Next: initialize Config PDA"
echo "  ORACLE_PUBKEY=<pubkey> npx tsx programs/scripts/initialize-config.ts --cluster devnet"
echo "Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo "========================================="
