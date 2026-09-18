/**
 * Compile + deploy HoodShare to Robinhood Chain 4663.
 * Uses HOOD_DEPLOYER_PRIVATE_KEY or PRIVATE_KEY. Never prints the key.
 */
import 'dotenv/config';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import solc from 'solc';
import { createPublicClient, createWalletClient, defineChain, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hoodDeployerPrivateKeyHex } from '../src/lib/hoodDeployer';
import { AURA_DEV_WALLET } from '../src/data/crossChainRegistry';
import { HOOD_CHAIN_ID, HOOD_EXPLORER_URL, HOOD_RPC_URL } from '../src/data/hoodChain';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PRICE_WEI = 50_000_000_000_000n; // 0.00005 ETH
const SUPPLY = 200n;
const PER_WALLET = 3n;
const BASE_URI = 'https://dex.buildingcultureid.space/api/hood/share/';

const hood = defineChain({
  id: HOOD_CHAIN_ID,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [HOOD_RPC_URL] } },
  blockExplorers: { default: { name: 'Blockscout', url: HOOD_EXPLORER_URL } },
});

function compile(): { abi: unknown[]; bytecode: `0x${string}` } {
  const source = readFileSync(join(ROOT, 'contracts/HoodShare.sol'), 'utf8');
  const input = {
    language: 'Solidity',
    sources: { 'HoodShare.sol': { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    },
  };
  const out = JSON.parse(solc.compile(JSON.stringify(input))) as {
    errors?: Array<{ severity: string; formattedMessage: string }>;
    contracts?: {
      'HoodShare.sol': { HoodShare: { abi: unknown[]; evm: { bytecode: { object: string } } } };
    };
  };
  const fatal = (out.errors || []).filter((e) => e.severity === 'error');
  if (fatal.length) {
    throw new Error(fatal.map((e) => e.formattedMessage).join('\n'));
  }
  const art = out.contracts?.['HoodShare.sol']?.HoodShare;
  if (!art?.evm?.bytecode?.object) throw new Error('compile produced no bytecode');
  return { abi: art.abi, bytecode: `0x${art.evm.bytecode.object}` };
}

async function main() {
  const key = hoodDeployerPrivateKeyHex();
  if (!key) throw new Error('HOOD_DEPLOYER_PRIVATE_KEY or PRIVATE_KEY missing');
  const account = privateKeyToAccount(key);
  if (account.address.toLowerCase() !== AURA_DEV_WALLET.toLowerCase()) {
    throw new Error(`deployer ${account.address} is not the published founder`);
  }

  const { abi, bytecode } = compile();
  mkdirSync(join(ROOT, 'contracts/out'), { recursive: true });
  writeFileSync(
    join(ROOT, 'contracts/out/HoodShare.json'),
    JSON.stringify({ abi, bytecode }, null, 2),
  );

  const publicClient = createPublicClient({ chain: hood, transport: http(HOOD_RPC_URL) });
  const wallet = createWalletClient({
    account,
    chain: hood,
    transport: http(HOOD_RPC_URL),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log('deployer', account.address, 'eth', Number(balance) / 1e18);
  if (balance < 200_000_000_000_000n) {
    throw new Error('not enough Hood ETH to deploy (need ~0.0002+)');
  }

  const hash = await wallet.deployContract({
    abi,
    bytecode,
    args: [PRICE_WEI, SUPPLY, PER_WALLET, BASE_URI],
  });
  console.log('tx', `${HOOD_EXPLORER_URL}/tx/${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
  const address = receipt.contractAddress;
  if (!address) throw new Error('no contract address in receipt');
  console.log('contract', `${HOOD_EXPLORER_URL}/address/${address}`);

  const seed = `/**
 * Live Aura share NFT on Robinhood Chain. Address is set by scripts/deploy-hood-share.ts.
 */
export const HOOD_SHARE_ADDRESS = '${address}' as const;
export const HOOD_SHARE_PRICE_WEI = ${PRICE_WEI.toString()}n;
export const HOOD_SHARE_SUPPLY = ${Number(SUPPLY)};
export const HOOD_SHARE_MAX_PER_WALLET = ${Number(PER_WALLET)};
export const HOOD_SHARE_HOLDER_POOL_BPS = 2000;
export const HOOD_SHARE_ID = 'raise_hood_p5';
export const HOOD_SHARE_PROJECT_ID = 'p5';
export const HOOD_SHARE_MINT_SEL = '0x1249c58b';
export const HOOD_SHARE_BASE_URI = '${BASE_URI}';

export function isHoodShareId(id: string | null | undefined): boolean {
  return id === HOOD_SHARE_ID || id === HOOD_SHARE_PROJECT_ID || id === 'raise_aura_p5';
}

export function hoodShareExplorer(): string {
  return \`https://robinhoodchain.blockscout.com/address/\${HOOD_SHARE_ADDRESS}\`;
}

export function hoodShareTxExplorer(hash: string): string {
  return \`https://robinhoodchain.blockscout.com/tx/\${hash}\`;
}

export function formatHoodSharePrice(wei: bigint = HOOD_SHARE_PRICE_WEI): string {
  const eth = Number(wei) / 1e18;
  return \`\${eth.toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH\`;
}
`;
  writeFileSync(join(ROOT, 'src/data/hoodShare.ts'), seed);
  console.log('wrote src/data/hoodShare.ts');
}

void main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
