#!/bin/bash
set -e
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

echo "========================================="
echo " Builder Passport - MAINNET Deployment"
echo " ⚠️  Requires CONFIRM_MAINNET=yes"
echo "========================================="

if [ "$CONFIRM_MAINNET" != "yes" ]; then
  echo "Refusing: set CONFIRM_MAINNET=yes after audit + funded wallet"
  exit 1
fi

read -p "Type MAINNET to continue: " CONFIRM
if [ "$CONFIRM" != "MAINNET" ]; then
  echo "Cancelled."
  exit 1
fi

solana config set --url "${SOLANA_RPC_URL:-https://api.mainnet-beta.solana.com}"
BALANCE=$(solana balance 2>/dev/null || echo "0")
echo "Balance: $BALANCE"

cd "$(dirname "$0")/.."
(
  cd programs/builder_passport
  cargo-build-sbf --arch v1
)

PROGRAM_ID=$(solana address -k target/deploy/builder_passport-keypair.json)
echo "Program ID: $PROGRAM_ID"

solana program deploy target/deploy/builder_passport.so \
  --program-id target/deploy/builder_passport-keypair.json \
  --url "${SOLANA_RPC_URL:-https://api.mainnet-beta.solana.com}"

cp -f target/idl/builder_passport.json idl/builder_passport.json 2>/dev/null || true

echo ""
echo "Next:"
echo "  CONFIRM_MAINNET=yes ORACLE_PUBKEY=... npx tsx programs/scripts/initialize-config.ts --cluster mainnet-beta"
echo "  Then set VITE_PASSPORT_MAINNET_MINT=true + PASSPORT_ORACLE_SECRET_KEY on VPS"
echo "========================================="
