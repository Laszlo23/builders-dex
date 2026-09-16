/**
 * Initialize Builder Passport Config PDA (one-time per cluster).
 *
 * Usage:
 *   ORACLE_PUBKEY=<pubkey> npx tsx programs/scripts/initialize-config.ts [--cluster devnet|mainnet-beta]
 *
 * Authority must be the wallet that pays rent (deployer). On mainnet, confirm carefully.
 */
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PROGRAM_ID = new PublicKey(
  process.env.BUILDER_PASSPORT_PROGRAM_ID ||
    '7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD',
);

/** Discriminator from committed IDL (programs/idl/builder_passport.json) */
const INIT_CONFIG_DISC = Buffer.from([208, 127, 21, 1, 194, 190, 196, 70]);

function loadKeypair(filePath: string): Keypair {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

function defaultKeypairPath(): string {
  return (
    process.env.SOLANA_KEYPAIR ||
    path.join(os.homedir(), '.config', 'solana', 'id.json')
  );
}

function clusterUrl(cluster: string): string {
  if (cluster === 'mainnet-beta' || cluster === 'mainnet') {
    return process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  }
  return process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com';
}

async function main() {
  const clusterArg = process.argv.find((a) => a.startsWith('--cluster'));
  const cluster =
    (clusterArg?.includes('=') ? clusterArg.split('=')[1] : undefined) ||
    process.argv[process.argv.indexOf('--cluster') + 1] ||
    'devnet';

  const oracleStr = process.env.ORACLE_PUBKEY;
  if (!oracleStr) {
    console.error('Set ORACLE_PUBKEY to the oracle public key');
    process.exit(1);
  }
  const oracle = new PublicKey(oracleStr);

  if (cluster === 'mainnet-beta' || cluster === 'mainnet') {
    if (process.env.CONFIRM_MAINNET !== 'yes') {
      console.error('Refusing mainnet without CONFIRM_MAINNET=yes');
      process.exit(1);
    }
  }

  const authority = loadKeypair(defaultKeypairPath());
  const connection = new Connection(clusterUrl(cluster), 'confirmed');
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID,
  );

  const existing = await connection.getAccountInfo(configPda);
  if (existing) {
    console.log('Config PDA already exists:', configPda.toBase58());
    console.log('Size:', existing.data.length);
    process.exit(0);
  }

  const data = Buffer.concat([INIT_CONFIG_DISC, oracle.toBuffer()]);
  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: authority.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  const tx = new Transaction().add(ix);
  console.log('Initializing Config PDA…');
  console.log('  cluster:', cluster);
  console.log('  program:', PROGRAM_ID.toBase58());
  console.log('  config: ', configPda.toBase58());
  console.log('  authority:', authority.publicKey.toBase58());
  console.log('  oracle:   ', oracle.toBase58());

  const sig = await sendAndConfirmTransaction(connection, tx, [authority], {
    commitment: 'confirmed',
  });
  console.log('Success. Signature:', sig);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
