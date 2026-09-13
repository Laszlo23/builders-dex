#!/bin/bash
set -e

echo "========================================="
echo " Builder Passport - Program Verification"
echo "========================================="

# Ensure PATH includes Solana CLI
export PATH="/home/ubuntu/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

PROGRAM_ID="${1:-$(solana address -k target/deploy/builder_passport-keypair.json)}"
CLUSTER="${2:-devnet}"

echo "Verifying program: $PROGRAM_ID"
echo "Cluster: $CLUSTER"
echo ""

# Set cluster
if [ "$CLUSTER" == "mainnet" ]; then
    CLUSTER_URL="https://api.mainnet-beta.solana.com"
    EXPLORER_URL="https://explorer.solana.com/address/$PROGRAM_ID"
else
    CLUSTER_URL="https://api.devnet.solana.com"
    EXPLORER_URL="https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
fi

solana config set --url $CLUSTER_URL

# Check if program exists
echo "Checking program account..."
solana account $PROGRAM_ID || {
    echo "❌ Program not found on $CLUSTER"
    exit 1
}

echo ""
echo "✅ Program verified on $CLUSTER"
echo "Explorer: $EXPLORER_URL"
echo ""
echo "Program is deployed and ready to use!"
echo "========================================="
