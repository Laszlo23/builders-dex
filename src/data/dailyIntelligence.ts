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

/** Builder Intelligence Daily™ — morning habit loop */
export const TODAY_BRIEF: DailyIntelligenceBrief = {
  greeting: 'GOOD MORNING',
  title: "Today's Builder Radar",
  dateLabel: 'Jul 20, 2026',
  events: [
    { kind: 'gained', text: '3 projects gained reputation' },
    { kind: 'entered', text: '2 builders entered the top 100' },
    { kind: 'lost', text: '1 project lost verification status' },
    { kind: 'entered', text: 'Crystal Ball™: HyperSphere at 91% Top-100 probability' },
    { kind: 'gained', text: '4 projects opened collaborator Needs' },
  ],
  marketPulse: [
    { sector: 'AI', changePct: 14 },
    { sector: 'DePIN', changePct: 8 },
    { sector: 'RWA', changePct: 5 },
  ],
  defaultWatchlistUpdates: 3,
};
