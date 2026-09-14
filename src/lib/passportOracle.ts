/**
 * Builder Passport On-Chain Score Oracle
 * 
 * Server-side module that can update Builder Passport scores on-chain
 * via the oracle authority from the Config PDA.
 * 
 * Score Policy (v1):
 * - Scout call publish: +25 (max +100 per day per wallet)
 * - Application approved: +100 (once per application)
 * - Scores clamped 0-10000
 * 
 * Environment Variables:
 * - BUILDER_PASSPORT_PROGRAM_ID: Program ID (defaults to devnet)
 * - PASSPORT_ORACLE_SECRET_KEY: Base58 or JSON byte array of oracle keypair
 * - SOLANA_DEVNET_RPC_URL or SOLANA_RPC_URL: RPC endpoint
 */

import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import bs58 from 'bs58';

const PROGRAM_ID_DEFAULT = '7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD';

interface OracleConfig {
  programId: PublicKey;
  oracleKeypair: Keypair | null;
  connection: Connection;
  ready: boolean;
}

let cachedConfig: OracleConfig | null = null;

/**
 * Load oracle configuration from environment
 */
function loadOracleConfig(): OracleConfig {
  if (cachedConfig) return cachedConfig;

  const programIdStr = process.env.BUILDER_PASSPORT_PROGRAM_ID || PROGRAM_ID_DEFAULT;
  const programId = new PublicKey(programIdStr);

  let oracleKeypair: Keypair | null = null;
  const oracleSecretRaw = process.env.PASSPORT_ORACLE_SECRET_KEY;
  
  if (oracleSecretRaw) {
    try {
      // Try Base58 first
      if (oracleSecretRaw.length < 100) {
        const decoded = bs58.decode(oracleSecretRaw);
        oracleKeypair = Keypair.fromSecretKey(decoded);
      } else {
        // Try JSON byte array
        const bytes = JSON.parse(oracleSecretRaw);
        if (Array.isArray(bytes)) {
          oracleKeypair = Keypair.fromSecretKey(Uint8Array.from(bytes));
        }
      }
    } catch (err) {
      console.error('[passport-oracle] Failed to parse PASSPORT_ORACLE_SECRET_KEY:', err);
    }
  }

  const rpcUrl = 
    process.env.SOLANA_DEVNET_RPC_URL || 
    process.env.SOLANA_RPC_URL || 
    'https://api.devnet.solana.com';
  
  const connection = new Connection(rpcUrl, 'confirmed');

  const ready = Boolean(oracleKeypair);
  if (!ready) {
    console.warn('[passport-oracle] Not configured — set PASSPORT_ORACLE_SECRET_KEY to enable on-chain updates');
  } else {
    console.log('[passport-oracle] Configured with oracle:', oracleKeypair!.publicKey.toBase58());
  }

  cachedConfig = {
    programId,
    oracleKeypair,
    connection,
    ready,
  };

  return cachedConfig;
}

/**
 * Derive the Config PDA
 */
export function deriveConfigPDA(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    programId
  );
}

/**
 * Derive the passport PDA for a wallet
 */
export function derivePassportPDA(
  walletAddress: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('builder-passport'), walletAddress.toBuffer()],
    programId
  );
}

/**
 * Check if the passport account exists for a wallet
 */
export async function hasPassport(
  walletAddress: PublicKey
): Promise<boolean> {
  try {
    const config = loadOracleConfig();
    const [passportPDA] = derivePassportPDA(walletAddress, config.programId);
    const accountInfo = await config.connection.getAccountInfo(passportPDA);
    return accountInfo !== null;
  } catch (err) {
    console.error('[passport-oracle] hasPassport error:', err);
    return false;
  }
}

/**
 * Fetch current score from on-chain passport
 * Returns null if account doesn't exist
 */
export async function fetchCurrentScore(
  walletAddress: PublicKey
): Promise<number | null> {
  try {
    const config = loadOracleConfig();
    const [passportPDA] = derivePassportPDA(walletAddress, config.programId);
    const accountInfo = await config.connection.getAccountInfo(passportPDA);
    
    if (!accountInfo) return null;

    // Parse score from account data
    // Layout: discriminator (8) + authority (32) + score (2) + ...
    const data = accountInfo.data;
    if (data.length < 42) return null;
    
    const score = data.readUInt16LE(40);
    return score;
  } catch (err) {
    console.error('[passport-oracle] fetchCurrentScore error:', err);
    return null;
  }
}

interface UpdateScoreResult {
  success: boolean;
  signature?: string;
  error?: string;
  notReady?: boolean;
}

/**
 * Update a wallet's on-chain passport score
 * 
 * @param walletAddress - The wallet whose passport to update
 * @param newScore - New score (0-10000), clamped automatically
 * @returns Result with signature if successful
 */
