import { encodeFunctionData, hexToBigInt, pad, parseAbi } from 'viem';
import {
  CCFF00_DESK,
  CCFF00_NFT,
  CCFF00_TOKEN,
  ERC6551_IMPLEMENTATION,
  ERC6551_REGISTRY,
  ERC6551_SALT,
  type Ccff00DeskItem,
} from '../data/ccff00Wallet';
import { HOOD_CHAIN_ID, HOOD_CHAIN_ID_HEX, addHoodToWallet, hoodRpcUrl } from '../data/hoodChain';
import { connectHoodEvm } from './hoodShareMint';

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const LOG_CHUNK = 400_000;
const LOG_WINDOWS = 6;
const CACHE_MS = 45_000;

const NFT_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getTokenBoundAccount(uint256 tokenId) view returns (address)',
  'function tradingActivated() view returns (bool)',
  'function ccff00Token() view returns (address)',
]);

const ERC20_ABI = parseAbi(['function balanceOf(address account) view returns (uint256)']);

const TBA_ABI = parseAbi([
  'function execute(address to, uint256 value, bytes data, uint8 operation) payable returns (bytes)',
]);

const REGISTRY_ABI = parseAbi([
  'function createAccount(address implementation, bytes32 salt, uint256 chainId, address tokenContract, uint256 tokenId) returns (address)',
]);

type InjectedEth = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
};

export type Ccff00Square = {
  tokenId: number;
  tba: `0x${string}`;
  tbaCreated: boolean;
  ethWei: string;
  ccff00Wei: string;
};

export type Ccff00WalletSnapshot = {
  owner: string;
  balance: number;
  tradingActivated: boolean;
  token: `0x${string}`;
  squares: Ccff00Square[];
  fetchedAt: string;
};

const snapshotCache = new Map<string, { at: number; snap: Ccff00WalletSnapshot }>();

function injectedEth(): InjectedEth | null {
  if (typeof window === 'undefined') return null;
  return (window as Window & { ethereum?: InjectedEth }).ethereum ?? null;
}

function padAddress(addr: string): `0x${string}` {
  return pad(addr.toLowerCase() as `0x${string}`, { size: 32 });
}

/** Reads always hit public Hood RPC — wallet RPC is slow and rate-limits getLogs. */
async function readRpc<T>(method: string, params: unknown[]): Promise<T> {
  const urls = [...new Set([hoodRpcUrl(), 'https://rpc.mainnet.chain.robinhood.com'])];
  let last: unknown;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'user-agent': 'BuildersDEX/ccff00-wallet',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: AbortSignal.timeout(10_000),
      });
      const body = (await res.json()) as { result?: T; error?: { message?: string } };
      if (body.result !== undefined) return body.result;
      last = body.error?.message || 'empty rpc result';
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error(String(last || 'hood rpc failed'));
}

async function writeRpc(method: string, params: unknown[]): Promise<unknown> {
  const eth = injectedEth();
  if (!eth) throw new Error('Connect MetaMask, Rabby, or Robinhood Wallet on Hood.');
  return eth.request({ method, params });
}

async function ethCall(to: string, data: `0x${string}`): Promise<`0x${string}`> {
  return readRpc<`0x${string}`>('eth_call', [{ to, data }, 'latest']);
}

function decodeAddress(hex: string): `0x${string}` {
  return (`0x${hex.slice(-40)}`.toLowerCase()) as `0x${string}`;
}

function decodeUint(hex: string): bigint {
  if (!hex || hex === '0x') return 0n;
  return hexToBigInt(hex as `0x${string}`);
}

async function ownedTokenIds(owner: string, need: number): Promise<number[]> {
  if (need <= 0) return [];
  const latestHex = await readRpc<string>('eth_blockNumber', []);
  const latest = Number(BigInt(latestHex || '0x1'));
  const ids = new Set<number>();
  let to = latest;
  for (let i = 0; i < LOG_WINDOWS && to > 0 && ids.size < need * 3; i += 1) {
    const from = Math.max(0, to - LOG_CHUNK);
    try {
      const logs = await readRpc<Array<{ topics?: string[] }>>('eth_getLogs', [
        {
          address: CCFF00_NFT,
          fromBlock: `0x${from.toString(16)}`,
          toBlock: `0x${to.toString(16)}`,
          topics: [TRANSFER_TOPIC, null, padAddress(owner)],
        },
      ]);
      for (const log of logs || []) {
        const topic = log.topics?.[3];
        if (topic) ids.add(Number(BigInt(topic)));
      }
    } catch {
      /* next window */
    }
    to = from - 1;
  }
  const candidates = [...ids].sort((a, b) => a - b).slice(0, 24);
  const owners = await Promise.all(
    candidates.map((tokenId) =>
      ethCall(
        CCFF00_NFT,
        encodeFunctionData({ abi: NFT_ABI, functionName: 'ownerOf', args: [BigInt(tokenId)] }),
      ).then((hex) => ({ tokenId, owner: decodeAddress(hex) })),
    ),
  );
  return owners.filter((row) => row.owner === owner).map((row) => row.tokenId);
}

