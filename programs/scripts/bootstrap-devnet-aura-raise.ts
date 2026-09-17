/**
 * Create + oracle-open the Aura OS raise on Devnet, then write the live seed JSON.
 * Run after program deploy + initialize-raise-config.
 */
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BUILDER_RAISE_PROGRAM_ID,
  buildCreateRaiseIx,
  buildOpenRaiseIx,
  deriveRaisePda,
  fetchOnchainRaise,
} from '../../src/lib/shareRaiseOnchain';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const REPO = path.join(ROOT, '..');
const RPC = process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com';
const PROJECT_ID = 'p5';
const RAISE_ID = 'raise_aura_p5';
const PRICE = 50_000_000;
const SUPPLY = 200;
const HOLDER_BPS = 2000;
const GOAL = 10_000_000_000;
const MIN_SCORE = 90;

function loadKp(p: string): Keypair {
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(p, 'utf8')) as number[]),
  );
}

async function main() {
  const authority = loadKp(
    process.env.SOLANA_KEYPAIR || path.join(process.env.HOME!, '.config/solana/id.json'),
  );
  const oraclePath =
    process.env.ORACLE_KEYPAIR || path.join(ROOT, '.keys/raise-oracle-keypair.json');
  // Config oracle is the deploy wallet on this canary; do not use the passport oracle key.
  const oracle = fs.existsSync(oraclePath) ? loadKp(oraclePath) : authority;
  const connection = new Connection(RPC, 'confirmed');
  const seed = createHash('sha256').update(`builders-dex:project:${PROJECT_ID}`).digest();
  const appHash = createHash('sha256').update('builders-dex:application:app_aura_p5').digest();
  const [raisePda] = deriveRaisePda(authority.publicKey, seed);

  const existing = await fetchOnchainRaise(connection, raisePda);
  if (!existing) {
    const createIx = buildCreateRaiseIx({
      founder: authority.publicKey,
      projectSeed: seed,
      priceLamports: PRICE,
      shareSupply: SUPPLY,
      holderPoolBps: HOLDER_BPS,
      goalLamports: GOAL,
      minBuilderScore: MIN_SCORE,
      applicationHash: appHash,
    });
    const createSig = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(createIx),
      [authority],
    );
    console.log('created', raisePda.toBase58(), createSig);
  } else {
    console.log('raise exists', raisePda.toBase58(), 'status', existing.status);
  }

  const afterCreate = await fetchOnchainRaise(connection, raisePda);
  if (afterCreate && afterCreate.status === 0) {
    const openIx = buildOpenRaiseIx({ raise: raisePda, oracle: oracle.publicKey });
    const openSig = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(openIx),
      oracle.publicKey.equals(authority.publicKey) ? [authority] : [authority, oracle],
    );
    console.log('opened', openSig);
  }

  const live = await fetchOnchainRaise(connection, raisePda);
  if (!live || live.status !== 1) {
    throw new Error(`Raise not live (status=${live?.status ?? 'missing'})`);
  }

  const seedJson = {
    id: RAISE_ID,
    projectId: PROJECT_ID,
    cluster: 'devnet' as const,
    programId: BUILDER_RAISE_PROGRAM_ID.toBase58(),
    raisePda: raisePda.toBase58(),
    founderWallet: authority.publicKey.toBase58(),
    projectSeedHex: seed.toString('hex'),
    priceLamports: PRICE,
    shareSupply: SUPPLY,
    holderPoolBps: HOLDER_BPS,
    founderRetainedBps: 10_000 - HOLDER_BPS,
    goalLamports: GOAL,
    applicationId: 'app_aura_p5',
    builderScore: 92,
    explorer: `https://explorer.solana.com/address/${raisePda.toBase58()}?cluster=devnet`,
  };
  const out = path.join(REPO, 'src/data/liveShareRaise.json');
  fs.writeFileSync(out, `${JSON.stringify(seedJson, null, 2)}\n`);
  console.log('wrote', out);
  console.log(JSON.stringify(seedJson, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
