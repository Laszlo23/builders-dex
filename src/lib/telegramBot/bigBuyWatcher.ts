import { getChain } from './chains';
import {
  getBotTokenForKey,
  listWatchableTokens,
  markTradeAnnounced,
  wasTradeAnnounced,
} from './repo';
import type { TokenProfile } from './types';

const poolCache = new Map<string, { pool: string | null; at: number }>();
const POOL_TTL_MS = 30 * 60_000;
/** Skip announcing historical trades the first time we see a token */
const warmedTokenIds = new Set<number>();

let timer: ReturnType<typeof setInterval> | null = null;
let running = false;

type GtTrade = {
  id: string;
  attributes?: {
    tx_hash?: string;
    kind?: string;
    volume_in_usd?: string;
    block_timestamp?: string;
  };
};

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function resolvePool(
  network: string,
  mint: string,
): Promise<string | null> {
  const cacheKey = `${network}:${mint}`;
  const cached = poolCache.get(cacheKey);
  if (cached && Date.now() - cached.at < POOL_TTL_MS) return cached.pool;

  try {
    const data = (await fetchJson(
      `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${encodeURIComponent(mint)}/pools?page=1`,
    )) as { data?: { attributes?: { address?: string } }[] };
    const pool = data.data?.[0]?.attributes?.address || null;
    poolCache.set(cacheKey, { pool, at: Date.now() });
    return pool;
  } catch (err) {
    console.warn('[big-buy] pool lookup failed', network, mint.slice(0, 8), err);
    poolCache.set(cacheKey, { pool: null, at: Date.now() });
    return null;
  }
}

async function fetchBigBuys(
  network: string,
  pool: string,
  minUsd: number,
): Promise<{ txHash: string; usd: number; kind: string }[]> {
  const url =
    `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${pool}/trades` +
    `?trade_volume_in_usd_greater_than=${Math.max(1, Math.floor(minUsd))}`;
  const data = (await fetchJson(url)) as { data?: GtTrade[] };
  const out: { txHash: string; usd: number; kind: string }[] = [];
  for (const t of data.data || []) {
    const txHash = t.attributes?.tx_hash;
    const kind = (t.attributes?.kind || '').toLowerCase();
    const usd = Number(t.attributes?.volume_in_usd || 0);
    if (!txHash || !Number.isFinite(usd) || usd < minUsd) continue;
    if (kind !== 'buy') continue;
    out.push({ txHash, usd, kind });
  }
  return out;
}

async function telegramSend(
  botToken: string,
  chatId: number,
  text: string,
): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`sendMessage ${res.status}: ${body.slice(0, 200)}`);
  }
}

function formatAlert(token: TokenProfile, usd: number, txHash: string): string {
  const chain = getChain(token.chain);
  const lines = [
    `🐋 *Big buy* on *$${token.ticker}* (${chain.label})`,
    `~$${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD`,
    token.name ? `${token.name}` : '',
    token.mint ? `Contract: \`${token.mint}\`` : '',
    `[Tx](${chain.explorerTx(txHash)})`,
  ].filter(Boolean);
  return lines.join('\n');
}

async function processToken(token: TokenProfile): Promise<number> {
  if (!token.mint) return 0;
  const chain = getChain(token.chain);
  if (!chain.geckoNetwork) return 0;
  const pool = await resolvePool(chain.geckoNetwork, token.mint);
  if (!pool) return 0;

  const minUsd = Number(token.big_buy_usd) > 0 ? Number(token.big_buy_usd) : 1000;
  const buys = await fetchBigBuys(chain.geckoNetwork, pool, minUsd);

  if (!warmedTokenIds.has(token.id)) {
    for (const buy of buys) {
      markTradeAnnounced(buy.txHash, token.id, buy.usd);
    }
    warmedTokenIds.add(token.id);
    return 0;
  }

  const botToken = getBotTokenForKey(token.serving_bot_key || 'platform');
  if (!botToken) return 0;

  let announced = 0;
  // Newest first from API — announce at most 3 per cycle per token
  for (const buy of buys.slice(0, 8)) {
    if (wasTradeAnnounced(buy.txHash)) continue;
    if (!markTradeAnnounced(buy.txHash, token.id, buy.usd)) continue;
    try {
      await telegramSend(
        botToken,
        token.chat_id,
        formatAlert(token, buy.usd, buy.txHash),
      );
      announced += 1;
      if (announced >= 3) break;
    } catch (err) {
      console.warn('[big-buy] announce failed', token.ticker, err);
    }
  }
  return announced;
}

async function tick(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const tokens = listWatchableTokens();
    for (const token of tokens) {
      try {
        await processToken(token);
      } catch (err) {
        console.warn('[big-buy] token error', token.ticker, err);
      }
      // gentle pacing for public API
      await new Promise((r) => setTimeout(r, 400));
    }
  } finally {
    running = false;
  }
}

export function startBigBuyWatcher(): void {
  if (process.env.TELEGRAM_BIG_BUY_DISABLE === '1') {
    console.log('[big-buy] disabled via TELEGRAM_BIG_BUY_DISABLE');
    return;
  }
  if (timer) return;
  const ms = Number(process.env.TELEGRAM_BIG_BUY_POLL_MS || 60_000);
  const interval = Number.isFinite(ms) && ms >= 20_000 ? ms : 60_000;
  console.log(`[big-buy] watcher every ${interval}ms`);
  // delay first tick so boot settles
  setTimeout(() => {
    void tick();
  }, 15_000);
  timer = setInterval(() => {
    void tick();
  }, interval);
}

export function stopBigBuyWatcher(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