async function loadSquare(tokenId: number): Promise<Ccff00Square> {
  const tba = decodeAddress(
    await ethCall(
      CCFF00_NFT,
      encodeFunctionData({
        abi: NFT_ABI,
        functionName: 'getTokenBoundAccount',
        args: [BigInt(tokenId)],
      }),
    ),
  );
  const [code, ethHex, tokenHex] = await Promise.all([
    readRpc<string>('eth_getCode', [tba, 'latest']),
    readRpc<string>('eth_getBalance', [tba, 'latest']),
    ethCall(
      CCFF00_TOKEN,
      encodeFunctionData({ abi: ERC20_ABI, functionName: 'balanceOf', args: [tba] }),
    ),
  ]);
  return {
    tokenId,
    tba,
    tbaCreated: Boolean(code && code !== '0x'),
    ethWei: decodeUint(ethHex).toString(),
    ccff00Wei: decodeUint(tokenHex).toString(),
  };
}

export async function loadCcff00Wallet(owner: string, opts?: { fresh?: boolean }): Promise<Ccff00WalletSnapshot> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(owner)) throw new Error('Need an EVM address');
  const normalized = owner.toLowerCase();
  const cached = snapshotCache.get(normalized);
  if (!opts?.fresh && cached && Date.now() - cached.at < CACHE_MS) return cached.snap;

  const [balHex, tradingHex, tokenHex] = await Promise.all([
    ethCall(
      CCFF00_NFT,
      encodeFunctionData({ abi: NFT_ABI, functionName: 'balanceOf', args: [normalized as `0x${string}`] }),
    ),
    ethCall(CCFF00_NFT, encodeFunctionData({ abi: NFT_ABI, functionName: 'tradingActivated' })),
    ethCall(CCFF00_NFT, encodeFunctionData({ abi: NFT_ABI, functionName: 'ccff00Token' })),
  ]);
  const balance = Number(decodeUint(balHex));
  const ids = await ownedTokenIds(normalized, balance);
  const squares = await Promise.all(ids.map((tokenId) => loadSquare(tokenId)));
  const snap: Ccff00WalletSnapshot = {
    owner: normalized,
    balance,
    tradingActivated: decodeUint(tradingHex) === 1n,
    token: decodeAddress(tokenHex),
    squares,
    fetchedAt: new Date().toISOString(),
  };
  snapshotCache.set(normalized, { at: Date.now(), snap });
  return snap;
}

export async function loadSquareById(tokenId: number): Promise<Ccff00Square> {
  if (!Number.isInteger(tokenId) || tokenId < 0 || tokenId > 10_000) {
    throw new Error('Token id must be 0–10000');
  }
  return loadSquare(tokenId);
}

export function formatWeiEth(wei: string | bigint, digits = 5): string {
  const value = typeof wei === 'bigint' ? wei : BigInt(wei || '0');
  const eth = Number(value) / 1e18;
  return `${eth.toLocaleString(undefined, { maximumFractionDigits: digits })} ETH`;
}

export function formatCcff00(wei: string | bigint): string {
  const value = typeof wei === 'bigint' ? wei : BigInt(wei || '0');
  return (Number(value) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function shortenHex(value: string): string {
  if (value.length < 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export async function createCcff00Account(tokenId: number): Promise<string> {
  const from = await connectHoodEvm();
  const data = encodeFunctionData({
    abi: REGISTRY_ABI,
    functionName: 'createAccount',
    args: [
      ERC6551_IMPLEMENTATION,
      ERC6551_SALT,
      BigInt(HOOD_CHAIN_ID),
      CCFF00_NFT,
      BigInt(tokenId),
    ],
  });
  const hash = (await writeRpc('eth_sendTransaction', [{ from, to: ERC6551_REGISTRY, data }])) as string;
  if (!hash) throw new Error('Wallet did not create the Square account');
  return hash;
}

export async function fundCcff00Tba(tba: string, wei: bigint): Promise<string> {
  const from = await connectHoodEvm();
  if (wei <= 0n) throw new Error('Enter an ETH amount to send into the Square');
  const hash = (await writeRpc('eth_sendTransaction', [
    { from, to: tba, value: `0x${wei.toString(16)}` },
  ])) as string;
  if (!hash) throw new Error('Wallet did not fund the Square');
  return hash;
}

export async function executeAsSquare(tba: string, item: Ccff00DeskItem): Promise<string> {
  if (item.status !== 'live') {
    throw new Error(item.lockReason || `${item.name} is not open from the Square yet`);
  }
  const from = await connectHoodEvm();
  const chainId = (await writeRpc('eth_chainId', [])) as string;
  if (chainId.toLowerCase() !== HOOD_CHAIN_ID_HEX.toLowerCase()) {
    const err = await addHoodToWallet();
    if (err) throw new Error(err);
  }
  const data = encodeFunctionData({
    abi: TBA_ABI,
    functionName: 'execute',
    args: [item.to, item.valueWei, item.data, 0],
  });
  const hash = (await writeRpc('eth_sendTransaction', [{ from, to: tba, data }])) as string;
  if (!hash) throw new Error('Wallet did not execute from the Square');
  return hash;
}

export function deskForBuy(id: string | null | undefined): Ccff00DeskItem | undefined {
  return CCFF00_DESK.find((item) => item.id === id);
}
