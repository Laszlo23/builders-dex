import React from 'react';
import { BuilderMilestone } from '../data/builderPlatform';
import { Trophy } from 'lucide-react';

export default function BuilderMilestonesCard({ milestones }: { milestones: BuilderMilestone[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Builder Milestones
      </p>
      <h2 className="font-display mt-1 text-xl font-bold">Unlock achievements</h2>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {milestones.map((m) => (
          <li
            key={m.key}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${
              m.unlocked
                ? 'border-accent/30 bg-accent/10 text-white'
                : 'border-white/8 bg-ink/40 text-steel'
            }`}
          >
            <Trophy className={`h-3.5 w-3.5 ${m.unlocked ? 'text-accent' : 'text-steel'}`} />
            {m.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
