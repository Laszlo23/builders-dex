/**
 * $BUILD on Robinhood Chain — Bankr Doppler ERC-20, published 2026-09-22.
 * Address is live. LP lock, DexScreener pool, and Square-loop fee volume are not.
 * Do not invent a lock, APR, pair, or in-app Bankr/x402 swap.
 */
import { CCFF00_NFT } from './ccff00Wallet';
import {
  HOOD_CHAIN_ID,
  HOOD_EXPLORER_URL,
  hoodDexScreenerTokenUrl,
  hoodExplorerTokenUrl,
} from './hoodChain';
import {
  ACTIVATION_REGISTRY_PUBLISHED,
  FEE_SPLITTER_PUBLISHED,
  STALL_VAULT_PUBLISHED,
} from './squareLoopContracts';

export const BUILD_TOKEN_SYMBOL = 'BUILD';
export const BUILD_TOKEN_NAME = 'Build';
export const BUILD_TOKEN_DECIMALS = 18;
export const BUILD_PAIR_LABEL = 'Unindexed';
export const BUILD_PAIR_FALLBACK = 'WETH or USDG via Bankr';

/** Blockscout checksum. Bankr DopplerERC20V1 clone on 4663. */
export const BUILD_TOKEN_PUBLISHED =
  '0x7bf8a47DAf2c0032fE6FcDAB4dd2DF37b5Eeaba3' as const;
export const BUILD_DEPLOY_TX =
  '0x7d2c85844df65222a570eaf6a307ba03ebabd0b8102593fea198704be03c218c' as const;
export const BUILD_IMPLEMENTATION_NAME = 'DopplerERC20V1';
export const BUILD_IMPLEMENTATION =
  '0x3Be8B97Fd0e713B5aBE0649Fa830223B6B4BC599' as const;
export const BUILD_CREATOR = '0x1B37D3a72082029c44B35B604Ea473617580b69a' as const;
export const BUILD_BANKR_TOKEN_URL = `https://bankr.bot/token/${BUILD_TOKEN_PUBLISHED}`;
export const BUILD_BANKR_TRADE_URL = `https://bankr.bot/terminal/trade?chain=robinhood&out=${BUILD_TOKEN_PUBLISHED}`;
export const BUILD_DISCLAIMER =
  'Bankr Doppler ERC-20 on Hood 4663. Not affiliated with Bankr or Robinhood Markets. No LP lock published. DexScreener has no pair yet. NFA.';

const ZERO = '0x0000000000000000000000000000000000000000';

function envOrNull(key: string): string | null {
  if (typeof process !== 'undefined' && process.env?.[key]?.trim()) {
    return process.env[key]!.trim();
  }
  try {
    const vite = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
    if (vite?.[key]?.trim()) return vite[key].trim();
    if (vite?.[`VITE_${key}`]?.trim()) return vite[`VITE_${key}`].trim();
  } catch {
    /* ignore */
  }
  return null;
}

function optionalAddress(raw: string | null | undefined): `0x${string}` | null {
  const value = (raw || '').trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) return null;
  if (value.toLowerCase() === ZERO) return null;
  return value as `0x${string}`;
}

export const BUILD_TOKEN_ADDRESS =
  optionalAddress(envOrNull('BUILD_TOKEN_ADDRESS') || envOrNull('VITE_BUILD_TOKEN_ADDRESS')) ??
  BUILD_TOKEN_PUBLISHED;
export const ACTIVATION_REGISTRY_ADDRESS =
  optionalAddress(
    envOrNull('ACTIVATION_REGISTRY_ADDRESS') || envOrNull('VITE_ACTIVATION_REGISTRY_ADDRESS'),
  ) ?? ACTIVATION_REGISTRY_PUBLISHED;
export const STALL_VAULT_ADDRESS =
  optionalAddress(envOrNull('STALL_VAULT_ADDRESS') || envOrNull('VITE_STALL_VAULT_ADDRESS')) ??
  STALL_VAULT_PUBLISHED;
export const FEE_SPLITTER_ADDRESS =
  optionalAddress(envOrNull('FEE_SPLITTER_ADDRESS') || envOrNull('VITE_FEE_SPLITTER_ADDRESS')) ??
  FEE_SPLITTER_PUBLISHED;
export const BUILD_LOCK_TX = envOrNull('BUILD_LOCK_TX') || envOrNull('VITE_BUILD_LOCK_TX');
export const BUILD_LOCK_URL = envOrNull('BUILD_LOCK_URL') || envOrNull('VITE_BUILD_LOCK_URL');
export const BUILD_POOLS_TRADE_URL =
  envOrNull('BUILD_POOLS_TRADE_URL') || 'https://pools.trade';
export const BUILD_CLANKER_URL = envOrNull('BUILD_CLANKER_URL') || 'https://www.clanker.world';

export type BuildLaunchStatus = 'planned' | 'live';

