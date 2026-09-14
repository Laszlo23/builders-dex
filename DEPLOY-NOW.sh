#!/bin/bash
# Builder Passport Oracle - One-Command Deployment to Devnet
# Run this on a machine with Solana + Anchor CLI installed

set -e

echo "🚀 Builder Passport Oracle Deployment to Devnet"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROGRAM_ID="7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD"
CLUSTER="devnet"
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
ORACLE_KEYPAIR="$REPO_ROOT/programs/oracle-keypair.json"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found${NC}"
    echo "Install: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found${NC}"
    echo "Install: cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Solana CLI: $(solana --version | head -1)${NC}"
echo -e "${GREEN}✓ Anchor CLI: $(anchor --version)${NC}"
echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
echo ""

# Check Solana config
echo "📂 Checking Solana configuration..."
KEYPAIR=$(solana config get keypair | grep "Keypair Path:" | awk '{print $3}')
RPC=$(solana config get | grep "RPC URL:" | awk '{print $3}')

if [ ! -f "$KEYPAIR" ]; then
    echo -e "${RED}❌ Keypair not found at $KEYPAIR${NC}"
    echo "Generate one: solana-keygen new"
    exit 1
fi

echo -e "${GREEN}✓ Deployer keypair: $KEYPAIR${NC}"
echo -e "${GREEN}✓ RPC URL: $RPC${NC}"
echo ""

# Check/get devnet balance
echo "💰 Checking devnet balance..."
BALANCE=$(solana balance --url $CLUSTER 2>/dev/null | awk '{print $1}')

if [ -z "$BALANCE" ]; then
    echo -e "${YELLOW}⚠️  Could not fetch balance. Continuing anyway...${NC}"
