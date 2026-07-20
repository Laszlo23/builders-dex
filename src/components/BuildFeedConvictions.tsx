import React from 'react';
import { BuildFeedItem, Conviction, CURRENT_SEASON, BuilderSeason } from '../data/builderEconomy';

export function BuildFeedCard({
  items,
  onOpenProject,
}: {
  items: BuildFeedItem[];
  onOpenProject?: (id: string) => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-surface p-5 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Build Feed™</p>
      <h2 className="font-display mt-1 text-xl font-bold">Watch builders building</h2>
      <p className="mt-1 text-xs text-steel">Not a price feed — a progress feed.</p>
      <ul className="mt-5 space-y-0">
        {items.map((item, i) => (
          <li
            key={item.id}
            className={`py-3.5 ${i < items.length - 1 ? 'border-b border-white/8' : ''}`}
          >
            <p className="font-mono text-[10px] text-steel">{item.when}</p>
            <button
              type="button"
              disabled={!item.projectId || !onOpenProject}
              onClick={() => item.projectId && onOpenProject?.(item.projectId)}
              className="mt-1 text-left disabled:cursor-default"
            >
              <p className="text-sm font-semibold text-white hover:text-accent">
                {item.projectName}
              </p>
              <p className="mt-0.5 text-sm text-white/75">{item.event}</p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stars({ level }: { level: number }) {
  return (
    <span className="font-mono text-xs tracking-tight text-accent" aria-label={`${level} of 5`}>
      {'★'.repeat(level)}
      <span className="text-white/20">{'☆'.repeat(5 - level)}</span>
    </span>
  );
}

export function ConvictionsCard({
  convictions,
  onOpenProject,
}: {
  convictions: Conviction[];
  onOpenProject?: (id: string) => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-surface/90 p-5 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        My Convictions
      </p>
      <h2 className="font-display mt-1 text-xl font-bold">Think like a builder</h2>
      <p className="mt-1 text-xs text-steel">Not a watchlist — conviction with a reason.</p>
      <ul className="mt-5 space-y-4">
        {convictions.map((c) => (
          <li key={c.id} className="rounded-2xl border border-white/8 bg-ink/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                {c.label}
              </p>
              <Stars level={c.level} />
            </div>
            <button
              type="button"
              onClick={() => onOpenProject?.(c.projectId)}
              className="mt-2 text-left text-lg font-semibold text-white hover:text-accent"
            >
              {c.projectName}
            </button>
            <p className="mt-1 text-sm text-steel">
              Reason: <span className="text-white/80">{c.reason}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BuilderSeasonCard({
  season = CURRENT_SEASON,
  onOpenWinner,
}: {
  season?: BuilderSeason;
  onOpenWinner?: (projectId: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-accent/30 bg-gradient-to-br from-accent/[0.12] via-ink to-surface p-5 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
        Builder Seasons
      </p>
      <h2 className="font-display mt-2 text-2xl font-bold tracking-tight">{season.name}</h2>
      <p className="mt-1 text-sm text-white/85">{season.theme}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 font-mono text-xs">
        <div className="rounded-xl border border-white/10 bg-ink/50 px-3 py-2.5">
          <dt className="text-steel">Applications</dt>
          <dd className="mt-1 text-lg text-white">{season.applications.toLocaleString()}</dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-ink/50 px-3 py-2.5">
          <dt className="text-steel">Accepted</dt>
          <dd className="mt-1 text-lg text-white">{season.accepted}</dd>
        </div>
      </dl>

      <div className="mt-5 rounded-2xl border border-accent/25 bg-accent/10 p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Winner</p>
        <button
          type="button"
          onClick={() => onOpenWinner?.(season.winnerProjectId)}
          className="mt-1 text-left font-display text-xl font-bold text-white hover:text-accent"
        >
          {season.winnerName}
        </button>
        <p className="mt-0.5 text-xs text-steel">Builder of the Season</p>
      </div>

      <p className="mt-5 font-mono text-sm text-white/80">
        Season closes in{' '}
        <span className="text-accent">{season.closesInDays} Days</span>
      </p>
    </section>
  );
}
