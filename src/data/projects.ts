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

/** Builders Index™ — Solana Innovation Market */
export const BUILDERS_INDEX: BuildersIndex = {
  title: 'Builders Index™',
  market: 'Solana Innovation Market',
  health: 92.4,
  projectsTracked: 4892,
  projectsApproved: 127,
  qualityThreshold: 'Top 2.6%',
  deltaLabel: '+0.6 this week',
};

/** THE STANDARD — exclusivity funnel */
export const THE_STANDARD: TheStandard = {
  projectsAnalyzed: 4892,
  earnedRecognition: 127,
  enteredNetwork: 23,
  approvedForTrading: 2,
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
    name: 'Satoshi Dev',
    walletAddress: '0x99A8c...B29c',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    reputationLevel: 'Genesis Builder',
    level: 5,
    xp: 5200,
    builderScore: 98,
    codeContribution: 124,
    communityImpact: 95,
    securityReputation: 99,
    followers: 1240,
    projectsCreated: ['p1'],
    contributionsCount: 420,
    communityTrust: 97,
    openSourceImpact: 'Exceptional',
    achievements: [
      { id: 'a1', name: 'Security Pioneer', icon: 'ShieldCheck', description: 'Audited over 50 custom smart contracts.', date: '2026-03-12' },
      { id: 'a2', name: 'Open-Source Titan', icon: 'Code', description: 'Contributed 300+ PRs to major Web3 repos.', date: '2026-05-18' },
    ],
    nftsEarned: [
      { id: 'nft1', name: 'Vanguard Builder ID', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80', level: 'Diamond' },
    ],
  },
  {
    id: 'b2',
    name: 'Elena Rostova',
    walletAddress: '0x2a1E3...5C19',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    reputationLevel: 'Visionary',
    level: 4,
    xp: 3800,
    builderScore: 89,
    codeContribution: 88,
    communityImpact: 92,
    securityReputation: 85,
    followers: 720,
    projectsCreated: ['p2'],
    contributionsCount: 195,
    communityTrust: 91,
    openSourceImpact: 'High',
    achievements: [
      { id: 'a4', name: 'Liquidity Guru', icon: 'Droplets', description: 'Supplied and managed $100k+ in DEX pools.', date: '2026-04-01' },
    ],
    nftsEarned: [
      { id: 'nft3', name: 'Architect Identity Card', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=150&q=80', level: 'Gold' },
    ],
  },
  {
    id: 'b3',
    name: 'Alex Rivera',
    walletAddress: '0x7F20d...66Fa',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    reputationLevel: 'Core Builder',
    level: 3,
    xp: 2100,
    builderScore: 94,
    codeContribution: 65,
    communityImpact: 74,
    securityReputation: 80,
    followers: 340,
    projectsCreated: ['p3'],
    contributionsCount: 94,
    communityTrust: 88,
    openSourceImpact: 'High',
    achievements: [
      { id: 'a6', name: 'Bug Exterminator', icon: 'Bug', description: 'Found critical vulnerabilities in 3 launchpad projects.', date: '2026-06-15' },
    ],
    nftsEarned: [
      { id: 'nft4', name: 'Contributor Passport', image: 'https://images.unsplash.com/photo-1644024541275-dc9f1f0b052f?auto=format&fit=crop&w=100&q=80', level: 'Silver' },
    ],
  },
  {
    id: 'b4',
    name: 'Sophia Chen',
    walletAddress: 'So1...Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    reputationLevel: 'Visionary',
    level: 4,
    xp: 3600,
    builderScore: 91,
    codeContribution: 72,
    communityImpact: 90,
    securityReputation: 88,
    followers: 890,
    projectsCreated: ['p4'],
    contributionsCount: 210,
    communityTrust: 93,
    openSourceImpact: 'High',
    achievements: [],
    nftsEarned: [],
  },
  {
    id: 'b5',
    name: 'Marcus Hale',
    walletAddress: 'Mh1...Hale',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    reputationLevel: 'Builder',
    level: 2,
    xp: 1400,
    builderScore: 78,
    codeContribution: 40,
    communityImpact: 62,
    securityReputation: 70,
    followers: 180,
    projectsCreated: [],
    contributionsCount: 48,
    communityTrust: 76,
    openSourceImpact: 'Medium',
    achievements: [],
    nftsEarned: [],
  },
  {
    id: 'b6',
    name: 'Priya Nair',
    walletAddress: 'Pn1...Nair',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    reputationLevel: 'Core Builder',
    level: 3,
    xp: 2400,
    builderScore: 86,
    codeContribution: 55,
    communityImpact: 80,
    securityReputation: 82,
    followers: 410,
    projectsCreated: [],
    contributionsCount: 112,
    communityTrust: 85,
    openSourceImpact: 'High',
    achievements: [],
    nftsEarned: [],
  },
];

/** Hall of Fame padding names for The Builder 100 display */
const WALL_PAD = [
  'Nova Relay', 'Kinetic Labs', 'Orbit Mesh', 'Cipher Grove', 'Lumen Protocol',
  'Forge State', 'Pulse Index', 'Arc Vault', 'Signal Works', 'Helix Commerce',
  'Drift Engine', 'Quartz Node', 'Axiom Soft', 'Tide Graph', 'Ember Stack',
  'Prism DAO', 'Vector Field', 'Anchor Mint', 'Flux Ledger', 'Coral Runtime',
];

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
  const entries: Builder100Entry[] = ranked.map((b, i) => {
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

  let rank = entries.length + 1;
  for (const name of WALL_PAD) {
    if (rank > 100) break;
    entries.push({
      rank,
      builderId: `pad_${rank}`,
      name,
      founder: `${name.split(' ')[0]} Team`,
      score: Math.round(Math.max(55, 84 - (rank - ranked.length) * 1.2)),
      level: rank <= 40 ? 'Builder' : 'Rookie Builder',
      avatarUrl: '',
      real: false,
    });
    rank += 1;
  }
  return entries.slice(0, 100);
}

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'SentientAI',
    ticker: 'SENT',
    tagline: 'The team building autonomous agents for decentralized commerce.',
    description:
      'SentientAI is a privacy-first Web3 platform where builders deploy, monetize, and trade compute shares of AI agents. It uses zero-knowledge proofs to secure agent weights while verifying that execution matches model parameters.',
    problem:
      'Centralized AI inference is opaque, expensive, and impossible to verify. Builders cannot prove that a model ran as claimed.',
    builderStory:
      'Founded by Satoshi Dev and Dr. Evelyn Carter after years in ZK research and ML systems. They set out to make inference as auditable as a blockchain transaction.',
    foundedYear: 2026,
    journey: 'Prototype → Mainnet',
    whySelected:
      'Strong engineering culture, transparent development, real product usage.',
    marketCapLabel: '~$8.4M',
    logoUrl: 'Brain',
    coverImage: '/projects/sentient.jpg',
    category: 'AI + Web3',
    chain: 'Solana',
    mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    rating: 4.9,
    upvotes: 342,
    githubRepo: 'sentient-ai-labs/agent-core',
    githubActivity: 342,
    roadmap: [
      { phase: 'Phase 1', title: 'Agent Sandbox', description: 'Sandboxed execution for LLM nodes.', date: 'Q1 2026', status: 'completed' },
      { phase: 'Phase 2', title: 'Token Fair Launch', description: 'Launch $SENT with lock-ups.', date: 'Q2 2026', status: 'in-progress' },
      { phase: 'Phase 3', title: 'Hardware Incentives', description: 'GPU staking for inference nodes.', date: 'Q4 2026', status: 'upcoming' },
    ],
    team: [
      { name: 'Satoshi Dev', role: 'Lead Architect', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
      { name: 'Dr. Evelyn Carter', role: 'ML Lead', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80' },
    ],
    raised: 284000,
    goal: 400000,
    tokenPrice: 0.12,
    tokenPriceHistory: [
      { time: '10:00', price: 0.08 },
      { time: '11:00', price: 0.092 },
      { time: '12:00', price: 0.105 },
      { time: '13:00', price: 0.098 },
      { time: '14:00', price: 0.115 },
      { time: '15:00', price: 0.12 },
    ],
    aiAnalysis: {
      quality: 95,
      market: 92,
      risk: 15,
      innovation: 97,
      summary:
        'SentientAI unites decentralized compute with zero-knowledge verification. Technical roadmap is granular; primary risk is hardware network synchronization latency.',
    },
    builderScore: makeBuilderScore({
      development: 95,
      innovation: 97,
      community: 90,
      transparency: 93,
      productProgress: 88,
      builderReputation: 96,
      liquidityHealth: 82,
    }),
    curation: { status: 'curated', builderVerified: true, reviewedAt: '2026-06-01' },
    comments: [
      {
        id: 'c1',
        author: 'Elena Rostova',
        wallet: '0x2a1E3...5C19',
        text: 'Most promising verifiable inference stack I have reviewed. Bindings are pristine.',
        date: '2026-07-15 14:30',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      },
    ],
    quests: [
      { id: 'q_p1_1', name: 'Review SentientAI Codebase', description: 'Review the verified GitHub repo and identify improvements.', xp: 250, category: 'research', completed: false, badge: 'Research Badge' },
    ],
    socials: { twitter: 'https://twitter.com/sentient_ai', website: 'https://sentientai.io', discord: 'https://discord.gg/sentient' },
    launchpadActive: true,
    liquidityLocked: true,
    reputationDelta: 14,
    communityMilestones: ['ZK sandbox live', '2.4k Discord members', 'Double audit scheduled'],
  },
  {
    id: 'p2',
    name: 'AeroLend',
    ticker: 'AERO',
    tagline: 'Building capital-efficient lending with isolated risk — so one bad asset cannot sink the pool.',
    description:
      'AeroLend is a non-custodial lending platform with dynamic rates and isolated asset tiers designed to prevent cascade liquidations.',
    problem:
      'Shared-pool lending turns one bad asset into systemic risk. Builders need isolated markets without sacrificing capital efficiency.',
    builderStory:
      'Elena Rostova designed AeroLend after watching cascade liquidations wipe out early DeFi users. The thesis: risk should be modular, not monolithic.',
    foundedYear: 2025,
    journey: 'Testnet → Audit → Launch',
    whySelected:
      'Clear risk architecture, double audits, founder with proven DeFi ops experience.',
    marketCapLabel: '~$12M',
    logoUrl: 'Coins',
    coverImage: '/projects/aerolend.jpg',
    category: 'DeFi',
    chain: 'Solana',
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    rating: 4.7,
    upvotes: 218,
    githubRepo: 'aerolend-finance/aerolend-v1',
    githubActivity: 32,
    roadmap: [
      { phase: 'Phase 1', title: 'Smart Contract Audit', description: 'Double audits with ConsenSys and PeckShield.', date: 'Q2 2026', status: 'completed' },
      { phase: 'Phase 2', title: 'Collateral Tiers Launch', description: 'Support native and liquid index tokens.', date: 'Q3 2026', status: 'in-progress' },
    ],
    team: [
      { name: 'Elena Rostova', role: 'Founding Engineer', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
    ],
    raised: 154000,
    goal: 200000,
    tokenPrice: 0.045,
    tokenPriceHistory: [
      { time: '10:00', price: 0.04 },
      { time: '11:00', price: 0.041 },
      { time: '12:00', price: 0.043 },
      { time: '13:00', price: 0.045 },
    ],
    aiAnalysis: {
      quality: 88,
      market: 82,
      risk: 25,
      innovation: 79,
      summary: 'Isolated pools and multi-tier liquidation triggers are mathematically sound; faces deep competition.',
    },
    builderScore: makeBuilderScore({
      development: 88,
      innovation: 79,
      community: 84,
      transparency: 90,
      productProgress: 80,
      builderReputation: 89,
      liquidityHealth: 75,
    }),
    curation: { status: 'curated', builderVerified: true, reviewedAt: '2026-05-20' },
    comments: [],
    quests: [
      { id: 'q_p2_1', name: 'Participate in Testnet Lending', description: 'Interact with the isolated pool and post feedback.', xp: 150, category: 'testing', completed: false },
    ],
    socials: { twitter: 'https://twitter.com/aerolend', website: 'https://aerolend.finance' },
    launchpadActive: true,
    liquidityLocked: false,
    reputationDelta: 9,
    communityMilestones: ['PeckShield audit complete', 'Testnet TVL $1.2M'],
  },
  {
    id: 'p3',
    name: 'HyperSphere',
    ticker: 'SPHERE',
    tagline: 'Shipping trustless cross-chain messaging — light clients over committees.',
    description:
      'HyperSphere provides instantly confirmed messaging across chains using light-client verification instead of centralized validators.',
    problem:
      'Bridges either trust multisigs or move too slowly. Developers need fast, verifiable cross-chain state without a trusted middleman.',
    builderStory:
      'Alex Rivera shipped HyperSphere after two failed bridge integrations in production. The bet: light clients beat committees.',
    foundedYear: 2026,
    journey: 'Research → Testnet',
    whySelected:
      'High innovation score, public testnet latency data, and a founder who learned from production failures.',
    marketCapLabel: '~$3.1M',
    logoUrl: 'Layers',
    coverImage: '/projects/hypersphere.jpg',
    category: 'Infrastructure',
    chain: 'Solana',
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    rating: 4.5,
    upvotes: 189,
    githubRepo: 'hypersphere-net/bridge-relayer',
    githubActivity: 19,
    roadmap: [
      { phase: 'Phase 1', title: 'Local Testnet Relayers', description: 'Cross-chain mock relayers with latency tests.', date: 'Q3 2026', status: 'completed' },
      { phase: 'Phase 2', title: 'Relay Staking', description: 'Community pool for relay staking.', date: 'Q3 2026', status: 'upcoming' },
    ],
    team: [
      { name: 'Alex Rivera', role: 'Core Dev', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
    ],
    raised: 82000,
    goal: 300000,
    tokenPrice: 0.25,
    tokenPriceHistory: [
      { time: '10:00', price: 0.25 },
      { time: '11:00', price: 0.25 },
    ],
    aiAnalysis: {
      quality: 81,
      market: 90,
      risk: 42,
      innovation: 97,
      summary:
        'Strong innovation via light-client verification. Bridging retains elevated risk — monitor audits closely.',
    },
    builderScore: makeBuilderScore({
      development: 92,
      innovation: 97,
      community: 95,
      transparency: 86,
      productProgress: 78,
      builderReputation: 88,
      liquidityHealth: 70,
    }),
    curation: { status: 'curated', builderVerified: true, reviewedAt: '2026-07-01' },
    comments: [],
    quests: [
      { id: 'q_p3_1', name: 'Set up Local Node relayer', description: 'Run docker, relay 10 payloads, upload logs.', xp: 350, category: 'code', completed: false },
    ],
    socials: { website: 'https://hypersphere.network', twitter: 'https://twitter.com/hypersphere' },
    launchpadActive: false,
    liquidityLocked: true,
    reputationDelta: 6,
    communityMilestones: ['Testnet latency < 2s', 'Featured on Builders DEX'],
  },
  {
    id: 'p4',
    name: 'CreatorLink',
    ticker: 'LINK',
    tagline: 'Giving creators portable ownership — memberships that travel with the fan.',
    description:
      'CreatorLink lets artists issue fractional access NFTs on Solana with loyalty rewards and automatic revenue share.',
    problem:
      'Creators leak value to platforms. Fans want ownership and upside — not just subscriptions.',
    builderStory:
      'Sophia Chen built CreatorLink after watching indie creators lose distribution overnight. On-chain memberships make the relationship portable.',
    foundedYear: 2025,
    journey: 'MVP → Revenue → Scale',
    whySelected:
      'Live creator integrations, completed fundraising with lock-ups, exceptional community signal.',
    marketCapLabel: '~$6.8M',
    logoUrl: 'Share2',
    coverImage: '/projects/creatorlink.jpg',
    category: 'Creator Economy',
    chain: 'Solana',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    rating: 4.8,
    upvotes: 298,
    githubRepo: 'creatorlink-sol/nfts',
    githubActivity: 52,
    roadmap: [
      { phase: 'Phase 1', title: 'Genesis Mint', description: '50 creator integration licenses.', date: 'Q1 2026', status: 'completed' },
      { phase: 'Phase 2', title: 'Vesting Engine', description: 'Dynamic streaming rewards.', date: 'Q2 2026', status: 'completed' },
      { phase: 'Phase 3', title: 'Public Listing', description: 'Fractional pool listing.', date: 'Q3 2026', status: 'in-progress' },
    ],
    team: [
      { name: 'Sophia Chen', role: 'Lead Architect', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80' },
    ],
    raised: 350000,
    goal: 350000,
    tokenPrice: 0.15,
    tokenPriceHistory: [
      { time: '10:00', price: 0.1 },
      { time: '11:00', price: 0.12 },
      { time: '12:00', price: 0.14 },
      { time: '13:00', price: 0.15 },
    ],
    aiAnalysis: {
      quality: 91,
      market: 88,
      risk: 18,
      innovation: 89,
      summary: 'Optimized SPL mint routines; fundraising complete with structured lock-ups reducing fragmentation risk.',
    },
    builderScore: makeBuilderScore({
      development: 91,
      innovation: 89,
      community: 93,
      transparency: 92,
      productProgress: 94,
      builderReputation: 90,
      liquidityHealth: 88,
    }),
    curation: { status: 'curated', builderVerified: true, reviewedAt: '2026-04-12' },
    comments: [],
    quests: [
      { id: 'q_p4_1', name: 'Join CreatorLink community', description: 'Follow official channels and share structured feedback.', xp: 100, category: 'community', completed: false },
    ],
    socials: {
      twitter: 'https://twitter.com/creator_link',
      website: 'https://creatorlink.xyz',
    },
    launchpadActive: false,
    liquidityLocked: true,
    reputationDelta: -4,
    communityMilestones: ['Fundraising goal met', '50 creator licenses live'],
  },
  {
    id: 'p5',
    name: 'GhostMint',
    ticker: 'GHST',
    tagline: 'Anonymous meme launchpad claiming "fair" launches.',
    description: 'GhostMint marketed anonymous fair launches with no public repo and no named team.',
    problem: 'Claimed to solve fair launch — without verifiable development.',
    builderStory: 'Submitted with anonymous founders and a Telegram-only presence.',
    foundedYear: 2026,
    journey: 'Concept only',
    whySelected: '',
    marketCapLabel: 'N/A',
    logoUrl: 'HelpCircle',
    category: 'DeFi',
    chain: 'Solana',
    rating: 1.2,
    upvotes: 4,
    githubRepo: '—',
    githubActivity: 0,
    roadmap: [],
    team: [],
    raised: 0,
    goal: 50000,
    tokenPrice: 0,
    tokenPriceHistory: [],
    aiAnalysis: {
      quality: 12,
      market: 30,
      risk: 95,
      innovation: 10,
      summary: 'Rejected: no active development, anonymous team, weak product progress.',
    },
    builderScore: makeBuilderScore({
      development: 8,
      innovation: 12,
      community: 15,
      transparency: 5,
      productProgress: 6,
      builderReputation: 10,
      liquidityHealth: 5,
    }),
    curation: {
      status: 'rejected',
      builderVerified: false,
      reviewedAt: '2026-07-08',
      rejectionReasons: [
        'No active development',
        'Anonymous team',
        'Weak product progress',
      ],
    },
    comments: [],
    quests: [],
    socials: {},
    launchpadActive: false,
    liquidityLocked: false,
    reputationDelta: -12,
  },
  {
    id: 'p6',
    name: 'PumpOracle',
    ticker: 'PUMP',
    tagline: 'Price oracle that never shipped a public commit.',
    description: 'Claimed decentralized oracle network; repository was empty at review.',
    problem: 'Oracle freshness without infrastructure.',
    builderStory: 'Team declined identity verification during review.',
    foundedYear: 2026,
    journey: 'Whitepaper → Silence',
    whySelected: '',
    logoUrl: 'HelpCircle',
    category: 'Infrastructure',
    chain: 'Solana',
    rating: 1.0,
    upvotes: 2,
    githubRepo: 'pump-oracle/empty',
    githubActivity: 0,
    roadmap: [],
    team: [{ name: 'Anonymous', role: '—', avatarUrl: 'https://images.unsplash.com/photo-1614850715649-1d0106293bd1?auto=format&fit=crop&w=100&q=80' }],
    raised: 0,
    goal: 100000,
    tokenPrice: 0,
    tokenPriceHistory: [],
    aiAnalysis: {
      quality: 18,
      market: 40,
      risk: 90,
      innovation: 22,
      summary: 'Rejected for inactivity and refusal of team verification.',
    },
    builderScore: makeBuilderScore({
      development: 10,
      innovation: 20,
      community: 12,
      transparency: 8,
      productProgress: 5,
      builderReputation: 15,
      liquidityHealth: 10,
    }),
    curation: {
      status: 'rejected',
      builderVerified: false,
      reviewedAt: '2026-06-22',
      rejectionReasons: [
        'No active development',
        'Anonymous team',
        'No verifiable product usage',
      ],
    },
    comments: [],
    quests: [],
    socials: {},
    launchpadActive: false,
    liquidityLocked: false,
    reputationDelta: 3,
  },
];

export const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop1',
    title: 'BD-GP-12: Matching Pool for High-Score AI & ZK Projects',
    description:
      'Allocate community reserve to quadratic funding for projects scoring 85+ on Builder Score™ in AI and ZK categories.',
    creator: '0x99A8c...B29c',
    votesFor: 12450000,
    votesAgainst: 1200000,
    status: 'active',
    endsAt: '2026-07-28',
    category: 'Grants',
  },
  {
    id: 'prop2',
    title: 'BD-UP-03: Passport Gas Sponsorship for Core Builders+',
    description:
      'Sponsor limited Solana fees daily for holders at Core Builder level and above to reward discovery and research.',
    creator: '0x2a1E3...5C19',
    votesFor: 8900000,
    votesAgainst: 450000,
    status: 'active',
    endsAt: '2026-07-25',
    category: 'Upgrades',
  },
];

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
