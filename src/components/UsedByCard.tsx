import React from 'react';
import { UsedByBlock } from '../data/builderPlatform';
import { Check, Link2 } from 'lucide-react';

export default function UsedByCard({ data }: { data: UsedByBlock }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-surface p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-accent" />
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Used By</p>
      </div>
      <h2 className="font-display mt-1 text-xl font-bold">Importance, visible</h2>
      <ul className="mt-4 space-y-2">
        {data.names.map((n) => (
          <li
            key={n}
            className="flex items-center gap-2 rounded-xl border border-white/8 bg-ink/40 px-3 py-2 text-sm"
          >
            <Check className="h-3.5 w-3.5 text-accent" />
            {n}
          </li>
        ))}
        <li className="flex items-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-3 py-2 text-sm text-accent">
          <Check className="h-3.5 w-3.5" />
          {data.buildersCount} builders
        </li>
      </ul>
      <div className="mt-5 border-t border-white/8 pt-4">
        <p className="font-mono text-[10px] uppercase text-steel">Dependencies</p>
        <p className="mt-1 text-sm text-white/90">
          <span className="font-display text-2xl font-bold text-accent">
            {data.dependentProjects}
          </span>{' '}
          projects rely on this protocol.
        </p>
      </div>
    </section>
  );
}
