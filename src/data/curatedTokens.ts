export interface CuratedToken {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  /** Env flag key: TRADEABLE_<KEY>=true|false */
  envKey: string;
  /** Optional link to an Explore project id */
  projectId?: string;
}

/** Native SOL wrapped mint used by Jupiter */
export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';
export const JUP_MINT = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN';
export const BONK_MINT = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
export const WIF_MINT = 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm';
export const RAY_MINT = '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R';

/**
 * Full catalog of coins that *can* be enabled for trading.
 * Only tokens with TRADEABLE_<envKey>=true in .env are actually tradeable.
 */
export const TOKEN_CATALOG: CuratedToken[] = [
  {
    mint: SOL_MINT,
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    envKey: 'SOL',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  {
    mint: USDC_MINT,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    envKey: 'USDC',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
  {
    mint: USDT_MINT,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    envKey: 'USDT',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
  },
  {
    mint: JUP_MINT,
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6,
    envKey: 'JUP',
    projectId: 'p3',
    logoURI: 'https://static.jup.ag/jup/icon.png',
  },
  {
    mint: BONK_MINT,
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    envKey: 'BONK',
    projectId: 'p4',
    logoURI: 'https://arweave.net/hQiPZOsRZXGXbJjZFKdFavWBPZbe8xhZUaAsjC8kJRc',
  },
  {
    mint: WIF_MINT,
    symbol: 'WIF',
    name: 'dogwifhat',
    decimals: 6,
    envKey: 'WIF',
    projectId: 'p2',
    logoURI:
      'https://bafkreibk3covs5pynxayczwtn2ckrmvagt3vrv3iciohxfoxjok53g35vy.ipfs.nftstorage.link',
  },
  {
    mint: RAY_MINT,
    symbol: 'RAY',
    name: 'Raydium',
    decimals: 6,
    envKey: 'RAY',
    projectId: 'p1',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  },
];

/** @deprecated use TOKEN_CATALOG + getTradeableTokens */
export const CURATED_TOKENS = TOKEN_CATALOG;

export function parseEnvFlag(value: string | undefined, defaultTrue = false): boolean {
  if (value == null || value.trim() === '') return defaultTrue;
  const v = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'off'].includes(v)) return false;
  return defaultTrue;
}

/** Defaults when .env omits a key — majors on, memes off until enabled */
const DEFAULT_ON = new Set(['SOL', 'USDC', 'USDT', 'JUP']);

export function isEnvTradeable(envKey: string, env: Record<string, string | undefined> = {}): boolean {
  const raw = env[`TRADEABLE_${envKey}`];
  return parseEnvFlag(raw, DEFAULT_ON.has(envKey));
}

export function getTradeableTokens(
  env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {}
): CuratedToken[] {
  return TOKEN_CATALOG.filter((t) => isEnvTradeable(t.envKey, env));
}

export function getTradeableMintSet(
  env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {}
): Set<string> {
  return new Set(getTradeableTokens(env).map((t) => t.mint));
}

export function isTradeableMint(
  mint: string,
  env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {}
): boolean {
  return getTradeableMintSet(env).has(mint);
}

/** Allowlist check used by server — only env-enabled mints */
export function isCuratedMint(mint: string): boolean {
  return isTradeableMint(mint, typeof process !== 'undefined' ? process.env : {});
}

export const CURATED_MINT_SET = {
  has(mint: string) {
    return isCuratedMint(mint);
  },
  get size() {
    return getTradeableTokens().length;
  },
};

export function getCuratedToken(mint: string): CuratedToken | undefined {
  return TOKEN_CATALOG.find((t) => t.mint === mint);
}

export function getCuratedTokenByProjectId(projectId: string): CuratedToken | undefined {
  return TOKEN_CATALOG.find((t) => t.projectId === projectId);
}

export function resolveTradeMint(
  project: {
    id: string;
    mint?: string;
    curation: { status: string };
  },
  /** When provided (from /api/tradeable-tokens), only env-enabled mints resolve */
  tradeableMints?: Set<string>
): string | null {
  if (project.curation.status !== 'curated') return null;
  const candidate =
    (project.mint && getCuratedToken(project.mint)?.mint) ||
    getCuratedTokenByProjectId(project.id)?.mint ||
    null;
  if (!candidate) return null;
  if (tradeableMints && !tradeableMints.has(candidate)) return null;
  return candidate;
}

export function filterCuratedTokens(
  query: string,
  tokens: CuratedToken[] = TOKEN_CATALOG
): CuratedToken[] {
  const q = query.trim().toLowerCase();
  if (!q) return tokens;
  return tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.mint.toLowerCase().includes(q)
  );
}
