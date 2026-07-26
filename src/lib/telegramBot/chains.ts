import { InlineKeyboard } from 'grammy';
import { BASE58_RE } from '../serverSecurity';

export type ChainId =
  | 'solana'
  | 'ethereum'
  | 'base'
  | 'bsc'
  | 'polygon'
  | 'arbitrum'
  | 'avalanche'
  | 'optimism'
  | 'sui'
  | 'ton';

export type ChainDef = {
  id: ChainId;
  label: string;
  /** GeckoTerminal network id for trade alerts */
  geckoNetwork: string | null;
  explorerToken: (address: string) => string;
  explorerTx: (tx: string) => string;
  validateAddress: (address: string) => boolean;
};

const EVM_RE = /^0x[a-fA-F0-9]{40}$/;
const SUI_RE = /^0x[a-fA-F0-9]{1,64}(::[\w]+)*$/;
const TON_RE = /^(EQ|UQ)[A-Za-z0-9_-]{46}$|^0:[a-fA-F0-9]{64}$/;

function evm(explorer: string): Pick<ChainDef, 'validateAddress' | 'explorerToken' | 'explorerTx'> {
  return {
    validateAddress: (a) => EVM_RE.test(a.trim()),
    explorerToken: (a) => `https://${explorer}/token/${a}`,
    explorerTx: (tx) => `https://${explorer}/tx/${tx}`,
  };
}

export const CHAINS: Record<ChainId, ChainDef> = {
  solana: {
    id: 'solana',
    label: 'Solana',
    geckoNetwork: 'solana',
    validateAddress: (a) => BASE58_RE.test(a.trim()),
    explorerToken: (a) => `https://solscan.io/token/${a}`,
    explorerTx: (tx) => `https://solscan.io/tx/${tx}`,
  },
  ethereum: {
    id: 'ethereum',
    label: 'Ethereum',
    geckoNetwork: 'eth',
    ...evm('etherscan.io'),
  },
  base: {
    id: 'base',
    label: 'Base',
    geckoNetwork: 'base',
    ...evm('basescan.org'),
  },
  bsc: {
    id: 'bsc',
    label: 'BNB Chain',
    geckoNetwork: 'bsc',
    ...evm('bscscan.com'),
  },
  polygon: {
    id: 'polygon',
    label: 'Polygon',
    geckoNetwork: 'polygon_pos',
    ...evm('polygonscan.com'),
  },
  arbitrum: {
    id: 'arbitrum',
    label: 'Arbitrum',
    geckoNetwork: 'arbitrum',
    ...evm('arbiscan.io'),
  },
  avalanche: {
    id: 'avalanche',
    label: 'Avalanche',
    geckoNetwork: 'avax',
    ...evm('snowtrace.io'),
  },
  optimism: {
    id: 'optimism',
    label: 'Optimism',
    geckoNetwork: 'optimism',
    ...evm('optimistic.etherscan.io'),
  },
  sui: {
    id: 'sui',
    label: 'Sui',
    geckoNetwork: 'sui-network',
    validateAddress: (a) => SUI_RE.test(a.trim()),
    explorerToken: (a) => `https://suiscan.xyz/mainnet/coin/${encodeURIComponent(a)}`,
    explorerTx: (tx) => `https://suiscan.xyz/mainnet/tx/${tx}`,
  },
  ton: {
    id: 'ton',
    label: 'TON',
    geckoNetwork: 'ton',
    validateAddress: (a) => TON_RE.test(a.trim()),
    explorerToken: (a) => `https://tonviewer.com/${a}`,
    explorerTx: (tx) => `https://tonviewer.com/transaction/${tx}`,
  },
};

export const CHAIN_IDS = Object.keys(CHAINS) as ChainId[];

export function isChainId(raw: string): raw is ChainId {
  return raw in CHAINS;
}

export function normalizeChainId(raw: string): ChainId | null {
  const s = raw.trim().toLowerCase();
  const aliases: Record<string, ChainId> = {
    sol: 'solana',
    solana: 'solana',
    eth: 'ethereum',
    ethereum: 'ethereum',
    base: 'base',
    bnb: 'bsc',
    bsc: 'bsc',
    binance: 'bsc',
    matic: 'polygon',
    polygon: 'polygon',
    arb: 'arbitrum',
    arbitrum: 'arbitrum',
    avax: 'avalanche',
    avalanche: 'avalanche',
    op: 'optimism',
    optimism: 'optimism',
    sui: 'sui',
    ton: 'ton',
  };
  return aliases[s] ?? (isChainId(s) ? s : null);
}

export function getChain(id: string | null | undefined): ChainDef {
  if (id && isChainId(id)) return CHAINS[id];
  return CHAINS.solana;
}

export function isValidContract(chainId: string | null | undefined, address: string): boolean {
  return getChain(chainId).validateAddress(address);
}

/** Inline keyboard to pick a chain */
export function chainPickerKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();
  const list = CHAIN_IDS;
  for (let i = 0; i < list.length; i += 2) {
    const a = CHAINS[list[i]!];
    kb.text(a.label, `nw:setchain:${a.id}`);
    const b = list[i + 1] ? CHAINS[list[i + 1]!] : null;
    if (b) kb.text(b.label, `nw:setchain:${b.id}`);
    kb.row();
  }
  kb.text('« Back to menu', 'nw:menu');
  return kb;
}
