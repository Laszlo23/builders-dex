/**
 * Prove mint_share + Metaplex 1/1 on Devnet with a throwaway buyer.
 * Funds the buyer from the deploy wallet, then prints logs on failure.
 */
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildMintShareIx,
  fetchConfigTreasury,
  fetchOnchainRaise,
} from '../../src/lib/shareRaiseOnchain';
import { buildShareNftIxs } from '../../src/lib/shareNft';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const live = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/liveShareRaise.json'), 'utf8'),
) as {
  id: string;
  raisePda: string;
  founderWallet: string;
};

function loadKp(p: string): Keypair {
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(p, 'utf8')) as number[]),
  );
}

async function main() {
  const rpc = process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpc, 'confirmed');
  const authority = loadKp(
    process.env.SOLANA_KEYPAIR || path.join(os.homedir(), '.config/solana/id.json'),
  );
  const raise = new PublicKey(live.raisePda);
  const founder = new PublicKey(live.founderWallet);
  const onchain = await fetchOnchainRaise(connection, raise);
  const treasury = await fetchConfigTreasury(connection);
  if (!onchain || !treasury) throw new Error('raise/config missing');
  console.log('raise status', onchain.status, 'minted', onchain.sharesMinted);

  const buyer = Keypair.generate();
  const fund = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: authority.publicKey,
      toPubkey: buyer.publicKey,
      lamports: Math.floor(0.12 * LAMPORTS_PER_SOL),
    }),
  );
  await sendAndConfirmTransaction(connection, fund, [authority]);
  console.log('buyer', buyer.publicKey.toBase58());

  const shareIx = buildMintShareIx({
    raise,
    buyer: buyer.publicKey,
    founder,
    treasury,
    serial: onchain.sharesMinted,
  });
  try {
    const shareSig = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(shareIx),
      [buyer],
    );
    console.log('SHARE_OK', shareSig);
  } catch (err) {
    const logs =
      err && typeof err === 'object' && 'getLogs' in err
        ? await (err as { getLogs: () => Promise<unknown> }).getLogs()
        : (err as { logs?: string[] }).logs;
    console.error('SHARE_FAIL', err);
    console.error('logs', logs);
    process.exit(1);
  }

  const nft = await buildShareNftIxs({
    connection,
    payer: buyer.publicKey,
    raiseId: live.id,
    projectName: 'Aura OS',
    ticker: 'AURA',
    serial: onchain.sharesMinted,
  });
  try {
    const nftTx = new Transaction().add(...nft.ixs);
    const nftSig = await sendAndConfirmTransaction(connection, nftTx, [buyer, nft.mint]);
    console.log('NFT_OK', nftSig, 'mint', nft.mint.publicKey.toBase58());
  } catch (err) {
    const logs =
      err && typeof err === 'object' && 'getLogs' in err
        ? await (err as { getLogs: () => Promise<unknown> }).getLogs()
        : (err as { logs?: string[] }).logs;
    console.error('NFT_FAIL', err);
    console.error('logs', logs);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
