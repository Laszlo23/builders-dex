/**
 * Client helpers for Metaplex Core "Builders Passport" collection (Phase 5).
 * Mint is gated on an existing Builder Passport PDA — collection mint address
 * comes from VITE_PASSPORT_COLLECTION_MINT once created.
 */
import { Connection, PublicKey } from '@solana/web3.js';
import { PASSPORT_COLLECTION } from '../data/crossChainRegistry';
import { hasBuilderPassport } from './builderPassport';

export function getPassportCollectionMint(): PublicKey | null {
  const raw = PASSPORT_COLLECTION.collectionMint;
  if (!raw) return null;
  try {
    return new PublicKey(raw);
  } catch {
    return null;
  }
}

export async function canMintPassportNft(
  connection: Connection,
  wallet: PublicKey,
): Promise<{ ok: boolean; reason?: string }> {
  const hasPda = await hasBuilderPassport(connection, wallet);
  if (!hasPda) {
    return { ok: false, reason: 'Mint Builder Passport PDA first' };
  }
  if (!getPassportCollectionMint()) {
    return {
      ok: false,
      reason: 'Collection mint not configured (set VITE_PASSPORT_COLLECTION_MINT)',
    };
  }
  return { ok: true };
}

export function passportCollectionSummary(): {
  name: string;
  symbol: string;
  collectionMint: string | null;
  status: 'ready' | 'awaiting_collection' | 'awaiting_passport_program';
} {
  const mint = PASSPORT_COLLECTION.collectionMint;
  return {
    name: PASSPORT_COLLECTION.name,
    symbol: PASSPORT_COLLECTION.symbol,
    collectionMint: mint,
    status: mint ? 'ready' : 'awaiting_collection',
  };
}
