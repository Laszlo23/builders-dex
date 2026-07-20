import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { TEAM_INTRO, TEAM_MEMBERS } from '../data/team';

interface TeamViewProps {
  setCurrentPath: (path: string) => void;
}

export default function TeamView({ setCurrentPath }: TeamViewProps) {
  return (
    <div className="relative mx-auto max-w-5xl px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        {TEAM_INTRO.eyebrow}
      </p>
      <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        {TEAM_INTRO.title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">{TEAM_INTRO.subtitle}</p>
      <a
        href={TEAM_INTRO.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-accent hover:underline"
      >
        Building Culture team <ExternalLink className="h-3 w-3" />
      </a>

      <div className="mt-10 space-y-6">
        {TEAM_MEMBERS.map((m) => (
          <article
            key={m.id}
            className="pulse-card overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.07] to-surface/90 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {m.name}
                </h2>
                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-accent">
                  {m.role}
                </p>
              </div>
              {m.location && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-steel">
                  <MapPin className="h-3.5 w-3.5" />
                  {m.location}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm font-medium text-white/90">{m.summary}</p>
            <p className="mt-3 text-sm leading-relaxed text-steel">{m.bio}</p>
            {m.links.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {m.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/85 hover:border-accent/40 hover:text-accent"
                  >
                    {l.label} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setCurrentPath('story')}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:border-accent/40"
        >
          Our story
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('contact')}
          className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink"
        >
          Contact
        </button>
      </div>
    </div>
  );
}
