import React, { useMemo, useState } from 'react';
import { Copy, Check, Download, Share2, Sparkles } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import {
  CAMPAIGN_ASSETS,
  CAMPAIGN_PILLARS,
  CAMPAIGN_POSTS,
  CAMPAIGN_SCHEDULE_NOTE,
  CAMPAIGN_TAGLINE,
  MEME_CAMPAIGN_ASSETS,
  MEME_CAMPAIGN_POSTS,
  CampaignChannel,
  CampaignHook,
} from '../data/campaign';

const HOOKS: Array<CampaignHook | 'All'> = [
  'All',
  'Hook',
  'Proof',
  'Contrast',
  'Product',
  'Social proof',
  'CTA',
];

const CHANNELS: Array<CampaignChannel | 'All'> = [
  'All',
  'X / Twitter',
  'LinkedIn',
  'Farcaster',
  'Instagram',
  'Telegram',
];

export default function ShareCampaignView({
  onShareAction,
}: {
  onShareAction?: (channel?: string) => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hookFilter, setHookFilter] = useState<(typeof HOOKS)[number]>('All');
  const [channelFilter, setChannelFilter] = useState<(typeof CHANNELS)[number]>('All');
  const [weekFilter, setWeekFilter] = useState<number | 'All'>('All');

  const weeks = useMemo(
    () =>
      Array.from(
        new Set([...CAMPAIGN_POSTS, ...MEME_CAMPAIGN_POSTS].map((p) => p.week))
      ).sort((a, b) => a - b),
    []
  );

  const posts = useMemo(() => {
    const all = [...MEME_CAMPAIGN_POSTS, ...CAMPAIGN_POSTS];
    return all.filter((p) => {
      if (hookFilter !== 'All' && p.hook !== hookFilter) return false;
      if (channelFilter !== 'All' && p.channel !== channelFilter) return false;
      if (weekFilter !== 'All' && p.week !== weekFilter) return false;
      return true;
    });
  }, [hookFilter, channelFilter, weekFilter]);

  const copyText = async (id: string, text: string, channel?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      onShareAction?.(channel);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      alert('Could not copy — select the text manually.');
    }
  };

  const shareNative = async (title: string, text: string, channel?: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: 'https://buildersdex.app' });
        onShareAction?.(channel);
      } catch {
        /* cancelled */
      }
    } else {
      void copyText('native', `${text}\n\nhttps://buildersdex.app`, channel);
    }
  };

  return (
    <div className="relative overflow-hidden text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(200,232,104,0.12),_transparent_55%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
              Social campaign kit
            </p>
            <h1 className="font-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Unruggable energy
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-steel sm:text-base">
              Meme drop + full share kit. Funny doors into the same standard: we DYOR so you
              don&apos;t wake up to zero. {CAMPAIGN_TAGLINE}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-md">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Cadence</p>
            <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-white/70">
              {CAMPAIGN_SCHEDULE_NOTE}
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {CAMPAIGN_PILLARS.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{p.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Meme drop hero */}
        <div className="relative mt-12 overflow-hidden rounded-[1.75rem] border border-accent/25 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.9)]">
          <OptimizedImage
            src="/campaign/meme-banner-wide.jpg"
            alt="Unruggable meme campaign"
            className="h-52 w-full object-cover sm:h-72 lg:h-80"
          sizes="(max-width: 768px) 100vw, 800px"
            />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] text-accent">
              <Sparkles className="h-3 w-3" />
              Week 5 · Meme drop
            </div>
            <p className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-4xl">
              UNRUGGABLE <span className="text-accent">ENERGY</span>
            </p>
            <p className="mt-1 max-w-lg text-sm text-white/75">
              No more zero. We touched the repo so you can touch grass.
            </p>
            <button
              type="button"
              onClick={() => setWeekFilter(5)}
              className="mt-4 rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink"
            >
              Jump to meme posts
            </button>
          </div>
        </div>

        {/* Meme creatives */}
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                Meme kit
              </p>
              <h2 className="font-display mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Share these winners
              </h2>
              <p className="mt-1 text-sm text-steel">
                Unruggable · No more zero · Outsourced DYOR · Rug season over · Touch grass
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MEME_CAMPAIGN_ASSETS.map((asset) => (
              <div
                key={asset.id}
                className="group overflow-hidden rounded-2xl border border-accent/20 bg-surface/40 transition hover:border-accent/45"
              >
                <div
                  className={`relative overflow-hidden bg-ink ${
                    asset.ratio === '9:16'
                      ? 'aspect-[9/16] max-h-80'
                      : asset.ratio === '16:9'
                        ? 'aspect-video'
                        : 'aspect-square'
                  }`}
                >
                  <OptimizedImage
                    src={asset.path}
                    alt={asset.label}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 400px"
                    />
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold tracking-tight">{asset.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-steel">
                      {asset.ratio} · {asset.use}
                    </p>
                  </div>
                  <a
                    href={asset.path}
                    download
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Save
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hero visual — classic kit */}
        <div className="relative mt-16 overflow-hidden rounded-[1.75rem] border border-white/12 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.9)]">
          <OptimizedImage
            src="/campaign/hook-wide.jpg"
            alt="Builders DEX campaign"
            className="h-52 w-full object-cover sm:h-72 lg:h-80"
          sizes="(max-width: 768px) 100vw, 800px"
            />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] text-accent">
              <Sparkles className="h-3 w-3" />
              Classic reputation kit
            </div>
            <p className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-4xl">
              BUILDERS <span className="text-accent">DEX</span>
            </p>
            <p className="mt-1 max-w-lg text-sm text-white/75">{CAMPAIGN_TAGLINE}</p>
          </div>
        </div>

        {/* Assets */}
        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Reputation share images
              </h2>
              <p className="mt-1 text-sm text-steel">
                Pair a different visual with each angle — A/B the legacy set vs new hooks.
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CAMPAIGN_ASSETS.map((asset) => (
              <div
                key={asset.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-surface/40 transition hover:border-accent/35"
              >
                <div
                  className={`relative overflow-hidden bg-ink ${
                    asset.ratio === '9:16' ? 'aspect-[9/16] max-h-72' : 'aspect-[4/3]'
                  }`}
                >
                  <OptimizedImage
                    src={asset.path}
                    alt={asset.label}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 400px"
                    />
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold tracking-tight">{asset.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-steel">
                      {asset.ratio} · {asset.use}
                    </p>
                  </div>
                  <a
                    href={asset.path}
                    download
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Save
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Posts */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Ready-to-post series
          </h2>
          <p className="mt-1 text-sm text-steel">
            Filter by week, hook type, or channel — copy + matching creative.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {weeks.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeekFilter(weekFilter === w ? 'All' : w)}
                  className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition ${
                    weekFilter === w
                      ? 'bg-accent text-ink'
                      : 'border border-white/12 text-steel hover:text-white'
                  }`}
                >
                  Week {w}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWeekFilter('All')}
                className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
                  weekFilter === 'All' ? 'bg-white/10 text-white' : 'text-steel'
                }`}
              >
                All weeks
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {HOOKS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHookFilter(h)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                    hookFilter === h
                      ? 'bg-accent/15 text-accent'
                      : 'border border-white/10 text-steel hover:border-white/20 hover:text-white'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CHANNELS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChannelFilter(c)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                    channelFilter === c
                      ? 'bg-white text-ink'
                      : 'border border-white/10 text-steel hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {posts.map((post) => {
              const full = `${post.copy}\n\n${post.hashtags}\nhttps://buildersdex.app`;
              return (
                <article
                  key={post.id}
                  className="grid overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-ink/40 lg:grid-cols-[220px_1fr]"
                >
                  <div className="relative min-h-[180px] overflow-hidden border-b border-white/8 lg:border-b-0 lg:border-r lg:border-white/8">
                    <OptimizedImage
                      src={post.asset}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                      />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-ink/40" />
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[9px] text-accent backdrop-blur-sm">
                        W{post.week}
                      </span>
                      <span className="rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[9px] text-white/80 backdrop-blur-sm">
                        {post.hook}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] text-accent">
                        {post.channel}
                      </span>
                      <span className="text-sm font-semibold tracking-tight text-white">
                        {post.title}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-steel">{post.angle}</p>
                    <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/80">
                      {post.copy}
                    </pre>
                    <p className="mt-3 font-mono text-[11px] text-steel">{post.hashtags}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                      onClick={() => copyText(post.id, full, post.channel)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink hover:bg-accent-bright"
                    >
                      {copiedId === post.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedId === post.id ? 'Copied' : 'Copy post'}
                    </button>
                    <button
                      type="button"
                      onClick={() => shareNative(post.title, full, post.channel)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:border-accent/40 hover:text-accent"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </button>
                      <a
                        href={post.asset}
                        download
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-steel hover:text-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Image
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
            {posts.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/12 py-12 text-center text-sm text-steel">
                No posts for this filter — try another week or hook.
              </p>
            )}
          </div>
        </section>

        <p className="mt-14 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-steel/80">
          Builders DEX · accent #C8E868 · reputation before liquidity
        </p>
      </div>
    </div>
  );
}
