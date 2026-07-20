import React from 'react';
import { BUILDER_ARCHIVE } from '../data/prideMovement';

type Props = {
  onOpenProject?: (projectId: string) => void;
};

export default function BuilderArchiveCard({ onOpenProject }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-ink/50 p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Builder Archive™
      </p>
      <h2 className="font-display mt-1 text-xl font-bold tracking-tight sm:text-2xl">
        Documenting Web3 history — as it happens.
      </h2>
      <p className="mt-2 max-w-lg text-sm text-steel">
        No prophecy slides. Only milestones that already shipped (2024 → today).
      </p>

      <ol className="mt-8 space-y-0">
        {BUILDER_ARCHIVE.map((e, i) => (
          <li key={e.year} className="relative">
            <button
              type="button"
              disabled={!e.projectId}
              onClick={() => e.projectId && onOpenProject?.(e.projectId)}
              className="w-full rounded-2xl border border-transparent px-1 py-4 text-left transition hover:border-white/10 hover:bg-white/[0.03] disabled:cursor-default"
            >
              <p className="font-mono text-sm text-accent">{e.year}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-steel">
                {e.title}
              </p>
              <p className="font-display mt-1 text-xl font-bold text-white">{e.projectName}</p>
              <p className="mt-1 text-sm text-white/75">{e.achievement}</p>
            </button>
            {i < BUILDER_ARCHIVE.length - 1 && (
              <div className="mx-1 border-b border-dashed border-white/15" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
