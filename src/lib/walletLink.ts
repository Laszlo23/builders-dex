/**
 * Solana ↔ EVM wallet linking (dual-sign identity bind).
 * Same 0x address is valid on Base and Robinhood Chain (4663).
 * Server persists links; optional future on-chain PDA ["wallet-link", sol].
 */
import { getSqlite } from './db/sqlite';

export type WalletLink = {
  solanaWallet: string;
  /** EVM 0x — valid on Base, Hood, and other EVM L2s */
  evmWallet: string;
  /** @deprecated alias of evmWallet (column name in SQLite) */
  baseWallet: string;
  solSig: string | null;
  evmSig: string | null;
  /** @deprecated alias of evmSig */
  baseSig: string | null;
  createdAt: string;
  updatedAt: string;
};

const SOL_MSG_PREFIX = 'Builders DEX link EVM wallet\nSolana:';
const EVM_MSG_PREFIX = 'Builders DEX link Solana wallet\nEVM:';
const LEGACY_SOL_MSG_PREFIX = 'Builders DEX link Base wallet\nSolana:';
const LEGACY_BASE_MSG_PREFIX = 'Builders DEX link Solana wallet\nBase:';

export function buildSolLinkMessage(solanaWallet: string, evmWallet: string): string {
  return `${SOL_MSG_PREFIX} ${solanaWallet}\nEVM: ${evmWallet}\nAction: bind`;
}

export function buildEvmLinkMessage(solanaWallet: string, evmWallet: string): string {
  return `${EVM_MSG_PREFIX} ${evmWallet}\nSolana: ${solanaWallet}\nAction: bind`;
}

/** @deprecated use buildEvmLinkMessage */
export function buildBaseLinkMessage(solanaWallet: string, evmWallet: string): string {
  return buildEvmLinkMessage(solanaWallet, evmWallet);
}

export function buildLegacySolLinkMessage(solanaWallet: string, evmWallet: string): string {
  return `${LEGACY_SOL_MSG_PREFIX} ${solanaWallet}\nBase: ${evmWallet}\nAction: bind`;
}

export function buildLegacyBaseLinkMessage(solanaWallet: string, evmWallet: string): string {
  return `${LEGACY_BASE_MSG_PREFIX} ${evmWallet}\nSolana: ${solanaWallet}\nAction: bind`;
}

export function buildSolUnlinkMessage(solanaWallet: string): string {
  return `Builders DEX unlink EVM wallet\nSolana: ${solanaWallet}\nAction: unbind`;
}

export function buildLegacySolUnlinkMessage(solanaWallet: string): string {
  return `Builders DEX unlink Base wallet\nSolana: ${solanaWallet}\nAction: unbind`;
}

function toWalletLink(row: {
  solana_wallet: string;
  base_wallet: string;
  sol_sig: string | null;
  base_sig: string | null;
  created_at: string;
  updated_at: string;
}): WalletLink {
  return {
    solanaWallet: row.solana_wallet,
    evmWallet: row.base_wallet,
    baseWallet: row.base_wallet,
    solSig: row.sol_sig,
    evmSig: row.base_sig,
    baseSig: row.base_sig,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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
  return toWalletLink(row);
}

export function upsertWalletLink(input: {
  solanaWallet: string;
  evmWallet?: string;
  solSig?: string;
  evmSig?: string;
  /** @deprecated use evmWallet */
  baseWallet?: string;
  /** @deprecated use evmSig */
  baseSig?: string;
}): WalletLink {
  const evm = (input.evmWallet || input.baseWallet || '').trim();
  if (!evm) {
    throw new Error('evmWallet required');
  }
  const evmSig = input.evmSig ?? input.baseSig;
  const db = getSqlite();
  db.prepare(
    `INSERT INTO wallet_links (solana_wallet, base_wallet, sol_sig, base_sig, created_at, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
     ON CONFLICT(solana_wallet) DO UPDATE SET
       base_wallet = excluded.base_wallet,
       sol_sig = COALESCE(excluded.sol_sig, wallet_links.sol_sig),
       base_sig = COALESCE(excluded.base_sig, wallet_links.base_sig),
       updated_at = datetime('now')`,
  ).run(input.solanaWallet, evm, input.solSig ?? null, evmSig ?? null);
  return getWalletLink(input.solanaWallet)!;
}

export function deleteWalletLink(solanaWallet: string): boolean {
  const db = getSqlite();
  const info = db.prepare(`DELETE FROM wallet_links WHERE solana_wallet = ?`).run(solanaWallet);
  return info.changes > 0;
}

export function isValidEvmAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
}

/** @deprecated use isValidEvmAddress — same 0x checksum space on Base and Hood */
export function isValidBaseAddress(addr: string): boolean {
  return isValidEvmAddress(addr);
}

export function isValidSolanaAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim());
}
