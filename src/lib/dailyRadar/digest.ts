import type { DailyRadarPayload } from '../dailyRadar/types';
import { getSqlite } from '../db/sqlite';

function dayKeyUtc(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Push Daily Radar digest to TELEGRAM_RADAR_CHAT_ID (optional).
 * At most once per UTC day. Failures are logged, never throw to callers.
 */
export async function maybePushRadarDigest(
  payload: DailyRadarPayload,
  botToken?: string | null,
): Promise<{ sent: boolean; reason?: string }> {
  const chatId = process.env.TELEGRAM_RADAR_CHAT_ID?.trim();
  const token = (botToken || process.env.TELEGRAM_BOT_TOKEN || '').trim();
  if (!chatId || !token) {
    return { sent: false, reason: 'TELEGRAM_RADAR_CHAT_ID or bot token unset' };
  }

  const key = dayKeyUtc();
  const db = getSqlite();
  const already = db
    .prepare(`SELECT 1 AS ok FROM radar_digest_sent WHERE day_key = ?`)
    .get(key) as { ok: number } | undefined;
  if (already) return { sent: false, reason: 'already_sent_today' };

  const lines = [
    `📡 *${payload.greeting}* — ${payload.title}`,
    `_${payload.dateLabel}_`,
    '',
    ...payload.events.slice(0, 5).map((e) => `• ${e.text}`),
  ];
  if (payload.marketPulse?.length) {
    lines.push(
      '',
      '*Sector pulse*',
      ...payload.marketPulse
        .slice(0, 4)
        .map(
          (p) =>
            `· ${p.sector} ${p.changePct >= 0 ? '+' : ''}${p.changePct}%`,
        ),
    );
  }
  if (payload.trending?.length) {
    lines.push(
      '',
      '*Community trending*',
      ...payload.trending
        .slice(0, 3)
        .map((t) => `· $${t.ticker} — ${t.voteCount} votes`),
    );
  }
  lines.push('', '_Builders DEX · not curated for trade_');

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join('\n'),
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn('[radar-digest] send failed', res.status, body.slice(0, 200));
      return { sent: false, reason: `http_${res.status}` };
    }
    db.prepare(
      `INSERT OR IGNORE INTO radar_digest_sent (day_key) VALUES (?)`,
    ).run(key);
    return { sent: true };
  } catch (err) {
    console.warn('[radar-digest]', err);
    return { sent: false, reason: 'network_error' };
  }
}
