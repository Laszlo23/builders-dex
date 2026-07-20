import React from 'react';
import { FEATURED_BADGE_LINE } from '../data/prideMovement';

type Props = {
  projectName: string;
  unlocked: boolean;
};

export default function FeaturedStandardBadge({ projectName, unlocked }: Props) {
  const copy = () => {
    void navigator.clipboard?.writeText(
      `${FEATURED_BADGE_LINE}\n${projectName} — Proof of Building™\nhttps://buildersdex.app`
    );
  };

  if (!unlocked) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-steel">
        Earn Featured status at Builder Score 90+. Founders put this in bios, READMEs, and pitch
        decks.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent/15 px-4 py-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">The standard</p>
        <p className="mt-0.5 text-sm font-bold text-white">{FEATURED_BADGE_LINE}</p>
        <p className="mt-0.5 text-xs text-steel">
          Put this on X, GitHub, and your pitch deck — you earned it.
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-ink hover:bg-accent-bright"
      >
        Copy badge
      </button>
    </div>
  );
}
