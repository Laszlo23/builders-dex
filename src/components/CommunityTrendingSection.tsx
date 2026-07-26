import React, { useEffect, useState } from 'react';
import { ExternalLink, MessageCircle } from 'lucide-react';

function explorerTokenUrl(chain: string | undefined, mint: string): string {
  switch (chain) {
    case 'ethereum':
      return `https://etherscan.io/token/${mint}`;
    case 'base':
      return `https://basescan.org/token/${mint}`;
    case 'bsc':
      return `https://bscscan.com/token/${mint}`;
    case 'polygon':
      return `https://polygonscan.com/token/${mint}`;
    case 'arbitrum':
      return `https://arbiscan.io/token/${mint}`;
    case 'avalanche':
      return `https://snowtrace.io/token/${mint}`;
    case 'optimism':
      return `https://optimistic.etherscan.io/token/${mint}`;
    case 'sui':
      return `https://suiscan.xyz/mainnet/coin/${encodeURIComponent(mint)}`;
    case 'ton':
      return `https://tonviewer.com/${mint}`;
    case 'solana':
    default:
      return `https://solscan.io/token/${mint}`;
  }
}

export type CommunityTrendingItem = {
  id: number;
  ticker: string;
  name: string;
  chain?: string;
  mint: string | null;
  description: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  website?: string | null;
  twitter?: string | null;
  telegramUrl?: string | null;
  discord?: string | null;
  voteCount: number;
  chatTitle: string;
  trendingAt: string | null;
  status: string;
};

type Props = {
  compact?: boolean;
  onTrade?: (mint?: string) => void;
};

/**
 * Telegram community vote lane — parallel to curated listings, not tradeable by default.
 */
export default function CommunityTrendingSection({ compact, onTrade }: Props) {
  const [items, setItems] = useState<CommunityTrendingItem[]>([]);
  const [threshold, setThreshold] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/telegram/trending');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (cancelled) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        if (typeof data.threshold === 'number') setThreshold(data.threshold);
        setError(null);
      } catch {
        if (!cancelled) setError('Could not load community trending');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className={compact ? 'py-4' : 'rounded-3xl border border-white/10 bg-ink/50 p-6 sm:p-8'}>
        <p className="font-mono text-[11px] text-steel">Loading community signal…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={compact ? 'py-4' : 'rounded-3xl border border-white/10 bg-ink/50 p-6 sm:p-8'}>
        <p className="text-sm text-steel">{error}</p>
      </div>
    );
  }

  return (
    <section
      className={
        compact ? '' : 'rounded-3xl border border-white/10 bg-ink/50 p-6 sm:p-8'
      }
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Community Trending
      </p>
      <h2 className="font-sans mt-1 text-xl font-bold tracking-tight sm:text-2xl">
        Seen in community
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-steel">
        Community signal — not curated for trade. Tokens that cleared {threshold} unique Telegram
        votes in a Builder group. Worth a look; not THE STANDARD.
      </p>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-white/45">
          No community-trending tokens yet. DM the bot `/newtoken`, then `/postvote TICKER` in your group.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <TrendingCard key={t.id} t={t} onTrade={onTrade} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TrendingCard({
  t,
  onTrade,
}: {
  t: CommunityTrendingItem;
  onTrade?: (mint?: string) => void;
}) {
  const [queueState, setQueueState] = useState<'idle' | 'loading' | 'done' | 'err'>('idle');

  const queueForIndex = async () => {
    setQueueState('loading');
    try {
      const res = await fetch('/api/index/candidates/from-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramTokenId: t.id }),
      });
      if (!res.ok) throw new Error('fail');
      setQueueState('done');
    } catch {
      setQueueState('err');
    }
  };

  return (
            <li
              className="flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] transition hover:border-accent/35"
            >
              {t.bannerUrl ? (
                <div className="relative h-24 w-full overflow-hidden bg-white/5">
                  <img
                    src={t.bannerUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {t.logoUrl ? (
                      <img
                        src={t.logoUrl}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10"
                        loading="lazy"
                      />
                    ) : null}
                    <div>
                      <p className="font-sans text-lg font-bold tracking-tight text-white">
                        ${t.ticker}
                        <span className="ml-2 font-mono text-[10px] font-normal uppercase text-steel">
                          {t.chain || 'solana'}
                        </span>
                      </p>
                      <p className="mt-0.5 text-sm text-white/70">{t.name}</p>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-accent">
                    {t.voteCount} votes
                  </span>
                </div>
                {t.description ? (
                  <p className="mt-3 flex-1 text-xs leading-relaxed text-white/55">
                    {t.description}
                  </p>
                ) : null}
                <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-steel">
                  <MessageCircle className="h-3 w-3" />
                  {t.chatTitle || 'Telegram group'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.website ? (
                    <a
                      href={t.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/12 px-2.5 py-1 font-mono text-[10px] text-white/70 hover:text-accent"
                    >
                      Web
                    </a>
                  ) : null}
                  {t.twitter ? (
                    <a
                      href={t.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/12 px-2.5 py-1 font-mono text-[10px] text-white/70 hover:text-accent"
                    >
                      X
                    </a>
                  ) : null}
                  {t.telegramUrl ? (
                    <a
                      href={t.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/12 px-2.5 py-1 font-mono text-[10px] text-white/70 hover:text-accent"
                    >
                      TG
                    </a>
                  ) : null}
                  {t.discord ? (
                    <a
                      href={t.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/12 px-2.5 py-1 font-mono text-[10px] text-white/70 hover:text-accent"
                    >
                      Discord
                    </a>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {t.mint ? (
                    <>
                    <a
                      href={explorerTokenUrl(t.chain, t.mint)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/80 transition hover:border-accent/40 hover:text-accent"
                    >
                      Contract <ExternalLink className="h-3 w-3" />
                    </a>
                    {onTrade && (t.chain || 'solana') === 'solana' ? (
                      <button
                        type="button"
                        onClick={() => onTrade(t.mint!)}
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-steel transition hover:border-white/30 hover:text-white"
                      >
                        Look up
                      </button>
                    ) : null}
                    </>
                  ) : (
                    <span className="font-mono text-[10px] text-steel">No mint on file</span>
                  )}
                  <button
                    type="button"
                    disabled={queueState === 'loading' || queueState === 'done'}
                    onClick={() => void queueForIndex()}
                    className="inline-flex items-center gap-1 rounded-full border border-accent/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-accent transition hover:border-accent/50 disabled:opacity-60"
                  >
                    {queueState === 'done'
                      ? 'Queued for Index'
                      : queueState === 'loading'
                        ? 'Queuing…'
                        : queueState === 'err'
                          ? 'Retry Index queue'
                          : 'Queue for Index'}
                  </button>
                </div>
              </div>
            </li>
  );
}
