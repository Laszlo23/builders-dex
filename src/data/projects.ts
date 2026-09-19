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
import { AURA_BASE_ADDRESS } from './crossChainRegistry';
import { CUBES_CONTRACT, CUBES_MINT_URL } from './hoodChain';
import { HOODSTREET_SITE } from './hoodStreet';

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
  {
    id: 'b5',
    name: 'Laszlo Bihary / Building Culture',
    walletAddress: 'github:Laszlo23',
    avatarUrl: 'https://unavatar.io/github/Laszlo23',
    reputationLevel: 'Core Builder',
    level: 3,
    xp: 0,
    builderScore: 82,
    codeContribution: 0,
    communityImpact: 0,
    securityReputation: 0,
    followers: 0,
    projectsCreated: ['p5'],
    contributionsCount: 0,
    communityTrust: 0,
    openSourceImpact: 'Medium',
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
    coverImage: '/projects/sentient.webp',
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
    reputationDelta: 4,
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
    coverImage: '/projects/aerolend.webp',
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
    reputationDelta: -1,
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
    coverImage: '/projects/hypersphere.webp',
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
    reputationDelta: 3,
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
    coverImage: '/projects/creatorlink.webp',
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
    reputationDelta: 2,
    communityMilestones: ['Solana NFT standard', 'Public programs', 'Genesis Index #3'],
  },
  {
    id: 'p5',
    name: 'Aura OS',
    ticker: 'AURA',
    tagline: 'Own a company. Let AI make money. The AI business OS for real founders.',
    description:
      'Aura OS is the operating system for AI-powered companies. You are the owner — AI employees draft pitches, book posts, follow up, and qualify leads. You approve spend and outbound. They execute, and you keep the upside. Built for local businesses first (Vienna launch), then global.',
    problem:
      'You lose hours in tools, spreadsheets, and busywork. Photos on Instagram do not draft follow-ups or pitch leads — and you are doing a job instead of owning a business.',
    builderStory:
      'Started with a Vienna shop, a dying homepage, and a cousin who said you do the internet thing. Built a review machine that tracks real visits (no star shop scams), then extended to AI employees that handle follow-ups, reviews, repeat visits. One Melange, one economy — AURA token on Base with locked Uni v4 AURA/USDC.',
    foundedYear: 2024,
    journey: 'Prototype → Mainnet → Scale',
    whySelected:
      'Featured partner with Building Culture ecosystem. Fair launch on Base (T-0: Sunday 13 Sep 2026, 11:11 Vienna). Founders-first, no VC dump, transparent tokenomics. Real local business proof (1,000 businesses, 23 districts in Vienna).',
    marketCapLabel: 'Fair launch on Base · $29/mo or $299/yr',
    logoUrl: 'Building',
    coverImage: '/projects/hypersphere.webp',
    category: 'AI + Web3',
    chain: 'Base',
    baseTokenAddress: AURA_BASE_ADDRESS,
    rating: 4.8,
    upvotes: 0,
    githubRepo: 'Laszlo23/auraos',
    githubActivity: 45,
    roadmap: [
      { phase: 'Phase 1', title: 'Vienna launch', description: 'Local guest check-in, follow-ups, reviews for 1,000 businesses.', date: '2024', status: 'completed' },
      { phase: 'Phase 2', title: 'AURA token', description: 'Fair launch on Base, locked Uni v4 AURA/USDC, fixed supply 777,777,777.', date: 'Sep 13, 2026', status: 'in-progress' },
      { phase: 'Phase 3', title: 'Global expansion', description: 'AI company OS for founders worldwide — not just Vienna.', date: '2026-2027', status: 'in-progress' },
    ],
    team: [
      { name: 'Laszlo Bihary', role: 'Founder', avatarUrl: 'https://unavatar.io/github/Laszlo23' },
      { name: 'Building Culture', role: 'Ecosystem', avatarUrl: 'https://unavatar.io/twitter/bihary41418' },
    ],
    raised: 0,
    goal: 0,
    tokenPrice: 0,
    tokenPriceHistory: [{ time: 'now', price: 0 }],
    aiAnalysis: {
      quality: 88,
      market: 85,
      risk: 32,
      innovation: 90,
      summary:
        'AI-first business OS with real local validation. Fair launch with transparent tokenomics. Risk is early-stage execution and Base chain dependency, not vaporware.',
    },
    builderScore: makeBuilderScore({
      development: 78,
      innovation: 90,
      community: 75,
      transparency: 92,
      productProgress: 80,
      builderReputation: 82,
      liquidityHealth: 50,
    }),
    curation: { status: 'curated', builderVerified: true, reviewedAt: '2026-09-13' },
    comments: [],
    quests: [
      {
        id: 'q_p5_1',
        name: 'Explore Aura OS',
        description: 'Visit aibusiness.fun and explore the AI company OS — check /access and /lokal.',
        xp: 200,
        category: 'research',
        completed: false,
        badge: 'Research Badge',
      },
      {
        id: 'q_p5_2',
        name: 'Join the Vienna launch',
        description: 'Watch the fair launch Sunday 13 Sep 2026, 11:11 Vienna time.',
        xp: 300,
        category: 'community',
        completed: false,
        badge: 'Community Signal',
      },
    ],
    socials: {
      twitter: 'https://x.com/bihary41418',
      website: 'https://aibusiness.fun',
      discord: '',
    },
    launchpadActive: true,
    liquidityLocked: true,
    reputationDelta: 0,
    communityMilestones: ['1,000 Vienna businesses', 'Fair launch on Base', 'AI company OS', 'Building Culture partner'],
  },
  {
    id: 'p6',
    name: 'HoodStreet',
    ticker: 'CCFF00',
    tagline: 'Wall Street reimagined onchain — CCFF00 Squares, My Neon wallets, Cubes mint.',
    description:
      'HoodStreet is an onchain market ecosystem on Robinhood Chain for humans and AI agents. CCFF00 is the founding membership: 10,000 identical #CCFF00 Squares, each an ERC-6551 wallet loaded with 10,000 $CCFF00. Cubes is the ETH mint we list (Square Apes). We are not the minter and we do not wrap this onto Solana.',
    problem:
      'Agents and founders need a persistent onchain identity with a wallet that moves with the NFT — not a username and an API key. Arrival from Solana still needs ETH on 4663 first.',
    builderStory:
      'CCFF00 is Proof of Neon: one color, fully onchain SVG, token-bound account. Cubes contract reviewed on-chain (Sourcify) at 0x5b9e105b28e6313222ee6572a90374c91a296639. My Neon is the wallet UI for what the Square holds. DYOR — config/metadata freeze and merkle details are on-chain, not our promises.',
    foundedYear: 2026,
    journey: 'HoodStreet live on Hood',
    whySelected:
      'The Hood project we can actually participate in today: official site, founding membership, live mint phases, same 0x as Base. Catalog lists the ecosystem — not a Cubes-only footnote.',
    marketCapLabel: 'CCFF00 membership · Hood ETH',
    logoUrl: 'Layers',
    coverImage: '/campaign/hook-wide.webp',
    category: 'Creator Economy',
    chain: 'Robinhood',
    hoodTokenAddress: CUBES_CONTRACT,
    rating: 4.2,
    upvotes: 0,
    githubRepo: '—',
    githubActivity: 0,
    roadmap: [
      { phase: 'Phase 0', title: 'CCFF00 + My Neon', description: 'Founding Squares and the token-bound wallet UI are live on hoodstreet.capital.', date: '2026', status: 'completed' },
      { phase: 'Phase 1', title: 'Cubes mint windows', description: 'ETH mint on Square Apes with on-chain phases() and merkle gates.', date: 'Sep 2026', status: 'in-progress' },
      { phase: 'Phase 2', title: 'Member street', description: 'HoodStreet lists planned launch access, fees, and agent tools. Subject to their disclosures.', date: 'TBD', status: 'upcoming' },
    ],
    team: [
      { name: 'HoodStreet', role: 'Ecosystem', avatarUrl: '/og-image.webp' },
      { name: 'Square Apes', role: 'Cubes minter', avatarUrl: '/og-image.webp' },
    ],
    raised: 0,
    goal: 0,
    tokenPrice: 0,
    tokenPriceHistory: [{ time: 'now', price: 0 }],
    aiAnalysis: {
      quality: 72,
      market: 68,
      risk: 48,
      innovation: 70,
      summary:
        'Verified Hood NFT with live phases. Risk is unpublished merkle details, unfrozen config/metadata, and 7-day canonical bridge exit — not an unverified drainer.',
    },
    builderScore: makeBuilderScore({
      development: 70,
      innovation: 68,
      community: 62,
      transparency: 78,
      productProgress: 74,
      builderReputation: 60,
      liquidityHealth: 40,
    }),
    curation: { status: 'curated', builderVerified: true, reviewedAt: '2026-09-17' },
    comments: [],
    quests: [
      {
        id: 'q_p6_1',
        name: 'Read On Hood',
        description: 'Follow /hood — test amount, ETH gas first, type bridge URLs yourself.',
        xp: 150,
        category: 'research',
        completed: false,
        badge: 'Research Badge',
      },
      {
        id: 'q_p6_2',
        name: 'Open HoodStreet',
        description: 'Read /hoodstreet — CCFF00, My Neon, then check Cubes phases before minting.',
        xp: 200,
        category: 'community',
        completed: false,
        badge: 'Community Signal',
      },
    ],
    socials: {
      twitter: '',
      website: HOODSTREET_SITE,
      discord: '',
    },
    launchpadActive: false,
    liquidityLocked: false,
    reputationDelta: 0,
    communityMilestones: ['HoodStreet on 4663', 'CCFF00 Proof of Neon', 'Sourcify Cubes mint', 'ETH gas first'],
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
