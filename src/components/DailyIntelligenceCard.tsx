import React from 'react';
import { TODAY_BRIEF, DailyEventKind } from '../data/dailyIntelligence';

const EVENT_MARK: Record<DailyEventKind, string> = {
  gained: '↑',
  entered: '↑',
  lost: '!',
};

type Props = {
  watchlistUpdates?: number;
  onOpenIntelligence?: () => void;
};

export default function DailyIntelligenceCard({
  watchlistUpdates,
  onOpenIntelligence,
}: Props) {
  const brief = TODAY_BRIEF;
  const updates = watchlistUpdates ?? brief.defaultWatchlistUpdates;

  return (
    <section className="overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-b from-accent/[0.08] to-surface/90 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
            {brief.greeting}
          </p>
          <h2 className="font-display mt-1 text-2xl font-bold tracking-tight">
            {brief.title}
          </h2>
          <p className="mt-1 font-mono text-[10px] text-steel">{brief.dateLabel}</p>
        </div>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[10px] text-accent">
          Builder Intelligence Daily™
        </span>
      </div>

      <ul className="mt-5 space-y-2">
        {brief.events.map((e) => (
          <li
            key={e.text}
            className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-ink/50 px-3.5 py-2.5 text-sm"
          >
            <span
              className={`mt-0.5 font-mono text-xs ${
                e.kind === 'lost' ? 'text-steel' : 'text-accent'
              }`}
            >
              {EVENT_MARK[e.kind]}
            </span>
            <span className="text-white/85">{e.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-steel">Market Pulse</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {brief.marketPulse.map((p) => (
            <span
              key={p.sector}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-white"
            >
              {p.sector}{' '}
              <span className="text-accent">
                {p.changePct >= 0 ? '+' : ''}
                {p.changePct}%
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
        <p className="text-sm text-white/80">
          Your Watchlist:{' '}
          <span className="font-mono text-accent">{updates} updates</span>
        </p>
        {onOpenIntelligence && (
          <button
            type="button"
            onClick={onOpenIntelligence}
            className="rounded-full border border-accent/35 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
          >
            Open Intelligence™
          </button>
        )}
      </div>
    </section>
  );
}
