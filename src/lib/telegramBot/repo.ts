import { getSqlite } from '../db/sqlite';
import type {
  ChatRow,
  TokenProfile,
  TokenProfileInput,
  TokenStatus,
  TrendingTokenRow,
} from './types';
import { defaultBigBuyUsd } from './validators';

function trendThreshold(): number {
  const n = Number(process.env.TELEGRAM_TREND_THRESHOLD || 25);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 25;
}

export function getTrendThreshold(): number {
  return trendThreshold();
}

export function upsertChat(
  chatId: number,
  title: string,
  servingBotKey?: string,
): ChatRow {
  const db = getSqlite();
  const key = servingBotKey || 'platform';
  db.prepare(
    `INSERT INTO chats (chat_id, title, serving_bot_key) VALUES (?, ?, ?)
     ON CONFLICT(chat_id) DO UPDATE SET
       title = excluded.title,
       serving_bot_key = COALESCE(excluded.serving_bot_key, chats.serving_bot_key)`,
  ).run(chatId, title.slice(0, 200), key);
  return db
    .prepare(`SELECT * FROM chats WHERE chat_id = ?`)
    .get(chatId) as ChatRow;
}

export function createTokenProfile(input: TokenProfileInput): TokenProfile {
  const db = getSqlite();
  const botKey = input.servingBotKey || 'platform';
  upsertChat(input.chatId, input.chatTitle, botKey);
  const ticker = normalizeTicker(input.ticker);
  const bigBuy = input.bigBuyUsd ?? defaultBigBuyUsd();
  const info = db
    .prepare(
      `INSERT INTO token_profiles
        (chat_id, ticker, name, chain, mint, description, logo_url, banner_url,
         website, twitter, telegram_url, discord, big_buy_usd, serving_bot_key,
         created_by_user_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'candidate')`,
    )
    .run(
      input.chatId,
      ticker,
      input.name.slice(0, 80),
      (input.chain || 'solana').slice(0, 32),
      input.mint,
      input.description.slice(0, 500),
      input.logoUrl.slice(0, 500),
      input.bannerUrl.slice(0, 500),
      input.website?.slice(0, 500) || null,
      input.twitter?.slice(0, 500) || null,
      input.telegramUrl?.slice(0, 500) || null,
      input.discord?.slice(0, 500) || null,
      bigBuy,
      botKey,
      input.createdByUserId,
    );
  return getTokenById(Number(info.lastInsertRowid))!;
}

export function getTokenById(id: number): TokenProfile | undefined {
  return getSqlite()
    .prepare(`SELECT * FROM token_profiles WHERE id = ?`)
    .get(id) as TokenProfile | undefined;
}

export function getTokenByTicker(
  chatId: number,
  ticker: string,
): TokenProfile | undefined {
  return getSqlite()
    .prepare(
      `SELECT * FROM token_profiles WHERE chat_id = ? AND ticker = ?`,
    )
    .get(chatId, normalizeTicker(ticker)) as TokenProfile | undefined;
}

/** Owner's token by ticker (DM drafts or already-linked communities). */
export function getOwnedTokenByTicker(
  userId: number,
  ticker: string,
): TokenProfile | undefined {
  return getSqlite()
    .prepare(
      `SELECT * FROM token_profiles
       WHERE created_by_user_id = ? AND ticker = ? AND status != 'closed'
       ORDER BY
         CASE WHEN status = 'candidate' THEN 0 ELSE 1 END,
         created_at DESC
       LIMIT 1`,
    )
    .get(userId, normalizeTicker(ticker)) as TokenProfile | undefined;
}

export function listTokensOwnedByUser(userId: number): TokenProfile[] {
  return getSqlite()
    .prepare(
      `SELECT * FROM token_profiles
       WHERE created_by_user_id = ? AND status != 'closed'
       ORDER BY created_at DESC`,
    )
    .all(userId) as TokenProfile[];
}

/**
 * Move a privately created token into a community chat for voting.
 * Fails if the ticker is already taken in the target chat.
 */
export function attachTokenToChat(
  tokenId: number,
  chatId: number,
  chatTitle: string,
  servingBotKey?: string,
): TokenProfile | undefined {
  const token = getTokenById(tokenId);
  if (!token) return undefined;
  if (token.chat_id === chatId) return token;

  const clash = getTokenByTicker(chatId, token.ticker);
  if (clash && clash.id !== tokenId) {
    throw new Error('ticker_taken');
  }

  upsertChat(chatId, chatTitle, servingBotKey || token.serving_bot_key);
  getSqlite()
    .prepare(`UPDATE token_profiles SET chat_id = ? WHERE id = ?`)
    .run(chatId, tokenId);
  return getTokenById(tokenId);
}

