import { getSqlite } from '../db/sqlite';
import type { EarnProgressSnapshot } from '../earnProgress';
import { createFreshProgress } from '../earnProgress';
import { getPassportLevel } from '../builderScore';
import type { PassportStats } from '../../types';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { passportSyncMessage } from './messages';

const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export type PublicPassportRow = {
  wallet: string;
  displayName: string;
  builderXp: number;
  contributionsCount: number;
  levelName: string;
  passport: PassportStats;
  verified: boolean;
  updatedAt: string;
  createdAt: string;
  completedTaskCount: number;
  scoutXp: number;
};

export type ReputationRecord = PublicPassportRow & {
  progress: EarnProgressSnapshot;
};

export function isValidSolanaWallet(wallet: string): boolean {
  return WALLET_RE.test(wallet.trim());
}

/** Cap forged XP even if signature is valid (sybil / bug guard) */
export const MAX_SYNC_BUILDER_XP = 250_000;
export const MAX_SYNC_SCOUT_XP = 50_000;

export function verifyWalletSignature(
  message: string,
  wallet: string,
  signatureBase58: string,
): boolean {
  try {
    const msg = new TextEncoder().encode(message);
    const sig = bs58.decode(signatureBase58);
    const pub = bs58.decode(wallet);
    if (sig.length !== 64 || pub.length !== 32) return false;
    return nacl.sign.detached.verify(msg, sig, pub);
  } catch {
    return false;
  }
}

export function verifyPassportSignature(
  wallet: string,
  updatedAt: number,
  signatureBase58: string,
): boolean {
  return verifyWalletSignature(
    passportSyncMessage(wallet, updatedAt),
    wallet,
    signatureBase58,
  );
}

function parseProgress(raw: string): EarnProgressSnapshot {
  try {
    const parsed = JSON.parse(raw) as Partial<EarnProgressSnapshot>;
    const fresh = createFreshProgress();
    return {
      ...fresh,
      ...parsed,
      passport: { ...fresh.passport, ...(parsed.passport || {}) },
      simBalances: { ...fresh.simBalances, ...(parsed.simBalances || {}) },
      lpDeposits: { ...(parsed.lpDeposits || {}) },
      completedTaskIds: Array.isArray(parsed.completedTaskIds)
        ? parsed.completedTaskIds
        : [],
      startedTaskIds: Array.isArray(parsed.startedTaskIds)
        ? parsed.startedTaskIds
        : [],
      discoveredIds: Array.isArray(parsed.discoveredIds) ? parsed.discoveredIds : [],
      completedQuestIds: Array.isArray(parsed.completedQuestIds)
        ? parsed.completedQuestIds
        : [],
      completedScoutIds: Array.isArray(parsed.completedScoutIds)
        ? parsed.completedScoutIds
        : [],
    };
  } catch {
    return createFreshProgress();
  }
}

function parsePassport(raw: string, fallback: PassportStats): PassportStats {
  try {
    return { ...fallback, ...(JSON.parse(raw) as PassportStats) };
  } catch {
    return fallback;
  }
}

function rowToRecord(row: {
  wallet: string;
  display_name: string;
  builder_xp: number;
  contributions_count: number;
  level_name: string;
  passport_json: string;
  progress_json: string;
  verified: number;
  updated_at: string;
  created_at: string;
}): ReputationRecord {
  const progress = parseProgress(row.progress_json);
  const passport = parsePassport(row.passport_json, progress.passport);
  return {
    wallet: row.wallet,
    displayName: row.display_name || '',
    builderXp: row.builder_xp,
    contributionsCount: row.contributions_count,
    levelName: row.level_name || getPassportLevel(row.builder_xp),
    passport,
    progress: { ...progress, passport, builderXp: row.builder_xp },
    verified: Boolean(row.verified),
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    completedTaskCount: progress.completedTaskIds.length,
    scoutXp: passport.scoutXp || 0,
  };
}

