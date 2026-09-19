import type { ChainLaneId } from '../data/chainLanes';

const ROOM_KEY = 'buildersdex.walletRoom';
const EVM_KEY = 'buildersdex.evmAccount';

export type WalletRoomId = ChainLaneId;

export function loadWalletRoom(): WalletRoomId {
  if (typeof window === 'undefined') return 'solana';
  const raw = window.localStorage.getItem(ROOM_KEY);
  if (raw === 'base' || raw === 'hood' || raw === 'solana') return raw;
  return 'solana';
}

export function saveWalletRoom(id: WalletRoomId): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ROOM_KEY, id);
  window.dispatchEvent(new CustomEvent('bdx-wallet-room'));
}

export function loadEvmAccount(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(EVM_KEY);
  return raw && /^0x[a-fA-F0-9]{40}$/.test(raw) ? raw : null;
}

export function saveEvmAccount(addr: string | null): void {
  if (typeof window === 'undefined') return;
  if (addr) window.localStorage.setItem(EVM_KEY, addr);
  else window.localStorage.removeItem(EVM_KEY);
  window.dispatchEvent(new CustomEvent('bdx-wallet-room'));
}

export function shortenWallet(addr: string): string {
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}
