import {
  AURA_BASE_ADDRESS,
  AURA_BASE_DECIMALS,
  AURA_BASE_SUPPLY,
  AURA_DEV_WALLET,
  AURA_USDC_V3_POOL,
  BASE_USDC,
  BASE_WETH,
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

export type AuraDevWalletSnapshot = {
  address: string;
  label: string;
  live: boolean;
  eth: number;
  aura: number;
  usdc: number;
  weth: number;
  txCount: number;
  auraUsd: number;
  supplyShare: number;
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
  devWallet: AuraDevWalletSnapshot | null;
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

function hexToAmount(hex: string | undefined, decimals: number): number {
  if (!hex || hex === '0x') return 0;
  try {
    const value = BigInt(hex);
    const base = 10n ** BigInt(decimals);
    const whole = value / base;
    const frac = value % base;
    return Number(whole) + Number(frac) / Number(base);
  } catch {
    return 0;
  }
}

function balanceOfData(holder: string): string {
  return `0x70a08231${holder.replace(/^0x/, '').toLowerCase().padStart(64, '0')}`;
}

function baseRpcUrls(): string[] {
  const urls: string[] = [];
  for (const key of ['BASE_RPC_URL', 'AVANTIS_BASE_RPC'] as const) {
    const value = process.env[key]?.trim();
    if (value) urls.push(value);
  }
  const alchemy = process.env.ALCHEMY_API_KEY?.trim();
  if (alchemy) urls.push(`https://base-mainnet.g.alchemy.com/v2/${alchemy}`);
  urls.push(
    'https://base.publicnode.com',
    'https://base.llamarpc.com',
    'https://mainnet.base.org',
  );
  return [...new Set(urls)];
}

async function baseRpc(method: string, params: unknown[]): Promise<string> {
  let lastError: unknown;
  for (const url of baseRpcUrls()) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: AbortSignal.timeout(6_000),
      });
      if (!res.ok) continue;
      const body = (await res.json()) as { result?: string; error?: { message?: string } };
      if (typeof body.result === 'string') return body.result;
      lastError = body.error?.message || 'empty rpc result';
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError || 'base rpc failed'));
}

async function loadDevWallet(priceUsd: number): Promise<AuraDevWalletSnapshot | null> {
  const address = (process.env.AURA_DEV_WALLET || AURA_DEV_WALLET).trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(address)) return null;
  try {
    const token = AURA_BASE_ADDRESS;
    const [ethHex, auraHex, usdcHex, wethHex, txHex] = await Promise.all([
      baseRpc('eth_getBalance', [address, 'latest']),
      baseRpc('eth_call', [{ to: token, data: balanceOfData(address) }, 'latest']),
      baseRpc('eth_call', [{ to: BASE_USDC, data: balanceOfData(address) }, 'latest']),
      baseRpc('eth_call', [{ to: BASE_WETH, data: balanceOfData(address) }, 'latest']),
      baseRpc('eth_getTransactionCount', [address, 'latest']),
    ]);
    const aura = hexToAmount(auraHex, AURA_BASE_DECIMALS);
    return {
      address,
      label: 'founder',
      live: true,
      eth: hexToAmount(ethHex, 18),
      aura,
      usdc: hexToAmount(usdcHex, 6),
      weth: hexToAmount(wethHex, 18),
      txCount: Number.parseInt(txHex, 16) || 0,
      auraUsd: aura * (Number.isFinite(priceUsd) ? priceUsd : 0),
      supplyShare: aura / AURA_BASE_SUPPLY,
    };
  } catch {
    return {
      address,
      label: 'founder',
      live: false,
      eth: 0,
      aura: 0,
      usdc: 0,
      weth: 0,
      txCount: 0,
      auraUsd: 0,
      supplyShare: 0,
    };
  }
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

  const priceUsd = primary?.priceUsd || 0;
  const devWallet = await loadDevWallet(priceUsd);

  return {
    token,
    chain: 'base',
    supply: AURA_BASE_SUPPLY,
    updatedAt: new Date().toISOString(),
    range,
    primary,
    pools: basePairs,
    candles,
    devWallet,
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
