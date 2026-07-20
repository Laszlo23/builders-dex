import { TODAY_BRIEF } from './dailyIntelligence';
import { CULTURE_NODE_X_POST, BRAND_SOCIALS } from './brand';
import { CONVICTION_WINNERS } from './convictionWinners';

export type FeedItem = {
  id: string;
  kind: 'pulse' | 'news' | 'social' | 'market' | 'builder';
  title: string;
  body: string;
  href?: string;
  at: string;
};

/** Live stream ticks — rotated in the Chat drawer */
export const STREAM_TICKS: Omit<FeedItem, 'id' | 'at'>[] = [
  {
    kind: 'pulse',
    title: 'Builder Radar',
    body: TODAY_BRIEF.events[0]?.text || 'Reputation moves updating…',
  },
  {
    kind: 'builder',
    title: 'Crystal Ball™',
    body: TODAY_BRIEF.events.find((e) => e.text.includes('Crystal'))?.text || 'Watchlist warming up.',
  },
  {
    kind: 'market',
    title: 'Sector pulse',
    body: TODAY_BRIEF.marketPulse.map((p) => `${p.sector} ${p.changePct >= 0 ? '+' : ''}${p.changePct}%`).join(' · '),
  },
  {
    kind: 'social',
    title: 'Culture Node',
    body: 'Like · share · comment the Building Culture post — Earn XP waiting.',
    href: CULTURE_NODE_X_POST,
  },
  {
    kind: 'news',
    title: 'Conviction bag',
    body: `Watching ${CONVICTION_WINNERS.map((t) => t.ticker).join(', ')} — not the newest, winners.`,
  },
  {
    kind: 'pulse',
    title: 'Talent Top 7',
    body: 'Avatar slider refreshed — identity before ticker.',
  },
  {
    kind: 'builder',
    title: 'THE STANDARD',
    body: 'Thousands analyzed → few recognized → fewer tradeable. Listing is earned.',
  },
  {
    kind: 'social',
    title: 'Community',
    body: 'Discord + Telegram open — join Building Culture.',
    href: BRAND_SOCIALS.find((s) => s.id === 'discord')?.href,
  },
];

/** News tab — denser, linkable */
export const CHAT_NEWS: FeedItem[] = [
  {
    id: 'n1',
    kind: 'news',
    title: TODAY_BRIEF.title,
    body: TODAY_BRIEF.events.map((e) => e.text).join(' · '),
    at: TODAY_BRIEF.dateLabel,
  },
  {
    id: 'n2',
    kind: 'social',
    title: 'Culture Node on X',
    body: 'Proof of Attention demo — ears first. Amplify the post for Earn missions.',
    href: CULTURE_NODE_X_POST,
    at: 'Jul 19, 2026',
  },
  {
    id: 'n3',
    kind: 'market',
    title: 'Solana rails',
    body: 'Jupiter + Raydium stay in the conviction bag. Trade when allowlisted.',
    href: 'https://jup.ag/',
    at: 'Ongoing',
  },
  {
    id: 'n4',
    kind: 'builder',
    title: 'IoTeX · Pundi X',
    body: 'Real-world AI / DePIN and payments — durable products we believe in.',
    href: 'https://iotex.io/',
    at: 'Conviction',
  },
  {
    id: 'n5',
    kind: 'pulse',
    title: 'Mining Culture',
    body: 'Human Passport + Proof of Attention live on mining.buildingcultureid.space.',
    href: 'https://mining.buildingcultureid.space/?hear=1',
    at: 'Live',
  },
  {
    id: 'n6',
    kind: 'social',
    title: 'Follow Building Culture',
    body: '@buildingcultu3 — trust layer for identity, agents & tokenized assets.',
    href: BRAND_SOCIALS.find((s) => s.id === 'x')?.href,
    at: 'Social',
  },
];
