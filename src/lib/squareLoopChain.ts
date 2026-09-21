import { encodeFunctionData, keccak256, parseAbi, toBytes } from 'viem';
import {
  ACTIVATION_REGISTRY_ADDRESS,
  BUILD_TOKEN_ADDRESS,
  FEE_SPLITTER_ADDRESS,
  STALL_VAULT_ADDRESS,
} from '../data/buildToken';
import { FIRST_STALL_PROJECT_ID } from '../data/squareLoop';
import { HOOD_CHAIN_ID_HEX, addHoodToWallet } from '../data/hoodChain';
import { connectHoodEvm } from './hoodShareMint';

export const FIRST_STALL_KEY = keccak256(toBytes(FIRST_STALL_PROJECT_ID));

const REGISTRY_ABI = parseAbi([
  'function activate(uint256 tokenId)',
  'function park(uint256 tokenId)',
  'function requestUnpark(uint256 tokenId)',
  'function unpark(uint256 tokenId)',
  'function isParked(uint256 tokenId, address who) view returns (bool)',
  'function isActivated(uint256 tokenId, address who) view returns (bool)',
  'function tbaOf(uint256 tokenId) view returns (address)',
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
