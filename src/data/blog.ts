export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  readingMinutes: number;
  body: string[];
  coverImage: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'reputation-layer-of-web3',
    title: 'Why Builders DEX is the reputation layer of Web3',
    excerpt:
      'Jupiter routes liquidity. We route trust. Every tradeable project carries a verified reputation history.',
    date: '2026-07-18',
    author: 'Laszlo Bihary',
    tags: ['Vision', 'Reputation'],
    readingMinutes: 5,
    coverImage: '/campaign/hook-reputation.jpg',
    body: [
      'Crypto has endless promises. Builders DEX measures reality — commits, deploys, users, and open-source signal — before a token becomes tradeable.',
      'The killer answer to “why not just use Jupiter?” is simple: every project here has a verified reputation history. Trading is the final step in a trust pipeline.',
      'Proof of Building™, Builder DNA™, Passport™, Scouts, and Genesis Radar™ form an operating system for discovery. Liquidity follows reputation — not the other way around.',
    ],
  },
  {
    slug: 'proof-of-building',
    title: 'Proof of Building™: measuring actions, not opinions',
    excerpt:
      'GitHub commits, live products, active users, community growth, OSS, and revenue — verified on a clock.',
    date: '2026-07-12',
    author: 'Builders DEX Research',
    tags: ['Proof', 'Standard'],
    readingMinutes: 4,
    coverImage: '/campaign/hook-standard.jpg',
    body: [
      'Ratings without evidence are vibes. Proof of Building™ checks whether a team shipped.',
      'We verify: GitHub activity, product deployment, user signal, community growth, open-source contribution, and revenue where applicable.',
      'Last-verified timestamps keep the standard honest. If the proof goes cold, so does the listing priority.',
    ],
  },
  {
    slug: 'builder-scouts-and-genesis-radar',
    title: 'Builder Scouts™ and Genesis Radar™ — find it before it is famous',
    excerpt:
      'Turn users into researchers. Early discovery is the emotional hook of a reputation exchange.',
    date: '2026-07-05',
    author: 'Builders DEX',
    tags: ['Scouts', 'Discovery'],
    readingMinutes: 4,
    coverImage: '/campaign/hook-stories.jpg',
    body: [
      'People do not want another exchange. They want to say: I found it before everyone else.',
      'Builder Scouts™ earn XP and reputation by submitting structured analysis. Genesis Radar™ surfaces projects entering the Builder Network while they are still under review.',
      'That loop makes the community the discovery engine — LinkedIn + Bloomberg + App Store ranking energy for Web3 builders.',
    ],
  },
  {
    slug: 'building-culture-meets-builders-dex',
    title: 'Building Culture × Builders DEX',
    excerpt:
      'Proof-first culture from Vienna — reputation, credentials, and access that communities can actually use.',
    date: '2026-06-28',
    author: 'Leonardo.based',
    tags: ['Culture', 'Team'],
    readingMinutes: 3,
    coverImage: '/campaign/story.jpg',
    body: [
      'Building Culture is the trust layer where people, communities, businesses, and AI agents build reputation and unlock access together.',
      'Builders DEX brings that same proof-first mindset to Solana trading: curation as achievement, passport as primitive, launchpad as help for every builder willing to be verified.',
      'Follow the team story and essays — then come back to the Terminal™.',
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