export function getReputation(wallet: string): ReputationRecord | null {
  const db = getSqlite();
  const row = db
    .prepare(
      `SELECT wallet, display_name, builder_xp, contributions_count, level_name,
              passport_json, progress_json, verified, updated_at, created_at
       FROM reputation_passports WHERE wallet = ?`,
    )
    .get(wallet.trim()) as
    | {
        wallet: string;
        display_name: string;
        builder_xp: number;
        contributions_count: number;
        level_name: string;
        passport_json: string;
        progress_json: string;
        verified: number;
        updated_at: string;
        created_at: string;
      }
    | undefined;
  if (!row) return null;
  return rowToRecord(row);
}

export function listLeaderboard(limit = 25): PublicPassportRow[] {
  const db = getSqlite();
  const rows = db
    .prepare(
      `SELECT wallet, display_name, builder_xp, contributions_count, level_name,
              passport_json, progress_json, verified, updated_at, created_at
       FROM reputation_passports
       WHERE builder_xp > 0
       ORDER BY builder_xp DESC, updated_at DESC
       LIMIT ?`,
    )
    .all(Math.min(100, Math.max(1, limit))) as {
    wallet: string;
    display_name: string;
    builder_xp: number;
    contributions_count: number;
    level_name: string;
    passport_json: string;
    progress_json: string;
    verified: number;
    updated_at: string;
    created_at: string;
  }[];

  return rows.map((r) => {
    const rec = rowToRecord(r);
    return {
      wallet: rec.wallet,
      displayName: rec.displayName,
      builderXp: rec.builderXp,
      contributionsCount: rec.contributionsCount,
      levelName: rec.levelName,
      passport: rec.passport,
      verified: rec.verified,
      updatedAt: rec.updatedAt,
      createdAt: rec.createdAt,
      completedTaskCount: rec.completedTaskCount,
      scoutXp: rec.scoutXp,
    };
  });
}

export function upsertReputation(input: {
  wallet: string;
  displayName?: string;
  progress: EarnProgressSnapshot;
  verified: boolean;
}): ReputationRecord {
  const db = getSqlite();
  const wallet = input.wallet.trim();
  const progress = input.progress;
  const levelName = getPassportLevel(progress.builderXp);
  const displayName = (input.displayName || '').trim().slice(0, 64);

  db.prepare(
    `INSERT INTO reputation_passports (
       wallet, display_name, builder_xp, contributions_count, level_name,
       passport_json, progress_json, verified, updated_at, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
     ON CONFLICT(wallet) DO UPDATE SET
       display_name = excluded.display_name,
       builder_xp = excluded.builder_xp,
       contributions_count = excluded.contributions_count,
       level_name = excluded.level_name,
       passport_json = excluded.passport_json,
       progress_json = excluded.progress_json,
       verified = CASE
         WHEN excluded.verified = 1 THEN 1
         ELSE reputation_passports.verified
       END,
       updated_at = datetime('now')`,
  ).run(
    wallet,
    displayName,
    Math.max(0, Math.floor(progress.builderXp)),
    Math.max(0, Math.floor(progress.contributionsCount)),
    levelName,
    JSON.stringify(progress.passport),
    JSON.stringify(progress),
    input.verified ? 1 : 0,
  );

  return getReputation(wallet)!;
}

export function recordProjectUpvote(projectId: string, wallet: string): {
  ok: boolean;
  already: boolean;
  count: number;
} {
  const db = getSqlite();
  const pid = projectId.trim().slice(0, 64);
  const w = wallet.trim();
  if (!pid || !isValidSolanaWallet(w)) {
    return { ok: false, already: false, count: 0 };
  }
  try {
    db.prepare(
      `INSERT INTO project_upvotes (project_id, wallet) VALUES (?, ?)`,
    ).run(pid, w);
  } catch {
    const count = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM project_upvotes WHERE project_id = ?`)
        .get(pid) as { c: number }
    ).c;
    return { ok: true, already: true, count };
  }
  const count = (
    db
      .prepare(`SELECT COUNT(*) AS c FROM project_upvotes WHERE project_id = ?`)
      .get(pid) as { c: number }
  ).c;
  return { ok: true, already: false, count };
}

export function getProjectUpvoteCount(projectId: string): number {
  const db = getSqlite();
  const row = db
    .prepare(`SELECT COUNT(*) AS c FROM project_upvotes WHERE project_id = ?`)
    .get(projectId.trim()) as { c: number };
  return row?.c || 0;
}
