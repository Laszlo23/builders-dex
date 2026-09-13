#!/bin/bash
set -e

echo "========================================="
echo " Builder Passport - Devnet Deployment"
echo "========================================="

# Ensure PATH includes Solana CLI
export PATH="/home/ubuntu/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

# Set Solana cluster to devnet
solana config set --url https://api.devnet.solana.com

# Check balance
BALANCE=$(solana balance 2>/dev/null || echo "0")
echo "Current balance: $BALANCE"

if [ "$BALANCE" == "0" ] || [ "$BALANCE" == "0 SOL" ]; then
    echo "Requesting airdrop..."
    solana airdrop 2 || echo "Airdrop may have failed or rate-limited - please fund your wallet manually"
    sleep 2
fi

# Build the program
echo "Building program..."
cd "$(dirname "$0")/.."
anchor build

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/builder_passport-keypair.json)
echo "Program ID: $PROGRAM_ID"

# Deploy to devnet
echo "Deploying to devnet..."
anchor deploy --provider.cluster devnet

echo ""
echo "========================================="
echo " Deployment Complete!"
echo "========================================="
echo "Program ID: $PROGRAM_ID"
echo "Network: Devnet"
echo "Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
echo "Save this Program ID in your .env file:"
echo "VITE_BUILDER_PASSPORT_PROGRAM_ID=$PROGRAM_ID"
echo "========================================="