export function listTokensForChat(chatId: number): TokenProfile[] {
  return getSqlite()
    .prepare(
      `SELECT * FROM token_profiles
       WHERE chat_id = ? AND status != 'closed'
       ORDER BY vote_count DESC, created_at DESC`,
    )
    .all(chatId) as TokenProfile[];
}

export function setTokenStatus(
  tokenId: number,
  status: TokenStatus,
): TokenProfile | undefined {
  const db = getSqlite();
  if (status === 'trending') {
    db.prepare(
      `UPDATE token_profiles
       SET status = ?, trending_at = COALESCE(trending_at, datetime('now'))
       WHERE id = ?`,
    ).run(status, tokenId);
  } else {
    db.prepare(`UPDATE token_profiles SET status = ? WHERE id = ?`).run(
      status,
      tokenId,
    );
  }
  return getTokenById(tokenId);
}

export type VoteResult =
  | { ok: true; token: TokenProfile; becameTrending: boolean }
  | {
      ok: false;
      reason: 'not_found' | 'not_voting' | 'duplicate' | 'cooldown' | 'closed';
      nextVoteAt?: string;
    };

/** Hours between votes for the same user + token (default 3). */
export function getVoteCooldownHours(): number {
  const n = Number(process.env.TELEGRAM_VOTE_COOLDOWN_HOURS || 3);
  return Number.isFinite(n) && n > 0 ? n : 3;
}

export function getVoteCooldownMs(): number {
  return getVoteCooldownHours() * 60 * 60 * 1000;
}

function parseSqliteUtc(ts: string): number {
  // SQLite datetime('now') is UTC without timezone suffix
  const normalized = /Z$|[+-]\d{2}:?\d{2}$/.test(ts) ? ts : `${ts.replace(' ', 'T')}Z`;
  const ms = Date.parse(normalized);
  return Number.isFinite(ms) ? ms : 0;
}

export type VoteCooldownInfo = {
  onCooldown: boolean;
  lastVotedAt: string | null;
  nextVoteAt: string | null;
};

