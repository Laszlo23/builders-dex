import React from 'react';
import { Builder } from '../types';
import { LegacyPassport } from '../data/builderNetwork';
import OnChainResumeCard from './OnChainResumeCard';

type Props = {
  founder: Builder;
  buildingSince?: number;
  previousProtocols?: number;
  exits?: number;
  legacy?: LegacyPassport;
  onOpenRankings?: () => void;
};

export default function FounderPassportCard({
  founder,
  buildingSince = 2021,
  previousProtocols,
  exits = 0,
  legacy,
  onOpenRankings,
}: Props) {
  const protocols = previousProtocols ?? Math.max(founder.projectsCreated.length, 1);

  const shareStats = legacy
    ? [
        { label: 'First Commit', value: legacy.firstCommit },
        { label: 'People Inspired', value: legacy.peopleInspired.toLocaleString() },
        { label: 'Protocols Shipped', value: String(legacy.protocolsShipped) },
        { label: 'Open Source Hours', value: legacy.openSourceHours.toLocaleString() },
        { label: 'Builders Mentored', value: String(legacy.buildersMentored) },
        { label: 'Legacy Rank', value: legacy.legacyRank },
      ]
    : [
        { label: 'Previous protocols', value: String(protocols) },
        { label: 'Exits', value: String(exits) },
        { label: 'Open-source', value: String(founder.contributionsCount || 18) },
        { label: 'Building since', value: String(buildingSince) },
        { label: 'People inspired', value: founder.followers.toLocaleString() },
        {
          label: 'Legacy Rank',
          value: founder.reputationLevel.includes('Genesis') ? 'Genesis' : 'Core',
        },
      ];

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-surface/90 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={founder.avatarUrl}
              alt=""
              className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
            />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                Builder Passport™
              </p>
              <h2 className="font-display mt-1 text-xl font-bold tracking-tight">{founder.name}</h2>
              <p className="mt-0.5 text-sm text-steel">{founder.reputationLevel}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-center">
            <p className="font-mono text-[9px] uppercase tracking-wider text-accent">Score</p>
            <p className="font-display mt-0.5 text-2xl font-bold text-white">{founder.builderScore}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shareStats.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-white/8 bg-ink/50 px-3 py-2.5"
            >
              <dt className="font-mono text-[9px] uppercase tracking-wider text-steel">{row.label}</dt>
              <dd className="mt-1 font-display text-base font-bold text-white sm:text-lg">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs leading-relaxed text-steel">
          Reputation is an asset — something people actively build. Trust the human behind the
          protocol.
        </p>

        {onOpenRankings && (
          <button
            type="button"
            onClick={onOpenRankings}
            className="mt-4 text-xs font-semibold text-accent hover:underline"
          >
            View Builder 100 →
          </button>
        )}
      </div>

      {legacy && <OnChainResumeCard legacy={legacy} name={founder.name} />}
    </section>
  );
}
