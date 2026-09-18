/**
 * Server-only Hood deployer. Never log the key. Never import from Vite client.
 * Address is the published Aura founder 0x — same key on Base and Hood.
 */
import { secp256k1 } from '@noble/curves/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { AURA_DEV_WALLET } from '../data/crossChainRegistry';

function readDeployerKey(): Uint8Array | null {
  const raw = (process.env.HOOD_DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY || '').trim();
  if (!raw) return null;
  const hex = raw.startsWith('0x') ? raw.slice(2) : raw;
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) return null;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function addressFromPrivateKey(key: Uint8Array): string {
  const pub = secp256k1.getPublicKey(key, false);
  const hash = keccak_256(pub.slice(1));
  const addr = Array.from(hash.slice(-20), (b) => b.toString(16).padStart(2, '0')).join('');
  return `0x${addr}`;
}

export function hoodDeployerConfigured(): boolean {
  return Boolean(readDeployerKey());
}

export function hoodDeployerPrivateKeyHex(): `0x${string}` | null {
  const key = readDeployerKey();
  if (!key) return null;
  const hex = Array.from(key, (b) => b.toString(16).padStart(2, '0')).join('');
  return `0x${hex}`;
}

/** Derived 0x, or the published founder if no key is loaded. */
export function hoodDeployerAddress(): string {
  const key = readDeployerKey();
  if (!key) return AURA_DEV_WALLET;
  return addressFromPrivateKey(key);
}

export function hoodDeployerMatchesFounder(): boolean {
  return hoodDeployerAddress().toLowerCase() === AURA_DEV_WALLET.toLowerCase();
}

export function logHoodDeployerBoot(): void {
  if (!hoodDeployerConfigured()) {
    console.warn('[hood] deployer key not loaded');
    return;
  }
  console.log(
    '[hood] deployer loaded',
    hoodDeployerMatchesFounder() ? 'founder' : 'unexpected-address',
  );
}
