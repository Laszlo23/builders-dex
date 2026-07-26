import { getSqlite } from '../db/sqlite';
import { isValidSolanaWallet } from '../reputation/repo';
import { INITIAL_SCOUT_MISSIONS } from '../../data/reputation';
import type { ScoutLeaderboardRow, ScoutSubmissionRow } from './types';

export type { ScoutLeaderboardRow, ScoutSubmissionRow };

const ANALYSIS_MIN = 40;

export function getMissionById(missionId: string) {
  return INITIAL_SCOUT_MISSIONS.find((m) => m.id === missionId) ?? null;
}

export function listSubmissionsForWallet(wallet: string): ScoutSubmissionRow[] {
  const w = wallet.trim();
  if (!isValidSolanaWallet(w)) return [];
  const rows = getSqlite()
    .prepare(
      `SELECT id, wallet, mission_id, project_id, analysis, evidence_url,
              reward_xp, early_call, created_at
       FROM scout_submissions WHERE wallet = ? ORDER BY created_at DESC`,
    )
    .all(w) as {
    id: number;
    wallet: string;
    mission_id: string;
    project_id: string;
    analysis: string;
    evidence_url: string;
    reward_xp: number;
    early_call: number;
    created_at: string;
  }[];
  return rows.map(mapRow);
}

export function listRecentSubmissions(limit = 20): ScoutSubmissionRow[] {
  const rows = getSqlite()
    .prepare(
      `SELECT id, wallet, mission_id, project_id, analysis, evidence_url,
              reward_xp, early_call, created_at
       FROM scout_submissions ORDER BY created_at DESC LIMIT ?`,
    )
    .all(Math.min(50, Math.max(1, limit))) as {
    id: number;
    wallet: string;
    mission_id: string;
    project_id: string;
    analysis: string;
    evidence_url: string;
    reward_xp: number;
    early_call: number;
    created_at: string;
  }[];
  return rows.map(mapRow);
}

export function listScoutLeaderboard(limit = 25): ScoutLeaderboardRow[] {
  const db = getSqlite();
  const fromSubs = db
    .prepare(
      `SELECT
         s.wallet AS wallet,
         COALESCE(r.display_name, '') AS display_name,
         COALESCE(r.level_name, 'Rookie Builder') AS level_name,
         COALESCE(r.verified, 0) AS verified,
         COALESCE(json_extract(r.passport_json, '$.scoutXp'), 0) AS passport_scout_xp,
         s.cnt AS submission_count,
         s.early AS early_calls,
         s.xp_sum AS submission_xp
       FROM (
         SELECT wallet,
                COUNT(*) AS cnt,
                SUM(early_call) AS early,
                SUM(reward_xp) AS xp_sum
         FROM scout_submissions
         GROUP BY wallet
       ) s
       LEFT JOIN reputation_passports r ON r.wallet = s.wallet`,
    )
    .all() as {
    wallet: string;
    display_name: string;
    level_name: string;
    verified: number;
    passport_scout_xp: number;
    submission_count: number;
    early_calls: number;
    submission_xp: number;
  }[];

  const fromPassports = db
    .prepare(
      `SELECT
         wallet,
         display_name,
         level_name,
         verified,
         COALESCE(json_extract(passport_json, '$.scoutXp'), 0) AS passport_scout_xp
       FROM reputation_passports
       WHERE COALESCE(json_extract(passport_json, '$.scoutXp'), 0) > 0`,
    )
    .all() as {
    wallet: string;
    display_name: string;
    level_name: string;
    verified: number;
    passport_scout_xp: number;
  }[];

  const byWallet = new Map<string, ScoutLeaderboardRow>();
  for (const r of fromSubs) {
    byWallet.set(r.wallet, {
      wallet: r.wallet,
      displayName: r.display_name || '',
      scoutXp: Math.max(
        Number(r.passport_scout_xp) || 0,
        Number(r.submission_xp) || 0,
      ),
      submissionCount: Number(r.submission_count) || 0,
      earlyCalls: Number(r.early_calls) || 0,
      levelName: r.level_name,
      verified: Boolean(r.verified),
    });
  }
  for (const r of fromPassports) {
    const existing = byWallet.get(r.wallet);
    if (existing) {
      existing.scoutXp = Math.max(existing.scoutXp, Number(r.passport_scout_xp) || 0);
      existing.displayName = existing.displayName || r.display_name || '';
      existing.verified = existing.verified || Boolean(r.verified);
      continue;
    }
    byWallet.set(r.wallet, {
      wallet: r.wallet,
      displayName: r.display_name || '',
      scoutXp: Number(r.passport_scout_xp) || 0,
      submissionCount: 0,
      earlyCalls: 0,
      levelName: r.level_name,
      verified: Boolean(r.verified),
    });
  }

  return [...byWallet.values()]
    .sort(
      (a, b) =>
        b.scoutXp - a.scoutXp ||
        b.submissionCount - a.submissionCount ||
        b.earlyCalls - a.earlyCalls,
    )
    .slice(0, Math.min(50, Math.max(1, limit)));
}

