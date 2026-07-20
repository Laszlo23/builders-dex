export type PassportLevel =
  | 'Rookie Builder'
  | 'Builder'
  | 'Core Builder'
  | 'Visionary'
  | 'Genesis Builder';

export type BuilderScoreDimension =
  | 'development'
  | 'innovation'
  | 'community'
  | 'transparency'
  | 'productProgress'
  | 'builderReputation'
  | 'liquidityHealth';

export interface BuilderScore {
  overall: number;
  development: number;
  innovation: number;
  community: number;
  transparency: number;
  productProgress: number;
  builderReputation: number;
  liquidityHealth: number;
}

export type CurationStatus = 'pending' | 'reviewed' | 'curated' | 'rejected';

export type OpenSourceImpact = 'Low' | 'Medium' | 'High' | 'Exceptional';

export interface CurationMeta {
  status: CurationStatus;
  builderVerified: boolean;
  reviewedAt?: string;
  /** Transparent rejection reasons when status === 'rejected' */
  rejectionReasons?: string[];
}

export interface Builder {
  id: string;
  name: string;
  walletAddress: string;
  avatarUrl: string;
  reputationLevel: PassportLevel;
  level: number;
  xp: number;
  builderScore: number; // 0-100 aggregate for rankings
  codeContribution: number;
  communityImpact: number;
  securityReputation: number;
  followers: number;
  projectsCreated: string[];
  contributionsCount: number;
  /** Community trust signal 0–100 */
  communityTrust: number;
  openSourceImpact: OpenSourceImpact;
  achievements: { id: string; name: string; icon: string; description: string; date: string }[];
  nftsEarned: { id: string; name: string; image: string; level: string }[];
}