else
    echo -e "${GREEN}✓ Balance: $BALANCE SOL${NC}"
    
    if (( $(echo "$BALANCE < 1" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${YELLOW}⚠️  Low balance. Airdropping 2 SOL...${NC}"
        solana airdrop 2 --url $CLUSTER || {
            echo -e "${YELLOW}⚠️  Airdrop failed (rate limited?). Continuing with current balance...${NC}"
        }
        sleep 2
    fi
fi
echo ""

# Step 1: Build program
echo "🔨 Step 1/5: Building program..."
cd "$REPO_ROOT/programs"

if [ ! -f "Cargo.toml" ]; then
    echo -e "${RED}❌ Not in Anchor workspace (no Cargo.toml)${NC}"
    exit 1
fi

anchor build
echo -e "${GREEN}✓ Program built${NC}"
echo ""

# Step 2: Deploy/upgrade program
echo "🚀 Step 2/5: Deploying program..."

# Check if program exists
PROGRAM_EXISTS=$(solana program show $PROGRAM_ID --url $CLUSTER 2>&1 | grep -c "Program Id: $PROGRAM_ID" || echo "0")

if [ "$PROGRAM_EXISTS" -gt 0 ]; then
    echo -e "${BLUE}📦 Program exists. Upgrading...${NC}"
    anchor upgrade target/deploy/builder_passport.so \
        --program-id $PROGRAM_ID \
        --provider.cluster $CLUSTER
    
    echo -e "${GREEN}✓ Program upgraded at $PROGRAM_ID${NC}"
else
    echo -e "${YELLOW}⚠️  Program not found. Deploying new...${NC}"
    echo -e "${YELLOW}   This will create a NEW program ID.${NC}"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
    
    anchor deploy --provider.cluster $CLUSTER
    
    NEW_PROGRAM_ID=$(solana-keygen pubkey target/deploy/builder_passport-keypair.json)
    echo -e "${GREEN}✓ Program deployed!${NC}"
    echo -e "${YELLOW}⚠️  New Program ID: $NEW_PROGRAM_ID${NC}"
    echo -e "${YELLOW}   Update .env: VITE_BUILDER_PASSPORT_PROGRAM_ID=\"$NEW_PROGRAM_ID\"${NC}"
    PROGRAM_ID=$NEW_PROGRAM_ID
fi

echo -e "${BLUE}🔗 Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=$CLUSTER${NC}"
echo ""

# Step 3: Generate oracle keypair
echo "🔑 Step 3/5: Setting up oracle keypair..."

if [ -f "$ORACLE_KEYPAIR" ]; then
    echo -e "${YELLOW}⚠️  Oracle keypair already exists at $ORACLE_KEYPAIR${NC}"
    read -p "Use existing keypair? (Y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo "Generating new keypair..."
        solana-keygen new --outfile "$ORACLE_KEYPAIR" --force
    fi
else
    echo "Generating oracle keypair..."
    solana-keygen new --outfile "$ORACLE_KEYPAIR" --no-bip39-passphrase
fi

ORACLE_PUBKEY=$(solana-keygen pubkey "$ORACLE_KEYPAIR")
echo -e "${GREEN}✓ Oracle pubkey: $ORACLE_PUBKEY${NC}"
echo -e "${YELLOW}⚠️  Keep $ORACLE_KEYPAIR secret!${NC}"
echo ""

# Step 4: Initialize Config PDA
echo "⚙️  Step 4/5: Initializing Config PDA..."

# Check if Config PDA already initialized
CONFIG_PDA=$(cd "$REPO_ROOT" && node -e "
const { PublicKey } = require('@solana/web3.js');
const [pda] = PublicKey.findProgramAddressSync(
  [Buffer.from('config')],
  new PublicKey('$PROGRAM_ID')
);
console.log(pda.toBase58());
" 2>/dev/null || echo "")

if [ -n "$CONFIG_PDA" ]; then
    echo -e "${BLUE}Config PDA: $CONFIG_PDA${NC}"
    
    CONFIG_EXISTS=$(solana account "$CONFIG_PDA" --url $CLUSTER 2>&1 | grep -c "Account" || echo "0")
    
    if [ "$CONFIG_EXISTS" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Config PDA already initialized${NC}"
        echo -e "${YELLOW}   To change oracle, use update_oracle instruction${NC}"
    else
        echo "Initializing Config PDA..."
        cd "$REPO_ROOT/programs"
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies..."
            npm install --silent
        fi
        
        npx ts-node scripts/initialize-config.ts --oracle "$ORACLE_PUBKEY" --cluster $CLUSTER
        echo -e "${GREEN}✓ Config PDA initialized${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not derive Config PDA (Node.js or @solana/web3.js missing)${NC}"
    echo -e "${YELLOW}   Run manually: cd programs && npm run init-config -- --oracle $ORACLE_PUBKEY${NC}"
fi
echo ""

# Step 5: Display environment variables
echo "🔧 Step 5/5: Server configuration"
echo "=================================="
echo ""
echo -e "${BLUE}Add these to your .env or export:${NC}"
echo ""
echo "export PASSPORT_ORACLE_SECRET_KEY=\"\$(cat $ORACLE_KEYPAIR)\""
echo "export BUILDER_PASSPORT_PROGRAM_ID=\"$PROGRAM_ID\""
echo "export APPLICATIONS_ADMIN_TOKEN=\"\$(openssl rand -hex 32)\""
echo "export SOLANA_DEVNET_RPC_URL=\"https://api.devnet.solana.com\""
echo ""
echo -e "${YELLOW}Or for production (Base58 private key):${NC}"
echo ""
ORACLE_BASE58=$(solana-keygen pubkey "$ORACLE_KEYPAIR" 2>&1 | head -1 || echo "ERROR")
echo "export PASSPORT_ORACLE_SECRET_KEY=\"<BASE58_PRIVATE_KEY>\""
echo ""

# Success summary
echo ""
echo "================================================================"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "================================================================"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  • Program ID: ${GREEN}$PROGRAM_ID${NC}"
echo -e "  • Oracle Pubkey: ${GREEN}$ORACLE_PUBKEY${NC}"
echo -e "  • Config PDA: ${GREEN}${CONFIG_PDA:-'(run init-config manually)'}${NC}"
echo -e "  • Cluster: ${GREEN}$CLUSTER${NC}"
echo ""
echo -e "${BLUE}🔗 Links:${NC}"
echo "  • Program: https://explorer.solana.com/address/$PROGRAM_ID?cluster=$CLUSTER"
echo "  • Oracle: https://explorer.solana.com/address/$ORACLE_PUBKEY?cluster=$CLUSTER"
[ -n "$CONFIG_PDA" ] && echo "  • Config: https://explorer.solana.com/address/$CONFIG_PDA?cluster=$CLUSTER"
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "  1. Export environment variables (shown above)"
echo "  2. Start server: npm run dev"
echo "  3. Test Scout bump: Submit scout call → check logs"
echo "  4. Test Application bump: Approve application → check logs"
echo ""
echo -e "${GREEN}🚀 Builder Passport oracle is LIVE on devnet!${NC}"
echo ""
