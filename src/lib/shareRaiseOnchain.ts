/**
 * Client helpers for builder_raise (share certificates + win vault).
 * Transactions are signed by the caller wallet — never by the server.
 */
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

export const BUILDER_RAISE_PROGRAM_ID = new PublicKey(
  (typeof import.meta !== 'undefined' &&
    (import.meta as ImportMeta & { env?: Record<string, string> }).env
      ?.VITE_BUILDER_RAISE_PROGRAM_ID) ||
    '6weAy9KBNBf6MFsiA4csnEj5yJEhLV5nA5fzvnHD6wS2',
);

export const RAISE_MAINNET_MINT =
  (typeof import.meta !== 'undefined' &&
    ((import.meta as ImportMeta & { env?: Record<string, string> }).env
      ?.VITE_RAISE_MAINNET_MINT === 'true' ||
      (import.meta as ImportMeta & { env?: Record<string, string> }).env
        ?.VITE_RAISE_MAINNET_MINT === '1')) ||
  false;

export const SOLANA_DEVNET_RPC =
  (typeof import.meta !== 'undefined' &&
    (import.meta as ImportMeta & { env?: Record<string, string> }).env
      ?.VITE_SOLANA_DEVNET_RPC_URL) ||
  'https://api.devnet.solana.com';

export function connectionForRaiseCluster(
  cluster: 'devnet' | 'mainnet-beta' | undefined,
  fallback: Connection,
): Connection {
  if (cluster === 'devnet') {
    if (fallback.rpcEndpoint.includes('devnet')) return fallback;
    return new Connection(SOLANA_DEVNET_RPC, 'confirmed');
  }
  return fallback;
}

export function raiseExplorerTx(signature: string, cluster?: 'devnet' | 'mainnet-beta'): string {
  const query = cluster === 'devnet' ? '?cluster=devnet' : '';
  return `https://explorer.solana.com/tx/${signature}${query}`;
}

export function formatRaiseTxError(err: unknown): string {
  const logs =
    err && typeof err === 'object' && 'logs' in err && Array.isArray((err as { logs?: unknown }).logs)
      ? ((err as { logs: string[] }).logs)
      : [];
  const fromLogs = logs.find(
    (line) =>
      /Error|failed|insufficient|0x1\b/i.test(line) && !line.includes('consumed'),
  );
  const message = err instanceof Error ? err.message : 'Mint failed';
  const text = `${fromLogs || message} ${logs.slice(-4).join(' ')}`.toLowerCase();
  if (text.includes('insufficient') || text.includes('0x1')) {
    return 'Not enough SOL on Devnet. In Phantom, switch the network to Devnet, fund the wallet, then retry.';
  }
  if (text.includes('blockhash') || text.includes('expired')) {
    return 'Devnet blockhash expired — retry the mint.';
  }
  if (text.includes('simulation') || text.includes('account not found') || text.includes('not on this cluster')) {
    return 'Phantom simulated this on the wrong cluster. Approve it as a Devnet transaction (the dapp sends it to Devnet).';
  }
  return fromLogs || message;
}

const DISC = {
  createRaise: Buffer.from([234, 185, 148, 199, 102, 231, 133, 210]),
  openRaise: Buffer.from([131, 238, 79, 115, 242, 135, 142, 242]),
  mintShare: Buffer.from([145, 1, 122, 214, 134, 106, 116, 109]),
  depositWin: Buffer.from([58, 9, 124, 70, 159, 18, 201, 10]),
  claim: Buffer.from([62, 198, 214, 193, 213, 159, 108, 210]),
};

export function deriveRaiseConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('raise-config')],
    BUILDER_RAISE_PROGRAM_ID,
  );
}

export function deriveRaisePda(
  founder: PublicKey,
  projectSeed: Buffer | Uint8Array,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('raise'), founder.toBuffer(), Buffer.from(projectSeed)],
    BUILDER_RAISE_PROGRAM_ID,
  );
}

export function deriveVaultPda(raise: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), raise.toBuffer()],
    BUILDER_RAISE_PROGRAM_ID,
  );
}

export function deriveCertificatePda(
  raise: PublicKey,
  serial: number,
): [PublicKey, number] {
  const serialBuf = Buffer.alloc(4);
  serialBuf.writeUInt32LE(serial);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('share'), raise.toBuffer(), serialBuf],
    BUILDER_RAISE_PROGRAM_ID,
  );
}

