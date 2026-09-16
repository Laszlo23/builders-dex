/**
 * Unit checks for share-raise inspection gate + seed hashing.
 * Run: npx tsx scripts/test-share-raise-gate.ts
 */
import { canOpenRaise, projectSeedBytes } from '../src/lib/shareRaise';
import type { ShareRaise } from '../src/types';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const base: ShareRaise = {
  id: 'r1',
  projectId: 'p5',
  projectSeedHex: projectSeedBytes('p5').toString('hex'),
  raisePda: null,
  collection: null,
  founderWallet: '6j7zWk9WVg8eFmbUhdAiQS3cxELiqFbhwR4JrYMRaPFW',
  status: 'draft',
  priceLamports: 50_000_000,
  shareSupply: 100,
  sharesMinted: 0,
  holderPoolBps: 2000,
  founderRetainedBps: 8000,
  goalLamports: 5_000_000_000,
  raisedLamports: 0,
  vaultMint: 'SOL',
  inspection: {
    applicationId: 'app1',
    builderScore: 92,
    pobVerified: true,
    attestedAt: null,
    tx: null,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const open = canOpenRaise(base);
assert(open.ok, `expected openable: ${open.reasons.join(', ')}`);

const low = canOpenRaise({
  ...base,
  inspection: { ...base.inspection, builderScore: 70 },
});
assert(!low.ok, 'low score should fail');

const live = canOpenRaise({ ...base, status: 'live' });
assert(!live.ok, 'live raise should not open again');

assert(projectSeedBytes('p5').length === 32, 'seed is 32 bytes');
console.log('SHARE_RAISE_GATE_OK');
