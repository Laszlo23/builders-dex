import { BRAND_SUPPORT, BRAND_TAGLINE, BRAND_SOCIALS } from '../data/brand';
import { BLOG_POSTS, getPostBySlug, type BlogPost } from '../data/blog';
import { INITIAL_PROJECTS } from '../data/projects';
import type { Project } from '../types';

export const SITE_URL = 'https://dex.buildingcultureid.space';
export const SITE_NAME = 'Builders DEX';
export const DEFAULT_DESCRIPTION = `${BRAND_TAGLINE} ${BRAND_SUPPORT}`;
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const DEFAULT_OG_IMAGE = '/og-image.webp';
export const TWITTER_HANDLE =
  BRAND_SOCIALS.find((s) => s.id === 'x')?.href.replace(/^https?:\/\/(x|twitter)\.com\//, '') ||
  'buildingcultu3';
export const TWITTER_SITE = `@${TWITTER_HANDLE.replace(/^@/, '')}`;

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
  | 'raise'
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
  | 'builder-stories'
  | 'aura';

type SeoConfig = {
  title: string;
  description: string;
  path: string;
};

export const ROUTE_SEO: Record<SeoRoute, SeoConfig> = {
  landing: {
    title: 'Builders DEX — Where Web3 discovers who deserves to win',
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
    title: 'Builder Terminal™ — War Room & Daily Intelligence',
    description:
      'Builder Intelligence Daily™, War Room movers, Genesis Radar™, Scouts™ — the morning habit for who deserves to win.',
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
    path: '/builders',
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
      'Inspection-gated share certificates. Proof of Building™ first, then mint a claim on deposited wins.',
    path: '/launchpad',
  },
  raise: {
    title: 'Share certificate — Builders DEX',
    description:
      'Inspected raise: mint a numbered share NFT and claim your percentage of deposited proceeds.',
    path: '/raise',
  },
  ai: {
    title: 'Builder Intelligence™ — Builders DEX',
    description: 'AI research agent for curated Solana builders — matches, scores, strengths, and risks.',
    path: '/ai',
  },
  profile: {
    title: 'Builder Passport™ — Builders DEX',
    description: 'Editable reputation passport — link X, Farcaster, and submit projects.',
    path: '/profile',
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
  aura: {
    title: '$AURA Live — Builders DEX',
    description:
      'Live Aura OS token board on Base: market cap, Uni v3 AURA/USDC liquidity, supply, and 24h flow.',
    path: '/aura',
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

export function projectOgPath(projectId: string): string {
  return `/og/project/${encodeURIComponent(projectId)}`;
}

export type ResolvedSeo = {
  title: string;
  description: string;
  /** Canonical path including query, e.g. /explore?id=p4 */
  path: string;
  image: string;
  type: 'website' | 'article';
  imageWidth: number;
  imageHeight: number;
  project?: Project;
  blog?: BlogPost;
};

const PATH_ALIASES: Record<string, SeoRoute> = {
  intelligence: 'ai',
  passport: 'profile',
  rankings: 'builders',
  graph: 'builder-graph',
  stories: 'builder-stories',
  'aura-live': 'aura',
};

function routeFromPathname(pathname: string): { route: SeoRoute; blogSlug: string | null } {
  const clean = pathname.replace(/\/$/, '') || '/';
  const blogMatch = clean.match(/^\/blog\/([^/?#]+)$/);
  if (blogMatch) {
    return { route: 'blog', blogSlug: decodeURIComponent(blogMatch[1]) };
  }
  const segment = clean === '/' ? '' : clean.replace(/^\//, '');
  if (!segment) return { route: 'landing', blogSlug: null };
  if (segment === 'project-detail') return { route: 'project-detail', blogSlug: null };
  if (segment in PATH_ALIASES) return { route: PATH_ALIASES[segment], blogSlug: null };
  if (segment in ROUTE_SEO) return { route: segment as SeoRoute, blogSlug: null };
  return { route: 'landing', blogSlug: null };
}

export function resolveSeoForRequest(pathname: string, search = ''): ResolvedSeo {
  const { route, blogSlug } = routeFromPathname(pathname);
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const projectId = (params.get('id') || params.get('project') || '').trim();
  const base = getSeoForPath(route);
  const post = route === 'blog' && blogSlug ? getPostBySlug(blogSlug) : null;
  const project =
    (route === 'project-detail' || (route === 'explore' && projectId)) && projectId
      ? INITIAL_PROJECTS.find((p) => p.id === projectId)
      : undefined;

  if (project) {
    return {
      title: `${project.name} — Builders DEX`,
      description: project.tagline || project.description || base.description,
      path: `/explore?id=${encodeURIComponent(project.id)}`,
      image: projectOgPath(project.id),
      type: 'website',
      imageWidth: OG_WIDTH,
      imageHeight: OG_HEIGHT,
      project,
    };
  }

  if (post) {
    return {
      title: `${post.title} — Builders DEX Blog`,
      description: post.excerpt || base.description,
      path: `/blog/${post.slug}`,
      image: post.coverImage || DEFAULT_OG_IMAGE,
      type: 'article',
      imageWidth: OG_WIDTH,
      imageHeight: OG_HEIGHT,
      blog: post,
    };
  }

  const specialized =
    route === 'campaign' || route === 'raise' || route === 'blog'
      ? DEFAULT_OG_IMAGE
      : DEFAULT_OG_IMAGE;

  return {
    title: base.title,
    description: base.description,
    path: base.path,
    image: specialized,
    type: 'website',
    imageWidth: OG_WIDTH,
    imageHeight: OG_HEIGHT,
  };
}

export function sitemapEntries(): { loc: string; changefreq: string; priority: string }[] {
  const primary: Array<{ route: SeoRoute; changefreq: string; priority: string }> = [
    { route: 'landing', changefreq: 'weekly', priority: '1.0' },
    { route: 'swap', changefreq: 'daily', priority: '0.9' },
    { route: 'explore', changefreq: 'daily', priority: '0.9' },
    { route: 'terminal', changefreq: 'daily', priority: '0.8' },
    { route: 'builders', changefreq: 'weekly', priority: '0.7' },
    { route: 'apply', changefreq: 'monthly', priority: '0.7' },
    { route: 'launchpad', changefreq: 'weekly', priority: '0.7' },
    { route: 'raise', changefreq: 'weekly', priority: '0.7' },
    { route: 'profile', changefreq: 'weekly', priority: '0.6' },
    { route: 'ai', changefreq: 'weekly', priority: '0.6' },
    { route: 'earn', changefreq: 'weekly', priority: '0.6' },
    { route: 'dao', changefreq: 'weekly', priority: '0.5' },
    { route: 'campaign', changefreq: 'monthly', priority: '0.4' },
    { route: 'blog', changefreq: 'weekly', priority: '0.5' },
    { route: 'team', changefreq: 'monthly', priority: '0.4' },
    { route: 'mission', changefreq: 'monthly', priority: '0.5' },
    { route: 'faq', changefreq: 'monthly', priority: '0.5' },
    { route: 'vision', changefreq: 'monthly', priority: '0.4' },
    { route: 'roadmap', changefreq: 'monthly', priority: '0.4' },
    { route: 'manifesto', changefreq: 'monthly', priority: '0.4' },
    { route: 'story', changefreq: 'monthly', priority: '0.4' },
    { route: 'guide', changefreq: 'monthly', priority: '0.4' },
    { route: 'investor', changefreq: 'monthly', priority: '0.5' },
    { route: 'builder-graph', changefreq: 'weekly', priority: '0.5' },
    { route: 'builder-stories', changefreq: 'weekly', priority: '0.5' },
    { route: 'aura', changefreq: 'hourly', priority: '0.7' },
    { route: 'terms', changefreq: 'yearly', priority: '0.2' },
    { route: 'privacy', changefreq: 'yearly', priority: '0.2' },
    { route: 'imprint', changefreq: 'yearly', priority: '0.2' },
    { route: 'contact', changefreq: 'yearly', priority: '0.3' },
    { route: 'support', changefreq: 'monthly', priority: '0.3' },
    { route: 'feedback', changefreq: 'monthly', priority: '0.3' },
  ];

  const entries = primary.map(({ route, changefreq, priority }) => ({
    loc: absoluteUrl(ROUTE_SEO[route].path),
    changefreq,
    priority,
  }));

  for (const project of INITIAL_PROJECTS) {
    entries.push({
      loc: absoluteUrl(`/explore?id=${encodeURIComponent(project.id)}`),
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  for (const post of BLOG_POSTS) {
    entries.push({
      loc: absoluteUrl(`/blog/${post.slug}`),
      changefreq: 'monthly',
      priority: '0.6',
    });
  }

  return entries;
}

export function buildSitemapXml(): string {
  const urls = sitemapEntries()
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
