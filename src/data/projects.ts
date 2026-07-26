import {
  Project,
  Builder,
  Proposal,
  Quest,
  BuildersIndex,
  TheStandard,
  PassportLevel,
} from '../types';
import { makeBuilderScore } from '../lib/builderScore';

/** Builders Index™ — live Genesis Index first */
export const BUILDERS_INDEX: BuildersIndex = {
  title: 'Builders Index™',
  market: 'Genesis Index · live scores',
  health: 88.0,
  projectsTracked: 4,
  projectsApproved: 3,
  qualityThreshold: 'Genesis Top 3',
  deltaLabel: 'Live GitHub citations',
};

/** THE STANDARD — exclusivity funnel (Genesis ship) */
export const THE_STANDARD: TheStandard = {
  projectsAnalyzed: 4,
  earnedRecognition: 4,
  enteredNetwork: 3,
  approvedForTrading: 0,
};

/** @deprecated use BUILDERS_INDEX / THE_STANDARD */
export const CURATED_MARKET_STATS = {
  projectsReviewed: THE_STANDARD.earnedRecognition,
  buildersFeatured: THE_STANDARD.enteredNetwork,
  qualityStandard: 1,
};

export const INITIAL_BUILDERS: Builder[] = [
  {
    id: 'b1',
    name: 'Georgi Gerganov',
    walletAddress: 'github:ggerganov',
    avatarUrl: 'https://unavatar.io/github/ggerganov',
    reputationLevel: 'Genesis Builder',
    level: 5,
    xp: 0,
    builderScore: 98,
    codeContribution: 0,
    communityImpact: 0,
    securityReputation: 0,
    followers: 0,
    projectsCreated: ['p1'],
    contributionsCount: 0,
    communityTrust: 0,
    openSourceImpact: 'Exceptional',
    achievements: [],
    nftsEarned: [],
  },
  {
    id: 'b2',
    name: 'Aave Labs',
    walletAddress: 'github:aave',
    avatarUrl: 'https://unavatar.io/twitter/aave',
    reputationLevel: 'Visionary',
    level: 4,
    xp: 0,
    builderScore: 89,
    codeContribution: 0,
    communityImpact: 0,
    securityReputation: 0,
    followers: 0,
    projectsCreated: ['p2'],
    contributionsCount: 0,
    communityTrust: 0,
    openSourceImpact: 'High',
    achievements: [],
    nftsEarned: [],
  },
  {
    id: 'b3',
    name: 'Wormhole Foundation',
    walletAddress: 'github:wormhole-foundation',
    avatarUrl: 'https://unavatar.io/twitter/wormhole',
    reputationLevel: 'Core Builder',
    level: 3,
    xp: 0,
    builderScore: 94,
    codeContribution: 0,
    communityImpact: 0,
    securityReputation: 0,
    followers: 0,
    projectsCreated: ['p3'],
    contributionsCount: 0,
    communityTrust: 0,
    openSourceImpact: 'High',
    achievements: [],
    nftsEarned: [],
  },
  {
    id: 'b4',
    name: 'Metaplex Foundation',
    walletAddress: 'github:metaplex-foundation',
    avatarUrl: 'https://unavatar.io/twitter/metaplex',
    reputationLevel: 'Visionary',
    level: 4,
    xp: 0,
    builderScore: 91,
    codeContribution: 0,
    communityImpact: 0,
    securityReputation: 0,
    followers: 0,
    projectsCreated: ['p4'],
    contributionsCount: 0,
    communityTrust: 0,
    openSourceImpact: 'High',
    achievements: [],
    nftsEarned: [],
  },
];

/**
 * Builder wall — only real catalog builders / orgs.
 * No filler names. Ranks grow as passports and Talent sync.
 */
export type Builder100Entry = {
  rank: number;
  builderId: string;
  name: string;
  founder: string;
  score: number;
  level: PassportLevel;
  projectId?: string;
  avatarUrl: string;
  real: boolean;
};