export interface ProjectTeamMember {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface ProjectAIAnalysis {
  quality: number;
  market: number;
  risk: number;
  innovation: number;
  summary: string;
}

export interface Comment {
  id: string;
  author: string;
  wallet: string;
  text: string;
  date: string;
  avatarUrl?: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  xp: number;
  category: 'code' | 'community' | 'liquidity' | 'testing' | 'research';
  completed: boolean;
  badge?: string;
}

export interface UserSocials {
  x: string;
  farcaster: string;
  linkedin: string;
  github: string;
  discord: string;
  telegram: string;
  tiktok: string;
  paragraph: string;
  website: string;
  email: string;
}

/** Hackathon-grade application extras */
export interface ProjectApplication {
  contactEmail: string;
  demoUrl: string;
  pitchDeckUrl: string;
  videoUrl: string;
  whitepaperUrl: string;
  hackathonName: string;
  tracks: string[];
  techStack: string[];
  lookingFor: string[];
  teamSize: number;
  fundingStatus: string;
  previousLaunches: string;
  whyBuildersDex: string;
  socials: Partial<UserSocials>;
}

export interface Project {
  id: string;
  name: string;
  ticker: string;
  tagline: string;
  description: string;
  /** Why the project exists / problem statement */
  problem: string;
  /** Short founder narrative */
  builderStory: string;
  /** Founded year for story cards */
  foundedYear: number;
  /** Journey stage e.g. Prototype → Mainnet */
  journey: string;
  /** Curation rationale quote */
  whySelected: string;
  /** Display market cap for research framing */
  marketCapLabel?: string;
  logoUrl: string;
  /** Optional cover / story image */
  coverImage?: string;
  category: 'AI + Web3' | 'DeFi' | 'Infrastructure' | 'Creator Economy';
  chain: 'Polygon' | 'Base' | 'Solana' | 'Ethereum';
  mint?: string;
  rating: number;
  upvotes: number;
  githubRepo: string;
  githubActivity: number;
  roadmap: {
    phase: string;
    title: string;
    description: string;
    date: string;
    status: 'completed' | 'in-progress' | 'upcoming';
  }[];
  team: ProjectTeamMember[];
  raised: number;
  goal: number;
  tokenPrice: number;
  tokenPriceHistory: { time: string; price: number }[];
  aiAnalysis: ProjectAIAnalysis;
  builderScore: BuilderScore;
  curation: CurationMeta;
  comments: Comment[];
  quests: Quest[];
  socials: { twitter?: string; telegram?: string; website?: string; discord?: string };
  launchpadActive: boolean;
  liquidityLocked: boolean;
  communityMilestones?: string[];
  /** Full application packet when submitted for review */
  application?: ProjectApplication;
  /** Daily reputation delta for War Room movers */
  reputationDelta?: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  creator: string;
  votesFor: number;
  votesAgainst: number;
  status: 'active' | 'passed' | 'defeated' | 'queued';
  endsAt: string;
  category: 'Grants' | 'Ecosystem' | 'Upgrades' | 'Rewards';
  userVoted?: 'for' | 'against';
}

export interface SwapTransaction {
  id: string;
  time: string;
  fromToken: string;
  toToken: string;
  fromMint: string;
  toMint: string;
  fromAmount: number;
  toAmount: number;
  signature?: string;
  status: 'success' | 'failed';
  explorerUrl?: string;
}

export interface UserWallet {
  connected: boolean;
  address: string;
  balances: { [ticker: string]: number };
  selectedChain: 'Polygon' | 'Base' | 'Solana' | 'Ethereum';
}

export interface UserProfile {
  displayName: string;
  bio: string;
  avatarUrl: string;
  socials: UserSocials;
}

export interface PassportStats {
  projectsDiscovered: number;
  communitiesSupported: number;
  researchQuestsCompleted: number;
  builderReputation: number;
  communityTrust: number;
  openSourceImpact: OpenSourceImpact;
  projectsCreated: number;
  previousContributions: number;
  /** Estimated active users influenced / supported */
  activeUsers?: number;
  /** Verified open-source contributions */
  openSourceContributions?: number;
  /** Years of on-platform reputation */
  reputationAgeYears?: number;
  /** Scout XP from Builder Scouts™ */
  scoutXp?: number;
  /** Scout early calls credited */
  earlyCalls?: number;
  /** Research accuracy % */
  researchAccuracy?: number;
}

export type BuilderTypeLabel =
  | 'The Engineer'
  | 'The Visionary'
  | 'The Operator'
  | 'The Community Architect'
  | 'The Researcher'
  | 'Emerging Builder';

export interface BuilderDNA {
  engineering: number;
  vision: number;
  execution: number;
  community: number;
  transparency: number;
  builderType: BuilderTypeLabel;
  strength: string;
  risk: string;
}

export type ProofKey =
  | 'github'
  | 'deployed'
  | 'users'
  | 'community'
  | 'opensource'
  | 'revenue';

export interface ProofOfBuildingItem {
  key: ProofKey;
  label: string;
  verified: boolean;
  /** 0–5 visual strength */
  strength: number;
  /** e.g. "342 commits", "Mainnet deployed" */
  metricLabel: string;
}

export interface ProofOfBuilding {
  items: ProofOfBuildingItem[];
  lastVerified: string;
}

export interface ScoutMission {
  id: string;
  title: string;
  description: string;
  focus: string;
  rewardXp: number;
  rewardLabel: string;
  completed: boolean;
  analysis?: string;
}

export interface ScoutProfile {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
  projectsDiscovered: number;
  earlyCalls: number;
  researchAccuracy: number;
  scoutReputation: number;
  focus?: string;
}

export type GenesisStatus = 'Under Review' | 'Private Evaluation' | 'Entering Network' | 'Early Signal';

export interface GenesisRadarEntry {
  id: string;
  name: string;
  sector: string;
  beforeLabel: string;
  currentLabel: string;
  status: GenesisStatus;
  signal: string;
  /** 0–100 evaluation progress */
  progress: number;
  projectId?: string;
}

export interface TerminalSector {
  name: string;
  changePct: number;
}

export interface ArenaMatch {
  id: string;
  title: string;
  a: { name: string; projectId: string; votes: number };
  b: { name: string; projectId: string; votes: number };
  prize: string;
}

/** Market-wide Builders Index™ */
export interface BuildersIndex {
  title: string;
  market: string;
  health: number;
  projectsTracked: number;
  projectsApproved: number;
  qualityThreshold: string;
  deltaLabel: string;
}

/** Funnel exclusivity stats — THE STANDARD */
export interface TheStandard {
  projectsAnalyzed: number;
  earnedRecognition: number;
  enteredNetwork: number;
  approvedForTrading: number;
}