export type OnchainRaise = {
  founder: PublicKey;
  status: number;
  priceLamports: bigint;
  shareSupply: number;
  sharesMinted: number;
  holderPoolBps: number;
  founderRetainedBps: number;
  goalLamports: bigint;
  raisedLamports: bigint;
  accPerShare: bigint;
};

const STATUS_NAMES = ['draft', 'live', 'filled', 'closed', 'cancelled'] as const;

export function raiseStatusName(status: number): (typeof STATUS_NAMES)[number] {
  return STATUS_NAMES[status] ?? 'draft';
}

const RAISE_ACCOUNT_DISC = Buffer.from([253, 96, 15, 240, 65, 242, 192, 103]);
const CERT_ACCOUNT_DISC = Buffer.from([68, 13, 89, 98, 168, 171, 170, 11]);
const CONFIG_ACCOUNT_DISC = Buffer.from([171, 194, 103, 55, 249, 30, 135, 56]);

function accountOwnedByRaiseProgram(
  info: { owner: PublicKey; data: Uint8Array },
  disc: Buffer,
  minLen: number,
): boolean {
  if (!info.owner.equals(BUILDER_RAISE_PROGRAM_ID) || info.data.length < minLen) return false;
  for (let i = 0; i < 8; i += 1) {
    if (info.data[i] !== disc[i]) return false;
  }
  return true;
}

export async function fetchOnchainRaise(
  connection: Connection,
  raisePda: PublicKey,
): Promise<OnchainRaise | null> {
  const info = await connection.getAccountInfo(raisePda);
  if (!info || !accountOwnedByRaiseProgram(info, RAISE_ACCOUNT_DISC, 193)) return null;
  const data = Buffer.from(info.data);
  let o = 8;
  const founder = new PublicKey(data.subarray(o, o + 32));
  o += 32;
  o += 32; // project_seed
  const status = data[o];
  o += 1;
  const priceLamports = data.readBigUInt64LE(o);
  o += 8;
  const shareSupply = data.readUInt32LE(o);
  o += 4;
  const sharesMinted = data.readUInt32LE(o);
  o += 4;
  const holderPoolBps = data.readUInt16LE(o);
  o += 2;
  const founderRetainedBps = data.readUInt16LE(o);
  o += 2;
  const goalLamports = data.readBigUInt64LE(o);
  o += 8;
  const raisedLamports = data.readBigUInt64LE(o);
  o += 8;
  const accPerShare = data.readBigUInt64LE(o) + (data.readBigUInt64LE(o + 8) << 64n);
  return {
    founder,
    status,
    priceLamports,
    shareSupply,
    sharesMinted,
    holderPoolBps,
    founderRetainedBps,
    goalLamports,
    raisedLamports,
    accPerShare,
  };
}

export type OnchainCertificate = {
  raise: PublicKey;
  owner: PublicKey;
  serial: number;
  lastAcc: bigint;
};

export async function fetchOnchainCertificate(
  connection: Connection,
  certPda: PublicKey,
): Promise<OnchainCertificate | null> {
  const info = await connection.getAccountInfo(certPda);
  if (!info || !accountOwnedByRaiseProgram(info, CERT_ACCOUNT_DISC, 8 + 32 + 32 + 4 + 16 + 1)) {
    return null;
  }
  const data = Buffer.from(info.data);
  return {
    raise: new PublicKey(data.subarray(8, 40)),
    owner: new PublicKey(data.subarray(40, 72)),
    serial: data.readUInt32LE(72),
    lastAcc: data.readBigUInt64LE(76) + (data.readBigUInt64LE(84) << 64n),
  };
}

export function claimableLamports(accPerShare: bigint, lastAcc: bigint): number {
  const SCALE = 1_000_000_000n;
  const owed = (accPerShare - lastAcc) / SCALE;
  return Number(owed);
}

function u64(n: number | bigint): Buffer {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(BigInt(n));
  return b;
}

function u32(n: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n);
  return b;
}

function u16(n: number): Buffer {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n);
  return b;
}

