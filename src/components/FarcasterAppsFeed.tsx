import React from 'react';
import { ExternalLink, Gamepad2, Wrench, Users, Coins, Clapperboard } from 'lucide-react';
import { FARCASTER_APPS_FEED, type FarcasterApp } from '../data/talentFarcaster';

const KIND_ICON = {
  tool: Wrench,
  game: Gamepad2,
  social: Users,
  defi: Coins,
  media: Clapperboard,
} as const;

/**
 * Apps & releases first seen on Farcaster — tools, social, and yes, games.
 */
export default function FarcasterAppsFeed() {
  return (
    <section className="rounded-3xl border border-white/10 bg-ink/50 p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Seen on Farcaster
      </p>
      <h2 className="font-display mt-1 text-xl font-bold tracking-tight sm:text-2xl">
        New apps & releases
      </h2>
      <p className="mt-2 max-w-xl text-sm text-steel">
        We spot launches in the feed first. If it works — tool, social, or game — it counts.
        Useless is rare; unshipped is the real waste.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {FARCASTER_APPS_FEED.map((app) => (
          <FarcasterAppRow key={app.id} app={app} />
        ))}
      </ul>
    </section>
  );
}

function FarcasterAppRow({ app }: { app: FarcasterApp }) {
  const Icon = KIND_ICON[app.kind];
  const href = app.appUrl || app.castUrl;
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition hover:border-accent/40 hover:bg-accent/[0.05]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white">{app.name}</span>
            <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-steel">
              {app.kind}
            </span>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
              {app.status}
            </span>
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-white/50">{app.blurb}</span>
          <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-accent/80">
            Open on Farcaster <ExternalLink className="h-3 w-3" />
          </span>
        </span>
      </a>
    </li>
  );
}
