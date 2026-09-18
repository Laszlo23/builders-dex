import type { ShareRaise } from '../types';

/** Devnet canary — source of truth for the showable share mint. */
export const LIVE_AURA_RAISE_SEED = {
  id: 'raise_aura_p5',
  projectId: 'p5',
  cluster: 'devnet' as const,
  programId: '6weAy9KBNBf6MFsiA4csnEj5yJEhLV5nA5fzvnHD6wS2',
  raisePda: '2cju2KfYS77XkAGd7Q9a5QoXKkcHaScs4PDbMub4KYdA',
  founderWallet: '6XitbmLNPGzsvGo6aNTbMG3uvwqdbmssy8g4zhbJrUTr',
  projectSeedHex: '7894a0a9b503609ac7e2201196a12e390ac2a01c98f1046e231216f2cec812e3',
  priceLamports: 50_000_000,
  shareSupply: 200,
  holderPoolBps: 2000,
  founderRetainedBps: 8000,
  goalLamports: 10_000_000_000,
  applicationId: 'app_aura_p5',
  builderScore: 92,
  explorer:
    'https://explorer.solana.com/address/2cju2KfYS77XkAGd7Q9a5QoXKkcHaScs4PDbMub4KYdA?cluster=devnet',
};

export function isLiveAuraRaiseId(id: string | null | undefined): boolean {
  return id === LIVE_AURA_RAISE_SEED.id || id === LIVE_AURA_RAISE_SEED.projectId || id === 'raise_demo_p5';
}

export function liveAuraRaise(): ShareRaise {
  const now = new Date().toISOString();
  return {
    id: LIVE_AURA_RAISE_SEED.id,
    projectId: LIVE_AURA_RAISE_SEED.projectId,
    projectSeedHex: LIVE_AURA_RAISE_SEED.projectSeedHex,
    raisePda: LIVE_AURA_RAISE_SEED.raisePda,
    collection: LIVE_AURA_RAISE_SEED.raisePda,
    founderWallet: LIVE_AURA_RAISE_SEED.founderWallet,
    status: 'live',
    priceLamports: LIVE_AURA_RAISE_SEED.priceLamports,
    shareSupply: LIVE_AURA_RAISE_SEED.shareSupply,
    sharesMinted: 1,
    holderPoolBps: LIVE_AURA_RAISE_SEED.holderPoolBps,
    founderRetainedBps: LIVE_AURA_RAISE_SEED.founderRetainedBps,
    goalLamports: LIVE_AURA_RAISE_SEED.goalLamports,
    raisedLamports: LIVE_AURA_RAISE_SEED.priceLamports,
    vaultMint: 'SOL',
    inspection: {
      applicationId: LIVE_AURA_RAISE_SEED.applicationId,
      builderScore: LIVE_AURA_RAISE_SEED.builderScore,
      pobVerified: true,
      attestedAt: now,
      tx: null,
    },
    demo: false,
    cluster: LIVE_AURA_RAISE_SEED.cluster,
    createdAt: now,
    updatedAt: now,
  };
}
