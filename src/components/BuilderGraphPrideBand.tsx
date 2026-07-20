import React from 'react';
import { Network, Sparkles } from 'lucide-react';
import {
  FEATURED_BADGE_LINE,
  OWNED_WORDS,
  PRIDE_CTA,
  BUILDER_GRAPH_LINE,
} from '../data/prideMovement';

type Props = {
  onApply: () => void;
  onOpenGraph?: () => void;
};

export default function BuilderGraphPrideBand({ onApply, onOpenGraph }: Props) {
  return (
    <section className="relative border-y border-white/5 bg-ink px-4 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,232,104,0.1),transparent_55%)]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <Network className="mx-auto h-8 w-8 text-accent" aria-hidden />
        <p className="font-mono mt-4 text-[11px] uppercase tracking-[0.28em] text-accent">
          Own the language
        </p>
        <h2 className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Builder Graph™
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-steel">
          {BUILDER_GRAPH_LINE}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {OWNED_WORDS.map((w) => (
            <span
              key={w}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] text-white/80"
            >
              <Sparkles className="h-3 w-3 text-accent" aria-hidden />
              {w}
            </span>
          ))}
        </div>
        <p className="font-display mx-auto mt-10 max-w-xl text-lg font-bold leading-snug text-white sm:text-xl">
          {PRIDE_CTA}
        </p>
        <p className="mt-3 font-mono text-[10px] text-steel">{FEATURED_BADGE_LINE}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onApply}
            className="rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-ink hover:bg-accent-bright"
          >
            Apply for recognition
          </button>
          {onOpenGraph && (
            <button
              type="button"
              onClick={onOpenGraph}
              className="rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white hover:border-accent/40"
            >
              Explore the graph
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
