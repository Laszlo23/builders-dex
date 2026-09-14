import { BRAND_SUPPORT, BRAND_TAGLINE } from '../data/brand';

export const SITE_URL = 'https://dex.buildingcultureid.space';
export const SITE_NAME = 'Builders DEX';
export const DEFAULT_DESCRIPTION = `${BRAND_TAGLINE} ${BRAND_SUPPORT}`;

export type SeoRoute =
  | 'landing'
  | 'swap'
  | 'explore'
  | 'project-detail'
  | 'apply'
  | 'launch'
  | 'builders'
  | 'dao'
  | 'earn'
  | 'terminal'
  | 'launchpad'
  | 'ai'
  | 'profile'
  | 'campaign'
  | 'blog'
  | 'team'
  | 'terms'
  | 'privacy'
  | 'imprint'
  | 'contact'
  | 'feedback'
  | 'support'
  | 'faq'
  | 'mission'
  | 'vision'
  | 'roadmap'
  | 'manifesto'
  | 'story'
  | 'guide'
  | 'investor'
  | 'builder-graph'
  | 'builder-stories';

type SeoConfig = {
  title: string;
  description: string;
  path: string;
};

const ROUTE_SEO: Record<SeoRoute, SeoConfig> = {
  landing: {
    title: 'Builders DEX — Builder intelligence network',
    description: DEFAULT_DESCRIPTION,
    path: '/',
  },
  swap: {
    title: 'Swap — Builders DEX',
    description:
      'Curated Solana token swaps via Jupiter. Trade Builder-verified projects with confidence. Quality screening first, liquidity second.',
    path: '/swap',
  },
  terminal: {
    title: 'Terminal — Builders DEX',
    description:
      'Real-time Builder activity feed: Scout calls, conviction updates, quality signals, and community discoveries. Watch builders building.',
    path: '/terminal',
  },
  explore: {
    title: 'Explore — Builders DEX',
    description: 'Curated Solana projects with Builder Score™ ratings, team transparency, proof of building, and community trust signals.',
    path: '/explore',
  },
  'project-detail': {
    title: 'Project — Builders DEX',
    description: 'Live Builder Score™ analysis, team profiles, proof of building, community sentiment, and AI research assistant.',
    path: '/explore',
  },
  apply: {
    title: 'Apply for Recognition — Builders DEX',
    description: 'Hackathon-grade application — demo, deck, tracks, socials, Proof of Building™.',
    path: '/apply',
  },
  launch: {
    title: 'Apply for Recognition — Builders DEX',
    description: 'Hackathon-grade application — demo, deck, tracks, socials, Proof of Building™.',
    path: '/apply',
  },
  builders: {
    title: 'The Builder 100 — Builders DEX',
    description: 'The Wall of Builders — top 100 builders pushing Solana forward.',
    path: '/rankings',
  },
  dao: {
    title: 'DAO — Builders DEX',
    description: 'Governance simulation showing future community voting on curation standards, listings, and protocol parameters.',
    path: '/dao',
  },
  earn: {
    title: 'Earn — Builders DEX',
    description:
      'Simulated liquidity provision, staking, and growth tasks. Demo features showing future tokenomics and community rewards.',
    path: '/earn',
  },
  launchpad: {
    title: 'Builder Accelerator — Builders DEX',
    description:
      'From idea → recognized protocol. Human review, AI analysis, community discovery, launch and liquidity support.',
    path: '/launchpad',
  },
  ai: {
    title: 'AI Research — Builders DEX',
    description: 'AI-powered project analysis using live Builder Scores, GitHub activity, team data, and quality signals. Ask about any curated project.',
    path: '/intelligence',
  },
  profile: {
    title: 'Passport — Builders DEX',
    description: 'Your builder profile and reputation tracking. Connect wallet, link social accounts, view XP progress, and discover projects.',
    path: '/passport',
  },
  campaign: {
    title: 'Share Campaign — Builders DEX',
    description: 'Social assets and ready-to-post copy for Builders DEX — amplify the standard.',
    path: '/campaign',
  },
  blog: {
    title: 'Blog — Builders DEX',
    description:
      'Essays on reputation infrastructure, Proof of Building™, Scouts, and the pulse of Web3 builders.',
    path: '/blog',
  },
  team: {
    title: 'Team — Builders DEX',
    description:
      'Laszlo Bihary, Reinhard Stix, and Roman Horvath — the team building Builders DEX with Building Culture.',
    path: '/team',
  },
  terms: {
    title: 'Terms of Use — Builders DEX',
    description: 'Terms governing use of Builders DEX reputation and trading interfaces.',
    path: '/terms',
  },
  privacy: {
    title: 'Privacy Policy — Builders DEX',
    description: 'How Builders DEX processes wallet, profile, and application data.',
    path: '/privacy',
  },
  imprint: {
    title: 'Imprint — Builders DEX',
    description: 'Legal imprint — Vienna, Austria · Building Culture.',
    path: '/imprint',
  },
  contact: {
    title: 'Contact — Builders DEX',
    description: 'Contact Builders DEX for listings, press, and support.',
    path: '/contact',
  },
  feedback: {
    title: 'Feedback — Builders DEX',
    description: 'Send product feedback, bug reports, and ideas to the Builders DEX team.',
    path: '/feedback',
  },
  support: {
    title: 'Support — Builders DEX',
    description: 'Chat with Support Agent for trade, Earn, Passport, and listing help.',
    path: '/support',
  },
  faq: {
    title: 'FAQ — Builders DEX',
    description: 'Why Builders DEX vs Jupiter, how listing works, and Passport™ explained.',
    path: '/faq',
  },
  mission: {
    title: 'Mission — Builders DEX',
    description: BRAND_TAGLINE,
    path: '/mission',
  },
  vision: {
    title: 'Vision — Builders DEX',
    description:
      'Every scam hurts the whole crypto ecosystem. We filter with Talent Protocol and Neynar score, then repo and reputation — and we share that knowledge.',
    path: '/vision',
  },
  roadmap: {
    title: 'Roadmap — Builders DEX',
    description:
      'From personal anti-scam filter to public standard: Talent Protocol, Farcaster/Neynar, repos, reputation, curated trading.',
    path: '/roadmap',
  },
  manifesto: {
    title: 'Manifest — Builders DEX',
    description:
      'Build > Hype. We start with ourselves, publish for everyone. Identity, Neynar score, repo, reputation — then listing.',
    path: '/manifesto',
  },
  story: {
    title: 'Our story — Builders DEX',
    description: 'From Building Culture to Builders DEX — proof-first products communities can use.',
    path: '/story',
  },
  guide: {
    title: 'Site guide — Builders DEX',
    description: 'Map of Trade, Terminal™, Launchpad, Passport™, Blog, and legal pages.',
    path: '/guide',
  },
  investor: {
    title: 'Investor Mode — Builders DEX',
    description: 'Conviction, velocity, and Builder Score™ signals for capital allocators.',
    path: '/investor',
  },
  'builder-graph': {
    title: 'Builder Graph™ — Builders DEX',
    description:
      'Interactive knowledge graph — builders, projects, contributors, auditors, investors, open source.',
    path: '/graph',
  },
  'builder-stories': {
    title: 'Builder Netflix — Builders DEX',
    description: 'Two-minute founder stories — why they build, what almost made them quit.',
    path: '/stories',
  },
};

export function getSeoForPath(path: string): SeoConfig {
  if (path in ROUTE_SEO) {
    return ROUTE_SEO[path as SeoRoute];
  }
  return ROUTE_SEO.landing;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
