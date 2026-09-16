/**
 * Persist oracle daily / application bump caps in SQLite
 * (replaces in-memory Maps that reset on process restart).
 */
import { getSqlite } from './db/sqlite';

export function getTodayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getScoutBumpCount(wallet: string, dayKey = getTodayUtc()): number {
  const db = getSqlite();
  const row = db
    .prepare(
      `SELECT count FROM oracle_scout_bumps WHERE wallet = ? AND day_key = ?`,
    )
    .get(wallet, dayKey) as { count: number } | undefined;
  return row?.count ?? 0;
}

export function incrementScoutBump(wallet: string, dayKey = getTodayUtc()): number {
  const db = getSqlite();
  db.prepare(
    `INSERT INTO oracle_scout_bumps (wallet, day_key, count, updated_at)
     VALUES (?, ?, 1, datetime('now'))
     ON CONFLICT(wallet, day_key) DO UPDATE SET
       count = count + 1,
       updated_at = datetime('now')`,
  ).run(wallet, dayKey);
  return getScoutBumpCount(wallet, dayKey);
}

export function hasApplicationBump(wallet: string, applicationId: string): boolean {
  const db = getSqlite();
  const row = db
    .prepare(
      `SELECT 1 AS ok FROM oracle_application_bumps WHERE wallet = ? AND application_id = ?`,
    )
    .get(wallet, applicationId) as { ok: number } | undefined;
  return Boolean(row);
}

export function recordApplicationBump(wallet: string, applicationId: string): void {
  const db = getSqlite();
  db.prepare(
    `INSERT OR IGNORE INTO oracle_application_bumps (wallet, application_id, created_at)
     VALUES (?, ?, datetime('now'))`,
  ).run(wallet, applicationId);
}
