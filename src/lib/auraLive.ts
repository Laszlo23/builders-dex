import {
  AURA_BASE_ADDRESS,
  AURA_BASE_SUPPLY,
  AURA_USDC_V3_POOL,
} from '../data/crossChainRegistry';

export type AuraLiveRange = '1h' | '6h';

export type AuraLiveCandle = {
  time: number;
  value: number;
};

export type AuraLivePool = {
  address: string;
  quote: string;
  priceUsd: number;
  liquidityUsd: number;
  liquidityBase: number;
  liquidityQuote: number;
  volumeH24: number;
  buysH24: number;
  sellsH24: number;
  fdv: number;
  marketCap: number;
  url: string;
  createdAt: number | null;
};

export type AuraLiveSnapshot = {
  token: string;
  chain: 'base';
  supply: number;
  updatedAt: string;
  range: AuraLiveRange;
  primary: AuraLivePool | null;
  pools: AuraLivePool[];
  candles: AuraLiveCandle[];
};

type DexPair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  quoteToken?: { symbol?: string; address?: string };
  priceUsd?: string;
  liquidity?: { usd?: number; base?: number; quote?: number };
  volume?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
};

function mapPair(pair: DexPair): AuraLivePool | null {
  const address = pair.pairAddress;
  const priceUsd = Number(pair.priceUsd);
  if (!address || !Number.isFinite(priceUsd) || priceUsd <= 0) return null;
  return {
    address,
    quote: pair.quoteToken?.symbol || '—',
    priceUsd,
    liquidityUsd: Number(pair.liquidity?.usd) || 0,
    liquidityBase: Number(pair.liquidity?.base) || 0,
    liquidityQuote: Number(pair.liquidity?.quote) || 0,
    volumeH24: Number(pair.volume?.h24) || 0,
    buysH24: Number(pair.txns?.h24?.buys) || 0,
    sellsH24: Number(pair.txns?.h24?.sells) || 0,
    fdv: Number(pair.fdv) || 0,
    marketCap: Number(pair.marketCap) || Number(pair.fdv) || 0,
    url: pair.url || `https://dexscreener.com/base/${address.toLowerCase()}`,
    createdAt: pair.pairCreatedAt || null,
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return res.json();
}

export async function loadAuraLiveSnapshot(
  range: AuraLiveRange = '6h',
): Promise<AuraLiveSnapshot> {
  const token = AURA_BASE_ADDRESS;
  const dex = (await fetchJson(
    `https://api.dexscreener.com/latest/dex/tokens/${token}`,
  )) as { pairs?: DexPair[] };

  const basePairs = (dex.pairs || [])
    .filter((p) => p.chainId === 'base')
    .map(mapPair)
    .filter((p): p is AuraLivePool => Boolean(p))
    .sort((a, b) => b.liquidityUsd - a.liquidityUsd);

  const primary =
    basePairs.find((p) => p.address.toLowerCase() === AURA_USDC_V3_POOL.toLowerCase()) ||
    basePairs[0] ||
    null;

  const poolForChart = (primary?.address || AURA_USDC_V3_POOL).toLowerCase();
  const geckoPath =
    range === '1h'
      ? `minute?aggregate=1&limit=60`
      : `minute?aggregate=5&limit=72`;
  let candles: AuraLiveCandle[] = [];
  try {
    const gecko = (await fetchJson(
      `https://api.geckoterminal.com/api/v2/networks/base/pools/${poolForChart}/ohlcv/${geckoPath}`,
    )) as { data?: { attributes?: { ohlcv_list?: number[][] } } };
    const rows = gecko.data?.attributes?.ohlcv_list || [];
    const seen = new Set<number>();
    candles = rows
      .map((row) => {
        const time = Number(row[0]);
        const close = Number(row[4]);
        return { time, value: close };
      })
      .filter((c) => Number.isFinite(c.time) && Number.isFinite(c.value) && c.value > 0)
      .filter((c) => {
        if (seen.has(c.time)) return false;
        seen.add(c.time);
        return true;
      })
      .sort((a, b) => a.time - b.time);
  } catch {
    candles = [];
  }

  return {
    token,
    chain: 'base',
    supply: AURA_BASE_SUPPLY,
    updatedAt: new Date().toISOString(),
    range,
    primary,
    pools: basePairs,
    candles,
  };
}

export function usd(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  });
}
