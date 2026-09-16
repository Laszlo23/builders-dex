# On-chain inventory — Mainnet readiness (Phase 0)

**Last updated:** 2026-09-15  
**Program ID:** `7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD`

## Secrets checklist (never commit)

| Secret | Where | Status |
|--------|-------|--------|
| Deploy / upgrade authority | `~/.config/solana/id.json` (dev: `6Xitbm…JrUTr`) | Local only; move to multisig before public mainnet |
| Oracle keypair | `programs/.keys/oracle-keypair.json` (gitignored) | Generated for Devnet Config; set `PASSPORT_ORACLE_SECRET_KEY` on VPS |
| Jupiter API key | VPS `.env` | Existing |
| Paid Solana RPC | `SOLANA_RPC_URL` / `VITE_SOLANA_RPC_URL` | Required for mainnet oracle |
| Aura OS Base AURA | `AURA_BASE_ADDRESS` | Confirmed `0xDb1E6D4FaB43c8cb5871D32D41df00ea34350723` (AURA Token, 777,777,777) |
| Wrapped AURA SPL | `AURA_SOLANA_MINT` / `VITE_AURA_SOLANA_MINT` | After Base↔Solana Bridge wrap |

## IDL

Committed copy: [`programs/idl/builder_passport.json`](../programs/idl/builder_passport.json)  
Rebuild sync: `cp programs/target/idl/builder_passport.json programs/idl/`

## Clusters

| Cluster | Program | Config PDA `hQzS6P…58eT` |
|---------|---------|---------------------------|
| Devnet | Deployed / upgradeable (SBF arch v1) | **Initialized** 2026-09-15 — oracle `6uVub24LhGxGUGmKFqeKqeKTToCT8SgJQiSvBzMJQ2S7` |
| Mainnet | Not deployed until Phase 3 canary | Requires `CONFIRM_MAINNET=yes` |

## Devnet smoke (verified)

- Config init: `5sjG9VnV…`
- Passport mint + oracle score 125 (Builder level) for wallet `99vVhQ64…`
- Local validator requires `--clone-feature-set --url https://api.devnet.solana.com` when testing SBF builds from platform-tools v1.54

## Toolchain note

Build with `cargo-build-sbf --arch v1` (see `programs/scripts/deploy-devnet.sh`). Avoid default SBPF versions that local validators reject with `sbpf_version … not enabled`.

Oracle secret: `programs/.keys/oracle-keypair.json` (gitignored). Set VPS `PASSPORT_ORACLE_SECRET_KEY` to the base58 secret (88 chars) or JSON byte array.

## AURA note

Catalog `p5` Aura OS targets Base fair launch (777,777,777). Many unrelated AURA tokens exist on Base/Solana — set env only after you verify the Aura OS contract on Basescan.
