/**
 * Devnet E2E for builder_raise — create, reject bad oracle, open, mint, deposit, claim.
 * Hold mainnet until CONFIRM_MAINNET + funded deploy wallet.
 *
 * Run (after deploy + config init):
 *   npx tsx programs/scripts/e2e-devnet-raise.ts
 */
import * as anchor from '@coral-xyz/anchor';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const RPC = process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey(
  process.env.BUILDER_RAISE_PROGRAM_ID ||
    '6weAy9KBNBf6MFsiA4csnEj5yJEhLV5nA5fzvnHD6wS2',
);

type Result = { name: string; ok: boolean; detail: string };

function loadKp(p: string): Keypair {
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(p, 'utf8')) as number[]),
  );
}

async function fund(
  connection: Connection,
  from: Keypair,
  to: PublicKey,
  sol: number,
) {
  const ix = SystemProgram.transfer({
    fromPubkey: from.publicKey,
    toPubkey: to,
    lamports: Math.floor(sol * LAMPORTS_PER_SOL),
  });
  await sendAndConfirmTransaction(connection, new Transaction().add(ix), [from], {
    commitment: 'confirmed',
  });
}

async function main() {
  if (process.env.CONFIRM_MAINNET === 'yes') {
    console.error('Refusing: this script is Devnet-only. Do not set CONFIRM_MAINNET.');
    process.exit(1);
  }

  const idlPath = path.join(ROOT, 'idl/builder_raise.json');
  if (!fs.existsSync(idlPath)) {
    console.error('Missing programs/idl/builder_raise.json — build + copy IDL first');
    process.exit(1);
  }

  const results: Result[] = [];
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  const authority = loadKp(
    process.env.SOLANA_KEYPAIR ||
      path.join(process.env.HOME!, '.config/solana/id.json'),
  );
  const oraclePath = path.join(ROOT, '.keys/oracle-keypair.json');
  const oracle = fs.existsSync(oraclePath) ? loadKp(oraclePath) : authority;
  const connection = new Connection(RPC, 'confirmed');
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(authority),
    { commitment: 'confirmed' },
  );
  const program = new anchor.Program(idl, provider);
  console.log('RPC', RPC);
  console.log('Program', program.programId.toBase58());

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('raise-config')],
    PROGRAM_ID,
  );

  try {
    const cfg = await program.account.raiseConfig.fetch(configPda);
    results.push({
      name: 'config_exists',
      ok: true,
      detail: `oracle=${cfg.oracle.toBase58()}`,
    });
  } catch (e: unknown) {
    results.push({
      name: 'config_exists',
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    });
  }

  const founder = Keypair.generate();
  const buyer = Keypair.generate();
  try {
    await fund(connection, authority, founder.publicKey, 0.08);
    await fund(connection, authority, buyer.publicKey, 0.08);
    if ((await connection.getBalance(oracle.publicKey)) < 0.01 * LAMPORTS_PER_SOL) {
      await fund(connection, authority, oracle.publicKey, 0.02);
    }

    const seed = createHash('sha256').update(`builders-dex:project:e2e-${Date.now()}`).digest();
    const appHash = createHash('sha256').update('builders-dex:application:e2e').digest();
    const [raisePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('raise'), founder.publicKey.toBuffer(), seed],
      PROGRAM_ID,
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), raisePda.toBuffer()],
      PROGRAM_ID,
    );

    await program.methods
      .createRaise(
        Array.from(seed),
        new anchor.BN(10_000_000),
        5,
        2000,
        new anchor.BN(50_000_000),
        90,
        Array.from(appHash),
      )
      .accounts({
        raise: raisePda,
        vault: vaultPda,
        founder: founder.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([founder])
      .rpc();
    results.push({ name: 'create_raise', ok: true, detail: raisePda.toBase58() });

    try {
      const bad = Keypair.generate();
      await fund(connection, authority, bad.publicKey, 0.01);
      await program.methods
        .openRaise()
        .accounts({ raise: raisePda, config: configPda, oracle: bad.publicKey })
        .signers([bad])
        .rpc();
      results.push({ name: 'bad_oracle_rejected', ok: false, detail: 'should fail' });
    } catch {
      results.push({ name: 'bad_oracle_rejected', ok: true, detail: 'rejected' });
    }

    await program.methods
      .openRaise()
      .accounts({ raise: raisePda, config: configPda, oracle: oracle.publicKey })
      .signers([oracle])
      .rpc();
    results.push({ name: 'open_raise', ok: true, detail: 'live' });

    const serialBuf = Buffer.alloc(4);
    serialBuf.writeUInt32LE(0);
    const [certPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('share'), raisePda.toBuffer(), serialBuf],
      PROGRAM_ID,
    );
    const cfg = await program.account.raiseConfig.fetch(configPda);
    await program.methods
      .mintShare(0)
      .accounts({
        raise: raisePda,
        config: configPda,
        certificate: certPda,
        buyer: buyer.publicKey,
        founder: founder.publicKey,
        platformTreasury: cfg.platformTreasury,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
    results.push({ name: 'mint_share', ok: true, detail: certPda.toBase58() });

    await program.methods
      .depositWin(new anchor.BN(20_000_000))
      .accounts({
        raise: raisePda,
        vault: vaultPda,
        founder: founder.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([founder])
      .rpc();
    results.push({ name: 'deposit_win', ok: true, detail: 'ok' });

    await program.methods
      .claim()
      .accounts({
        raise: raisePda,
        certificate: certPda,
        vault: vaultPda,
        owner: buyer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
    results.push({ name: 'claim', ok: true, detail: 'ok' });
  } catch (e: unknown) {
    results.push({
      name: 'flow',
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    });
  }

  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}: ${r.detail}`);
  }
  const ok = results.every((r) => r.ok);
  console.log(ok ? 'RAISE_E2E_OK' : 'RAISE_E2E_FAIL');
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
