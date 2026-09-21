/**
 * Compile SquareLoop.sol (ActivationRegistry, StallVault, FeeSplitter).
 * Does not deploy. Write artifacts to contracts/out.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import solc from 'solc';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'contracts/SquareLoop.sol');
const OUT = join(ROOT, 'contracts/out');

const NAMES = ['ActivationRegistry', 'StallVault', 'FeeSplitter'] as const;

function compile(): Record<(typeof NAMES)[number], { abi: unknown[]; bytecode: `0x${string}` }> {
  const content = readFileSync(SOURCE, 'utf8');
  const input = {
    language: 'Solidity',
    sources: { 'SquareLoop.sol': { content } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    },
  };
  const out = JSON.parse(solc.compile(JSON.stringify(input))) as {
    errors?: Array<{ severity: string; formattedMessage: string }>;
    contracts?: {
      'SquareLoop.sol': Record<string, { abi: unknown[]; evm: { bytecode: { object: string } } }>;
    };
  };
  const fatal = (out.errors || []).filter((e) => e.severity === 'error');
  if (fatal.length) {
    throw new Error(fatal.map((e) => e.formattedMessage).join('\n'));
  }
  const art = out.contracts?.['SquareLoop.sol'];
  if (!art) throw new Error('compile produced no SquareLoop artifacts');
  const result = {} as Record<(typeof NAMES)[number], { abi: unknown[]; bytecode: `0x${string}` }>;
  for (const name of NAMES) {
    const item = art[name];
    if (!item?.evm?.bytecode?.object) throw new Error(`missing bytecode for ${name}`);
    result[name] = { abi: item.abi, bytecode: `0x${item.evm.bytecode.object}` };
  }
  return result;
}

export function compileSquareLoop() {
  const artifacts = compile();
  mkdirSync(OUT, { recursive: true });
  for (const name of NAMES) {
    writeFileSync(join(OUT, `${name}.json`), JSON.stringify(artifacts[name], null, 2));
  }
  return artifacts;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const artifacts = compileSquareLoop();
  for (const name of NAMES) {
    console.log(name, 'bytecode', artifacts[name].bytecode.length / 2 - 1, 'bytes');
  }
}
