/**
 * Deploy ActivationRegistry + StallVault + FeeSplitter to Robinhood Chain 4663.
 * Does not launch $BUILD. Run only when asked: npm run deploy:square-loop
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, createWalletClient, defineChain, encodeDeployData, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { CCFF00_NFT } from '../src/data/ccff00Wallet';
import { HOOD_CHAIN_ID, HOOD_EXPLORER_URL, HOOD_RPC_URL } from '../src/data/hoodChain';
import { AURA_DEV_WALLET } from '../src/data/crossChainRegistry';
import { hoodDeployerPrivateKeyHex } from '../src/lib/hoodDeployer';
import { compileSquareLoop } from './compile-square-loop';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const hood = defineChain({
  id: HOOD_CHAIN_ID,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [HOOD_RPC_URL] } },
  blockExplorers: { default: { name: 'Blockscout', url: HOOD_EXPLORER_URL } },
});

async function main() {
  const key = hoodDeployerPrivateKeyHex();
  if (!key) throw new Error('HOOD_DEPLOYER_PRIVATE_KEY or PRIVATE_KEY missing');
  const account = privateKeyToAccount(key);
  if (account.address.toLowerCase() !== AURA_DEV_WALLET.toLowerCase()) {
    throw new Error(`deployer ${account.address} is not the published founder`);
  }

  const artifacts = compileSquareLoop();
  const publicClient = createPublicClient({ chain: hood, transport: http(HOOD_RPC_URL) });
  const wallet = createWalletClient({ account, chain: hood, transport: http(HOOD_RPC_URL) });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log('deployer', account.address, 'eth', Number(balance) / 1e18);
  if (balance < 400_000_000_000_000n) {
    throw new Error('not enough Hood ETH to deploy square loop (need ~0.0004+)');
  }

  const registryData = encodeDeployData({
    abi: artifacts.ActivationRegistry.abi,
    bytecode: artifacts.ActivationRegistry.bytecode,
    args: [CCFF00_NFT],
  });
  const registryHash = await wallet.sendTransaction({ data: registryData });
  const registryReceipt = await publicClient.waitForTransactionReceipt({ hash: registryHash });
  const registry = registryReceipt.contractAddress;
  if (!registry) throw new Error('ActivationRegistry deploy produced no address');
  console.log('ActivationRegistry', registry, registryHash);

  const stallData = encodeDeployData({
    abi: artifacts.StallVault.abi,
    bytecode: artifacts.StallVault.bytecode,
    args: [registry],
  });
  const stallHash = await wallet.sendTransaction({ data: stallData });
  const stallReceipt = await publicClient.waitForTransactionReceipt({ hash: stallHash });
  const stall = stallReceipt.contractAddress;
  if (!stall) throw new Error('StallVault deploy produced no address');
  console.log('StallVault', stall, stallHash);

  const feeData = encodeDeployData({
    abi: artifacts.FeeSplitter.abi,
    bytecode: artifacts.FeeSplitter.bytecode,
    args: [registry],
  });
  const feeHash = await wallet.sendTransaction({ data: feeData });
  const feeReceipt = await publicClient.waitForTransactionReceipt({ hash: feeHash });
  const fees = feeReceipt.contractAddress;
  if (!fees) throw new Error('FeeSplitter deploy produced no address');
  console.log('FeeSplitter', fees, feeHash);

  const deployed = {
    chainId: HOOD_CHAIN_ID,
    squares: CCFF00_NFT,
    activationRegistry: registry,
    stallVault: stall,
    feeSplitter: fees,
    txs: { registry: registryHash, stall: stallHash, fees: feeHash },
    at: new Date().toISOString(),
  };
  writeFileSync(join(ROOT, 'contracts/out/square-loop-deployed.json'), JSON.stringify(deployed, null, 2));
  console.log('wrote contracts/out/square-loop-deployed.json');
  console.log('Set VITE_ACTIVATION_REGISTRY_ADDRESS / STALL_VAULT / FEE_SPLITTER — do not invent $BUILD.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
