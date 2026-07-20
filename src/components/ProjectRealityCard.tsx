import React from 'react';
import { ProjectReality } from '../data/builderPlatform';
import { AlertTriangle, Flag, Users } from 'lucide-react';

export default function ProjectRealityCard({ reality }: { reality: ProjectReality }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Reality</p>
      <h2 className="font-display mt-1 text-xl font-bold">Progress, not perfection</h2>
      <p className="mt-1 text-sm text-steel">
        People connect with struggle — not polished pitch decks.
      </p>

      <div className="mt-5 space-y-0">
        <div className="py-4">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase text-steel">
            <AlertTriangle className="h-3.5 w-3.5 text-accent" />
            Current Challenge
          </p>
          <p className="mt-1.5 text-sm font-semibold text-white">{reality.challenge}</p>
        </div>
        <div className="border-t border-dashed border-white/15 py-4">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase text-steel">
            <Flag className="h-3.5 w-3.5 text-accent" />
            Next Milestone
          </p>
          <p className="mt-1.5 text-sm font-semibold text-white">{reality.nextMilestone}</p>
        </div>
        <div className="border-t border-dashed border-white/15 py-4">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase text-steel">
            <Users className="h-3.5 w-3.5 text-accent" />
            Needs
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {reality.needs.map((n) => (
              <li
                key={n}
                className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent"
              >
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
