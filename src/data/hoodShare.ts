/**
 * Live Aura share NFT on Robinhood Chain. Address is set by scripts/deploy-hood-share.ts.
 */
/** CREATE-address matched to Base AURA — same 0x, ERC-721 share on Hood. */
export const HOOD_SHARE_ADDRESS = '0xDb1E6D4FaB43c8cb5871D32D41df00ea34350723' as const;
export const HOOD_SHARE_PRICE_WEI = 50000000000000n;
export const HOOD_SHARE_SUPPLY = 200;
export const HOOD_SHARE_MAX_PER_WALLET = 3;
export const HOOD_SHARE_HOLDER_POOL_BPS = 2000;
export const HOOD_SHARE_ID = 'raise_hood_p5';
export const HOOD_SHARE_PROJECT_ID = 'p5';
export const HOOD_SHARE_MINT_SEL = '0x1249c58b';
export const HOOD_SHARE_BASE_URI = 'https://dex.buildingcultureid.space/api/hood/share/';

export function isHoodShareId(id: string | null | undefined): boolean {
  return id === HOOD_SHARE_ID || id === HOOD_SHARE_PROJECT_ID || id === 'raise_aura_p5';
}

export function hoodShareExplorer(): string {
  return `https://robinhoodchain.blockscout.com/address/${HOOD_SHARE_ADDRESS}`;
}

export function hoodShareTxExplorer(hash: string): string {
  return `https://robinhoodchain.blockscout.com/tx/${hash}`;
}

export function formatHoodSharePrice(wei: bigint = HOOD_SHARE_PRICE_WEI): string {
  const eth = Number(wei) / 1e18;
  return `${eth.toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH`;
}
