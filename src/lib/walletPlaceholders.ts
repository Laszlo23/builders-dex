/**
 * Wallets that must never appear on public leaderboards.
 * System program + common dummy/base58 placeholders used in local SQLite.
 */
export const HIDDEN_PASSPORT_WALLETS = new Set([
  '11111111111111111111111111111111',
  '11111111111111111111111111111112',
]);

export function isPublicPassportWallet(wallet: string): boolean {
  const w = wallet.trim();
  if (!w) return false;
  return !HIDDEN_PASSPORT_WALLETS.has(w);
}
