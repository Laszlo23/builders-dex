# On-chain test matrix (Phase 6)

Run before calling mainnet “done”. Checkboxes are operational, not CI-enforced yet.

## Program (Anchor)

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
cd programs
# Prefer a Solana toolchain that can build Anchor 0.31 (see onchain-inventory.md)
anchor build
anchor test   # local validator — config, mint, oracle update, unauthorized reject, close
```

- [ ] `initialize_config`
- [ ] `initialize` passport
- [ ] `update_score` as oracle
- [ ] reject non-oracle
- [ ] `close` + re-init
- [ ] `update_oracle`

## Devnet E2E

```bash
ORACLE_PUBKEY=<pubkey> npx tsx programs/scripts/initialize-config.ts --cluster devnet
# Mint via Profile (network = Devnet)
# Scout submit → oracle bump (PASSPORT_ORACLE_SECRET_KEY set)
# Explorer: Config PDA hQzS6P… + passport PDA
```

- [ ] Config PDA exists
- [ ] 3 wallets mint + score > 0
- [ ] Daily scout cap persists across server restart (SQLite `oracle_scout_bumps`)

## Mainnet canary

```bash
CONFIRM_MAINNET=yes ORACLE_PUBKEY=<pubkey> npx tsx programs/scripts/initialize-config.ts --cluster mainnet-beta
# VITE_PASSPORT_MAINNET_MINT=true + paid SOLANA_RPC_URL
```

- [ ] Program account on mainnet-beta
- [ ] Config initialized
- [ ] Internal wallets only mint
- [ ] Upgrade authority → multisig plan documented

## Swap regression

- [ ] Allowlisted mint quotes OK
- [ ] Non-allowlisted mint rejected by `/api/jupiter/order`
- [ ] AURA only quotes when `AURA_SOLANA_MINT` + `TRADEABLE_AURA=true`

## Cross-chain AURA

- [ ] Confirm Aura OS Base address (not random AURA)
- [ ] Bridge small amount Base → Sol (official Base↔Solana Bridge)
- [ ] Jupiter quote/swap on Builders DEX
- [ ] Bridge back
- [ ] Project detail shows `CrossChainBindingCard`

## Wallet link

```bash
curl -s localhost:PORT/api/cross-chain/registry | jq .
curl -s -X POST localhost:PORT/api/wallet-link -H 'content-type: application/json' \
  -d '{"solanaWallet":"...","baseWallet":"0x...","solSig":"stub"}'
```

- [ ] Link upsert / get / delete
- [ ] Invalid addresses rejected

## Ops

- [ ] Oracle key loss runbook (rotate via `update_oracle`)
- [ ] RPC failover documented
- [ ] Seed phrase / keypair never in git (`programs/.keys/`)
