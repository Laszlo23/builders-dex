import React from 'react';
import { CollabNeed } from '../data/prideMovement';

type Props = {
  needs: CollabNeed[];
  projectName: string;
  onHelp?: () => void;
};

export default function CollaborationNeedsCard({ needs, projectName, onHelp }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Looking For</p>
      <h2 className="font-display mt-1 text-xl font-bold">Help {projectName} succeed</h2>
      <p className="mt-1 text-sm text-steel">
        Not just discovery — collaboration. Network effects explode here.
      </p>

      <ul className="mt-5 divide-y divide-white/8 rounded-2xl border border-white/10 overflow-hidden">
        {needs.map((n) => (
          <li
            key={n.role}
            className="flex flex-wrap items-center justify-between gap-2 bg-ink/40 px-4 py-3.5"
          >
            <div>
              <p className="text-sm font-semibold text-white">{n.role}</p>
              {n.status === 'matched' && n.matchPct != null && (
                <p className="mt-0.5 font-mono text-[10px] text-accent">Matched {n.matchPct}%</p>
              )}
              {n.status === 'recommended' && (
                <p className="mt-0.5 font-mono text-[10px] text-accent">
                  Recommended: {n.recommendedName}
                  {n.matchPct != null ? ` · ${n.matchPct}%` : ''}
                </p>
              )}
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase ${
                n.status === 'open'
                  ? 'border-white/20 text-white/80'
                  : n.status === 'matched'
                    ? 'border-accent/35 bg-accent/10 text-accent'
                    : 'border-accent/30 bg-accent/10 text-accent/90'
              }`}
            >
              {n.status === 'open' ? 'Open' : n.status === 'matched' ? 'Matched' : 'Recommended'}
            </span>
          </li>
        ))}
      </ul>

      {onHelp && (
        <button
          type="button"
          onClick={onHelp}
          className="mt-4 rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink hover:bg-accent-bright"
        >
          Offer to collaborate
        </button>
      )}
    </section>
  );
}
