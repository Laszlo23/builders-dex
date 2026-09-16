# Builder Passport - Solana Program

On-chain Builder Score and Passport system for Builders DEX.

Companion program **`builder_raise`** (`ApfLKeKDbRUmMsf7Fq8n6kH8wvn8YW4ideKiLzt4oafB`) issues inspection-gated share certificates and a win-claim vault. Devnet only until `VITE_RAISE_MAINNET_MINT` and a funded deploy wallet. See `programs/programs/builder_raise` and `scripts/e2e-devnet-raise.ts`.

## Overview

The Builder Passport program anchors Builder Score™ and Passport™ data on-chain using Solana smart contracts built with Anchor.

### Features

- **PDA-based Storage**: Each wallet gets a deterministic PDA account storing their builder data
- **Score Tracking**: Store and update builder scores (0-10000 range)
- **Level System**: Automatic level calculation (Rookie → Builder → Advanced → Expert → Genesis)
- **Admin-gated Updates**: Only authorized admin/oracle keys can update scores
- **Account Management**: Initialize and close passport accounts with rent refunds

### Program Structure

```
programs/builder_passport/
├── src/
│   └── lib.rs          # Main program logic
├── Cargo.toml
└── Xargo.toml
```

## Architecture

### Account Structure

The `BuilderPassport` account stores:

```rust
pub struct BuilderPassport {
    pub authority: Pubkey,      // Owner wallet
    pub score: u16,             // 0-10000
    pub level: BuilderLevel,    // Rookie/Builder/Advanced/Expert/Genesis
    pub last_updated: i64,      // Unix timestamp
    pub bump: u8,               // PDA bump seed
}
```

### Instructions

1. **`initialize`** - Create a new passport PDA for a wallet
2. **`update_score`** - Update score (admin only)
3. **`close`** - Close passport and refund rent (owner only)

### Level Calculation

- **Rookie**: 0-99 points
- **Builder**: 100-249 points
- **Advanced**: 250-499 points
- **Expert**: 500-999 points
- **Genesis**: 1000+ points

## Development

### Prerequisites

- Rust 1.98+
- Solana CLI 4.2+
- Anchor CLI 0.31+
- Node.js 20+

### Build

```bash
cd programs
anchor build
```

The compiled program will be at `target/deploy/builder_passport.so`.

### Test

```bash
# Run full test suite (starts local validator)
anchor test

# Run tests with existing validator
anchor test --skip-local-validator
```

### Program ID

The program ID is deterministically generated from the keypair at:
```
target/deploy/builder_passport-keypair.json
```

Current Program ID: `7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD`

## Deployment

### Devnet

1. Configure Solana CLI for devnet:
   ```bash
   solana config set --url https://api.devnet.solana.com
   ```

2. Ensure your wallet has SOL (request airdrop if needed):
   ```bash
   solana airdrop 2
   ```

3. Deploy using the script:
   ```bash
   ./scripts/deploy-devnet.sh
   ```

   Or manually:
   ```bash
   anchor deploy --provider.cluster devnet
   ```

4. Verify deployment:
   ```bash
   ./scripts/verify-program.sh <PROGRAM_ID> devnet
   ```

5. View on Solana Explorer:
   ```
   https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet
   ```

### Mainnet

⚠️ **IMPORTANT**: Mainnet deployment requires real SOL and cannot be reversed.

1. Configure Solana CLI for mainnet:
   ```bash
   solana config set --url https://api.mainnet-beta.solana.com
   ```

2. Ensure your wallet is funded (2-5 SOL recommended)

3. Deploy using the script:
   ```bash
   ./scripts/deploy-mainnet.sh
   ```

4. Verify deployment:
   ```bash
   ./scripts/verify-program.sh <PROGRAM_ID> mainnet
   ```

## Integration

### Frontend Usage

Add the program ID to your `.env`:

```bash
VITE_BUILDER_PASSPORT_PROGRAM_ID=7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD
```

Use the provided hooks and utilities:

```typescript
import { useBuilderPassport } from '@/hooks/useBuilderPassport';
import { fetchBuilderPassport, derivePassportPDA } from '@/lib/builderPassport';

// In a component
const { passport, loading, error } = useBuilderPassport();

// Fetch for any wallet
const passport = await fetchBuilderPassport(connection, walletPublicKey);

// Get PDA address
const [passportPDA, bump] = derivePassportPDA(walletPublicKey);
```

## Security Considerations

1. **Private Keys**: Never commit deployer keypairs or private keys to git
2. **Admin Keys**: Store admin/oracle keys securely (env vars, HSM, etc.)
3. **Rate Limiting**: Consider rate-limiting score updates to prevent abuse
4. **Upgrade Authority**: For mainnet, consider using a multisig or transferring to governance

## IDL

The program IDL is generated at `target/idl/builder_passport.json` after building. Use this for client-side integration with Anchor.

## Program Upgrade

To upgrade an existing deployed program:

```bash
anchor upgrade target/deploy/builder_passport.so \
  --program-id <PROGRAM_ID> \
  --provider.cluster <devnet|mainnet>
```

Ensure you have the upgrade authority for the program.

## Testing on Devnet

After deploying to devnet, test the program:

```bash
# Initialize a passport
anchor run initialize-passport

# Update a score (requires admin key)
anchor run update-score -- <wallet> <score>

# Check passport data
solana account <PASSPORT_PDA> --url devnet
```

## Support

- Solana Program: `programs/builder_passport/`
- Frontend Integration: `src/lib/builderPassport.ts`, `src/hooks/useBuilderPassport.ts`
- Deploy Scripts: `programs/scripts/`

## License

See parent repository license.
