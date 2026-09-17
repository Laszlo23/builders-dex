import React, { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Loader2, Wallet } from 'lucide-react';
import AuraPriceChart from './AuraPriceChart';
import {
  AURA_BASE_ADDRESS,
  AURA_BASE_DECIMALS,
  AURA_BASE_SUPPLY,
  AURA_USDC_V3_POOL,
  basescanTokenUrl,
  dexScreenerTokenUrl,
  uniswapBaseSwapUrl,
  watchAuraOnBase,
} from '../data/crossChainRegistry';
import {
  usd,
  type AuraLiveRange,
  type AuraLiveSnapshot,
} from '../lib/auraLive';

type Props = {
  setCurrentPath: (path: string) => void;
};

const UNIT = 1_000_000;

function fmtCompact(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

export default function AuraLiveView({ setCurrentPath }: Props) {
  const [range, setRange] = useState<AuraLiveRange>('6h');
  const [snap, setSnap] = useState<AuraLiveSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [watchError, setWatchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch(`/api/aura/live?range=${range}`)
        .then((r) => r.json())
        .then((data: AuraLiveSnapshot & { error?: string }) => {
          if (cancelled) return;
          if (data.error) throw new Error(data.error);
          setSnap(data);
          setError(null);
        })
        .catch((err: unknown) => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Live feed failed');
        });
    };
    load();
    const id = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [range]);

  const primary = snap?.primary;
  const price = primary?.priceUsd ?? 0;
  const per100k = price * 100_000;
  const inLp = primary?.liquidityBase ?? 0;
  const lpShare = snap ? Math.min(1, inLp / Math.max(1, snap.supply)) : 0;
  const blocks = snap ? Math.ceil(snap.supply / UNIT) : 0;
  const lpBlocks = Math.round(lpShare * blocks);
  const buys = snap?.pools.reduce((n, p) => n + p.buysH24, 0) ?? 0;
  const sells = snap?.pools.reduce((n, p) => n + p.sellsH24, 0) ?? 0;
  const flowTotal = Math.max(1, buys + sells);
  const swapUrl = uniswapBaseSwapUrl(AURA_BASE_ADDRESS);

  const tankLabel = useMemo(() => {
    if (!primary) return 'waiting on pool';
    if (primary.liquidityUsd >= 10_000) return 'tank holding';
    if (primary.liquidityUsd >= 2_000) return 'thin but live';
    return 'shallow LP';
  }, [primary]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(AURA_BASE_ADDRESS);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            $AURA · live on Base
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            $AURA Live
          </h1>
        </div>
        <p className="font-mono text-[10px] text-steel">
          Uni v3 AURA/USDC · every 30s · NFA
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">MCAP</p>
          <p className="font-display mt-1 text-5xl font-bold tabular-nums sm:text-6xl">
            {primary ? usd(primary.marketCap, 0) : '—'}
          </p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            100K $AURA
          </p>
          <p className="font-display mt-1 text-5xl font-bold tabular-nums text-accent sm:text-6xl">
            {price ? usd(per100k, 2) : '—'}
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-ink/60">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 px-4 py-3">
          <p className="font-mono text-[11px] text-steel">
            Chart · USD · {range === '1h' ? '1 minute' : '5 minute'}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={swapUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-ink"
            >
              Trade
            </a>
            <button
              type="button"
              onClick={() => setCurrentPath('launchpad')}
              className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold"
            >
              Raise
            </button>
            {(['6h', '1h'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1.5 font-mono text-[11px] ${
                  range === r
                    ? 'bg-accent/15 text-accent'
                    : 'border border-white/10 text-steel'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[280px] px-2 py-2 sm:h-[340px]">
          {snap?.candles.length ? (
            <AuraPriceChart candles={snap.candles} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-steel">
              {error ? error : <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
          )}
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-white/10 bg-surface/80 p-5 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Rug check</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[10px] text-steel">LP status</p>
            <p className="mt-1 text-2xl font-bold">{tankLabel}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-steel">USDC in LP</p>
            <p className="mt-1 text-2xl font-bold">
              {primary ? usd(primary.liquidityQuote, 0) : '—'}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-steel">LP value</p>
            <p className="mt-1 text-2xl font-bold">
              {primary ? usd(primary.liquidityUsd, 0) : '—'}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-steel">
          Canonical pool is Uniswap v3 AURA/USDC on Base. USDC still sitting in the pool is not a
          pull. This page does not prove LP lock — check the NFT position on Basescan before you
          size up.
        </p>
      </section>

      <section className="mt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          Where the supply sits
        </p>
        <h2 className="font-display mt-1 text-xl font-bold">
          {snap ? snap.supply.toLocaleString() : '—'} $AURA · 1 block = 1M
        </h2>
        <div className="mt-4 flex flex-wrap gap-1">
          {Array.from({ length: Math.min(blocks, 800) }).map((_, i) => (
            <span
              key={i}
              title={i < lpBlocks ? 'In AURA/USDC LP' : 'Outside this LP'}
              className={`h-3 w-3 rounded-[2px] ${
                i < lpBlocks ? 'bg-accent' : 'bg-white/12'
              }`}
            />
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-steel">
          {fmtCompact(inLp)} in the USDC pool ({(lpShare * 100).toFixed(1)}% of fixed supply) · rest
          is wallets, the WETH pool, or unsold.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-surface/80 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
            Token flow · 24h
          </p>
          <div className="mt-4 flex justify-between font-mono text-xs">
            <span className="text-accent">▲ Bought {buys}</span>
            <span className="text-steel">Sold ▼ {sells}</span>
          </div>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/10">
            <div className="bg-accent" style={{ width: `${(buys / flowTotal) * 100}%` }} />
            <div className="bg-white/25" style={{ width: `${(sells / flowTotal) * 100}%` }} />
          </div>
          <p className="mt-3 text-sm text-steel">
            Volume {primary ? usd(snap?.pools.reduce((n, p) => n + p.volumeH24, 0) || 0, 2) : '—'}{' '}
            across Base pools. Quiet tape — not a wash.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-surface/80 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Pools</p>
          <ul className="mt-3 space-y-3">
            {(snap?.pools || []).map((p) => (
              <li key={p.address} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold">
                    AURA/{p.quote}
                    {p.address.toLowerCase() === AURA_USDC_V3_POOL.toLowerCase() ? ' · primary' : ''}
                  </p>
                  <p className="font-mono text-[10px] text-steel">
                    {usd(p.liquidityUsd, 0)} LP · {p.buysH24}B/{p.sellsH24}S
                  </p>
                </div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent"
                >
                  Chart
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-white/10 bg-surface/80 p-5 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Contract</p>
        <p className="mt-2 break-all font-mono text-sm text-white">{AURA_BASE_ADDRESS}</p>
        <p className="mt-1 font-mono text-[11px] text-steel">
          Base · {AURA_BASE_DECIMALS} decimals · fixed {AURA_BASE_SUPPLY.toLocaleString()}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
          >
            <Copy className="h-3 w-3" />
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={() => {
              setWatchError(null);
              void watchAuraOnBase().then(setWatchError);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
          >
            <Wallet className="h-3 w-3" />
            Add to wallet
          </button>
          <a
            href={basescanTokenUrl(AURA_BASE_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
          >
            Basescan <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={dexScreenerTokenUrl(AURA_BASE_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
          >
            DexScreener <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            onClick={() => {
              window.location.assign('/explore?id=p5');
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
          >
            Aura story
          </button>
        </div>
        {watchError && <p className="mt-3 text-xs text-amber-200/90">{watchError}</p>}
      </section>

      <p className="mt-8 font-mono text-[10px] text-steel">
        Live from DexScreener + GeckoTerminal on Base. Not affiliated pricing advice. DYOR.{' '}
        Inspired by community live boards like{' '}
        <a
          href="https://rarefriends.intelstrata.com/"
          target="_blank"
          rel="noreferrer"
          className="text-accent"
        >
          $RAREFRIENDS Live
        </a>
        .
      </p>
    </div>
  );
}
