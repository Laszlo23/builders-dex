/**
 * Initialize builder_raise Config PDA (one-time per cluster).
 * Devnet default. Mainnet requires CONFIRM_MAINNET=yes.
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
  process.env.BUILDER_RAISE_PROGRAM_ID ||
    '6weAy9KBNBf6MFsiA4csnEj5yJEhLV5nA5fzvnHD6wS2',
);

const INIT_CONFIG_DISC = Buffer.from([208, 127, 21, 1, 194, 190, 196, 70]);

function loadKeypair(filePath: string): Keypair {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function main() {
  const cluster = process.argv.includes('mainnet-beta') ? 'mainnet-beta' : 'devnet';
  if (cluster === 'mainnet-beta' && process.env.CONFIRM_MAINNET !== 'yes') {
    console.error('Refusing mainnet without CONFIRM_MAINNET=yes');
    process.exit(1);
  }
  const oracleStr = process.env.ORACLE_PUBKEY;
  if (!oracleStr) {
    console.error('Set ORACLE_PUBKEY');
    process.exit(1);
  }
  const oracle = new PublicKey(oracleStr);
  const treasury = new PublicKey(
    process.env.RAISE_TREASURY || oracleStr,
  );
  const feeBps = Number(process.env.RAISE_FEE_BPS || 250);
  const authority = loadKeypair(
    process.env.SOLANA_KEYPAIR || path.join(os.homedir(), '.config/solana/id.json'),
  );
  const rpc =
    cluster === 'mainnet-beta'
      ? process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
      : process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpc, 'confirmed');
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('raise-config')],
    PROGRAM_ID,
  );
  const existing = await connection.getAccountInfo(configPda);
  if (existing) {
    console.log('Config already exists', configPda.toBase58());
    return;
  }

  const data = Buffer.alloc(8 + 32 + 2 + 32);
  INIT_CONFIG_DISC.copy(data, 0);
  oracle.toBuffer().copy(data, 8);
  data.writeUInt16LE(feeBps, 40);
  treasury.toBuffer().copy(data, 42);

  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: authority.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
  try {
    const sig = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(ix),
      [authority],
    );
    console.log('Initialized', configPda.toBase58(), sig);
  } catch (err) {
    const logs =
      err && typeof err === 'object' && 'getLogs' in err
        ? await (err as { getLogs: () => Promise<unknown> }).getLogs()
        : null;
    console.error(err);
    if (logs) console.error('logs', logs);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
