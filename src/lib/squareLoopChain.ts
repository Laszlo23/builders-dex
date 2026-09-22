import { decodeFunctionResult, encodeFunctionData, keccak256, parseAbi, toBytes } from 'viem';
import {
  ACTIVATION_REGISTRY_ADDRESS,
  BUILD_TOKEN_ADDRESS,
  FEE_SPLITTER_ADDRESS,
  STALL_VAULT_ADDRESS,
} from '../data/buildToken';
import { FIRST_STALL_PROJECT_ID, type SquareLoopPhase } from '../data/squareLoop';
import { HOOD_CHAIN_ID_HEX, addHoodToWallet, hoodRpcUrl } from '../data/hoodChain';
import { connectHoodEvm } from './hoodShareMint';
import type { SquareLoopEntry } from './squareLoop';

export const FIRST_STALL_KEY = keccak256(toBytes(FIRST_STALL_PROJECT_ID));

const REGISTRY_ABI = parseAbi([
  'function activate(uint256 tokenId)',
  'function park(uint256 tokenId)',
  'function requestUnpark(uint256 tokenId)',
  'function unpark(uint256 tokenId)',
  'function isParked(uint256 tokenId, address who) view returns (bool)',
  'function isActivated(uint256 tokenId, address who) view returns (bool)',
  'function tbaOf(uint256 tokenId) view returns (address)',
  'function records(uint256 tokenId) view returns (address owner, address tba, uint64 activatedAt, uint64 parkedAt, uint64 unparkUnlockAt)',
]);

const STALL_ABI = parseAbi([
  'function takeStall(uint256 tokenId, bytes32 projectKey)',
  'function exitStall(uint256 tokenId)',
  'function stallOf(uint256 tokenId) view returns (bytes32)',
]);

const FEE_ABI = parseAbi([
  'function sync(uint256 tokenId)',
  'function claim(uint256 tokenId)',
  'function earned(uint256 tokenId) view returns (uint256)',
  'function lock(uint256 tokenId, uint256 amount)',
]);

type InjectedEth = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function injectedEth(): InjectedEth | null {
  if (typeof window === 'undefined') return null;
  return (window as Window & { ethereum?: InjectedEth }).ethereum ?? null;
}

async function writeRpc(method: string, params: unknown[]): Promise<unknown> {
  const eth = injectedEth();
  if (!eth) throw new Error('Connect MetaMask, Rabby, or Robinhood Wallet on Hood 4663.');
  return eth.request({ method, params });
}

async function ensureHood(): Promise<string> {
  const from = await connectHoodEvm();
  const chainId = (await writeRpc('eth_chainId', [])) as string;
  if (chainId.toLowerCase() !== HOOD_CHAIN_ID_HEX.toLowerCase()) {
    const err = await addHoodToWallet();
    if (err) throw new Error(err);
  }
  return from;
}

async function send(to: `0x${string}`, data: `0x${string}`): Promise<string> {
  const from = await ensureHood();
  const hash = (await writeRpc('eth_sendTransaction', [{ from, to, data }])) as string;
  if (!hash) throw new Error('Wallet did not send the Square loop transaction');
  return hash;
}

export function squareLoopContractsReady(): boolean {
  return Boolean(ACTIVATION_REGISTRY_ADDRESS && STALL_VAULT_ADDRESS && FEE_SPLITTER_ADDRESS);
}

export function buildTokenLive(): boolean {
  return Boolean(BUILD_TOKEN_ADDRESS);
}

export type SquareLoopChainSnap = {
  entry: SquareLoopEntry;
  earnedWei: string;
};

async function hoodCall(to: `0x${string}`, data: `0x${string}`): Promise<`0x${string}`> {
  const urls = [...new Set([hoodRpcUrl(), 'https://rpc.mainnet.chain.robinhood.com'])];
  let last: unknown;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'user-agent': 'BuildersDEX/square-loop',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{ to, data }, 'latest'],
        }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) {
        last = `rpc ${res.status}`;
        continue;
      }
      const body = (await res.json()) as { result?: string; error?: { message?: string } };
      if (typeof body.result === 'string' && body.result !== '0x') {
        return body.result as `0x${string}`;
      }
      last = body.error?.message || 'empty rpc result';
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error(String(last || 'hood rpc failed'));
}

function phaseFromRecord(
  activatedAt: bigint,
  parkedAt: bigint,
  stallKey: `0x${string}`,
): SquareLoopPhase {
  if (stallKey !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return 'stalled';
  }
  if (parkedAt > 0n) return 'parked';
  if (activatedAt > 0n) return 'activated';
  return 'dormant';
}