export function getVoteCooldown(
  tokenId: number,
  telegramUserId: number,
): VoteCooldownInfo {
  const row = getSqlite()
    .prepare(
      `SELECT created_at FROM votes
       WHERE token_id = ? AND telegram_user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .get(tokenId, telegramUserId) as { created_at: string } | undefined;

  if (!row?.created_at) {
    return { onCooldown: false, lastVotedAt: null, nextVoteAt: null };
  }

  const lastMs = parseSqliteUtc(row.created_at);
  const nextMs = lastMs + getVoteCooldownMs();
  const onCooldown = Date.now() < nextMs;
  return {
    onCooldown,
    lastVotedAt: row.created_at,
    nextVoteAt: onCooldown ? new Date(nextMs).toISOString() : null,
  };
}

function applyVote(
  token: TokenProfile,
  telegramUserId: number,
  username: string | null,
): VoteResult {
  if (token.status === 'closed') return { ok: false, reason: 'closed' };
  if (token.status === 'candidate') return { ok: false, reason: 'not_voting' };
  if (token.status !== 'voting' && token.status !== 'trending') {
    return { ok: false, reason: 'not_voting' };
  }

  const cooldown = getVoteCooldown(token.id, telegramUserId);
  if (cooldown.onCooldown) {
    return {
      ok: false,
      reason: 'cooldown',
      nextVoteAt: cooldown.nextVoteAt || undefined,
    };
  }

  const db = getSqlite();
  try {
    db.prepare(
      `INSERT INTO votes (token_id, telegram_user_id, username)
       VALUES (?, ?, ?)`,
    ).run(token.id, telegramUserId, username);
  } catch (err: unknown) {
    // Pre-migration DBs may still enforce UNIQUE(token_id, telegram_user_id)
    const msg = String((err as { message?: string })?.message || err);
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      const again = getVoteCooldown(token.id, telegramUserId);
      return {
        ok: false,
        reason: 'cooldown',
        nextVoteAt: again.nextVoteAt || undefined,
      };
    }
    throw err;
  }

  db.prepare(
    `UPDATE token_profiles SET vote_count = vote_count + 1 WHERE id = ?`,
  ).run(token.id);

  let updated = getTokenById(token.id)!;
  let becameTrending = false;
  const threshold = trendThreshold();
  if (updated.status === 'voting' && updated.vote_count >= threshold) {
    setTokenStatus(updated.id, 'trending');
    updated = getTokenById(updated.id)!;
    becameTrending = true;
  }

  return { ok: true, token: updated, becameTrending };
}

export function castVote(input: {
  chatId: number;
  ticker: string;
  telegramUserId: number;
  username: string | null;
  /** When set, resolve ticker for this owner if not found in chat (DM status cards). */
  ownerUserId?: number | null;
}): VoteResult {
  let token = getTokenByTicker(input.chatId, input.ticker);
  if (!token && input.ownerUserId != null) {
    token = getOwnedTokenByTicker(input.ownerUserId, input.ticker);
  }
  if (!token) return { ok: false, reason: 'not_found' };
  return applyVote(token, input.telegramUserId, input.username);
}

export function castVoteByTokenId(input: {
  tokenId: number;
  telegramUserId: number;
  username: string | null;
}): VoteResult {
  const token = getTokenById(input.tokenId);
  if (!token) return { ok: false, reason: 'not_found' };
  return applyVote(token, input.telegramUserId, input.username);
}

/** True when the user is still inside the vote cooldown window. */
export function hasUserVoted(tokenId: number, telegramUserId: number): boolean {
  return getVoteCooldown(tokenId, telegramUserId).onCooldown;
}

/**
 * Tokens open for Mini App voting.
 * Only filter by chatId when it is a group/supergroup (negative Telegram id).
 * Private chat ids (positive) are ignored so Menu / DM opens still list
 * community tokens after they were attached to a group.
 */
export function listVotableTokens(chatId?: number | null): TrendingTokenRow[] {
  const db = getSqlite();
  const groupChatId =
    chatId != null && Number.isFinite(chatId) && chatId < 0 ? chatId : null;

  if (groupChatId != null) {
    return db
      .prepare(
        `SELECT t.*, c.title AS chat_title
         FROM token_profiles t
         JOIN chats c ON c.chat_id = t.chat_id
         WHERE t.chat_id = ?
           AND t.status IN ('voting', 'trending')
         ORDER BY t.vote_count DESC, t.created_at DESC`,
      )
      .all(groupChatId) as TrendingTokenRow[];
  }
  return db
    .prepare(
      `SELECT t.*, c.title AS chat_title
       FROM token_profiles t
       JOIN chats c ON c.chat_id = t.chat_id
       WHERE t.status IN ('voting', 'trending')
       ORDER BY t.vote_count DESC, t.trending_at DESC, t.created_at DESC
       LIMIT 100`,
    )
    .all() as TrendingTokenRow[];
}

export function listTrending(limit = 50): TrendingTokenRow[] {
  return getSqlite()
    .prepare(
      `SELECT t.*, c.title AS chat_title
       FROM token_profiles t
       JOIN chats c ON c.chat_id = t.chat_id
       WHERE t.status = 'trending'
       ORDER BY t.trending_at DESC, t.vote_count DESC
       LIMIT ?`,
    )
    .all(limit) as TrendingTokenRow[];
}

export function listTokensByChatId(chatId: number): TrendingTokenRow[] {
  return getSqlite()
    .prepare(
      `SELECT t.*, c.title AS chat_title
       FROM token_profiles t
       JOIN chats c ON c.chat_id = t.chat_id
       WHERE t.chat_id = ?
       ORDER BY t.created_at DESC`,
    )
    .all(chatId) as TrendingTokenRow[];
}

/** Tokens with a mint that should receive big-buy alerts */
export function listWatchableTokens(): TokenProfile[] {
  return getSqlite()
    .prepare(
      `SELECT * FROM token_profiles
       WHERE mint IS NOT NULL AND mint != ''
         AND status IN ('voting', 'trending', 'candidate')
       ORDER BY id ASC`,
    )
    .all() as TokenProfile[];
}

export function wasTradeAnnounced(txHash: string): boolean {
  const row = getSqlite()
    .prepare(`SELECT 1 AS ok FROM announced_trades WHERE tx_hash = ?`)
    .get(txHash) as { ok: number } | undefined;
  return Boolean(row);
}

export function markTradeAnnounced(
  txHash: string,
  tokenId: number,
  usdAmount: number,
): boolean {
  try {
    getSqlite()
      .prepare(
        `INSERT INTO announced_trades (tx_hash, token_id, usd_amount)
         VALUES (?, ?, ?)`,
      )
      .run(txHash, tokenId, usdAmount);
    return true;
  } catch {
    return false;
  }
}

export function getBotTokenForKey(botKey: string): string | null {
  if (botKey === 'platform') {
    return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
  }
  const row = getSqlite()
    .prepare(
      `SELECT token FROM registered_bots WHERE id = ? AND active = 1`,
    )
    .get(botKey) as { token: string } | undefined;
  return row?.token || null;
}

export function normalizeTicker(raw: string): string {
  return raw.trim().replace(/^\$/, '').toUpperCase().slice(0, 16);
}
