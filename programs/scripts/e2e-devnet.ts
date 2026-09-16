/**
 * Real Devnet E2E for Builder Passport — mints, scores, rejects unauthorized.
 * Run: npx tsx programs/scripts/e2e-devnet.ts
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
const RPC = process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com';
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
  console.log('Authority', authority.publicKey.toBase58());
  console.log('Oracle', oracle.publicKey.toBase58());

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    program.programId,
  );

  // 1) Config exists
  try {
    const cfg = await program.account.config.fetch(configPda);
    const match = cfg.oracle.equals(oracle.publicKey);
    results.push({
      name: 'config_pda_exists',
      ok: true,
      detail: `oracle=${cfg.oracle.toBase58()} match=${match}`,
    });
    if (!match) {
      results.push({
        name: 'config_oracle_matches_local_key',
        ok: false,
        detail: `on-chain ${cfg.oracle.toBase58()} != local ${oracle.publicKey.toBase58()}`,
      });
    } else {
      results.push({
        name: 'config_oracle_matches_local_key',
        ok: true,
        detail: 'ok',
      });
    }
  } catch (e: any) {
    results.push({
      name: 'config_pda_exists',
      ok: false,
      detail: e.message || String(e),
    });
  }

  // Fund oracle for fees
  try {
    const bal = await connection.getBalance(oracle.publicKey);
    if (bal < 0.02 * LAMPORTS_PER_SOL) {
      await fund(connection, authority, oracle.publicKey, 0.05);
    }
    results.push({ name: 'oracle_funded', ok: true, detail: 'ok' });
  } catch (e: any) {
    results.push({ name: 'oracle_funded', ok: false, detail: e.message });
  }

  // 2) Mint 3 passports + score bumps
  const wallets: Keypair[] = [];
  for (let i = 0; i < 3; i++) {
    const user = Keypair.generate();
    wallets.push(user);
    try {
      await fund(connection, authority, user.publicKey, 0.05);
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
      const score = 100 + i * 50;
      const scoreSig = await program.methods
        .updateScore(score)
        .accountsPartial({
          passport: passportPda,
          config: configPda,
          oracle: oracle.publicKey,
        })
        .signers([oracle])
        .rpc();
      const acct = await program.account.builderPassport.fetch(passportPda);
      const ok = acct.score === score;
      results.push({
        name: `wallet_${i + 1}_mint_and_score`,
        ok,
        detail: `wallet=${user.publicKey.toBase58()} score=${acct.score} mint=${mintSig.slice(0, 12)}… scoreTx=${scoreSig.slice(0, 12)}…`,
      });
    } catch (e: any) {
      results.push({
        name: `wallet_${i + 1}_mint_and_score`,
        ok: false,
        detail: e.message || String(e),
      });
    }
  }

  // 3) Unauthorized oracle rejected
  try {
    const user = wallets[0];
    if (!user) throw new Error('no wallet');
    const bad = Keypair.generate();
    await fund(connection, authority, bad.publicKey, 0.02);
    const [passportPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('builder-passport'), user.publicKey.toBuffer()],
      program.programId,
    );
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
        name: 'unauthorized_oracle_rejected',
        ok: false,
        detail: 'expected failure but tx succeeded',
      });
    } catch {
      results.push({
        name: 'unauthorized_oracle_rejected',
        ok: true,
        detail: 'rejected as expected',
      });
    }
  } catch (e: any) {
    results.push({
      name: 'unauthorized_oracle_rejected',
      ok: false,
      detail: e.message || String(e),
    });
  }

  // 4) Close + re-init
  try {
    const user = Keypair.generate();
    await fund(connection, authority, user.publicKey, 0.05);
    const [passportPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('builder-passport'), user.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .initialize()
      .accountsPartial({ passport: passportPda, authority: user.publicKey })
      .signers([user])
      .rpc();
    await program.methods
      .close()
      .accountsPartial({ passport: passportPda, authority: user.publicKey })
      .signers([user])
      .rpc();
    await program.methods
      .initialize()
      .accountsPartial({ passport: passportPda, authority: user.publicKey })
      .signers([user])
      .rpc();
    const acct = await program.account.builderPassport.fetch(passportPda);
    results.push({
      name: 'close_and_reinit',
      ok: acct.score === 0,
      detail: `score=${acct.score}`,
    });
  } catch (e: any) {
    results.push({
      name: 'close_and_reinit',
      ok: false,
      detail: e.message || String(e),
    });
  }

  console.log('\n=== DEVNET E2E RESULTS ===');
  let failed = 0;
  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name} — ${r.detail}`);
    if (!r.ok) failed++;
  }
  console.log(
    failed === 0
      ? `\nALL ${results.length} CHECKS PASSED`
      : `\n${failed}/${results.length} FAILED`,
  );
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
