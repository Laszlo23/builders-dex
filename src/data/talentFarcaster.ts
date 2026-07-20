/** Talent Protocol top builders — curated fallback + live API shape */

export type TalentBuilder = {
  id: string;
  displayName: string;
  handle: string;
  /** talent.app profile path segment */
  talentPath: string;
  avatarUrl: string;
  rank?: number;
  score?: number;
  tagline?: string;
};

export function talentProfileUrl(builder: Pick<TalentBuilder, 'talentPath'>): string {
  return `https://talent.app/${builder.talentPath}`;
}

/**
 * Seed Top 7 — real Talent.app profiles (avatars via unavatar).
 * Replaced by /api/talent/top-builders when TALENT_API_KEY is set.
 */
export const TALENT_TOP7_FALLBACK: TalentBuilder[] = [
  {
    id: 'tp1',
    displayName: 'Jesse Pollak',
    handle: 'jessepollak',
    talentPath: 'jessepollak',
    avatarUrl: 'https://unavatar.io/twitter/jessepollak',
    rank: 1,
    tagline: 'Base · onchain builder',
  },
  {
    id: 'tp2',
    displayName: 'Dan Romero',
    handle: 'dwr',
    talentPath: 'dwr',
    avatarUrl: 'https://unavatar.io/twitter/dwr',
    rank: 2,
    tagline: 'Farcaster',
  },
  {
    id: 'tp3',
    displayName: 'Vitalik Buterin',
    handle: 'vitalik',
    talentPath: 'vitalik',
    avatarUrl: 'https://unavatar.io/twitter/VitalikButerin',
    rank: 3,
    tagline: 'Ethereum',
  },
  {
    id: 'tp4',
    displayName: 'Linda Xie',
    handle: 'linda',
    talentPath: 'linda',
    avatarUrl: 'https://unavatar.io/twitter/lindajxie',
    rank: 4,
    tagline: 'Builder · investor',
  },
  {
    id: 'tp5',
    displayName: 'Varun Srinivasan',
    handle: 'v',
    talentPath: 'v',
    avatarUrl: 'https://unavatar.io/twitter/varunsrin',
    rank: 5,
    tagline: 'Farcaster',
  },
  {
    id: 'tp6',
    displayName: 'Brian Armstrong',
    handle: 'brian',
    talentPath: 'brian_armstrong',
    avatarUrl: 'https://unavatar.io/twitter/brian_armstrong',
    rank: 6,
    tagline: 'Coinbase',
  },
  {
    id: 'tp7',
    displayName: 'Balaji',
    handle: 'balajis',
    talentPath: 'balajis',
    avatarUrl: 'https://unavatar.io/twitter/balajis',
    rank: 7,
    tagline: 'Network state · builder',
  },
];

/** Apps / games / tools first spotted on Farcaster — useful ≠ boring */
export type FarcasterApp = {
  id: string;
  name: string;
  kind: 'tool' | 'game' | 'social' | 'defi' | 'media';
  blurb: string;
  castUrl: string;
  appUrl?: string;
  status: 'live' | 'beta' | 'playable';
};

export const FARCASTER_APPS_FEED: FarcasterApp[] = [
  {
    id: 'fc1',
    name: 'Warpcast Mini Apps',
    kind: 'social',
    blurb: 'Where new Farcaster apps surface first — frames, mini apps, games included.',
    castUrl: 'https://warpcast.com/~/discover',
    appUrl: 'https://warpcast.com/~/discover',
    status: 'live',
  },
  {
    id: 'fc2',
    name: 'Farcaster Frames',
    kind: 'tool',
    blurb: 'Interactive casts that ship UX in the feed. Games count — attention is a resource.',
    castUrl: 'https://docs.farcaster.xyz/developers/frames/',
    appUrl: 'https://docs.farcaster.xyz/developers/frames/',
    status: 'live',
  },
  {
    id: 'fc3',
    name: 'Base App Store signals',
    kind: 'tool',
    blurb: 'Onchain app drops often hit Farcaster before Twitter. We watch what people actually open.',
    castUrl: 'https://warpcast.com/base',
    status: 'live',
  },
  {
    id: 'fc4',
    name: 'Builder score casts',
    kind: 'social',
    blurb: 'Talent + Neynar chatter — early reputation before a ticker exists.',
    castUrl: 'https://warpcast.com/search?q=builder%20score',
    status: 'live',
  },
  {
    id: 'fc5',
    name: 'Playable experiments',
    kind: 'game',
    blurb: 'Nothing is useless if it ships. A game that retains is more real than a vapor whitepaper.',
    castUrl: 'https://warpcast.com/~/discover',
    status: 'playable',
  },
  {
    id: 'fc6',
    name: 'Mini-app launches',
    kind: 'media',
    blurb: 'New releases we catch in the feed first — then verify repo + Talent before any listing talk.',
    castUrl: 'https://warpcast.com/',
    status: 'beta',
  },
];
