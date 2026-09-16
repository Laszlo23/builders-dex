/**
 * Slim mainnet canary: config check, 1 mint+score, unauthorized reject.
 * Run: npx tsx programs/scripts/e2e-mainnet-canary.ts
 * Requires CONFIRM_MAINNET=yes and funded deployer + oracle key.
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
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const PROGRAM_ID = new PublicKey(
  process.env.BUILDER_PASSPORT_PROGRAM_ID ||
    '7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD',
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
  if (process.env.CONFIRM_MAINNET !== 'yes') {
    console.error('Refusing: set CONFIRM_MAINNET=yes');
    process.exit(1);
  }

  const results: Result[] = [];
  const idl = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'idl/builder_passport.json'), 'utf8'),
  );
  const authority = loadKp(
    process.env.SOLANA_KEYPAIR ||
      path.join(process.env.HOME!, '.config/solana/id.json'),
  );
  const oracle = loadKp(path.join(ROOT, '.keys/oracle-keypair.json'));
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
    [Buffer.from('config')],
    program.programId,
  );

  try {
    const cfg = await program.account.config.fetch(configPda);
    const match = cfg.oracle.equals(oracle.publicKey);
    results.push({
      name: 'config_oracle',
      ok: match,
      detail: `config=${configPda.toBase58()} oracle=${cfg.oracle.toBase58()}`,
    });
  } catch (e: unknown) {
    results.push({
      name: 'config_oracle',
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    });
  }

  try {
    const bal = await connection.getBalance(oracle.publicKey);
    if (bal < 0.01 * LAMPORTS_PER_SOL) {
      await fund(connection, authority, oracle.publicKey, 0.02);
    }
    results.push({
      name: 'oracle_funded',
      ok: true,
      detail: `${(await connection.getBalance(oracle.publicKey)) / LAMPORTS_PER_SOL} SOL`,
    });
  } catch (e: unknown) {
    results.push({
      name: 'oracle_funded',
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    });
  }

  const user = Keypair.generate();
  try {
    await fund(connection, authority, user.publicKey, 0.015);
    const [passportPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('builder-passport'), user.publicKey.toBuffer()],
      program.programId,
    );
    const mintSig = await program.methods
      .initialize()
      .accountsPartial({
        passport: passportPda,
        authority: user.publicKey,
      })
      .signers([user])
      .rpc();
    const scoreSig = await program.methods
      .updateScore(142)
      .accountsPartial({
        passport: passportPda,
        config: configPda,
        oracle: oracle.publicKey,
      })
      .signers([oracle])
      .rpc();
    const acct = await program.account.builderPassport.fetch(passportPda);
    results.push({
      name: 'canary_mint_and_score',
      ok: acct.score === 142,
      detail: `wallet=${user.publicKey.toBase58()} pda=${passportPda.toBase58()} score=${acct.score} mint=${mintSig} scoreTx=${scoreSig}`,
    });

    const bad = Keypair.generate();
    await fund(connection, authority, bad.publicKey, 0.005);
    try {
      await program.methods
        .updateScore(9999)
        .accountsPartial({
          passport: passportPda,
          config: configPda,
          oracle: bad.publicKey,
        })
        .signers([bad])
        .rpc();
      results.push({
        name: 'unauthorized_rejected',
        ok: false,
        detail: 'expected failure',
      });
    } catch {
      results.push({
        name: 'unauthorized_rejected',
        ok: true,
        detail: 'rejected as expected',
      });
    }
  } catch (e: unknown) {
    results.push({
      name: 'canary_mint_and_score',
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    });
  }

  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}: ${r.detail}`);
  }
  const ok = results.every((r) => r.ok);
  console.log(ok ? 'CANARY_OK' : 'CANARY_FAIL');
  console.log(
    'authority_balance',
    (await connection.getBalance(authority.publicKey)) / LAMPORTS_PER_SOL,
  );
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
