import React, { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { FIRST_DISCOVERY_COPY } from '../data/builderEconomy';
import { Project } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  onPick: (projectId: string) => void;
};

export default function FirstDiscoveryModal({ open, onClose, projects, onPick }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const picks = [...projects]
    .filter((p) => p.curation.status === 'curated')
    .sort((a, b) => b.builderScore.overall - a.builderScore.overall)
    .slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/75 p-3 backdrop-blur-md sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-accent/30 bg-gradient-to-b from-white/[0.07] to-ink shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-discovery-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-steel hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
            Your First Discovery
          </p>
          <h2
            id="first-discovery-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight"
          >
            {FIRST_DISCOVERY_COPY.title}
          </h2>
          <div className="mt-4 space-y-2">
            {FIRST_DISCOVERY_COPY.lines.map((line) => (
              <p key={line} className="text-sm leading-relaxed text-white/80 sm:text-base">
                {line}
              </p>
            ))}
          </div>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-wider text-steel">
            Pick one to begin
          </p>
          <ul className="mt-3 space-y-2">
            {picks.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onPick(p.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition hover:border-accent/40 hover:bg-accent/[0.06]"
                >
                  <div>
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="mt-0.5 text-xs text-steel">{p.tagline}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-accent">
                    {p.builderScore.overall}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => picks[0] && onPick(picks[0].id)}
            className="btn-sheen mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-bold text-ink hover:bg-accent-bright"
          >
            <Sparkles className="h-4 w-4" />
            {FIRST_DISCOVERY_COPY.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