export function getBuilder100(builders: Builder[], projects: Project[]): Builder100Entry[] {
  const ranked = [...builders].sort((a, b) => b.builderScore - a.builderScore);
  return ranked.map((b, i) => {
    const project = projects.find((p) => b.projectsCreated.includes(p.id));
    return {
      rank: i + 1,
      builderId: b.id,
      name: project?.name || b.name,
      founder: b.name,
      score: b.builderScore,
      level: b.reputationLevel,
      projectId: project?.id,
      avatarUrl: b.avatarUrl,
      real: true,
    };
  });
}

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'llama.cpp',
    ticker: 'GGML',
    tagline: 'The open runtime that made local LLMs real — shipping weekly, cited globally.',
    description:
      'llama.cpp is the GGML community’s high-performance C/C++ inference stack for large language models. It is the reference implementation builders fork when they need on-device and edge AI without a cloud dependency.',
    problem:
      'AI inference was locked behind opaque cloud APIs. Builders could not run, audit, or ship models locally at production quality.',
    builderStory:
      'Georgi Gerganov and contributors turned a research-shaped idea into the default open inference engine — public commits, public releases, no theater.',
    foundedYear: 2023,
    journey: 'Prototype → Mainnet → Scale',
    whySelected:
      'Genesis #1 by live Builder Score™ — verified public GitHub (ggml-org/llama.cpp), extreme shipping velocity, and unmatched open-source adoption.',
    marketCapLabel: 'Open source · no token required',
    logoUrl: 'Brain',
    coverImage: '/projects/sentient.jpg',
    category: 'AI + Web3',
    chain: 'Solana',
    rating: 4.9,
    upvotes: 0,
    githubRepo: 'ggerganov/llama.cpp',
    githubActivity: 12000,
    roadmap: [
      { phase: 'Phase 1', title: 'Core inference', description: 'CPU/GPU backends for major LLM families.', date: '2023', status: 'completed' },
      { phase: 'Phase 2', title: 'Ecosystem forks', description: 'Bindings, servers, and app embeddings worldwide.', date: '2024', status: 'completed' },
      { phase: 'Phase 3', title: 'Continuous release', description: 'Weekly merges — score pipeline reads live push signals.', date: '2026', status: 'in-progress' },
    ],
    team: [
      { name: 'Georgi Gerganov', role: 'Creator / lead', avatarUrl: 'https://unavatar.io/github/ggerganov' },
      { name: 'GGML contributors', role: 'Core maintainers', avatarUrl: 'https://unavatar.io/github/ggml-org' },
    ],
    raised: 0,
    goal: 0,
    tokenPrice: 0,
    tokenPriceHistory: [{ time: 'now', price: 0 }],
    aiAnalysis: {
      quality: 96,
      market: 94,
      risk: 22,
      innovation: 95,
      summary:
        'Canonical open inference stack. Risk is governance/coordination of a massive OSS graph — not vaporware.',
    },
    builderScore: makeBuilderScore({
      development: 98,
      innovation: 94,
      community: 97,
      transparency: 99,
      productProgress: 96,
      builderReputation: 98,
      liquidityHealth: 40,
    }),
    curation: { status: 'curated', builderVerified: true, reviewedAt: '2026-07-26' },
    comments: [],
    quests: [
      {
        id: 'q_p1_1',
        name: 'Read the llama.cpp repo',
        description: 'Open the public GitHub, skim recent commits, note one shipping signal.',
        xp: 250,
        category: 'research',
        completed: false,
        badge: 'Research Badge',
      },
    ],
    socials: {
      twitter: 'https://x.com/ggerganov',
      website: 'https://github.com/ggml-org/llama.cpp',
    },
    launchpadActive: false,
    liquidityLocked: false,
    reputationDelta: 0,
    communityMilestones: ['100k+ GitHub stars', 'Default local LLM runtime', 'Genesis Index #1'],
  },
  {
    id: 'p2',
    name: 'Aave v3',
    ticker: 'AAVE',
    tagline: 'Isolated risk markets that became DeFi’s lending reference.',
    description:
      'Aave v3 is the open-source core of a multi-chain liquidity protocol — audited contracts, public development history, and a battle-tested risk architecture.',
    problem:
      'Shared-pool lending turns one bad asset into systemic risk. Builders need modular markets with transparent code.',
    builderStory:
      'Aave Labs and contributors shipped v3 as public infrastructure — the score pipeline reads aave/aave-v3-core directly.',
    foundedYear: 2022,
    journey: 'Mainnet → Revenue → Scale',
    whySelected:
      'Strong protocol pedigree. Currently below Genesis cut on live repo activity — kept as reviewed, not Genesis.',
    marketCapLabel: 'Blue-chip DeFi',
    logoUrl: 'Coins',
    coverImage: '/projects/aerolend.jpg',
    category: 'DeFi',
    chain: 'Solana',
    rating: 4.7,
    upvotes: 0,
    githubRepo: 'aave/aave-v3-core',
    githubActivity: 32,
    roadmap: [
      { phase: 'Phase 1', title: 'v3 core', description: 'Isolated pools and risk managers.', date: '2022', status: 'completed' },
      { phase: 'Phase 2', title: 'Multi-chain', description: 'Deployments across major L2s.', date: '2023', status: 'completed' },
    ],
    team: [
      { name: 'Aave Labs', role: 'Protocol team', avatarUrl: 'https://unavatar.io/twitter/aave' },
    ],
    raised: 0,
    goal: 0,
    tokenPrice: 0,
    tokenPriceHistory: [{ time: 'now', price: 0 }],
    aiAnalysis: {
      quality: 90,
      market: 88,
      risk: 28,
      innovation: 72,
      summary: 'Mature lending core. Live GitHub activity is quieter — score reflects that honestly.',
    },
    builderScore: makeBuilderScore({
      development: 55,
      innovation: 70,
      community: 80,
      transparency: 88,
      productProgress: 92,
      builderReputation: 90,
      liquidityHealth: 85,
    }),
    curation: { status: 'reviewed', builderVerified: true, reviewedAt: '2026-07-26' },
    comments: [],
    quests: [
      {
        id: 'q_p2_1',
        name: 'Skim Aave v3 core',
        description: 'Open aave/aave-v3-core and note last push date vs protocol maturity.',
        xp: 150,
        category: 'research',
        completed: false,
      },
    ],
    socials: { twitter: 'https://x.com/aave', website: 'https://aave.com' },
    launchpadActive: false,
    liquidityLocked: true,
    reputationDelta: 0,
    communityMilestones: ['Multi-chain liquidity', 'Public audits'],
  },
  {
    id: 'p3',
    name: 'Wormhole',
    ticker: 'W',
    tagline: 'Cross-chain messaging infrastructure — open protocols, public guardians, live code.',
    description:
      'Wormhole is a widely deployed interoperability network. The open wormhole-foundation/wormhole monorepo is what our Builder Score™ cites for development and transparency.',
    problem:
      'Liquidity and state are fragmented across chains. Builders need messaging that is inspectable — not a black-box bridge pitch.',
    builderStory:
      'Wormhole Foundation and core contributors treat interoperability as public infrastructure: repos, docs, and on-chain deployments you can verify.',
    foundedYear: 2021,
    journey: 'Mainnet → Scale',
    whySelected:
      'Genesis #2 — live GitHub signals from wormhole-foundation/wormhole, production deployment footprint, and clear infra category fit.',
    marketCapLabel: 'Interop infrastructure',
    logoUrl: 'Layers',
    coverImage: '/projects/hypersphere.jpg',
    category: 'Infrastructure',
    chain: 'Solana',
    rating: 4.6,
    upvotes: 0,
    githubRepo: 'wormhole-foundation/wormhole',
    githubActivity: 8000,
    roadmap: [
      { phase: 'Phase 1', title: 'Core messaging', description: 'Guardian-verified VAAs across chains.', date: '2021', status: 'completed' },
      { phase: 'Phase 2', title: 'Ecosystem apps', description: 'Token bridge + native integrations.', date: '2023', status: 'completed' },
      { phase: 'Phase 3', title: 'Open contribution', description: 'Continuous public development.', date: '2026', status: 'in-progress' },
    ],
    team: [
      { name: 'Wormhole Foundation', role: 'Stewards', avatarUrl: 'https://unavatar.io/twitter/wormhole' },
    ],
    raised: 0,
    goal: 0,
    tokenPrice: 0,
    tokenPriceHistory: [{ time: 'now', price: 0 }],
    aiAnalysis: {
      quality: 88,
      market: 92,
      risk: 38,
      innovation: 86,
      summary: 'Category-defining interop. Bridge risk remains — citations show code reality, not vibes.',
    },
    builderScore: makeBuilderScore({
      development: 90,
      innovation: 88,
      community: 90,
      transparency: 92,
      productProgress: 94,
      builderReputation: 91,
      liquidityHealth: 70,
    }),
    curation: { status: 'curated', builderVerified: true, reviewedAt: '2026-07-26' },
    comments: [],
    quests: [
      {
        id: 'q_p3_1',
        name: 'Inspect Wormhole monorepo',
        description: 'Open wormhole-foundation/wormhole and cite one recent merge.',
        xp: 350,
        category: 'research',
        completed: false,
      },
    ],
    socials: {
      website: 'https://wormhole.com',
      twitter: 'https://x.com/wormhole',
      discord: 'https://discord.gg/wormholecrypto',
    },
    launchpadActive: false,
    liquidityLocked: true,
    reputationDelta: 0,
    communityMilestones: ['Multi-chain mainnet', 'Public monorepo', 'Genesis Index #2'],
  },
  {
    id: 'p4',
    name: 'Metaplex',
    ticker: 'MPL',
    tagline: 'The NFT and digital-asset standard Solana builders actually ship on.',
    description:
      'Metaplex Token Metadata (mpl-token-metadata) is core open-source infrastructure for Solana digital assets — the contracts and programs creator apps compose.',
    problem:
      'Creators and apps need portable on-chain ownership standards — not one-off mint scripts.',
    builderStory:
      'Metaplex Foundation maintains public programs that power a huge share of Solana NFTs and digital assets. Our score cites the live mpl-token-metadata repository.',
    foundedYear: 2021,
    journey: 'Mainnet → Revenue → Scale',
    whySelected:
      'Genesis #3 — live Metaplex Token Metadata repo signals, creator-economy category leadership, and transparent OSS stewardship.',
    marketCapLabel: 'Creator infrastructure',
    logoUrl: 'Share2',
    coverImage: '/projects/creatorlink.jpg',
    category: 'Creator Economy',
    chain: 'Solana',
    rating: 4.8,
    upvotes: 0,
    githubRepo: 'metaplex-foundation/mpl-token-metadata',
    githubActivity: 2000,
    roadmap: [
      { phase: 'Phase 1', title: 'Token Metadata', description: 'Standard NFT metadata programs.', date: '2021', status: 'completed' },
      { phase: 'Phase 2', title: 'Core / Bubblegum', description: 'Compressed and flexible asset primitives.', date: '2023', status: 'completed' },
      { phase: 'Phase 3', title: 'Ongoing standards', description: 'Public maintenance of creator tooling.', date: '2026', status: 'in-progress' },
    ],
    team: [
      { name: 'Metaplex Foundation', role: 'Stewards', avatarUrl: 'https://unavatar.io/twitter/metaplex' },
    ],
    raised: 0,
    goal: 0,
    tokenPrice: 0,
    tokenPriceHistory: [{ time: 'now', price: 0 }],
    aiAnalysis: {
      quality: 90,
      market: 89,
      risk: 24,
      innovation: 84,
      summary: 'Default Solana creator stack. Score tracks the public metadata program — not marketing.',
    },
    builderScore: makeBuilderScore({
      development: 82,
      innovation: 84,
      community: 88,
      transparency: 90,
      productProgress: 93,
      builderReputation: 89,
      liquidityHealth: 65,
    }),
    curation: { status: 'curated', builderVerified: true, reviewedAt: '2026-07-26' },
    comments: [],
    quests: [
      {
        id: 'q_p4_1',
        name: 'Open Token Metadata',
        description: 'Visit metaplex-foundation/mpl-token-metadata and note the license + last push.',
        xp: 100,
        category: 'research',
        completed: false,
      },
    ],
    socials: {
      twitter: 'https://x.com/metaplex',
      website: 'https://www.metaplex.com',
      discord: 'https://discord.gg/metaplex',
    },
    launchpadActive: false,
    liquidityLocked: false,
    reputationDelta: 0,
    communityMilestones: ['Solana NFT standard', 'Public programs', 'Genesis Index #3'],
  },
];

