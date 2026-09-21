export type DailyEventKind = 'gained' | 'entered' | 'lost';

export type DailyEvent = {
  kind: DailyEventKind;
  text: string;
};

export type DailyPulse = {
  sector: string;
  changePct: number;
};

export type DailyIntelligenceBrief = {
  greeting: string;
  title: string;
  dateLabel: string;
  events: DailyEvent[];
  marketPulse: DailyPulse[];
  /** Fallback watchlist updates when user has no discoveries yet */
  defaultWatchlistUpdates: number;
};

/**
 * Builder Intelligence Daily™ — offline seed shaped like the morning habit card.
 * Live brief replaces this via GET /api/daily-radar whenever available.
 */
export const TODAY_BRIEF: DailyIntelligenceBrief = {
  greeting: 'GOOD MORNING',
  title: "Today's Builder Radar",
  dateLabel: new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }),
  events: [
    { kind: 'gained', text: 'Genesis builders holding live Builder Score™ — open Radar for Δ' },
    { kind: 'entered', text: 'llama.cpp · Wormhole · Metaplex on Genesis Index' },
    { kind: 'lost', text: 'Rejected cosplay listings stay educational — not tradeable' },
    { kind: 'entered', text: 'Scout ledger open — timestamp a thesis before the crowd' },
    { kind: 'gained', text: 'Community Trending (Telegram) feeds the Index queue' },
  ],
  marketPulse: [
    { sector: 'AI', changePct: 0 },
    { sector: 'Infrastructure', changePct: 0 },
    { sector: 'DeFi', changePct: 0 },
  ],
  defaultWatchlistUpdates: 0,
};
