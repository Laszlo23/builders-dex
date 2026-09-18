/**
 * Share-raise ledger (SQLite) + inspection helpers.
 * On-chain balances live on builder_raise; this table is the product index.
 */
import { createHash, randomBytes } from 'node:crypto';
import { getSqlite } from './db/sqlite';
import type { ShareRaise, ShareRaiseStatus } from '../types';
import { BUILDER_SCORE_UNLOCK } from './reputationRules';
import { LIVE_AURA_RAISE_SEED } from '../data/liveShareRaise';

export const SHARE_RAISE_PROGRAM_ID =
  process.env.VITE_BUILDER_RAISE_PROGRAM_ID ||
  process.env.BUILDER_RAISE_PROGRAM_ID ||
  '6weAy9KBNBf6MFsiA4csnEj5yJEhLV5nA5fzvnHD6wS2';

type RaiseRow = {
  id: string;
  project_id: string;
  raise_pda: string | null;
  collection: string | null;
  founder_wallet: string;
  status: string;
  price_lamports: number;
  share_supply: number;
  shares_minted: number;
  holder_pool_bps: number;
  founder_retained_bps: number;
  goal_lamports: number;
  raised_lamports: number;
  vault_mint: string;
  application_id: string;
  builder_score: number;
  pob_verified: number;
  attested_at: string | null;
  attest_tx: string | null;
  created_at: string;
  updated_at: string;
};

