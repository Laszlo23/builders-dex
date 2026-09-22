import { BRAND_HOOD_STANCE, BRAND_MULTICHAIN, BRAND_SUPPORT, BRAND_TAGLINE, BRAND_SOCIALS } from '../data/brand';
import { BLOG_POSTS, getPostBySlug, type BlogPost } from '../data/blog';
import { LEGAL_DOCS } from '../data/legal';
import { INITIAL_PROJECTS } from '../data/projects';
import { campaignMemeByQuery } from '../data/campaign';
import type { Project } from '../types';

export const SITE_URL = 'https://dex.buildingcultureid.space';
export const SITE_NAME = 'Builders DEX';
export const DEFAULT_DESCRIPTION = `${BRAND_TAGLINE} ${BRAND_MULTICHAIN} ${BRAND_SUPPORT}`;
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const DEFAULT_OG_IMAGE = '/og-image.webp';
export const OG_LOCALE = 'en_US';
export const SITEMAP_LASTMOD = '2026-09-20';
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
  | 'aura'
  | 'hood'
  | 'hoodstreet'
  | 'ccff00'
  | 'build'
  | 'cubes'
  | 'desk'
  | 'stacc'
  | 'dossier'
  | 'telegram-bot'
  | 'coming-soon';

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
    title: 'Curated Solana Swap | Builders DEX',
    description:
      'Swap allowlisted Solana tokens after verified reputation history — trading is the final step, not the homepage.',
    path: '/swap',
  },
  terminal: {
    title: 'Builder Terminal™ | Daily intelligence',
    description:
      'Builder Intelligence Daily™, War Room movers, Genesis Radar™, Scouts™ — the morning habit for who deserves to win.',
    path: '/terminal',
  },
  explore: {
    title: 'Explore Builder Stories | Builders DEX',
    description:
      'Search curated startup profiles with live Builder Score™ citations, journey, and why they were selected. Use /explore?q=',
    path: '/explore',
  },
  'project-detail': {
    title: 'Builder Story | Builders DEX',
    description: 'Builder Score™, team transparency, roadmap, and Builder Intelligence™ research.',
    path: '/explore',
  },
  apply: {
    title: 'Apply for Recognition | Builders DEX',
    description: 'Hackathon-grade application — demo, deck, tracks, socials, Proof of Building™.',
    path: '/apply',
  },
  launch: {
    title: 'Apply for Recognition | Builders DEX',
    description: 'Hackathon-grade application — demo, deck, tracks, socials, Proof of Building™.',
    path: '/apply',
  },
  builders: {
    title: 'The Builder 100 | Builders DEX',
    description: 'The Wall of Builders — live GitHub-cited scores for people shipping in public.',
    path: '/builders',
  },
  dao: {
    title: 'Governance simulation | Builders DEX',
    description:
      'Preview of protocol governance. Stake and votes here are not on-chain until a live contract is named.',
    path: '/dao',
  },
  earn: {
    title: 'Earn XP & Square loop | Builders DEX',
    description:
      'Growth tasks and daily spin are live. CCFF00 Square activate → park → stall is a preview. $BUILD has a Bankr address — no lock, no fake APR.',
    path: '/earn',
  },
  launchpad: {
    title: 'Builder Accelerator | Builders DEX',
    description:
      'Inspection-gated share certificates. Public Aura mint is on Robinhood Chain — Proof of Building™ first.',
    path: '/launchpad',
  },
  raise: {
    title: 'Aura Share | Builders DEX',
    description:
      'Inspected Aura share NFT on Robinhood Chain. Pay ETH on 4663 for a numbered certificate.',
    path: '/raise',
  },
  ai: {
    title: 'Builder Intelligence™ | Builders DEX',
    description: 'AI research agent for curated builders — matches, scores, strengths, and risks.',
    path: '/ai',
  },
  profile: {
    title: 'Builder Passport™ | Builders DEX',
    description: 'Editable reputation passport — link X, Farcaster, and submit projects. Wallet optional to start.',
    path: '/profile',
  },
  campaign: {
    title: 'Share kit — one-tap X | Builders DEX',
    description:
      'One-tap X posts with your scout referral already in compose — Unruggable meme kit and ready-to-post copy.',
    path: '/campaign',
  },
  blog: {
    title: 'Builders DEX Blog — Proof of Building™ essays',
    description:
      'Guides on Builder Score™, why trade is last, HoodStreet on chain 4663, Scouts, and reputation infrastructure.',
    path: '/blog',
  },
  team: {
    title: 'Team | Laszlo, Reinhard, Roman',
    description:
      'Laszlo Bihary, Reinhard Stix, and Roman Horvath — the team building Builders DEX with Building Culture.',
    path: '/team',
  },
  terms: {
    title: 'Terms of Use | Builders DEX',
    description: 'Terms governing use of Builders DEX reputation and trading interfaces.',
    path: '/terms',
  },
  privacy: {
    title: 'Privacy Policy | Builders DEX',
    description: 'How Builders DEX processes wallet, profile, referral, and application data.',
    path: '/privacy',
  },
  imprint: {
    title: 'Imprint | Builders DEX',
    description: 'Legal imprint — Vienna, Austria · Building Culture.',
    path: '/imprint',
  },
  contact: {
    title: 'Contact | Builders DEX',
    description: 'Contact Builders DEX for listings, press, and support.',
    path: '/contact',
  },
  feedback: {
    title: 'Feedback | Builders DEX',
    description: 'Send product feedback, bug reports, and ideas to the Builders DEX team.',
    path: '/feedback',
  },
  support: {
    title: 'Support | Builders DEX',
    description: 'Chat with Support Agent for trade, Earn, Passport, and listing help.',
    path: '/support',
  },
  faq: {
    title: 'FAQ | First-time Builders DEX',
    description:
      'What to click first, Jupiter vs Builders DEX, wallets, Builder Score™, HoodStreet vs Trade, Earn simulations, referrals.',
    path: '/faq',
  },
  mission: {
    title: 'Mission | Who deserves to win',
    description: BRAND_TAGLINE,
    path: '/mission',
  },
  vision: {
    title: 'Vision | Filter scams, share the map',
    description:
      'Every scam hurts the whole crypto ecosystem. We filter with Talent Protocol and Neynar score, then repo and reputation — and we share that knowledge.',
    path: '/vision',
  },
  roadmap: {
    title: 'Roadmap | From private filter to public standard',
    description:
      'From personal anti-scam filter to public standard: Talent Protocol, Farcaster/Neynar, repos, reputation, curated trading.',
    path: '/roadmap',
  },
  manifesto: {
    title: 'Manifest | Build > Hype',
    description:
      'Build > Hype. We start with ourselves, publish for everyone. Identity, Neynar score, repo, reputation — then listing.',
    path: '/manifesto',
  },
  story: {
    title: 'Our story | Building Culture × DEX',
    description: 'From Building Culture in Vienna to Builders DEX — proof-first products communities can use.',
    path: '/story',
  },
  guide: {
    title: 'Site guide | Every room on Builders DEX',
    description:
      'Map of Trade, Terminal™, HoodStreet, Passport™, Earn, Blog, Share kit, and legal — including what is live vs simulated.',
    path: '/guide',
  },
  investor: {
    title: 'Investor Mode | Thesis filters',
    description:
      'Filter the live catalog by category and GitHub-cited Builder Score™. Research desk — fund subscription rails are not live.',
    path: '/investor',
  },
  'builder-graph': {
    title: 'Builder Graph™ | Knowledge map',
    description:
      'Interactive knowledge graph — builders, projects, contributors, auditors, investors, open source.',
    path: '/graph',
  },
  'builder-stories': {
    title: 'Builder Stories | Catalog founder briefs',
    description:
      'Founder story briefs from the live catalog — why they build. Recorded video episodes publish here when we film them.',
    path: '/stories',
  },
  aura: {
    title: '$AURA Live on Base | Builders DEX',
    description:
      'Live Aura OS token board on Base: market cap, Uni v3 AURA/USDC liquidity, supply, and 24h flow.',
    path: '/aura',
  },
  hood: {
    title: 'On Hood | Honest hop to chain 4663',
    description: `${BRAND_MULTICHAIN} ${BRAND_HOOD_STANCE} Honest hop onto chain 4663. Gas-first. NFA. Not affiliated with Robinhood Markets.`,
    path: '/hood',
  },
  hoodstreet: {
    title: 'HoodStreet | Robinhood Chain neon',
    description:
      'HoodStreet on Robinhood Chain: CCFF00 founding Squares, My Neon wallets, Cubes ETH mint. Not affiliated with Robinhood Markets.',
    path: '/hoodstreet',
  },
  ccff00: {
    title: 'CCFF00 Wallet | Square ERC-6551',
    description:
      'Use your CCFF00 Square ERC-6551 wallet to buy Hood projects, activate, park, and stall. Not affiliated with Robinhood Markets.',
    path: '/ccff00',
  },
  build: {
    title: '$BUILD on Hood | Builders DEX',
    description:
      'Bankr Doppler $BUILD on Robinhood Chain 4663. Address published. No LP lock, no in-app swap. NFA.',
    path: '/build',
  },
  cubes: {
    title: 'Cubes Live | CCFF00 mint phases',
    description:
      'CCFF00 Cubes mint windows on Robinhood Chain from on-chain phases(). Outbound Square Apes mint only.',
    path: '/cubes',
  },
  desk: {
    title: 'The Desk | Daily conviction',
    description:
      'Stamp today\'s call. Collect Solana, Base, and Hood rooms. Load a CCFF00 Square for neon signal. NFA.',
    path: '/desk',
  },
  stacc: {
    title: 'staccpad book | Outbound Hood vault',
    description:
      'Official staccpad CCFF00 vault and Neons desks on Robinhood Chain. Same Square collection. Not affiliated. Unaudited. NFA.',
    path: '/stacc',
  },
  dossier: {
    title: 'Builder Dossier | Signed reputation',
    description:
      'Look up a published Builder Passport. Scout accuracy is scored 30-day calls only. NFA.',
    path: '/dossier',
  },
  'telegram-bot': {
    title: 'Telegram bots | Builders DEX',
    description: 'Register buy-bot alerts and token profiles for Telegram — wallet not required to read the setup.',
    path: '/telegram-bot',
  },
  'coming-soon': {
    title: 'Still working on this | Builders DEX',
    description: 'This destination is reserved. Live Builder Score™, catalog stories, and trade stay available.',
    path: '/coming-soon',
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

export function routeOgPath(route: SeoRoute): string {
  if (route === 'landing') return DEFAULT_OG_IMAGE;
  if (route === 'stacc') return '/og/route-hoodstreet.webp';
  if (route === 'dossier') return '/og/route-profile.webp';
  return `/og/route-${route}.webp`;
}

export function blogOgPath(slug: string): string {
  return `/og/blog-${encodeURIComponent(slug)}.webp`;
}

export function memeOgPath(memeId: string): string {
  return `/og/meme-${encodeURIComponent(memeId)}.webp`;
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
  robots: string;
  publishedTime?: string;
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
  bridge: 'hood',
  'cubes-live': 'cubes',
  'hood-street': 'hoodstreet',
  neon: 'ccff00',
  'my-neon': 'ccff00',
  myneon: 'ccff00',
  '$build': 'build',
  pulse: 'desk',
  conviction: 'desk',
  staccpad: 'stacc',
  ngu: 'stacc',
  neons: 'stacc',
  resume: 'dossier',
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
  return { route: 'coming-soon', blogSlug: null };
}

const INDEXABLE: string = 'index,follow,max-image-preview:large';
const NOINDEX: string = 'noindex,follow';

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

  if (route === 'dossier') {
    const wallet = (params.get('w') || '').trim();
    if (wallet) {
      const short =
        wallet.length > 10 ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}` : wallet;
      return {
        title: `Builder Dossier · ${short} | Builders DEX`,
        description: base.description,
        path: `/dossier?w=${encodeURIComponent(wallet)}`,
        image: routeOgPath('dossier'),
        type: 'website',
        imageWidth: OG_WIDTH,
        imageHeight: OG_HEIGHT,
        robots: INDEXABLE,
      };
    }
  }

  if (project) {
    return {
      title: `${project.name} — Builder Story | Builders DEX`,
      description: project.tagline || project.description || base.description,
      path: `/explore?id=${encodeURIComponent(project.id)}`,
      image: projectOgPath(project.id),
      type: 'website',
      imageWidth: OG_WIDTH,
      imageHeight: OG_HEIGHT,
      robots: INDEXABLE,
      project,
    };
  }

  if (route === 'blog' && blogSlug && !post) {
    return {
      title: 'Post not found | Builders DEX Blog',
      description: 'That essay is not in the catalog. Open the blog index for live Proof of Building™ posts.',
      path: `/blog/${encodeURIComponent(blogSlug)}`,
      image: DEFAULT_OG_IMAGE,
      type: 'website',
      imageWidth: OG_WIDTH,
      imageHeight: OG_HEIGHT,
      robots: NOINDEX,
    };
  }

  if (post) {
    return {
      title: `${post.title} | Builders DEX Blog`,
      description: post.excerpt || base.description,
      path: `/blog/${post.slug}`,
      image: blogOgPath(post.slug),
      type: 'article',
      imageWidth: OG_WIDTH,
      imageHeight: OG_HEIGHT,
      robots: INDEXABLE,
      publishedTime: `${post.date}T08:00:00+02:00`,
      blog: post,
    };
  }

  if (route === 'campaign') {
    const meme = campaignMemeByQuery(params.get('meme'));
    return {
      title: meme ? `${meme.label} | Builders DEX share kit` : base.title,
      description: meme
        ? `${meme.label} — one-tap X share from the Unruggable meme kit. Proof of Building™ before the trade.`
        : base.description,
      path: meme ? `/campaign?meme=${encodeURIComponent(meme.id)}` : base.path,
      image: meme ? memeOgPath(meme.id) : routeOgPath('campaign'),
      type: 'website',
      imageWidth: OG_WIDTH,
      imageHeight: OG_HEIGHT,
      robots: INDEXABLE,
    };
  }

  if (route === 'explore' && params.get('q')) {
    const q = params.get('q')!.trim().slice(0, 80);
    return {
      title: q ? `Search “${q}” | Builder Stories` : base.title,
      description: `Catalog search for ${q} — Builder Score™ cited profiles on Builders DEX.`,
      path: `/explore?q=${encodeURIComponent(q)}`,
      image: routeOgPath('explore'),
      type: 'website',
      imageWidth: OG_WIDTH,
      imageHeight: OG_HEIGHT,
      robots: INDEXABLE,
    };
  }

  const canonicalPath =
    route === 'coming-soon' && pathname.replace(/\/$/, '') && pathname !== '/coming-soon'
      ? pathname.split('?')[0]
      : base.path;

  return {
    title: base.title,
    description: base.description,
    path: canonicalPath,
    image: routeOgPath(route),
    type: 'website',
    imageWidth: OG_WIDTH,
    imageHeight: OG_HEIGHT,
    robots: route === 'coming-soon' ? NOINDEX : INDEXABLE,
  };
}

export function jsonLdGraph(seo: ResolvedSeo): Record<string, unknown>[] {
  const org: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand-mark.webp`,
    description: DEFAULT_DESCRIPTION,
    sameAs: ['https://x.com/buildingcultu3', 'https://github.com/Laszlo23/builders-dex'],
  };

  const website: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const nodes: Record<string, unknown>[] = [org, website];

  if (seo.project) {
    nodes.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: seo.project.name,
      url: absoluteUrl(seo.path),
      image: absoluteUrl(seo.image),
      description: seo.project.tagline || seo.project.description,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'Builder Score',
        value: seo.project.builderScore.overall,
      },
    });
  } else if (seo.blog) {
    nodes.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: seo.blog.title,
      datePublished: seo.blog.date,
      author: { '@type': 'Person', name: seo.blog.author },
      description: seo.blog.excerpt,
      image: absoluteUrl(seo.image),
      url: absoluteUrl(seo.path),
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/brand-mark.webp` },
      mainEntityOfPage: absoluteUrl(seo.path),
    });
  } else if (seo.path === '/blog') {
    nodes.push({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Builders DEX Blog',
      url: `${SITE_URL}/blog`,
      description: ROUTE_SEO.blog.description,
      blogPost: BLOG_POSTS.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${SITE_URL}/blog/${p.slug}`,
        datePublished: p.date,
      })),
    });
  } else if (seo.path === '/faq') {
    nodes.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: LEGAL_DOCS.faq.sections.map((s) => ({
        '@type': 'Question',
        name: s.heading,
        acceptedAnswer: { '@type': 'Answer', text: s.paragraphs.join(' ') },
      })),
    });
  } else {
    nodes.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description: seo.description,
      featureList: [
        'Curated builder discovery',
        'Live Builder Score™ citations',
        'Allowlisted Solana swaps',
        'HoodStreet on Robinhood Chain',
      ],
    });
  }

  nodes.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: seo.title, item: absoluteUrl(seo.path) },
    ],
  });

  return nodes;
}