/** DAO proposals — empty until real governance is live (no fake vote theater). */
export const INITIAL_PROPOSALS: Proposal[] = [];

export const ALL_QUESTS: Quest[] = [
  {
    id: 'g_q1',
    name: 'Trade a Curated Asset',
    description: 'Complete a swap of an allowlisted token on Builders DEX.',
    xp: 200,
    category: 'liquidity',
    completed: false,
    badge: 'Trader Signal',
  },
  {
    id: 'g_q2',
    name: 'Apply for Listing',
    description: 'Submit a project for curation review (Apply).',
    xp: 300,
    category: 'code',
    completed: false,
    badge: 'Founder Badge',
  },
  {
    id: 'g_q3',
    name: 'Support a Builder',
    description: 'Upvote or comment on a curated project story.',
    xp: 150,
    category: 'community',
    completed: false,
    badge: 'Community Signal',
  },
  {
    id: 'g_q4',
    name: 'Ask Builder Intelligence™',
    description: 'Run a research query on the intelligence layer.',
    xp: 250,
    category: 'research',
    completed: false,
    badge: 'Research Badge',
  },
  {
    id: 'g_q5',
    name: 'Discovery Quest',
    description: 'Review 5 builder stories in Explore and open their profiles.',
    xp: 250,
    category: 'research',
    completed: false,
    badge: 'Research Badge',
  },
];
