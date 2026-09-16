#!/bin/bash
set -e
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

echo "========================================="
echo " builder_raise — Devnet deploy"
echo "========================================="

solana config set --url "${SOLANA_DEVNET_RPC_URL:-https://api.devnet.solana.com}"
cd "$(dirname "$0")/.."
(
  cd programs/builder_raise
  cargo-build-sbf --arch v1
)

solana program deploy target/deploy/builder_raise.so \
  --program-id target/deploy/builder_raise-keypair.json \
  --url "${SOLANA_DEVNET_RPC_URL:-https://api.devnet.solana.com}"

cp -f target/idl/builder_raise.json idl/builder_raise.json 2>/dev/null || true

echo "Next:"
echo "  ORACLE_PUBKEY=... npx tsx programs/scripts/initialize-raise-config.ts"
echo "  Keep VITE_RAISE_MAINNET_MINT=false until canary"
echo "========================================="
