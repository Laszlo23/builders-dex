/**
 * Solana ↔ Base wallet linking (dual-sign identity bind).
 * Server persists links; optional future on-chain PDA ["wallet-link", sol].
 */
import { getSqlite } from './db/sqlite';

export type WalletLink = {
  solanaWallet: string;
  baseWallet: string;
  solSig: string | null;
  baseSig: string | null;
  createdAt: string;
  updatedAt: string;
};

const SOL_MSG_PREFIX = 'Builders DEX link Base wallet\nSolana:';
const BASE_MSG_PREFIX = 'Builders DEX link Solana wallet\nBase:';

export function buildSolLinkMessage(solanaWallet: string, baseWallet: string): string {
  return `${SOL_MSG_PREFIX} ${solanaWallet}\nBase: ${baseWallet}\nAction: bind`;
}

export function buildBaseLinkMessage(solanaWallet: string, baseWallet: string): string {
  return `${BASE_MSG_PREFIX} ${baseWallet}\nSolana: ${solanaWallet}\nAction: bind`;
}

export function buildSolUnlinkMessage(solanaWallet: string): string {
  return `Builders DEX unlink Base wallet\nSolana: ${solanaWallet}\nAction: unbind`;
}

export function getWalletLink(solanaWallet: string): WalletLink | null {
  const db = getSqlite();
  const row = db
    .prepare(
      `SELECT solana_wallet, base_wallet, sol_sig, base_sig, created_at, updated_at
       FROM wallet_links WHERE solana_wallet = ?`,
    )
    .get(solanaWallet) as
    | {
        solana_wallet: string;
        base_wallet: string;
        sol_sig: string | null;
        base_sig: string | null;
        created_at: string;
        updated_at: string;
      }
    | undefined;
  if (!row) return null;
  return {
    solanaWallet: row.solana_wallet,
    baseWallet: row.base_wallet,
    solSig: row.sol_sig,
    baseSig: row.base_sig,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function upsertWalletLink(input: {
  solanaWallet: string;
  baseWallet: string;
  solSig?: string;
  baseSig?: string;
}): WalletLink {
  const db = getSqlite();
  db.prepare(
    `INSERT INTO wallet_links (solana_wallet, base_wallet, sol_sig, base_sig, created_at, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
     ON CONFLICT(solana_wallet) DO UPDATE SET
       base_wallet = excluded.base_wallet,
       sol_sig = COALESCE(excluded.sol_sig, wallet_links.sol_sig),
       base_sig = COALESCE(excluded.base_sig, wallet_links.base_sig),
       updated_at = datetime('now')`,
  ).run(
    input.solanaWallet,
    input.baseWallet,
    input.solSig ?? null,
    input.baseSig ?? null,
  );
  return getWalletLink(input.solanaWallet)!;
}

export function deleteWalletLink(solanaWallet: string): boolean {
  const db = getSqlite();
  const info = db.prepare(`DELETE FROM wallet_links WHERE solana_wallet = ?`).run(solanaWallet);
  return info.changes > 0;
}

export function isValidBaseAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
}

export function isValidSolanaAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim());
}