export function sitemapEntries(): {
  loc: string;
  changefreq: string;
  priority: string;
  lastmod: string;
}[] {
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
    { route: 'dao', changefreq: 'weekly', priority: '0.4' },
    { route: 'campaign', changefreq: 'weekly', priority: '0.6' },
    { route: 'blog', changefreq: 'weekly', priority: '0.8' },
    { route: 'team', changefreq: 'monthly', priority: '0.4' },
    { route: 'mission', changefreq: 'monthly', priority: '0.5' },
    { route: 'faq', changefreq: 'monthly', priority: '0.7' },
    { route: 'vision', changefreq: 'monthly', priority: '0.4' },
    { route: 'roadmap', changefreq: 'monthly', priority: '0.4' },
    { route: 'manifesto', changefreq: 'monthly', priority: '0.4' },
    { route: 'story', changefreq: 'monthly', priority: '0.4' },
    { route: 'guide', changefreq: 'weekly', priority: '0.6' },
    { route: 'investor', changefreq: 'monthly', priority: '0.5' },
    { route: 'builder-graph', changefreq: 'weekly', priority: '0.5' },
    { route: 'builder-stories', changefreq: 'weekly', priority: '0.6' },
    { route: 'aura', changefreq: 'hourly', priority: '0.7' },
    { route: 'hood', changefreq: 'weekly', priority: '0.6' },
    { route: 'hoodstreet', changefreq: 'daily', priority: '0.8' },
    { route: 'ccff00', changefreq: 'daily', priority: '0.7' },
    { route: 'build', changefreq: 'weekly', priority: '0.7' },
    { route: 'cubes', changefreq: 'hourly', priority: '0.6' },
    { route: 'desk', changefreq: 'daily', priority: '0.8' },
    { route: 'stacc', changefreq: 'daily', priority: '0.7' },
    { route: 'dossier', changefreq: 'daily', priority: '0.7' },
    { route: 'telegram-bot', changefreq: 'monthly', priority: '0.3' },
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
    lastmod: SITEMAP_LASTMOD,
  }));

  for (const project of INITIAL_PROJECTS) {
    entries.push({
      loc: absoluteUrl(`/explore?id=${encodeURIComponent(project.id)}`),
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: SITEMAP_LASTMOD,
    });
  }

  for (const post of BLOG_POSTS) {
    entries.push({
      loc: absoluteUrl(`/blog/${post.slug}`),
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: post.date,
    });
  }

  return entries;
}

export function buildSitemapXml(): string {
  const urls = sitemapEntries()
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
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