export function buildMintShareIx(args: {
  raise: PublicKey;
  buyer: PublicKey;
  founder: PublicKey;
  treasury: PublicKey;
  serial: number;
}): TransactionInstruction {
  const [config] = deriveRaiseConfigPda();
  const [certificate] = deriveCertificatePda(args.raise, args.serial);
  return new TransactionInstruction({
    programId: BUILDER_RAISE_PROGRAM_ID,
    keys: [
      { pubkey: args.raise, isSigner: false, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: certificate, isSigner: false, isWritable: true },
      { pubkey: args.buyer, isSigner: true, isWritable: true },
      { pubkey: args.founder, isSigner: false, isWritable: true },
      { pubkey: args.treasury, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([DISC.mintShare, u32(args.serial)]),
  });
}

export function buildClaimIx(args: {
  raise: PublicKey;
  certificate: PublicKey;
  owner: PublicKey;
}): TransactionInstruction {
  const [vault] = deriveVaultPda(args.raise);
  return new TransactionInstruction({
    programId: BUILDER_RAISE_PROGRAM_ID,
    keys: [
      { pubkey: args.raise, isSigner: false, isWritable: false },
      { pubkey: args.certificate, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: args.owner, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: DISC.claim,
  });
}

export function buildOpenRaiseIx(args: {
  raise: PublicKey;
  oracle: PublicKey;
}): TransactionInstruction {
  const [config] = deriveRaiseConfigPda();
  return new TransactionInstruction({
    programId: BUILDER_RAISE_PROGRAM_ID,
    keys: [
      { pubkey: args.raise, isSigner: false, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: args.oracle, isSigner: true, isWritable: false },
    ],
    data: DISC.openRaise,
  });
}

export function buildCreateRaiseIx(args: {
  founder: PublicKey;
  projectSeed: Buffer;
  priceLamports: number;
  shareSupply: number;
  holderPoolBps: number;
  goalLamports: number;
  minBuilderScore: number;
  applicationHash: Buffer;
}): TransactionInstruction {
  const [raise] = deriveRaisePda(args.founder, args.projectSeed);
  const [vault] = deriveVaultPda(raise);
  const data = Buffer.concat([
    DISC.createRaise,
    Buffer.from(args.projectSeed),
    u64(args.priceLamports),
    u32(args.shareSupply),
    u16(args.holderPoolBps),
    u64(args.goalLamports),
    u16(args.minBuilderScore),
    Buffer.from(args.applicationHash),
  ]);
  return new TransactionInstruction({
    programId: BUILDER_RAISE_PROGRAM_ID,
    keys: [
      { pubkey: raise, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: args.founder, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export function buildDepositWinIx(args: {
  raise: PublicKey;
  founder: PublicKey;
  amount: number;
}): TransactionInstruction {
  const [vault] = deriveVaultPda(args.raise);
  return new TransactionInstruction({
    programId: BUILDER_RAISE_PROGRAM_ID,
    keys: [
      { pubkey: args.raise, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: args.founder, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([DISC.depositWin, u64(args.amount)]),
  });
}

export async function sendRaiseTx(
  connection: Connection,
  feePayer: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  ix: TransactionInstruction | TransactionInstruction[],
  extraSigners: Signer[] = [],
  sendTransaction?: (
    tx: Transaction,
    connection: Connection,
    options?: { signers?: Signer[] },
  ) => Promise<string>,
): Promise<string> {
  const ixs = Array.isArray(ix) ? ix : [ix];
  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
    ...ixs,
  );
  tx.feePayer = feePayer;
  const latest = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = latest.blockhash;
  let signature: string;
  try {
    if (extraSigners.length > 0) tx.partialSign(...extraSigners);
    if (sendTransaction) {
      signature = await sendTransaction(tx, connection, { signers: extraSigners });
    } else {
      const signed = await signTransaction(tx);
      extraSigners.forEach((signer) => {
        const hasSig = signed.signatures.some(
          (entry) => entry.publicKey.equals(signer.publicKey) && Boolean(entry.signature),
        );
        if (!hasSig) signed.partialSign(signer);
      });
      signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
      });
    }
  } catch (err) {
    throw new Error(formatRaiseTxError(err));
  }
  await connection.confirmTransaction(
    {
      signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    },
    'confirmed',
  );
  return signature;
}

export async function fetchConfigTreasury(
  connection: Connection,
): Promise<PublicKey | null> {
  const [config] = deriveRaiseConfigPda();
  const info = await connection.getAccountInfo(config);
  if (!info || !accountOwnedByRaiseProgram(info, CONFIG_ACCOUNT_DISC, 8 + 32 + 32 + 2 + 32 + 1)) {
    return null;
  }
  return new PublicKey(info.data.subarray(8 + 32 + 32 + 2, 8 + 32 + 32 + 2 + 32));
}
