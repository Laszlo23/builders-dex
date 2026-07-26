import { getSqlite } from '../db/sqlite';

export type IndexCandidateRow = {
  id: number;
  source: string;
  telegramTokenId: number | null;
  ticker: string;
  name: string;
  chain: string;
  mint: string | null;
  description: string;
  voteCount: number;
  chatTitle: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
};

export function upsertIndexCandidateFromTelegram(input: {
  telegramTokenId: number;
  ticker: string;
  name: string;
  chain: string;
  mint: string | null;
  description: string;
  voteCount: number;
  chatTitle: string;
}): IndexCandidateRow {
  const db = getSqlite();
  const existing = db
    .prepare(
      `SELECT id FROM index_candidates WHERE telegram_token_id = ?`,
    )
    .get(input.telegramTokenId) as { id: number } | undefined;

  if (existing) {
    db.prepare(
      `UPDATE index_candidates SET
         ticker = ?, name = ?, chain = ?, mint = ?, description = ?,
         vote_count = ?, chat_title = ?, updated_at = datetime('now')
       WHERE id = ?`,
    ).run(
      input.ticker.slice(0, 16),
      input.name.slice(0, 120),
      (input.chain || 'solana').slice(0, 32),
      input.mint?.slice(0, 128) || null,
      (input.description || '').slice(0, 500),
      input.voteCount,
      (input.chatTitle || '').slice(0, 200),
      existing.id,
    );
    return getIndexCandidate(existing.id)!;
  }

  const info = db
    .prepare(
      `INSERT INTO index_candidates
        (source, telegram_token_id, ticker, name, chain, mint, description,
         vote_count, chat_title, status)
       VALUES ('telegram', ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    )
    .run(
      input.telegramTokenId,
      input.ticker.slice(0, 16),
      input.name.slice(0, 120),
      (input.chain || 'solana').slice(0, 32),
      input.mint?.slice(0, 128) || null,
      (input.description || '').slice(0, 500),
      input.voteCount,
      (input.chatTitle || '').slice(0, 200),
    );

  return getIndexCandidate(Number(info.lastInsertRowid))!;
}

export function getIndexCandidate(id: number): IndexCandidateRow | undefined {
  const r = getSqlite()
    .prepare(`SELECT * FROM index_candidates WHERE id = ?`)
    .get(id) as Record<string, unknown> | undefined;
  return r ? mapCandidate(r) : undefined;
}

export function listIndexCandidates(
  status?: string,
  limit = 50,
): IndexCandidateRow[] {
  const db = getSqlite();
  const lim = Math.min(100, Math.max(1, limit));
  if (status) {
    return (
      db
        .prepare(
          `SELECT * FROM index_candidates WHERE status = ?
           ORDER BY vote_count DESC, created_at DESC LIMIT ?`,
        )
        .all(status, lim) as Record<string, unknown>[]
    ).map(mapCandidate);
  }
  return (
    db
      .prepare(
        `SELECT * FROM index_candidates
         ORDER BY
           CASE status WHEN 'pending' THEN 0 WHEN 'reviewed' THEN 1 ELSE 2 END,
           vote_count DESC, created_at DESC
         LIMIT ?`,
      )
      .all(lim) as Record<string, unknown>[]
  ).map(mapCandidate);
}

export function setIndexCandidateStatus(
  id: number,
  status: IndexCandidateRow['status'],
): IndexCandidateRow | undefined {
  getSqlite()
    .prepare(
      `UPDATE index_candidates SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .run(status, id);
  return getIndexCandidate(id);
}

function mapCandidate(r: Record<string, unknown>): IndexCandidateRow {
  return {
    id: Number(r.id),
    source: String(r.source || 'telegram'),
    telegramTokenId:
      r.telegram_token_id == null ? null : Number(r.telegram_token_id),
    ticker: String(r.ticker || ''),
    name: String(r.name || ''),
    chain: String(r.chain || 'solana'),
    mint: r.mint == null ? null : String(r.mint),
    description: String(r.description || ''),
    voteCount: Number(r.vote_count) || 0,
    chatTitle: String(r.chat_title || ''),
    status: (String(r.status || 'pending') as IndexCandidateRow['status']),
    createdAt: String(r.created_at || ''),
    updatedAt: String(r.updated_at || ''),
  };
}
