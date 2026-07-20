import { BRAND_SUPPORT, BRAND_TAGLINE } from '../data/brand';

export const SITE_URL = 'https://buildersdex.app';
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
    title: 'Trusted Trading — Builders DEX',
    description:
      'Swap allowlisted Solana tokens after verified reputation history — trading is the final step.',
    path: '/swap',
  },
  terminal: {
    title: 'Builder Terminal™ — Builders DEX',
    description:
      'Build Feed™, War Room, Genesis Radar™, Scouts™, Convictions — watch builders building.',
    path: '/terminal',
  },
  explore: {
    title: 'Builder Stories — Builders DEX',
    description: 'Startup profiles with Builder Score™, journey, and why they were selected.',
    path: '/explore',
  },
  'project-detail': {
    title: 'Builder Story — Builders DEX',
    description: 'Builder Score™, team transparency, roadmap, and Builder Intelligence™ research.',
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
    title: 'Governance — Builders DEX',
    description: 'Protocol governance for the Builders DEX intelligence layer.',
    path: '/dao',
  },
  earn: {
    title: 'Earn — Builders DEX',
    description:
      'Provide liquidity, stake $BUILD for platform perks, and complete growth tasks that power the intelligence layer.',
    path: '/earn',
  },
  launchpad: {
    title: 'Builder Accelerator — Builders DEX',
    description:
      'From idea → recognized protocol. Human review, AI analysis, community discovery, launch and liquidity support.',
    path: '/launchpad',
  },
  ai: {
    title: 'Builder Intelligence™ — Builders DEX',
    description: 'AI research agent for curated Solana builders — matches, scores, strengths, and risks.',
    path: '/intelligence',
  },
  profile: {
    title: 'Builder Passport™ — Builders DEX',
    description: 'Editable reputation passport — link X, Farcaster, and submit projects.',
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
