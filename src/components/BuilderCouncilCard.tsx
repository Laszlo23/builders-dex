import React from 'react';
import { COUNCIL_ROLES } from '../data/builderPlatform';
import { Crown, ArrowRight } from 'lucide-react';

type Props = {
  onExplore?: () => void;
};

export default function BuilderCouncilCard({ onExplore }: Props) {
  return (
    <section className="rounded-3xl border border-accent/30 bg-gradient-to-b from-accent/10 to-surface p-6 md:p-8">
      <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        <Crown className="h-3.5 w-3.5" />
        Beyond #1
      </p>
      <h2 className="font-display mt-2 text-xl font-bold md:text-2xl">
        Hall of Fame is not the end
      </h2>
      <p className="mt-2 max-w-xl text-sm text-steel">
        Top builders become leaders — mentors, judges, curators. Progression beyond
        ranking.
      </p>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {COUNCIL_ROLES.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-white/10 bg-ink/40 px-4 py-3"
          >
            <p className="text-sm font-semibold text-white">{r.title}</p>
            <p className="mt-1 text-xs text-steel">{r.description}</p>
          </li>
        ))}
      </ul>
      {onExplore && (
        <button
          type="button"
          onClick={onExplore}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent px-4 py-2 text-sm font-semibold text-ink"
        >
          Meet Master Builders
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}