export type BuildLaunchpadId = 'bankr' | 'pools-trade' | 'clanker';

export type BuildLaunchpad = {
  id: BuildLaunchpadId;
  name: string;
  href: string;
  role: 'primary' | 'backup' | 'unused';
  model: string;
};

export const BUILD_LAUNCHPADS: BuildLaunchpad[] = [
  {
    id: 'bankr',
    name: 'Bankr Doppler',
    href: BUILD_BANKR_TOKEN_URL,
    role: 'primary',
    model:
      'How this mint actually launched. DopplerERC20V1 clone on Hood. Trade on Bankr. We do not run their router, claim their fees, or embed x402.',
  },
  {
    id: 'pools-trade',
    name: 'Pools.trade Crowd Launch',
    href: BUILD_POOLS_TRADE_URL,
    role: 'unused',
    model: 'Earlier intended door. Not how this mint shipped. Uniswap Labs crowd window + locked v4 LP.',
  },
  {
    id: 'clanker',
    name: 'Clanker',
    href: BUILD_CLANKER_URL,
    role: 'unused',
    model: 'Earlier backup door. Not this mint. Locked Uniswap pool with a creator-fee remainder.',
  },
];

export function launchpadById(id: BuildLaunchpadId): BuildLaunchpad {
  const found = BUILD_LAUNCHPADS.find((item) => item.id === id);
  if (found) return found;
  const _never: never = id;
  return _never;
}

export function buildLaunchStatus(): BuildLaunchStatus {
  return BUILD_TOKEN_ADDRESS ? 'live' : 'planned';
}

export function isBuildLoopLive(): boolean {
  return Boolean(ACTIVATION_REGISTRY_ADDRESS && STALL_VAULT_ADDRESS && FEE_SPLITTER_ADDRESS);
}

export function explorerAddress(address: string): string {
  return `${HOOD_EXPLORER_URL}/address/${address}`;
}

export function explorerTx(hash: string): string {
  return `${HOOD_EXPLORER_URL}/tx/${hash}`;
}

export function explorerToken(address: string): string {
  return hoodExplorerTokenUrl(address);
}

export function buildDexScreenerUrl(address: string): string {
  return hoodDexScreenerTokenUrl(address);
}

export type BuildPublicStatus = {
  chainId: number;
  squareNft: `0x${string}`;
  token: {
    symbol: string;
    name: string;
    pair: string;
    pairFallback: string;
    address: `0x${string}` | null;
    status: BuildLaunchStatus;
    origin: 'bankr-doppler' | null;
    decimals: number;
    deployTx: string | null;
    implementation: string | null;
    bankrTokenUrl: string | null;
    bankrTradeUrl: string | null;
    dexscreenerUrl: string | null;
  };
  launchpads: BuildLaunchpad[];
  lock: {
    tx: string | null;
    url: string | null;
    published: boolean;
  };
  contracts: {
    activationRegistry: `0x${string}` | null;
    stallVault: `0x${string}` | null;
    feeSplitter: `0x${string}` | null;
  };
  feesThisWeekWei: string;
  firstStall: {
    projectId: string;
    name: string;
    key: 'p5';
  };
};

export function buildPublicStatus(feesThisWeekWei = '0'): BuildPublicStatus {
  const address = BUILD_TOKEN_ADDRESS;
  return {
    chainId: HOOD_CHAIN_ID,
    squareNft: CCFF00_NFT,
    token: {
      symbol: BUILD_TOKEN_SYMBOL,
      name: BUILD_TOKEN_NAME,
      pair: BUILD_PAIR_LABEL,
      pairFallback: BUILD_PAIR_FALLBACK,
      address,
      status: buildLaunchStatus(),
      origin: address ? 'bankr-doppler' : null,
      decimals: BUILD_TOKEN_DECIMALS,
      deployTx: address ? BUILD_DEPLOY_TX : null,
      implementation: address ? BUILD_IMPLEMENTATION_NAME : null,
      bankrTokenUrl: address ? BUILD_BANKR_TOKEN_URL : null,
      bankrTradeUrl: address ? BUILD_BANKR_TRADE_URL : null,
      dexscreenerUrl: address ? buildDexScreenerUrl(address) : null,
    },
    launchpads: BUILD_LAUNCHPADS,
    lock: {
      tx: BUILD_LOCK_TX,
      url: BUILD_LOCK_URL,
      published: Boolean(BUILD_LOCK_TX || BUILD_LOCK_URL),
    },
    contracts: {
      activationRegistry: ACTIVATION_REGISTRY_ADDRESS,
      stallVault: STALL_VAULT_ADDRESS,
      feeSplitter: FEE_SPLITTER_ADDRESS,
    },
    feesThisWeekWei,
    firstStall: {
      projectId: 'p5',
      name: 'Aura Share',
      key: 'p5',
    },
  };
}
