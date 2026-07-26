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
 * Offline fallback only — live brief comes from GET /api/daily-radar.
 * Keep empty so we never ship dated fiction when the API is down.
 */
export const TODAY_BRIEF: DailyIntelligenceBrief = {
  greeting: 'GOOD MORNING',
  title: "Today's Builder Radar",
  dateLabel: 'Awaiting live radar',
  events: [
    {
      kind: 'entered',
      text: 'Connect to load live Builder Score™ deltas and community trending.',
    },
  ],
  marketPulse: [
    { sector: 'AI', changePct: 0 },
    { sector: 'Infrastructure', changePct: 0 },
    { sector: 'DeFi', changePct: 0 },
  ],
  defaultWatchlistUpdates: 0,
};