export async function loadSquareLoopChain(tokenId: number): Promise<SquareLoopChainSnap | null> {
  if (!squareLoopContractsReady() || !Number.isInteger(tokenId) || tokenId < 0) return null;
  const recordData = encodeFunctionData({
    abi: REGISTRY_ABI,
    functionName: 'records',
    args: [BigInt(tokenId)],
  });
  const stallData = encodeFunctionData({
    abi: STALL_ABI,
    functionName: 'stallOf',
    args: [BigInt(tokenId)],
  });
  const feeData = encodeFunctionData({
    abi: FEE_ABI,
    functionName: 'earned',
    args: [BigInt(tokenId)],
  });
  const [recordHex, stallHex, feeHex] = await Promise.all([
    hoodCall(ACTIVATION_REGISTRY_ADDRESS!, recordData),
    hoodCall(STALL_VAULT_ADDRESS!, stallData),
    hoodCall(FEE_SPLITTER_ADDRESS!, feeData).catch(() => '0x' as const),
  ]);
  const record = decodeFunctionResult({
    abi: REGISTRY_ABI,
    functionName: 'records',
    data: recordHex,
  });
  const stallKey = decodeFunctionResult({
    abi: STALL_ABI,
    functionName: 'stallOf',
    data: stallHex,
  });
  let earnedWei = '0';
  if (feeHex && feeHex !== '0x') {
    try {
      earnedWei = decodeFunctionResult({
        abi: FEE_ABI,
        functionName: 'earned',
        data: feeHex,
      }).toString();
    } catch {
      earnedWei = '0';
    }
  }
  const activatedAtBn = record[2];
  const parkedAtBn = record[3];
  const unparkUnlockAtBn = record[4];
  const activatedAt = Number(activatedAtBn);
  const parkedAt = Number(parkedAtBn);
  const unparkUnlockAt = Number(unparkUnlockAtBn);
  const phase = phaseFromRecord(activatedAtBn, parkedAtBn, stallKey);
  return {
    earnedWei,
    entry: {
      tokenId,
      phase,
      activatedAt: activatedAt > 0 ? activatedAt * 1000 : null,
      parkedAt: parkedAt > 0 ? parkedAt * 1000 : null,
      stallProjectId: phase === 'stalled' ? FIRST_STALL_PROJECT_ID : null,
      unparkUnlockAt: unparkUnlockAt > 0 ? unparkUnlockAt * 1000 : null,
      updatedAt: Date.now(),
    },
  };
}

export async function chainActivate(tokenId: number): Promise<string> {
  if (!ACTIVATION_REGISTRY_ADDRESS) throw new Error('Activation registry is not deployed yet.');
  return send(
    ACTIVATION_REGISTRY_ADDRESS,
    encodeFunctionData({ abi: REGISTRY_ABI, functionName: 'activate', args: [BigInt(tokenId)] }),
  );
}

export async function chainPark(tokenId: number): Promise<string> {
  if (!ACTIVATION_REGISTRY_ADDRESS) throw new Error('Activation registry is not deployed yet.');
  return send(
    ACTIVATION_REGISTRY_ADDRESS,
    encodeFunctionData({ abi: REGISTRY_ABI, functionName: 'park', args: [BigInt(tokenId)] }),
  );
}

export async function chainRequestUnpark(tokenId: number): Promise<string> {
  if (!ACTIVATION_REGISTRY_ADDRESS) throw new Error('Activation registry is not deployed yet.');
  return send(
    ACTIVATION_REGISTRY_ADDRESS,
    encodeFunctionData({
      abi: REGISTRY_ABI,
      functionName: 'requestUnpark',
      args: [BigInt(tokenId)],
    }),
  );
}

export async function chainUnpark(tokenId: number): Promise<string> {
  if (!ACTIVATION_REGISTRY_ADDRESS) throw new Error('Activation registry is not deployed yet.');
  return send(
    ACTIVATION_REGISTRY_ADDRESS,
    encodeFunctionData({ abi: REGISTRY_ABI, functionName: 'unpark', args: [BigInt(tokenId)] }),
  );
}

export async function chainTakeStall(tokenId: number): Promise<string> {
  if (!STALL_VAULT_ADDRESS) throw new Error('Stall vault is not deployed yet.');
  return send(
    STALL_VAULT_ADDRESS,
    encodeFunctionData({
      abi: STALL_ABI,
      functionName: 'takeStall',
      args: [BigInt(tokenId), FIRST_STALL_KEY],
    }),
  );
}

export async function chainExitStall(tokenId: number): Promise<string> {
  if (!STALL_VAULT_ADDRESS) throw new Error('Stall vault is not deployed yet.');
  return send(
    STALL_VAULT_ADDRESS,
    encodeFunctionData({ abi: STALL_ABI, functionName: 'exitStall', args: [BigInt(tokenId)] }),
  );
}

export async function chainClaimFees(tokenId: number): Promise<string> {
  if (!FEE_SPLITTER_ADDRESS) throw new Error('Fee splitter is not deployed yet.');
  return send(
    FEE_SPLITTER_ADDRESS,
    encodeFunctionData({ abi: FEE_ABI, functionName: 'claim', args: [BigInt(tokenId)] }),
  );
}

export async function chainSyncFees(tokenId: number): Promise<string> {
  if (!FEE_SPLITTER_ADDRESS) throw new Error('Fee splitter is not deployed yet.');
  return send(
    FEE_SPLITTER_ADDRESS,
    encodeFunctionData({ abi: FEE_ABI, functionName: 'sync', args: [BigInt(tokenId)] }),
  );
}
