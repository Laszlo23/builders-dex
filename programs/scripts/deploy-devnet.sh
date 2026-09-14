#!/bin/bash
set -e

# Builder Passport Devnet Deployment Script
# Upgrades existing program or deploys new one

PROGRAM_ID="7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD"
CLUSTER="devnet"

echo "🚀 Builder Passport Devnet Deployment"
echo "   Program ID: $PROGRAM_ID"
echo "   Cluster: $CLUSTER"
echo ""

# Check prerequisites
command -v anchor >/dev/null 2>&1 || { echo "❌ anchor not found. Install: cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked"; exit 1; }
command -v solana >/dev/null 2>&1 || { echo "❌ solana not found. Install: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""; exit 1; }

# Check Solana config
KEYPAIR=$(solana config get keypair | grep "Keypair Path:" | awk '{print $3}')
RPC=$(solana config get rpc | grep "RPC URL:" | awk '{print $3}')
echo "📂 Using keypair: $KEYPAIR"
echo "🌐 RPC URL: $RPC"

# Check balance
BALANCE=$(solana balance --url $CLUSTER | awk '{print $1}')
echo "💰 Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 1" | bc -l) )); then
    echo "⚠️  Low balance. Airdropping 2 SOL..."
    solana airdrop 2 --url $CLUSTER
    sleep 2
fi

# Build program
echo ""
echo "🔨 Building program..."
cd "$(dirname "$0")/.."
anchor build

# Check if program is upgradeable
echo ""
echo "🔍 Checking if program exists..."
PROGRAM_EXISTS=$(solana program show $PROGRAM_ID --url $CLUSTER 2>&1 | grep -c "Program Id: $PROGRAM_ID" || echo "0")

if [ "$PROGRAM_EXISTS" -gt 0 ]; then
    echo "✅ Program exists at $PROGRAM_ID"
    echo "🔄 Upgrading program..."
    anchor upgrade target/deploy/builder_passport.so \
        --program-id $PROGRAM_ID \
        --provider.cluster $CLUSTER
    
    echo "✅ Program upgraded successfully!"
    echo "   Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=$CLUSTER"
else
    echo "⚠️  Program not found. Deploying new program..."
    echo "   NOTE: This will generate a NEW program ID."
    echo "   Update VITE_BUILDER_PASSPORT_PROGRAM_ID in .env after deployment."
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
    
    anchor deploy --provider.cluster $CLUSTER
    
    # Extract new program ID
    NEW_PROGRAM_ID=$(solana-keygen pubkey target/deploy/builder_passport-keypair.json)
    echo ""
    echo "✅ Program deployed!"
    echo "   New Program ID: $NEW_PROGRAM_ID"
    echo "   Explorer: https://explorer.solana.com/address/$NEW_PROGRAM_ID?cluster=$CLUSTER"
    echo ""
    echo "⚠️  ACTION REQUIRED:"
    echo "   1. Update .env: VITE_BUILDER_PASSPORT_PROGRAM_ID=\"$NEW_PROGRAM_ID\""
    echo "   2. Update Anchor.toml: builder_passport = \"$NEW_PROGRAM_ID\""
    echo "   3. Update src/lib.rs: declare_id!(\"$NEW_PROGRAM_ID\");"
    echo "   4. Rebuild: anchor build"
    PROGRAM_ID=$NEW_PROGRAM_ID
fi

echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Generate oracle keypair:"
echo "   solana-keygen new --outfile oracle-keypair.json"
echo ""
echo "2. Get oracle pubkey:"
echo "   ORACLE_PUBKEY=\$(solana-keygen pubkey oracle-keypair.json)"
echo "   echo \$ORACLE_PUBKEY"
echo ""
echo "3. Initialize Config PDA:"
echo "   cd programs"
echo "   npx ts-node scripts/initialize-config.ts --oracle \$ORACLE_PUBKEY --cluster $CLUSTER"
echo ""
echo "4. Set server environment:"
echo "   export PASSPORT_ORACLE_SECRET_KEY=\"\$(cat oracle-keypair.json)\""
echo "   export BUILDER_PASSPORT_PROGRAM_ID=\"$PROGRAM_ID\""
echo "   export APPLICATIONS_ADMIN_TOKEN=\"your-secure-random-token\""
echo ""
echo "5. Test oracle:"
echo "   npm run dev"
echo "   # Submit a Scout call or approve an application"
echo "   # Check logs for '[passport-oracle] Score updated to X'"
echo ""
echo "✅ Deployment complete!"
