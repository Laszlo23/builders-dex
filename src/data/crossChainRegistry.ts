/**
 * Cross-chain registry: Solana Passport collection ↔ Base AURA (and other Base tokens).
 * Canonical AURA stays on Base; Solana mint is the bridged/wrapped representation.
 */

export type CrossChainTokenBinding = {
  id: string;
  projectId: string;
  symbol: string;
  /** Canonical ERC-20 on Base (set via AURA_BASE_ADDRESS) */
  baseAddress: string | null;
  /** Bridged SPL mint on Solana (set via AURA_SOLANA_MINT) */
  solanaMint: string | null;
  /** Official Base↔Solana Bridge docs */
  bridgeDocsUrl: string;
  /** Deep link helper for Terminally Onchain / bridge UIs */
  bridgeAppUrl: string;
  notes: string;
};

export type PassportCollectionMeta = {
  name: string;
  symbol: string;
  /** Metaplex Core collection mint — set after Phase 5 mint */
  collectionMint: string | null;
  /** Requires Builder Passport PDA before visual NFT mint */
  requiresPassportPda: true;
  description: string;
};

export const BASE_SOLANA_BRIDGE_DOCS =
  'https://docs.base.org/base-chain/network-information/base-solana-bridge';

export const BASE_SOLANA_BRIDGE_APP =
  'https://www.superbridge.app/base';

/** Confirmed Aura OS ERC-20 on Base (Basescan: AURA Token, 777,777,777 supply). */
export const AURA_BASE_ADDRESS = '0xDb1E6D4FaB43c8cb5871D32D41df00ea34350723';
export const AURA_BASE_DECIMALS = 18;
export const AURA_BASE_SUPPLY = 777_777_777;
export const AURA_USDC_V3_POOL = '0x73eC0F9Cf1C1274F9988e7723d9822b57c2714d8';
export const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export function resolveAuraBaseAddress(): string {
  return (
    envOrNull('AURA_BASE_ADDRESS') ||
    envOrNull('VITE_AURA_BASE_ADDRESS') ||
    AURA_BASE_ADDRESS
  );
}

export function basescanTokenUrl(address: string): string {
  return `https://basescan.org/token/${address}`;
}

export function dexScreenerTokenUrl(address: string): string {
  return `https://dexscreener.com/base/${address.toLowerCase()}`;
}

export function uniswapBaseSwapUrl(outputAddress: string): string {
  const params = new URLSearchParams({
    chain: 'base',
    inputCurrency: BASE_USDC,
    outputCurrency: outputAddress,
  });
  return `https://app.uniswap.org/swap?${params.toString()}`;
}

export function resolveBaseTradeAddress(project: {
  id: string;
  chain: string;
  baseTokenAddress?: string;
}): string | null {
  if (project.chain !== 'Base') return null;
  if (project.baseTokenAddress && /^0x[a-fA-F0-9]{40}$/.test(project.baseTokenAddress)) {
    return project.baseTokenAddress;
  }
  if (project.id === 'p5') return resolveAuraBaseAddress();
  return null;
}

export function openBaseTrade(address: string): void {
  if (typeof window === 'undefined') return;
  window.open(uniswapBaseSwapUrl(address), '_blank', 'noopener,noreferrer');
}

export async function watchAuraOnBase(): Promise<string | null> {
  const eth = (
    window as Window & {
      ethereum?: { request: (args: { method: string; params?: unknown }) => Promise<unknown> };
    }
  ).ethereum;
  if (!eth) return 'Connect a Base wallet (MetaMask or Rabby) to add AURA';
  try {
    await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2105' }] });
  } catch {
    /* stay on current chain if the wallet rejects */
  }
  try {
    await eth.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: resolveAuraBaseAddress(),
          symbol: 'AURA',
          decimals: AURA_BASE_DECIMALS,
        },
      },
    });
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : 'Wallet rejected add-token';
  }
}

function envOrNull(key: string): string | null {
  if (typeof process !== 'undefined' && process.env?.[key]?.trim()) {
    return process.env[key]!.trim();
  }
  // Vite client
  try {
    const vite = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
    if (vite?.[key]?.trim()) return vite[key].trim();
    if (vite?.[`VITE_${key}`]?.trim()) return vite[`VITE_${key}`].trim();
  } catch {
    /* ignore */
  }
  return null;
}

export const PASSPORT_COLLECTION: PassportCollectionMeta = {
  name: 'Builders Passport',
  symbol: 'BPASS',
  collectionMint: envOrNull('PASSPORT_COLLECTION_MINT') || envOrNull('VITE_PASSPORT_COLLECTION_MINT'),
  requiresPassportPda: true,
  description:
    'Visual Metaplex Core membership NFT minted 1:1 with an on-chain Builder Passport PDA. Not the trading asset — AURA liquidity stays Base-canonical with optional Solana wrap.',
};

export function getAuraBinding(): CrossChainTokenBinding {
  return {
    id: 'aura-os',
    projectId: 'p5',
    symbol: 'AURA',
    baseAddress: resolveAuraBaseAddress(),
    solanaMint: envOrNull('AURA_SOLANA_MINT') || envOrNull('VITE_AURA_SOLANA_MINT'),
    bridgeDocsUrl: BASE_SOLANA_BRIDGE_DOCS,
    bridgeAppUrl: BASE_SOLANA_BRIDGE_APP,
    notes:
      'Canonical AURA is the Base ERC-20. Jupiter TRADEABLE_AURA stays off until a confirmed Solana wrap exists.',
  };
}

export const CROSS_CHAIN_BINDINGS: CrossChainTokenBinding[] = [getAuraBinding()];

export function bindingForProject(projectId: string): CrossChainTokenBinding | undefined {
  return CROSS_CHAIN_BINDINGS.find((b) => b.projectId === projectId);
}
