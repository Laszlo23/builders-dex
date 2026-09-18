import { addHoodToWallet, HOOD_CHAIN_ID_HEX, HOOD_RPC_URL } from '../data/hoodChain';
import {
  HOOD_SHARE_ADDRESS,
  HOOD_SHARE_MINT_SEL,
  HOOD_SHARE_PRICE_WEI,
} from '../data/hoodShare';

type InjectedEth = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
};

function injectedEth(): InjectedEth | null {
  if (typeof window === 'undefined') return null;
  return (window as Window & { ethereum?: InjectedEth }).ethereum ?? null;
}

export async function connectHoodEvm(): Promise<string> {
  const eth = injectedEth();
  if (!eth) {
    throw new Error('Connect MetaMask, Rabby, or Robinhood Wallet. Phantom on Solana cannot mint on Hood.');
  }
  const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[];
  const from = accounts?.[0];
  if (!from) throw new Error('No EVM account connected');
  const switchErr = await addHoodToWallet();
  if (switchErr) throw new Error(switchErr);
  return from;
}

export async function readHoodShareSupply(): Promise<{ minted: number; live: boolean }> {
  const eth = injectedEth();
  const call = async (data: string) => {
    const params = [{ to: HOOD_SHARE_ADDRESS, data }, 'latest'];
    if (eth) {
      return (await eth.request({ method: 'eth_call', params })) as string;
    }
    const res = await fetch(HOOD_RPC_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': 'BuildersDEX/hood-share',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params }),
    });
    const body = (await res.json()) as { result?: string };
    return body.result || '0x0';
  };
  const mintedHex = await call('0x18160ddd');
  const liveHex = await call('0x957aa58c'); // live()
  const minted = Number(BigInt(mintedHex || '0x0'));
  const live = BigInt(liveHex || '0x0') === 1n;
  return { minted, live };
}

export async function mintHoodShare(): Promise<string> {
  const eth = injectedEth();
  if (!eth) throw new Error('No injected EVM wallet');
  const from = await connectHoodEvm();
  const chainId = (await eth.request({ method: 'eth_chainId' })) as string;
  if (chainId.toLowerCase() !== HOOD_CHAIN_ID_HEX.toLowerCase()) {
    throw new Error('Switch the wallet to Robinhood Chain (4663) and retry.');
  }
  const hash = (await eth.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from,
        to: HOOD_SHARE_ADDRESS,
        value: `0x${HOOD_SHARE_PRICE_WEI.toString(16)}`,
        data: HOOD_SHARE_MINT_SEL,
      },
    ],
  })) as string;
  if (!hash) throw new Error('Wallet did not return a transaction hash');
  return hash;
}
