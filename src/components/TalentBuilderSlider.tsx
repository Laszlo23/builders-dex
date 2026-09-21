import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { TalentBuilder, talentProfileUrl } from '../data/talentFarcaster';

/**
 * Infinite avatar slider — Top 7 Talent Protocol builders.
 * Empty until the live Talent API returns rows. Click opens talent.app.
 */
export default function TalentBuilderSlider() {
  const [builders, setBuilders] = useState<TalentBuilder[]>([]);
  const [source, setSource] = useState<'live' | 'unavailable'>('unavailable');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/talent/top-builders')
      .then((r) => r.json())
      .then((data: { builders?: TalentBuilder[]; source?: string }) => {
        if (cancelled) return;
        if (data.source === 'live' && Array.isArray(data.builders) && data.builders.length >= 3) {
          setBuilders(data.builders.slice(0, 7));
          setSource('live');
        }
      })
      .catch(() => {
        /* stay empty */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loop = builders.length ? [...builders, ...builders] : [];

  return (
    <section className="relative overflow-hidden border-y border-white/8 bg-ink/90 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
              Talent Protocol · Top 7
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Builders we watch first
            </h2>
            <p className="mt-2 max-w-lg text-sm text-steel">
              {source === 'live'
                ? 'Live Talent Protocol rankings. Click opens their Talent.app profile.'
                : 'Rankings appear when the live Talent Protocol key is connected. We do not invent a Top 7.'}
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/35">
            {source === 'live' ? 'Live Talent API' : 'Waiting on live API'}
          </span>
        </div>
      </div>

      {builders.length === 0 ? (
        <p className="mx-auto mt-8 max-w-5xl px-4 text-sm text-steel sm:px-6">
          No Talent ranking on this page until the API is live.
        </p>
      ) : (
        <div className="ticker-mask mt-8 overflow-hidden">
          <div className="animate-marquee flex w-max items-center gap-8 px-4">
            {loop.map((b, i) => (
              <a
                key={`${b.id}-${i}`}
                href={talentProfileUrl(b)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-28 shrink-0 flex-col items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-4 transition hover:border-accent/45 hover:bg-accent/[0.06]"
                title={`Open ${b.displayName} on Talent Protocol`}
              >
                <span className="relative">
                  <img
                    src={b.avatarUrl}
                    alt={`${b.displayName} avatar`}
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                    className="h-14 w-14 rounded-full border border-white/15 object-cover transition group-hover:scale-105 group-hover:border-accent/50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(b.handle)}`;
                    }}
                  />
                  {b.rank != null && (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent font-mono text-[9px] font-bold text-ink">
                      {b.rank}
                    </span>
                  )}
                </span>
                <span className="w-full truncate text-center text-[11px] font-semibold text-white">
                  {b.displayName}
                </span>
                <span className="inline-flex items-center gap-0.5 font-mono text-[9px] text-accent/80">
                  talent.app <ExternalLink className="h-2.5 w-2.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