export function submitScoutCall(input: {
  wallet: string;
  missionId: string;
  projectId: string;
  analysis: string;
  evidenceUrl?: string;
  earlyCall: boolean;
}):
  | { ok: true; submission: ScoutSubmissionRow; already: boolean }
  | { ok: false; error: string } {
  const wallet = input.wallet.trim();
  const missionId = input.missionId.trim();
  const projectId = input.projectId.trim().slice(0, 64);
  const analysis = input.analysis.trim();
  const evidenceUrl = (input.evidenceUrl || '').trim().slice(0, 400);

  if (!isValidSolanaWallet(wallet)) {
    return { ok: false, error: 'Valid Solana wallet required' };
  }
  const mission = getMissionById(missionId);
  if (!mission) return { ok: false, error: 'Unknown mission' };
  if (!projectId) return { ok: false, error: 'projectId required' };
  if (analysis.length < ANALYSIS_MIN) {
    return {
      ok: false,
      error: `Analysis must be at least ${ANALYSIS_MIN} characters`,
    };
  }
  if (evidenceUrl && !/^https?:\/\//i.test(evidenceUrl)) {
    return { ok: false, error: 'Evidence URL must start with http(s)://' };
  }

  const existing = getSqlite()
    .prepare(
      `SELECT id, wallet, mission_id, project_id, analysis, evidence_url,
              reward_xp, early_call, created_at
       FROM scout_submissions WHERE wallet = ? AND mission_id = ?`,
    )
    .get(wallet, missionId) as
    | {
        id: number;
        wallet: string;
        mission_id: string;
        project_id: string;
        analysis: string;
        evidence_url: string;
        reward_xp: number;
        early_call: number;
        created_at: string;
      }
    | undefined;

  if (existing) {
    return { ok: true, submission: mapRow(existing), already: true };
  }

  const info = getSqlite()
    .prepare(
      `INSERT INTO scout_submissions (
         wallet, mission_id, project_id, analysis, evidence_url,
         reward_xp, early_call
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      wallet,
      missionId,
      projectId,
      analysis,
      evidenceUrl,
      mission.rewardXp,
      input.earlyCall ? 1 : 0,
    );

  const row = getSqlite()
    .prepare(
      `SELECT id, wallet, mission_id, project_id, analysis, evidence_url,
              reward_xp, early_call, created_at
       FROM scout_submissions WHERE id = ?`,
    )
    .get(Number(info.lastInsertRowid)) as {
    id: number;
    wallet: string;
    mission_id: string;
    project_id: string;
    analysis: string;
    evidence_url: string;
    reward_xp: number;
    early_call: number;
    created_at: string;
  };

  return { ok: true, submission: mapRow(row), already: false };
}

function mapRow(r: {
  id: number;
  wallet: string;
  mission_id: string;
  project_id: string;
  analysis: string;
  evidence_url: string;
  reward_xp: number;
  early_call: number;
  created_at: string;
}): ScoutSubmissionRow {
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
  };
}

export { ANALYSIS_MIN };
