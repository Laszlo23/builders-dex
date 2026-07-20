import React from 'react';
import { ProjectNeed } from '../data/builderNetwork';

type Props = {
  roles: ProjectNeed[];
  matchScore: number;
  projectName: string;
  onOfferHelp?: () => void;
};

export default function ProjectNeedsCard({
  roles,
  matchScore,
  projectName,
  onOfferHelp,
}: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-surface p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Needs</p>
      <h2 className="font-display mt-1 text-xl font-bold">Looking for collaborators</h2>
      <p className="mt-1 text-sm text-steel">
        {projectName} grows here — not just lists. Match roles across the builder network.
      </p>

      <ul className="mt-5 space-y-2">
        {roles.map((n) => (
          <li
            key={n.role}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink/40 px-3.5 py-2.5 text-sm"
          >
            <span className="inline-flex items-center gap-2">
              <span className="text-accent">✔</span>
              {n.role}
            </span>
            {n.urgent && (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase text-accent/90">
                Urgent
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-accent">
            Builder Match Score
          </p>
          <p className="font-display text-2xl font-bold text-white">{matchScore}%</p>
        </div>
        {onOfferHelp && (
          <button
            type="button"
            onClick={onOfferHelp}
            className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink hover:bg-accent-bright"
          >
            Offer help
          </button>
        )}
      </div>
    </section>
  );
}
