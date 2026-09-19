/**
 * Robinhood Chain (Hood) — official network + partner-bridge links only.
 * Solana is not a canonical source. Do not invent a Hood wrap of Base AURA
 * or port Passport / builder_raise here.
 */

export const HOOD_CHAIN_ID = 4663;
export const HOOD_CHAIN_ID_HEX = '0x1237';
export const HOOD_CHAIN_NAME = 'Robinhood Chain';
export const HOOD_NATIVE_SYMBOL = 'ETH';
export const HOOD_RPC_URL = 'https://rpc.mainnet.chain.robinhood.com';
export const HOOD_EXPLORER_URL = 'https://robinhoodchain.blockscout.com';
export const HOOD_DOCS_URL = 'https://docs.robinhood.com/chain/bridging/';
export const HOOD_ARBITRUM_PORTAL = 'https://portal.arbitrum.io/bridge';
export const HOOD_RELAY_URL = 'https://relay.link';
export const HOOD_ACROSS_URL = 'https://across.to';
export const DEBRIDGE_APP_URL = 'https://app.debridge.finance/';
export const MAYAN_APP_URL = 'https://mayan.finance/';
export const HOOD_DISCLAIMER =
  'Not financial advice. DYOR. Builders DEX is not affiliated with Robinhood Markets, Inc. or Robinhood Chain. There is no canonical Solana → Hood bridge — partner hops only.';

/** Confirmed CCFF00 Cubes ERC-721 on Hood (Sourcify match). Mint is outbound. */
export const CUBES_CONTRACT = '0x5b9e105b28e6313222ee6572a90374c91a296639';
export const CUBES_SQUARES_CONTRACT = '0x505a22ffed8d37ebe580ffd98d2cdb0021189146';
export const CUBES_PAYOUT = '0x51a0cE4B5281C1f140855369b9204bb0A0F61100';
export const CUBES_MINT_URL = 'https://cubes.squareapes.com';
export const CUBES_PROJECT_ID = 'p6';

export type HoodAssetKind = 'nft' | 'erc20';

export type HoodAsset = {
  id: string;
  projectId: string;
  symbol: string;
  name: string;
  kind: HoodAssetKind;
  address: string;
  mintUrl: string;
  notes: string;
};

export const HOOD_ASSETS: HoodAsset[] = [
  {
    id: 'ccff00-cubes',
    projectId: CUBES_PROJECT_ID,
    symbol: 'CCFF00',
    name: 'HoodStreet CCFF00',
    kind: 'nft',
    address: CUBES_CONTRACT,
    mintUrl: CUBES_MINT_URL,
    notes:
      'HoodStreet founding membership. Cubes ETH mint on Square Apes — not Jupiter. Swap tab stays Solana curated.',
  },
];

export function hoodRpcUrl(): string {
  return (
    envOrNull('HOOD_RPC_URL') ||
    envOrNull('VITE_HOOD_RPC_URL') ||
    HOOD_RPC_URL
  );
}

export function hoodExplorerAddressUrl(address: string): string {
  return `${HOOD_EXPLORER_URL}/address/${address}`;
}

export function hoodExplorerTokenUrl(address: string): string {
  return `${HOOD_EXPLORER_URL}/token/${address}`;
}

export function hoodDexScreenerTokenUrl(address: string): string {
  return `https://dexscreener.com/robinhood/${address.toLowerCase()}`;
}

export function resolveHoodAssetAddress(project: {
  id: string;
  chain: string;
  hoodTokenAddress?: string;
}): string | null {
  if (project.chain !== 'Robinhood') return null;
  if (project.hoodTokenAddress && /^0x[a-fA-F0-9]{40}$/.test(project.hoodTokenAddress)) {
    return project.hoodTokenAddress;
  }
  const asset = HOOD_ASSETS.find((a) => a.projectId === project.id);
  return asset?.address ?? null;
}

export function hoodAssetForProject(projectId: string): HoodAsset | undefined {
  return HOOD_ASSETS.find((a) => a.projectId === projectId);
}

export function openHoodMint(projectId: string): void {
  if (typeof window === 'undefined') return;
  const asset = hoodAssetForProject(projectId);
  window.open(asset?.mintUrl || CUBES_MINT_URL, '_blank', 'noopener,noreferrer');
}

type InjectedEth = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
};

function injectedEth(): InjectedEth | null {
  if (typeof window === 'undefined') return null;
  const eth = (window as Window & { ethereum?: InjectedEth }).ethereum;
  return eth ?? null;
}

/** Phantom-on-Solana cannot add 4663. Only injected EVM wallets. */
export async function addHoodToWallet(): Promise<string | null> {
  const eth = injectedEth();
  if (!eth) {
    return 'Connect MetaMask, Rabby, or Robinhood Wallet to add chain 4663. Phantom on Solana cannot add Hood.';
  }
  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HOOD_CHAIN_ID_HEX }],
    });
    return null;
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code !== 4902 && code !== -32603) {
      return err instanceof Error ? err.message : 'Wallet rejected switch';
    }
  }
  try {
    await eth.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: HOOD_CHAIN_ID_HEX,
          chainName: HOOD_CHAIN_NAME,
          nativeCurrency: { name: 'Ether', symbol: HOOD_NATIVE_SYMBOL, decimals: 18 },
          rpcUrls: [hoodRpcUrl()],
          blockExplorerUrls: [HOOD_EXPLORER_URL],
        },
      ],
    });
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : 'Wallet rejected add-chain';
  }
}

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
