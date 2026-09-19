import { connectHoodEvm } from './hoodShareMint';

type InjectedEth = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
};

function injectedEth(): InjectedEth | null {
  if (typeof window === 'undefined') return null;
  return (window as Window & { ethereum?: InjectedEth }).ethereum ?? null;
}

/** Any injected EVM wallet. Does not switch chain. */
export async function connectEvmAccount(): Promise<string> {
  const eth = injectedEth();
  if (!eth) {
    throw new Error(
      'Connect MetaMask, Rabby, or Robinhood Wallet. Phantom on Solana cannot sign EVM.',
    );
  }
  const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[];
  const from = accounts?.[0];
  if (!from) throw new Error('No EVM account connected');
  return from;
}

export async function connectHoodAccount(): Promise<string> {
  return connectHoodEvm();
}

export function hasInjectedEvm(): boolean {
  return Boolean(injectedEth());
}
