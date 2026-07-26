import { getSqlite } from '../db/sqlite';
import type { ScoutSubmissionRow } from './types';

export type ScoutOutcome = 'pending' | 'hit' | 'miss' | 'neutral';

export type CurationStatusForOutcome =
  | 'pending'
  | 'reviewed'
  | 'approved'
  | 'rejected'
  | 'featured'
  | string;

function daysBetween(isoCreated: string, now = new Date()): number {
  const created = new Date(
    isoCreated.includes('T') ? isoCreated : `${isoCreated.replace(' ', 'T')}Z`,
  );
  if (Number.isNaN(created.getTime())) return 0;
  return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Hit = project cleared into network / featured after the call.
 * Miss = rejected.
 * Neutral = still under evaluation after the window.
 */
export function outcomeFromCuration(
  status: CurationStatusForOutcome | undefined,
): ScoutOutcome {
  if (!status) return 'neutral';
  if (status === 'rejected') return 'miss';
  if (
    status === 'approved' ||
    status === 'featured' ||
    status === 'curated' ||
    status === 'entered' ||
    status === 'live'
  ) {
    return 'hit';
  }
  return 'neutral';
}

type RawSub = {
  id: number;
  wallet: string;
  mission_id: string;
  project_id: string;
  analysis: string;
  evidence_url: string;
  reward_xp: number;
  early_call: number;
  created_at: string;
  outcome_30d: string | null;
  outcome_90d: string | null;
  scored_at_30d: string | null;
  scored_at_90d: string | null;
};

/**
 * Score scout calls that have aged past 30d / 90d using current catalog curation.
 * Safe to run on every radar / leaderboard request (idempotent).
 */
export function resolveScoutOutcomes(
  curationByProjectId: Map<string, string>,
  now = new Date(),
): { scored30: number; scored90: number } {
  const db = getSqlite();
  const rows = db
    .prepare(
      `SELECT id, wallet, mission_id, project_id, analysis, evidence_url,
              reward_xp, early_call, created_at,
              outcome_30d, outcome_90d, scored_at_30d, scored_at_90d
       FROM scout_submissions`,
    )
    .all() as RawSub[];

  const upd30 = db.prepare(
    `UPDATE scout_submissions
     SET outcome_30d = ?, scored_at_30d = datetime('now')
     WHERE id = ? AND (outcome_30d IS NULL OR outcome_30d = '' OR outcome_30d = 'pending')`,
  );
  const upd90 = db.prepare(
    `UPDATE scout_submissions
     SET outcome_90d = ?, scored_at_90d = datetime('now')
     WHERE id = ? AND (outcome_90d IS NULL OR outcome_90d = '' OR outcome_90d = 'pending')`,
  );

  let scored30 = 0;
  let scored90 = 0;

  for (const row of rows) {
    const age = daysBetween(row.created_at, now);
    const status = curationByProjectId.get(row.project_id);
    const outcome = outcomeFromCuration(status);

    if (age >= 30 && (!row.outcome_30d || row.outcome_30d === 'pending')) {
      upd30.run(outcome, row.id);
      scored30 += 1;
    }
    if (age >= 90 && (!row.outcome_90d || row.outcome_90d === 'pending')) {
      upd90.run(outcome, row.id);
      scored90 += 1;
    }
  }

  return { scored30, scored90 };
}

/** Hit rate from scored 30d outcomes (0–100). Null if none scored yet. */
export function accuracyForWallet(wallet: string): number | null {
  const rows = getSqlite()
    .prepare(
      `SELECT outcome_30d FROM scout_submissions
       WHERE wallet = ? AND outcome_30d IS NOT NULL AND outcome_30d != '' AND outcome_30d != 'pending'`,
    )
    .all(wallet.trim()) as { outcome_30d: string }[];
  if (!rows.length) return null;
  const hits = rows.filter((r) => r.outcome_30d === 'hit').length;
  const misses = rows.filter((r) => r.outcome_30d === 'miss').length;
  const denom = hits + misses;
  if (denom === 0) return null;
  return Math.round((hits / denom) * 100);
}

export function mapSubmissionWithOutcomes(r: RawSub): ScoutSubmissionRow {
  return {
    id: r.id,
    wallet: r.wallet,
    missionId: r.mission_id,
    projectId: r.project_id,
    analysis: r.analysis,
    evidenceUrl: r.evidence_url,
    rewardXp: r.reward_xp,
    earlyCall: Boolean(r.early_call),
    createdAt: r.created_at,
    outcome30d: (r.outcome_30d as ScoutOutcome | null) || null,
    outcome90d: (r.outcome_90d as ScoutOutcome | null) || null,
    scoredAt30d: r.scored_at_30d,
    scoredAt90d: r.scored_at_90d,
  };
}
