import React, { useState } from 'react';
import { FounderEpisode } from '../data/builderPlatform';
import { Play, Quote } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

export default function BuilderNetflixCard({
  episodes,
  onOpenProject,
}: {
  episodes: FounderEpisode[];
  onOpenProject?: (projectId: string) => void;
}) {
  const [active, setActive] = useState(episodes[0]?.id ?? null);
  const ep = episodes.find((e) => e.id === active) ?? episodes[0];
  if (!ep) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-surface">
      <div className="relative aspect-[16/9] max-h-[280px] w-full overflow-hidden bg-ink">
        <OptimizedImage
          src={ep.coverImage}
          alt=""
          className="h-full w-full object-cover opacity-70"
          onError={(e) => {
            (e.target as HTMLImageElement).src = ep.avatarUrl;
          }}
        sizes="(max-width: 768px) 100vw, 60vw"
          />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <button
          type="button"
          onClick={() => onOpenProject?.(ep.projectId)}
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/40 bg-accent text-ink shadow-lg shadow-accent/20 transition hover:scale-105"
          aria-label={`Play ${ep.founderName}`}
        >
          <Play className="h-6 w-6 fill-current" />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            Builder Netflix
          </p>
          <h2 className="font-display mt-1 text-lg font-bold md:text-xl">{ep.question}</h2>
          <p className="mt-0.5 text-xs text-white/70">
            {ep.founderName} · {ep.projectName} · {ep.duration}
          </p>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <p className="inline-flex items-start gap-2 text-sm text-white/85">
          <Quote className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          {ep.teaser}
        </p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {episodes.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setActive(e.id)}
              className={`shrink-0 overflow-hidden rounded-xl border transition ${
                e.id === ep.id
                  ? 'border-accent ring-1 ring-accent/40'
                  : 'border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <OptimizedImage
                src={e.coverImage}
                alt=""
                className="h-16 w-28 object-cover"
                onError={(ev) => {
                  (ev.target as HTMLImageElement).src = e.avatarUrl;
                }}
              sizes="160px"
                />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
