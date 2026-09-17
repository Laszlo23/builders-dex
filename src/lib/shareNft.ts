import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
} from '@solana/spl-token';
import { SITE_URL } from './seo';

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

export function shareMetadataUri(raiseId: string, serial: number): string {
  return `${SITE_URL}/api/nft/share/${encodeURIComponent(raiseId)}/${serial}.json`;
}

function encodeBorshString(value: string): Buffer {
  const body = Buffer.from(value, 'utf8');
  const out = Buffer.alloc(4 + body.length);
  out.writeUInt32LE(body.length, 0);
  body.copy(out, 4);
  return out;
}

function deriveMetadataPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
}

function deriveMasterEditionPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from('edition'),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
}

function buildCreateMetadataV3Ix(args: {
  mint: PublicKey;
  payer: PublicKey;
  name: string;
  symbol: string;
  uri: string;
}): TransactionInstruction {
  const metadata = deriveMetadataPda(args.mint);
  const data = Buffer.concat([
    Buffer.from([33]),
    encodeBorshString(args.name),
    encodeBorshString(args.symbol),
    encodeBorshString(args.uri),
    Buffer.from([0, 0]),
    Buffer.from([0]),
    Buffer.from([0]),
    Buffer.from([0]),
    Buffer.from([1]),
    Buffer.from([0]),
  ]);
  return new TransactionInstruction({
    programId: TOKEN_METADATA_PROGRAM_ID,
    keys: [
      { pubkey: metadata, isSigner: false, isWritable: true },
      { pubkey: args.mint, isSigner: false, isWritable: false },
      { pubkey: args.payer, isSigner: true, isWritable: false },
      { pubkey: args.payer, isSigner: true, isWritable: true },
      { pubkey: args.payer, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data,
  });
}

function buildCreateMasterEditionV3Ix(args: {
  mint: PublicKey;
  payer: PublicKey;
}): TransactionInstruction {
  const metadata = deriveMetadataPda(args.mint);
  const edition = deriveMasterEditionPda(args.mint);
  return new TransactionInstruction({
    programId: TOKEN_METADATA_PROGRAM_ID,
    keys: [
      { pubkey: edition, isSigner: false, isWritable: true },
      { pubkey: args.mint, isSigner: false, isWritable: true },
      { pubkey: args.payer, isSigner: true, isWritable: false },
      { pubkey: args.payer, isSigner: true, isWritable: false },
      { pubkey: args.payer, isSigner: true, isWritable: true },
      { pubkey: metadata, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    // CreateMasterEditionV3: disc 17, Option::Some(max_supply=0)
    data: Buffer.from([17, 1, 0, 0, 0, 0, 0, 0, 0, 0]),
  });
}

export async function buildShareNftIxs(args: {
  connection: { getMinimumBalanceForRentExemption: (size: number) => Promise<number> };
  payer: PublicKey;
  raiseId: string;
  projectName: string;
  ticker: string;
  serial: number;
}): Promise<{ mint: Keypair; ixs: TransactionInstruction[] }> {
  const mint = Keypair.generate();
  const lamports =
    (await args.connection.getMinimumBalanceForRentExemption(MINT_SIZE).catch(() => 0)) ||
    (await getMinimumBalanceForRentExemptMint(args.connection as never));
  const ata = getAssociatedTokenAddressSync(mint.publicKey, args.payer);
  const serialLabel = String(args.serial + 1).padStart(3, '0');
  const name = `${args.projectName} Share #${serialLabel}`.slice(0, 32);
  const symbol = (args.ticker || 'SHARE').slice(0, 10);
  const uri = shareMetadataUri(args.raiseId, args.serial);

  const ixs: TransactionInstruction[] = [
    SystemProgram.createAccount({
      fromPubkey: args.payer,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMint2Instruction(mint.publicKey, 0, args.payer, args.payer),
    createAssociatedTokenAccountIdempotentInstruction(
      args.payer,
      ata,
      args.payer,
      mint.publicKey,
    ),
    createMintToInstruction(mint.publicKey, ata, args.payer, 1),
    buildCreateMetadataV3Ix({
      mint: mint.publicKey,
      payer: args.payer,
      name,
      symbol,
      uri,
    }),
    buildCreateMasterEditionV3Ix({ mint: mint.publicKey, payer: args.payer }),
  ];
  return { mint, ixs };
}
