/**
 * Builder Passport On-Chain Integration
 *
 * Devnet program: 7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD
 * Set VITE_BUILDER_PASSPORT_PROGRAM_ID to enable on-chain reads.
 * Without it, Passport stats stay local-only (localStorage simulation).
 */

import { Connection, PublicKey } from '@solana/web3.js';

const PROGRAM_ID_ENV =
  import.meta.env.VITE_BUILDER_PASSPORT_PROGRAM_ID ||
  '7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD';

export const BUILDER_PASSPORT_PROGRAM_ID = PROGRAM_ID_ENV 
  ? new PublicKey(PROGRAM_ID_ENV)
  : null;

export const PASSPORT_DEPLOYED = Boolean(PROGRAM_ID_ENV);

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
 * Returns null if program is not deployed
 */
export function derivePassportPDA(
  walletAddress: PublicKey
): [PublicKey, number] | null {
  if (!BUILDER_PASSPORT_PROGRAM_ID) return null;
  return PublicKey.findProgramAddressSync(
    [Buffer.from('builder-passport'), walletAddress.toBuffer()],
    BUILDER_PASSPORT_PROGRAM_ID
  );
}

/**
 * Fetch a builder's passport from the blockchain
 * Returns null if program is not deployed or account doesn't exist
 */
export async function fetchBuilderPassport(
  connection: Connection,
  walletAddress: PublicKey
): Promise<BuilderPassport | null> {
  try {
    if (!PASSPORT_DEPLOYED) return null;
    const pda = derivePassportPDA(walletAddress);
    if (!pda) return null;
    const [passportPDA] = pda;
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
 * Always returns false if program is not deployed
 */
export async function hasBuilderPassport(
  connection: Connection,
  walletAddress: PublicKey
): Promise<boolean> {
  if (!PASSPORT_DEPLOYED) return false;
  const passport = await fetchBuilderPassport(connection, walletAddress);
  return passport !== null;
}

/**
 * Get Solana Explorer URL for passport PDA
 * Returns null if program is not deployed
 */
export function getPassportExplorerUrl(
  walletAddress: PublicKey,
  cluster: 'mainnet' | 'devnet' = 'mainnet'
): string | null {
  const pda = derivePassportPDA(walletAddress);
  if (!pda) return null;
  const [passportPDA] = pda;
  const clusterParam = cluster === 'devnet' ? '?cluster=devnet' : '';
  return `https://explorer.solana.com/address/${passportPDA.toBase58()}${clusterParam}`;
}

/**
 * Initialize a Builder Passport on-chain (mint)
 * Returns transaction signature on success, throws on error
 */
export async function initializeBuilderPassport(
  connection: Connection,
  walletAddress: PublicKey,
  signTransaction: (tx: any) => Promise<any>
): Promise<string> {
  if (!BUILDER_PASSPORT_PROGRAM_ID) {
    throw new Error('Builder Passport program not deployed');
  }

  const pda = derivePassportPDA(walletAddress);
  if (!pda) {
    throw new Error('Could not derive passport PDA');
  }

  const [passportPDA] = pda;

  // Check if already exists
  const existing = await connection.getAccountInfo(passportPDA);
  if (existing) {
    throw new Error('Builder Passport already minted for this wallet');
  }

  // Import web3.js types
  const { Transaction, SystemProgram, TransactionInstruction } = await import('@solana/web3.js');

  // Build initialize instruction
  // Instruction discriminator for "initialize" (first 8 bytes of sha256("global:initialize"))
  const discriminator = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]);
  
  const keys = [
    { pubkey: passportPDA, isSigner: false, isWritable: true },
    { pubkey: walletAddress, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  const ix = new TransactionInstruction({
    keys,
    programId: BUILDER_PASSPORT_PROGRAM_ID,
    data: discriminator,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = walletAddress;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const signed = await signTransaction(tx);
  const signature = await connection.sendRawTransaction(signed.serialize());
  
  // Wait for confirmation
  await connection.confirmTransaction(signature, 'confirmed');
  
  return signature;
}
