import React from 'react';
import { Hammer } from 'lucide-react';

type Props = {
  topic?: string;
  setCurrentPath: (path: string) => void;
};

export default function ComingSoonView({ topic, setCurrentPath }: Props) {
  const reserved =
    topic && topic !== 'coming-soon'
      ? topic.replace(/-/g, ' ')
      : typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('bdx_coming_soon')?.replace(/-/g, ' ')
        : null;
  const label = reserved || 'this page';

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-white sm:px-6">
      <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        <Hammer className="h-3.5 w-3.5" />
        In progress
      </p>
      <h1 className="font-display mt-3 text-4xl font-bold tracking-tight">
        We&apos;re still working on this
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-steel">
        <span className="capitalize text-white/80">{label}</span> is reserved so a footer or typed
        URL never dumps you on a dead click. Live Builder Score™, catalog stories, and trade stay
        available while we finish this surface.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setCurrentPath('landing')}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:border-accent/40"
        >
          Back home
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('guide')}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:border-accent/40"
        >
          Site guide
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('blog')}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:border-accent/40"
        >
          Blog
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('builders')}
          className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink"
        >
          Live builders
        </button>
      </div>
    </div>
  );
}
