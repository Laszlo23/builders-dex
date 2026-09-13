#!/bin/bash
set -e

echo "========================================="
echo " Builder Passport - Mainnet Deployment"
echo " ⚠️  WARNING: This deploys to MAINNET! ⚠️"
echo "========================================="

# Ensure PATH includes Solana CLI
export PATH="/home/ubuntu/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

# Confirmation prompt
read -p "Are you sure you want to deploy to MAINNET? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Deployment cancelled."
    exit 1
fi

# Set Solana cluster to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Check balance
BALANCE=$(solana balance 2>/dev/null || echo "0")
echo "Current balance: $BALANCE"

if [ "$BALANCE" == "0" ] || [ "$BALANCE" == "0 SOL" ]; then
    echo "ERROR: Insufficient balance. Please fund your wallet with SOL."
    echo "Deployment requires approximately 2-5 SOL for program deployment."
    exit 1
fi

# Build the program
echo "Building program..."
cd "$(dirname "$0")/.."
anchor build

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/builder_passport-keypair.json)
echo "Program ID: $PROGRAM_ID"

# Final confirmation
read -p "Deploy program $PROGRAM_ID to MAINNET? (yes/no): " FINAL_CONFIRM
if [ "$FINAL_CONFIRM" != "yes" ]; then
    echo "Deployment cancelled."
    exit 1
fi

# Deploy to mainnet
echo "Deploying to mainnet..."
anchor deploy --provider.cluster mainnet

echo ""
echo "========================================="
echo " Deployment Complete!"
echo "========================================="
echo "Program ID: $PROGRAM_ID"
echo "Network: Mainnet-Beta"
echo "Explorer: https://explorer.solana.com/address/$PROGRAM_ID"
echo ""
echo "Update your .env file:"
echo "VITE_BUILDER_PASSPORT_PROGRAM_ID=$PROGRAM_ID"
echo "========================================="
