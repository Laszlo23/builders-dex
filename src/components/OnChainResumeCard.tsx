import React from 'react';
import { LegacyPassport } from '../data/builderNetwork';

type Props = {
  legacy: LegacyPassport;
  name?: string;
  shareable?: boolean;
};

export default function OnChainResumeCard({ legacy, name, shareable = true }: Props) {
  const stats = [
    { label: 'First Commit', value: legacy.firstCommit },
    { label: 'People Inspired', value: legacy.peopleInspired.toLocaleString() },
    { label: 'Protocols Shipped', value: String(legacy.protocolsShipped) },
    { label: 'Open Source Hours', value: legacy.openSourceHours.toLocaleString() },
    { label: 'Builders Mentored', value: String(legacy.buildersMentored) },
    { label: 'Legacy Rank', value: legacy.legacyRank },
  ];

  const shareText = () => {
    const lines = [
      `Builder Passport — ${name || 'Builder'}`,
      `Legacy Rank: ${legacy.legacyRank}`,
      `First Commit: ${legacy.firstCommit}`,
      `People Inspired: ${legacy.peopleInspired.toLocaleString()}`,
      `Protocols Shipped: ${legacy.protocolsShipped}`,
      `Open Source Hours: ${legacy.openSourceHours.toLocaleString()}`,
      `Builders Mentored: ${legacy.buildersMentored}`,
      '',
      'Verified forever on Builders DEX.',
      'https://buildersdex.app',
    ];
    void navigator.clipboard?.writeText(lines.join('\n'));
  };

  return (
    <section className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/[0.1] via-surface to-ink p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            On-chain resume
          </p>
          <h2 className="font-display mt-1 text-xl font-bold tracking-tight">
            {name ? `${name}'s career` : 'Immutable professional history'}
          </h2>
          <p className="mt-1 text-sm text-steel">
            Not wallet activity — an entire career that follows the founder across projects.
          </p>
        </div>
        {shareable && (
          <button
            type="button"
            onClick={shareText}
            className="rounded-full border border-accent/35 px-3 py-1.5 font-mono text-[10px] text-accent hover:bg-accent/10"
          >
            Copy share card
          </button>
        )}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/10 bg-ink/50 px-3 py-3"
          >
            <dt className="font-mono text-[9px] uppercase tracking-wider text-steel">{s.label}</dt>
            <dd className="mt-1 font-display text-lg font-bold text-white">{s.value}</dd>
          </div>
        ))}
      </dl>

      <ol className="mt-6 space-y-0 border-l border-accent/30 pl-4">
        {legacy.career.map((m) => (
          <li key={`${m.year}-${m.title}`} className="relative pb-4 last:pb-0">
            <span className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-accent" />
            <p className="font-mono text-[10px] text-accent">{m.year}</p>
            <p className="text-sm text-white/90">
              {m.title}
              {m.verified && (
                <span className="ml-2 font-mono text-[9px] uppercase text-steel">
                  Verified forever
                </span>
              )}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
