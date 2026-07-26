import { getSqlite } from '../db/sqlite';

export function utcDayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function loadScoreSnapshot(
  dayKey: string,
): Map<string, number> {
  const rows = getSqlite()
    .prepare(
      `SELECT project_id, overall FROM radar_score_snapshots WHERE day_key = ?`,
    )
    .all(dayKey) as { project_id: string; overall: number }[];
  return new Map(rows.map((r) => [r.project_id, r.overall]));
}

export function saveScoreSnapshot(
  dayKey: string,
  scores: { projectId: string; overall: number }[],
): void {
  const db = getSqlite();
  const upsert = db.prepare(
    `INSERT INTO radar_score_snapshots (day_key, project_id, overall)
     VALUES (?, ?, ?)
     ON CONFLICT(day_key, project_id) DO UPDATE SET overall = excluded.overall`,
  );
  const tx = db.transaction(() => {
    for (const s of scores) {
      upsert.run(dayKey, s.projectId, Math.round(s.overall));
    }
  });
  tx();
}

export function previousDayKey(dayKey: string): string {
  const d = new Date(`${dayKey}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
