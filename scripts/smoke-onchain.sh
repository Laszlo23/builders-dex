#!/usr/bin/env bash
# Phase 6 smoke helpers — run pieces as environment allows.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

echo "== SQLite oracle caps / wallet link =="
cd "$ROOT"
npx tsx -e "
import { getSqlite, closeSqlite } from './src/lib/db/sqlite.ts';
import { incrementScoutBump, getScoutBumpCount } from './src/lib/oracleCaps.ts';
import { upsertWalletLink, deleteWalletLink } from './src/lib/walletLink.ts';
getSqlite();
const w='SmokeWallet111111111111111111111111111111';
incrementScoutBump(w);
console.log('scout count', getScoutBumpCount(w));
upsertWalletLink({ solanaWallet:w, baseWallet:'0x0000000000000000000000000000000000000001', solSig:'x' });
deleteWalletLink(w);
closeSqlite();
console.log('ok');
"

echo "== Devnet Config PDA =="
solana account hQzS6PfaZEStsKqxpux1eJhbzy449Dt1qhNHQpb58eT --url https://api.devnet.solana.com | head -8

echo "== Cross-chain registry module =="
npx tsx -e "import { getAuraBinding, PASSPORT_COLLECTION } from './src/data/crossChainRegistry.ts'; console.log(getAuraBinding().symbol, PASSPORT_COLLECTION.name);"

echo "See docs/onchain-test-matrix.md for full checklist."
