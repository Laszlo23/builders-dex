/**
 * Initialize Config PDA for Builder Passport Oracle
 * 
 * Run once after deploying/upgrading the program:
 *   npx ts-node scripts/initialize-config.ts --oracle <ORACLE_PUBKEY>
 * 
 * Requirements:
 * - Deployer keypair in ~/.config/solana/id.json (or set via --keypair)
 * - SOL on devnet for transaction fees
 * - Program deployed at BUILDER_PASSPORT_PROGRAM_ID
 */

import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

const PROGRAM_ID = new PublicKey('7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD');

interface BuilderPassport {
  version: string;
  name: string;
  instructions: any[];
  accounts: any[];
  types: any[];
}

async function initializeConfig(oraclePubkey: PublicKey, cluster: string = 'devnet') {
  console.log('🔧 Initializing Builder Passport Config PDA...');
  console.log(`   Oracle: ${oraclePubkey.toBase58()}`);
  console.log(`   Cluster: ${cluster}`);
  
  // Load deployer keypair
  const keypairPath = process.env.ANCHOR_WALLET || 
    path.join(process.env.HOME!, '.config', 'solana', 'id.json');
  
  if (!fs.existsSync(keypairPath)) {
    throw new Error(`Keypair not found at ${keypairPath}. Set ANCHOR_WALLET or ensure ~/.config/solana/id.json exists.`);
  }

  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  const deployer = Keypair.fromSecretKey(Uint8Array.from(keypairData));
  console.log(`   Deployer: ${deployer.publicKey.toBase58()}`);

  // Setup connection
  const rpcUrl = cluster === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : cluster === 'mainnet'
    ? 'https://api.mainnet-beta.solana.com'
    : cluster;
  
  const connection = new Connection(rpcUrl, 'confirmed');
  const wallet = new Wallet(deployer);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  // Load IDL
  const idlPath = path.join(__dirname, '../target/idl/builder_passport.json');
  if (!fs.existsSync(idlPath)) {
    throw new Error(`IDL not found at ${idlPath}. Run 'anchor build' first.`);
  }

  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8')) as BuilderPassport;
  const program = new Program(idl as any, PROGRAM_ID, provider);

  // Derive Config PDA
  const [configPDA, configBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  );

  console.log(`   Config PDA: ${configPDA.toBase58()} (bump: ${configBump})`);

  // Check if already initialized
  try {
    const configAccount = await connection.getAccountInfo(configPDA);
    if (configAccount) {
      console.log('❌ Config PDA already initialized!');
      console.log('   To change oracle, use update_oracle instruction instead.');
      process.exit(1);
    }
  } catch (err) {
    // Not initialized, continue
  }

  // Check deployer balance
  const balance = await connection.getBalance(deployer.publicKey);
  const balanceSol = balance / 1e9;
  if (balanceSol < 0.01) {
    console.log(`❌ Insufficient balance: ${balanceSol} SOL (need at least 0.01 SOL)`);
    console.log(`   Airdrop: solana airdrop 1 ${deployer.publicKey.toBase58()} --url ${rpcUrl}`);
    process.exit(1);
  }
  console.log(`   Balance: ${balanceSol.toFixed(4)} SOL`);

  // Send initialize_config transaction
  console.log('\n📤 Sending initialize_config transaction...');
  try {
    const tx = await program.methods
      .initializeConfig(oraclePubkey)
      .accounts({
        config: configPDA,
        authority: deployer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(`✅ Config initialized!`);
    console.log(`   Tx: ${tx}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${tx}?cluster=${cluster}`);
    console.log(`\n🔑 Oracle pubkey stored: ${oraclePubkey.toBase58()}`);
    console.log(`   Only this oracle can update passport scores.`);
    console.log(`   Set PASSPORT_ORACLE_SECRET_KEY to the oracle's private key in server .env`);
  } catch (err: any) {
    console.error('❌ Transaction failed:', err.message || err);
    if (err.logs) {
      console.error('Program logs:', err.logs.join('\n'));
    }
    process.exit(1);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  let oraclePubkey: PublicKey | null = null;
  let cluster = 'devnet';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--oracle' && args[i + 1]) {
      try {
        oraclePubkey = new PublicKey(args[i + 1]);
      } catch {
        console.error(`❌ Invalid oracle pubkey: ${args[i + 1]}`);
        process.exit(1);
      }
      i++;
    } else if (args[i] === '--cluster' && args[i + 1]) {
      cluster = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Initialize Builder Passport Config PDA

Usage:
  npx ts-node scripts/initialize-config.ts --oracle <ORACLE_PUBKEY> [--cluster devnet|mainnet|<RPC_URL>]

Options:
  --oracle    Oracle public key (required)
  --cluster   Cluster or RPC URL (default: devnet)
  --help      Show this help

Example:
  # Generate oracle keypair first
  solana-keygen new --outfile oracle-keypair.json
  
  # Get oracle pubkey
  solana-keygen pubkey oracle-keypair.json
  
  # Initialize config
  npx ts-node scripts/initialize-config.ts --oracle <ORACLE_PUBKEY>

Environment:
  ANCHOR_WALLET    Path to deployer keypair (default: ~/.config/solana/id.json)
      `);
      process.exit(0);
    }
  }

  if (!oraclePubkey) {
    console.error('❌ Missing required argument: --oracle <ORACLE_PUBKEY>');
    console.error('   Run with --help for usage');
    process.exit(1);
  }

  await initializeConfig(oraclePubkey, cluster);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
