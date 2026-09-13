/**
 * Builder Passport On-Chain Integration
 * 
 * Utilities for interacting with the Builder Passport Solana program.
 * Fetches passport PDAs and provides helpers for score display.
 */

import { Connection, PublicKey } from '@solana/web3.js';

// Program ID - Update this after deploying to devnet/mainnet
export const BUILDER_PASSPORT_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_BUILDER_PASSPORT_PROGRAM_ID || 
  'HM1CaGZRzdNC7pJxtj2jNwuxhYDbMQGt3xGAJk9iKakD'
);

export interface BuilderPassport {
  authority: PublicKey;
  score: number;
  level: BuilderLevel;
  lastUpdated: Date;
  bump: number;
}

export enum BuilderLevel {
  Rookie = 'Rookie',
  Builder = 'Builder',
  Advanced = 'Advanced',
  Expert = 'Expert',
  Genesis = 'Genesis',
}

const LEVEL_NAMES = ['Rookie', 'Builder', 'Advanced', 'Expert', 'Genesis'];

/**
 * Derive the PDA address for a builder's passport
 */
export function derivePassportPDA(
  walletAddress: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('builder-passport'), walletAddress.toBuffer()],
    BUILDER_PASSPORT_PROGRAM_ID
  );
}

/**
 * Fetch a builder's passport from the blockchain
 */
export async function fetchBuilderPassport(
  connection: Connection,
  walletAddress: PublicKey
): Promise<BuilderPassport | null> {
  try {
    const [passportPDA] = derivePassportPDA(walletAddress);
    const accountInfo = await connection.getAccountInfo(passportPDA);

    if (!accountInfo) {
      return null;
    }

    // Parse the account data (simplified - use Anchor IDL in production)
    const data = accountInfo.data;
    
    // Account layout: discriminator (8) + authority (32) + score (2) + level (1) + lastUpdated (8) + bump (1)
    if (data.length < 52) {
      return null;
    }

    const authority = new PublicKey(data.slice(8, 40));
    const score = data.readUInt16LE(40);
    const levelIndex = data[42];
    const lastUpdated = new Date(Number(data.readBigInt64LE(43)) * 1000);
    const bump = data[51];

    return {
      authority,
      score,
      level: LEVEL_NAMES[levelIndex] as BuilderLevel,
      lastUpdated,
      bump,
    };
  } catch (error) {
    console.error('Error fetching builder passport:', error);
    return null;
  }
}

/**
 * Get the level name for a given score
 */
export function getLevelForScore(score: number): BuilderLevel {
  if (score >= 1000) return BuilderLevel.Genesis;
  if (score >= 500) return BuilderLevel.Expert;
  if (score >= 250) return BuilderLevel.Advanced;
  if (score >= 100) return BuilderLevel.Builder;
  return BuilderLevel.Rookie;
}

/**
 * Get level color for UI display
 */
export function getLevelColor(level: BuilderLevel): string {
  switch (level) {
    case BuilderLevel.Genesis:
      return '#FFD700'; // Gold
    case BuilderLevel.Expert:
      return '#9333EA'; // Purple
    case BuilderLevel.Advanced:
      return '#3B82F6'; // Blue
    case BuilderLevel.Builder:
      return '#10B981'; // Green
    case BuilderLevel.Rookie:
      return '#6B7280'; // Gray
    default:
      return '#6B7280';
  }
}

/**
 * Check if a wallet has an initialized passport
 */
export async function hasBuilderPassport(
  connection: Connection,
  walletAddress: PublicKey
): Promise<boolean> {
  const passport = await fetchBuilderPassport(connection, walletAddress);
  return passport !== null;
}

/**
 * Get Solana Explorer URL for passport PDA
 */
export function getPassportExplorerUrl(
  walletAddress: PublicKey,
  cluster: 'mainnet' | 'devnet' = 'mainnet'
): string {
  const [passportPDA] = derivePassportPDA(walletAddress);
  const clusterParam = cluster === 'devnet' ? '?cluster=devnet' : '';
  return `https://explorer.solana.com/address/${passportPDA.toBase58()}${clusterParam}`;
}