function rowToRaise(row: RaiseRow): ShareRaise {
  return {
    id: row.id,
    projectId: row.project_id,
    projectSeedHex:
      row.id === LIVE_AURA_RAISE_SEED.id || row.project_id === LIVE_AURA_RAISE_SEED.projectId
        ? LIVE_AURA_RAISE_SEED.projectSeedHex
        : projectSeedBytes(row.project_id).toString('hex'),
    raisePda: row.raise_pda,
    collection: row.collection,
    founderWallet: row.founder_wallet,
    status: row.status as ShareRaiseStatus,
    priceLamports: Number(row.price_lamports),
    shareSupply: Number(row.share_supply),
    sharesMinted: Number(row.shares_minted),
    holderPoolBps: Number(row.holder_pool_bps),
    founderRetainedBps: Number(row.founder_retained_bps),
    goalLamports: Number(row.goal_lamports),
    raisedLamports: Number(row.raised_lamports),
    vaultMint: 'SOL',
    inspection: {
      applicationId: row.application_id || '',
      builderScore: Number(row.builder_score) || 0,
      pobVerified: Boolean(row.pob_verified),
      attestedAt: row.attested_at,
      tx: row.attest_tx,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    demo: row.id === 'raise_demo_p5' && !row.raise_pda,
    cluster: row.raise_pda ? 'devnet' : undefined,
  };
}

function stampLiveRaise(raise: ShareRaise): ShareRaise {
  if (raise.id !== LIVE_AURA_RAISE_SEED.id && raise.projectId !== LIVE_AURA_RAISE_SEED.projectId) {
    return raise;
  }
  raise.cluster = LIVE_AURA_RAISE_SEED.cluster;
  raise.demo = false;
  raise.projectSeedHex = LIVE_AURA_RAISE_SEED.projectSeedHex;
  raise.status = 'live';
  raise.raisePda = LIVE_AURA_RAISE_SEED.raisePda;
  raise.collection = LIVE_AURA_RAISE_SEED.raisePda;
  raise.founderWallet = LIVE_AURA_RAISE_SEED.founderWallet;
  raise.inspection = {
    ...raise.inspection,
    applicationId: LIVE_AURA_RAISE_SEED.applicationId,
    builderScore: Math.max(raise.inspection.builderScore, LIVE_AURA_RAISE_SEED.builderScore),
    pobVerified: true,
  };
  return raise;
}

export function projectSeedBytes(projectId: string): Buffer {
  return createHash('sha256').update(`builders-dex:project:${projectId}`).digest();
}

export function applicationHashBytes(applicationId: string): Buffer {
  return createHash('sha256').update(`builders-dex:application:${applicationId}`).digest();
}

type LiveSeed = {
  id: string;
  projectId: string;
  cluster?: 'devnet' | 'mainnet-beta';
  raisePda: string;
  founderWallet: string;
  priceLamports: number;
  shareSupply: number;
  holderPoolBps: number;
  founderRetainedBps: number;
  goalLamports: number;
  applicationId: string;
  builderScore: number;
};

function loadLiveSeed(): LiveSeed {
  return LIVE_AURA_RAISE_SEED;
}

/** Upsert the Devnet Aura canary so Accelerator mint is not the catalog demo. */
export function ensureLiveRaise(): ShareRaise | null {
  const seed = loadLiveSeed();
  if (!seed?.raisePda || !seed.founderWallet) return null;
  const db = getSqlite();
  const existing = db
    .prepare(`SELECT * FROM share_raises WHERE id = ?`)
    .get(seed.id) as RaiseRow | undefined;
  if (!existing) {
    db.prepare(
      `INSERT INTO share_raises (
        id, project_id, raise_pda, collection, founder_wallet, status,
        price_lamports, share_supply, shares_minted, holder_pool_bps,
        founder_retained_bps, goal_lamports, raised_lamports, application_id,
        builder_score, pob_verified, attested_at
      ) VALUES (?, ?, ?, ?, ?, 'live', ?, ?, 0, ?, ?, ?, 0, ?, ?, 1, datetime('now'))`,
    ).run(
      seed.id,
      seed.projectId,
      seed.raisePda,
      seed.raisePda,
      seed.founderWallet,
      seed.priceLamports,
      seed.shareSupply,
      seed.holderPoolBps,
      seed.founderRetainedBps,
      seed.goalLamports,
      seed.applicationId,
      seed.builderScore,
    );
  } else if (existing.raise_pda !== seed.raisePda || existing.status !== 'live') {
    db.prepare(
      `UPDATE share_raises SET
         raise_pda = ?, collection = ?, founder_wallet = ?, status = 'live',
         price_lamports = ?, share_supply = ?, holder_pool_bps = ?,
         founder_retained_bps = ?, goal_lamports = ?, application_id = ?,
         builder_score = ?, pob_verified = 1, attested_at = COALESCE(attested_at, datetime('now')),
         updated_at = datetime('now')
       WHERE id = ?`,
    ).run(
      seed.raisePda,
      seed.raisePda,
      seed.founderWallet,
      seed.priceLamports,
      seed.shareSupply,
      seed.holderPoolBps,
      seed.founderRetainedBps,
      seed.goalLamports,
      seed.applicationId,
      seed.builderScore,
      seed.id,
    );
  }
  const row = db.prepare(`SELECT * FROM share_raises WHERE id = ?`).get(seed.id) as RaiseRow;
  return stampLiveRaise(rowToRaise(row));
}

export function listRaises(opts?: { status?: ShareRaiseStatus; projectId?: string }): ShareRaise[] {
  ensureLiveRaise();
  const db = getSqlite();
  const clauses: string[] = [];
  const params: string[] = [];
  if (opts?.status) {
    clauses.push('status = ?');
    params.push(opts.status);
  }
  if (opts?.projectId) {
    clauses.push('project_id = ?');
    params.push(opts.projectId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT * FROM share_raises ${where} ORDER BY created_at DESC`)
    .all(...params) as RaiseRow[];
  const raises = rows.map((row) => stampLiveRaise(rowToRaise(row)));
  const filtered = raises.some((r) => r.raisePda) ? raises.filter((r) => !r.demo) : raises;
  if (filtered.length === 0 && !opts?.status && !opts?.projectId) {
    return [ensureDemoRaise()];
  }
  return filtered;
}

export function getRaise(id: string): ShareRaise | null {
  const live = ensureLiveRaise();
  if (
    live &&
    (id === live.id || id === live.projectId || id === 'raise_demo_p5' || id === 'p5')
  ) {
    return live;
  }
  const db = getSqlite();
  const row = db.prepare(`SELECT * FROM share_raises WHERE id = ?`).get(id) as RaiseRow | undefined;
  if (row) return rowToRaise(row);
  if (id === 'raise_demo_p5') return ensureDemoRaise();
  return null;
}

export function getRaiseByProject(projectId: string): ShareRaise | null {
  const live = ensureLiveRaise();
  if (live && live.projectId === projectId) return live;
  const db = getSqlite();
  const row = db
    .prepare(`SELECT * FROM share_raises WHERE project_id = ? ORDER BY created_at DESC LIMIT 1`)
    .get(projectId) as RaiseRow | undefined;
  if (row) return rowToRaise(row);
  if (projectId === 'p5') return ensureDemoRaise();
  return null;
}

export function createRaiseDraft(input: {
  projectId: string;
  founderWallet: string;
  priceLamports: number;
  shareSupply: number;
  holderPoolBps: number;
  goalLamports: number;
  applicationId?: string;
  builderScore?: number;
}): ShareRaise {
  if (input.priceLamports <= 0) throw new Error('priceLamports must be > 0');
  if (input.shareSupply <= 0 || input.shareSupply > 10_000) {
    throw new Error('shareSupply must be 1–10000');
  }
  if (input.holderPoolBps <= 0 || input.holderPoolBps > 10_000) {
    throw new Error('holderPoolBps must be 1–10000');
  }
  const db = getSqlite();
  const id = `raise_${randomBytes(6).toString('hex')}`;
  const retained = 10_000 - input.holderPoolBps;
  db.prepare(
    `INSERT INTO share_raises (
      id, project_id, founder_wallet, status, price_lamports, share_supply,
      holder_pool_bps, founder_retained_bps, goal_lamports, application_id, builder_score
    ) VALUES (?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.projectId,
    input.founderWallet,
    input.priceLamports,
    input.shareSupply,
    input.holderPoolBps,
    retained,
    input.goalLamports,
    input.applicationId || '',
    input.builderScore ?? 0,
  );
  return getRaise(id)!;
}

export function markRaiseInspection(input: {
  applicationId: string;
  projectId?: string;
  builderScore: number;
  pobVerified: boolean;
}): number {
  const db = getSqlite();
  const info = db
    .prepare(
      `UPDATE share_raises SET
        builder_score = ?,
        pob_verified = ?,
        application_id = CASE WHEN application_id = '' THEN ? ELSE application_id END,
        updated_at = datetime('now')
       WHERE application_id = ? OR (application_id = '' AND project_id = ?)`,
    )
    .run(
      input.builderScore,
      input.pobVerified ? 1 : 0,
      input.applicationId,
      input.applicationId,
      input.projectId || '',
    );
  return info.changes;
}

export function canOpenRaise(raise: ShareRaise): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (raise.status !== 'draft') reasons.push('Raise is not in draft');
  if (raise.inspection.builderScore < BUILDER_SCORE_UNLOCK) {
    reasons.push(`Builder Score™ must be ≥ ${BUILDER_SCORE_UNLOCK}`);
  }
  if (!raise.inspection.pobVerified) reasons.push('Proof of Building™ not verified');
  if (!raise.inspection.applicationId) reasons.push('No linked application');
  return { ok: reasons.length === 0, reasons };
}

export function markRaiseAttested(id: string, tx: string | null, raisePda?: string): void {
  const db = getSqlite();
  db.prepare(
    `UPDATE share_raises SET
       status = 'live',
       attested_at = datetime('now'),
       attest_tx = ?,
       raise_pda = COALESCE(?, raise_pda),
       collection = COALESCE(?, collection),
       updated_at = datetime('now')
     WHERE id = ?`,
  ).run(tx, raisePda || null, raisePda || null, id);
}

export function syncRaiseOnchain(id: string, patch: {
  raisePda?: string;
  collection?: string;
  status?: ShareRaiseStatus;
  sharesMinted?: number;
  raisedLamports?: number;
}): void {
  const db = getSqlite();
  const current = getRaise(id);
  if (!current) return;
  db.prepare(
    `UPDATE share_raises SET
       raise_pda = COALESCE(?, raise_pda),
       collection = COALESCE(?, collection),
       status = COALESCE(?, status),
       shares_minted = COALESCE(?, shares_minted),
       raised_lamports = COALESCE(?, raised_lamports),
       updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    patch.raisePda ?? null,
    patch.collection ?? null,
    patch.status ?? null,
    patch.sharesMinted ?? null,
    patch.raisedLamports ?? null,
    id,
  );
}

/** Catalog demo so Accelerator is not empty before first founder draft. */
export function ensureDemoRaise(): ShareRaise {
  const live = ensureLiveRaise();
  if (live) return live;
  const db = getSqlite();
  const existing = db
    .prepare(`SELECT * FROM share_raises WHERE id = ?`)
    .get('raise_demo_p5') as RaiseRow | undefined;
  if (existing) {
    const raise = rowToRaise(existing);
    raise.demo = true;
    return raise;
  }
  db.prepare(
    `INSERT INTO share_raises (
      id, project_id, founder_wallet, status, price_lamports, share_supply,
      shares_minted, holder_pool_bps, founder_retained_bps, goal_lamports,
      raised_lamports, application_id, builder_score, pob_verified, attested_at
    ) VALUES (
      'raise_demo_p5', 'p5', '11111111111111111111111111111111', 'live',
      50000000, 200, 0, 2000, 8000, 10000000000, 0,
      'app_demo_aura', 92, 1, datetime('now')
    )`,
  ).run();
  const raise = getRaise('raise_demo_p5')!;
  raise.demo = true;
  return raise;
}
