/**
 * Cubes live snapshot on Robinhood Chain — phases() + explorer, no fake Hood Jupiter.
 * Passport / builder_raise stay on Solana. No Hood wrap of AURA.
 */
import {
  CUBES_CONTRACT,
  CUBES_MINT_URL,
  CUBES_PAYOUT,
  CUBES_SQUARES_CONTRACT,
  HOOD_CHAIN_ID,
  HOOD_EXPLORER_URL,
  hoodExplorerTokenUrl,
  hoodRpcUrl,
} from '../data/hoodChain';

export type CubesGate = 'public' | 'allowlist' | 'squares' | 'unknown';

export type CubesPhaseSnapshot = {
  id: number;
  configured: boolean;
  open: boolean;
  gate: CubesGate;
  gateCode: number;
  merkleRoot: string;
  start: number;
  end: number;
  cap: number;
  minted: number;
  walletCap: number;
  priceWei: string;
  priceEth: number;
  squaresPerCube: number;
};

export type CubesPairQuote = {
  chainId: string;
  priceUsd: string | null;
  liquidityUsd: number;
  url: string;
} | null;

export type CubesLiveSnapshot = {
  chainId: number;
  contract: string;
  mintUrl: string;
  explorerUrl: string;
  squaresContract: string;
  payout: string;
  totalMinted: number;
  maxSupply: number;
  publicRemaining: number;
  paused: boolean;
  configFrozen: boolean;
  metadataFrozen: boolean;
  perWallet: number;
  reserve: number;
  reserveMinted: number;
  latestEnd: number;
  phases: CubesPhaseSnapshot[];
  pair: CubesPairQuote;
  fetchedAt: string;
};

const PHASES_SEL = '0x69eee005';
const PHASE_OPEN_SEL = '0x7496325a';
const SELECTORS = {
  totalMinted: '0xa2309ff8',
  maxSupply: '0x32cb6b0c',
  paused: '0x5c975abb',
  latestEnd: '0xccf87d88',
  publicRemaining: '0x869c66da',
  configFrozen: '0xbd1ffe2e',
  metadataFrozen: '0xfb3cc6c2',
  perWallet: '0xcd68bfb9',
  reserve: '0xcd3293de',
  reserveMinted: '0x4c81433f',
} as const;

const GATE_BY_CODE: Record<number, CubesGate> = {
  0: 'public',
  1: 'allowlist',
  2: 'squares',
};

function padUint(id: number): string {
  return id.toString(16).padStart(64, '0');
}

function word(hex: string, index: number): string {
  const h = hex.replace(/^0x/, '');
  return h.slice(index * 64, index * 64 + 64);
}

function wordBig(hex: string, index: number): bigint {
  const w = word(hex, index);
  if (!w) return 0n;
  return BigInt(`0x${w}`);
}

function decodePhase(id: number, hex: string, nowSec: number): CubesPhaseSnapshot {
  const gateCode = Number(wordBig(hex, 0));
  const merkleRoot = `0x${word(hex, 1)}`;
  const start = Number(wordBig(hex, 2));
  const end = Number(wordBig(hex, 3));
  const cap = Number(wordBig(hex, 4));
  const minted = Number(wordBig(hex, 5));
  const walletCap = Number(wordBig(hex, 6));
  const priceWei = wordBig(hex, 7);
  const squaresPerCube = Number(wordBig(hex, 8));
  const configured = start > 0 || end > 0 || cap > 0 || minted > 0 || priceWei > 0n;
  return {
    id,
    configured,
    open: configured && nowSec >= start && nowSec < end,
    gate: GATE_BY_CODE[gateCode] ?? 'unknown',
    gateCode,
    merkleRoot,
    start,
    end,
    cap,
    minted,
    walletCap,
    priceWei: priceWei.toString(),
    priceEth: Number(priceWei) / 1e18,
    squaresPerCube,
  };
}

async function hoodRpc(method: string, params: unknown[]): Promise<string> {
  const urls = [...new Set([hoodRpcUrl(), 'https://rpc.mainnet.chain.robinhood.com'])];
  let lastError: unknown;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'user-agent': 'BuildersDEX/hood-live',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) continue;
      const body = (await res.json()) as { result?: string; error?: { message?: string } };
      if (typeof body.result === 'string') return body.result;
      lastError = body.error?.message || 'empty rpc result';
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError || 'hood rpc failed'));
}

async function ethCall(data: string): Promise<string> {
  return hoodRpc('eth_call', [{ to: CUBES_CONTRACT, data }, 'latest']);
}

function hexToInt(hex: string | undefined): number {
  if (!hex || hex === '0x') return 0;
  try {
    return Number(BigInt(hex));
  } catch {
    return 0;
  }
}

async function loadDexPair(): Promise<CubesPairQuote> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${CUBES_CONTRACT}`,
      { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(6_000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      pairs?: Array<{ chainId?: string; priceUsd?: string; liquidity?: { usd?: number }; url?: string }>;
    };
    const pair = data.pairs?.[0];
    if (!pair) return null;
    return {
      chainId: pair.chainId || 'unknown',
      priceUsd: pair.priceUsd ?? null,
      liquidityUsd: Number(pair.liquidity?.usd) || 0,
      url: pair.url || `https://dexscreener.com/search?q=${CUBES_CONTRACT}`,
    };
  } catch {
    return null;
  }
}

export async function loadCubesLiveSnapshot(): Promise<CubesLiveSnapshot> {
  const nowSec = Math.floor(Date.now() / 1000);
  const scalarKeys = Object.keys(SELECTORS) as Array<keyof typeof SELECTORS>;
  const scalarCalls = await Promise.all(scalarKeys.map((key) => ethCall(SELECTORS[key])));
  const scalars = Object.fromEntries(
    scalarKeys.map((key, i) => [key, hexToInt(scalarCalls[i])]),
  ) as Record<keyof typeof SELECTORS, number>;

  const phaseIds = [0, 1, 2, 3, 4];
  const phaseHexes = await Promise.all(
    phaseIds.map((id) => ethCall(`${PHASES_SEL}${padUint(id)}`)),
  );
  const openFlags = await Promise.all(
    phaseIds.map(async (id) => {
      try {
        return hexToInt(await ethCall(`${PHASE_OPEN_SEL}${padUint(id)}`)) === 1;
      } catch {
        return false;
      }
    }),
  );

  const phases = phaseHexes
    .map((hex, i) => {
      const phase = decodePhase(phaseIds[i]!, hex, nowSec);
      if (openFlags[i]) phase.open = true;
      return phase;
    })
    .filter((p) => p.configured);

  const pair = await loadDexPair();

  return {
    chainId: HOOD_CHAIN_ID,
    contract: CUBES_CONTRACT,
    mintUrl: CUBES_MINT_URL,
    explorerUrl: hoodExplorerTokenUrl(CUBES_CONTRACT),
    squaresContract: CUBES_SQUARES_CONTRACT,
    payout: CUBES_PAYOUT,
    totalMinted: scalars.totalMinted,
    maxSupply: scalars.maxSupply,
    publicRemaining: scalars.publicRemaining,
    paused: scalars.paused === 1,
    configFrozen: scalars.configFrozen === 1,
    metadataFrozen: scalars.metadataFrozen === 1,
    perWallet: scalars.perWallet,
    reserve: scalars.reserve,
    reserveMinted: scalars.reserveMinted,
    latestEnd: scalars.latestEnd,
    phases,
    pair,
    fetchedAt: new Date().toISOString(),
  };
}

export function cubesExplorerHome(): string {
  return HOOD_EXPLORER_URL;
}