export async function updatePassportScore(
  walletAddress: PublicKey,
  newScore: number
): Promise<UpdateScoreResult> {
  const config = loadOracleConfig();
  
  if (!config.ready || !config.oracleKeypair) {
    console.warn('[passport-oracle] updatePassportScore called but oracle not configured');
    return {
      success: false,
      notReady: true,
      error: 'Oracle not configured (missing PASSPORT_ORACLE_SECRET_KEY)',
    };
  }

  try {
    // Clamp score 0-10000
    const clampedScore = Math.max(0, Math.min(10000, Math.floor(newScore)));

    // Derive PDAs
    const [passportPDA] = derivePassportPDA(walletAddress, config.programId);
    const [configPDA] = deriveConfigPDA(config.programId);

    // Check if passport exists
    const accountInfo = await config.connection.getAccountInfo(passportPDA);
    if (!accountInfo) {
      return {
        success: false,
        error: 'Passport not initialized for this wallet (must mint first)',
      };
    }

    // Build update_score instruction
    // Instruction discriminator for "update_score" (first 8 bytes of sha256("global:update_score"))
    const discriminator = Buffer.from([113, 90, 215, 166, 104, 179, 157, 115]);
    const scoreBuffer = Buffer.alloc(2);
    scoreBuffer.writeUInt16LE(clampedScore);

    const data = Buffer.concat([discriminator, scoreBuffer]);

    const keys = [
      { pubkey: passportPDA, isSigner: false, isWritable: true },
      { pubkey: configPDA, isSigner: false, isWritable: false },
      { pubkey: config.oracleKeypair.publicKey, isSigner: true, isWritable: false },
    ];

    const ix = new TransactionInstruction({
      keys,
      programId: config.programId,
      data,
    });

    // Build and send transaction
    const tx = new Transaction().add(ix);
    tx.feePayer = config.oracleKeypair.publicKey;
    tx.recentBlockhash = (await config.connection.getLatestBlockhash()).blockhash;

    tx.sign(config.oracleKeypair);

    const signature = await config.connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    // Wait for confirmation
    await config.connection.confirmTransaction(signature, 'confirmed');

    console.log(`[passport-oracle] Score updated to ${clampedScore} for ${walletAddress.toBase58()}: ${signature}`);

    return {
      success: true,
      signature,
    };
  } catch (err: any) {
    console.error('[passport-oracle] updatePassportScore error:', err);
    return {
      success: false,
      error: err?.message || String(err),
    };
  }
}

/**
 * Score bump tracking to enforce daily caps
 * (In-memory; for production use Redis or database)
 */
const dailyScoutBumps = new Map<string, { date: string; count: number }>();

const MAX_SCOUT_BUMPS_PER_DAY = 4; // 4 x 25 = 100 max per day
const SCOUT_BUMP_AMOUNT = 25;
const APPLICATION_BUMP_AMOUNT = 100;

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Attempt to bump score for a successful Scout submission
 * Enforces max +100 per day via daily cap
 */
export async function bumpScoreForScout(
  walletAddress: PublicKey
): Promise<UpdateScoreResult> {
  try {
    const config = loadOracleConfig();
    if (!config.ready) {
      return { success: false, notReady: true, error: 'Oracle not configured' };
    }

    // Check daily cap
    const walletKey = walletAddress.toBase58();
    const today = getTodayKey();
    const tracked = dailyScoutBumps.get(walletKey);

    if (tracked && tracked.date === today && tracked.count >= MAX_SCOUT_BUMPS_PER_DAY) {
      console.log(`[passport-oracle] Scout bump skipped for ${walletKey} — daily cap reached`);
      return {
        success: false,
        error: `Daily scout bump cap reached (max ${MAX_SCOUT_BUMPS_PER_DAY} per day)`,
      };
    }

    // Fetch current score
    const currentScore = await fetchCurrentScore(walletAddress);
    if (currentScore === null) {
      return { success: false, error: 'Passport not initialized' };
    }

    const newScore = currentScore + SCOUT_BUMP_AMOUNT;

    const result = await updatePassportScore(walletAddress, newScore);

    if (result.success) {
      // Update daily tracking
      if (tracked && tracked.date === today) {
        tracked.count += 1;
      } else {
        dailyScoutBumps.set(walletKey, { date: today, count: 1 });
      }
      console.log(`[passport-oracle] Scout bump +${SCOUT_BUMP_AMOUNT} for ${walletKey} (${tracked?.count || 1}/${MAX_SCOUT_BUMPS_PER_DAY} today)`);
    }

    return result;
  } catch (err: any) {
    console.error('[passport-oracle] bumpScoreForScout error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Bump score for an approved application
 * One-time +100 (tracked separately to prevent duplicates)
 */
const approvedApplicationBumps = new Set<string>();

export async function bumpScoreForApplication(
  walletAddress: PublicKey,
  applicationId: string
): Promise<UpdateScoreResult> {
  try {
    const config = loadOracleConfig();
    if (!config.ready) {
      return { success: false, notReady: true, error: 'Oracle not configured' };
    }

    // Prevent duplicate bumps for same application
    const bumpKey = `${walletAddress.toBase58()}-${applicationId}`;
    if (approvedApplicationBumps.has(bumpKey)) {
      console.log(`[passport-oracle] Application bump skipped for ${bumpKey} — already processed`);
      return { success: false, error: 'Application already awarded points' };
    }

    // Fetch current score
    const currentScore = await fetchCurrentScore(walletAddress);
    if (currentScore === null) {
      return { success: false, error: 'Passport not initialized' };
    }

    const newScore = currentScore + APPLICATION_BUMP_AMOUNT;

    const result = await updatePassportScore(walletAddress, newScore);

    if (result.success) {
      approvedApplicationBumps.add(bumpKey);
      console.log(`[passport-oracle] Application bump +${APPLICATION_BUMP_AMOUNT} for ${bumpKey}`);
    }

    return result;
  } catch (err: any) {
    console.error('[passport-oracle] bumpScoreForApplication error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}
