import React, { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { BRAND_HOOD_STANCE, BRAND_MULTICHAIN } from '../data/brand';
import {
  CUBES_CONTRACT,
  CUBES_MINT_URL,
  HOOD_CHAIN_ID,
  HOOD_DISCLAIMER,
  addHoodToWallet,
} from '../data/hoodChain';
import {
  CCFF00_PER_NFT,
  CCFF00_PUBLIC,
  CCFF00_RESERVED,
  CCFF00_SUPPLY,
  CCFF00_TOKEN_SUPPLY,
  HOODSTREET_CCFF00_URL,
  HOODSTREET_DISCLOSURES,
  HOODSTREET_FACTS,
  HOODSTREET_LAYERS,
  HOODSTREET_NEON_URL,
  HOODSTREET_PROJECT_ID,
  HOODSTREET_SITE,
  hoodStreetExplorerToken,
} from '../data/hoodStreet';
import type { CubesLiveSnapshot } from '../lib/hoodLive';
import ChainLaneBar from './ChainLaneBar';

type Props = {
  setCurrentPath: (path: string) => void;
  setSelectedProjectId?: (id: string) => void;
};

export default function HoodStreetView({ setCurrentPath, setSelectedProjectId }: Props) {
  const [snap, setSnap] = useState<CubesLiveSnapshot | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch('/api/cubes/live')
        .then((r) => r.json())
        .then((data: CubesLiveSnapshot & { error?: string }) => {
          if (cancelled || data.error) return;
          setSnap(data);
        })
        .catch(() => {
          /* live board is optional on this page */
        });
    };
    load();
    const id = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const minted = snap?.totalMinted ?? 0;
  const max = snap?.maxSupply || CCFF00_SUPPLY;
  const fill = max > 0 ? Math.min(100, Math.round((minted / max) * 100)) : 0;

  return (
    <div className="hood-lane-page mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
      <ChainLaneBar active="hood" setCurrentPath={setCurrentPath} />
      <div className="relative mt-6 overflow-hidden rounded-[2rem] border border-[#CCFF00]/35 bg-ink">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#CCFF00]">
              {BRAND_MULTICHAIN} · HoodStreet on {HOOD_CHAIN_ID}
            </p>
            <h1 className="font-display mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
              The street is moving onchain.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-steel sm:text-base">
              HoodStreet is an onchain market for humans and AI agents — launch, own, and operate
              with a persistent wallet identity. CCFF00 is the founding membership. Cubes is the
              ETH mint we already list. We are not HoodStreet and not Robinhood. We are here to
              participate.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={HOODSTREET_SITE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#CCFF00] px-5 py-2.5 text-xs font-bold text-ink"
              >
                Open HoodStreet <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={HOODSTREET_CCFF00_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#CCFF00]/40 px-5 py-2.5 text-xs font-semibold text-white"
              >
                Proof of Neon
              </a>
              <button
                type="button"
                onClick={() => setCurrentPath('ccff00')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#CCFF00]/40 px-5 py-2.5 text-xs font-semibold text-[#CCFF00]"
              >
                CCFF00 Wallet <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPath('cubes')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold"
              >
                Live phases <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative flex h-52 w-52 items-center justify-center sm:h-64 sm:w-64">
              <div className="absolute inset-4 rounded-[1.75rem] bg-[#CCFF00] opacity-50 blur-2xl" />
              <div className="relative flex h-full w-full items-center justify-center rounded-[1.75rem] border border-[#CCFF00]/50 bg-[#CCFF00] shadow-[0_0_80px_rgba(204,255,0,0.35)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-ink">#CCFF00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { k: 'Squares', v: CCFF00_SUPPLY.toLocaleString() },
          { k: 'Public mint', v: CCFF00_PUBLIC.toLocaleString() },
          { k: '$CCFF00 / Square', v: CCFF00_PER_NFT.toLocaleString() },
        ].map((stat) => (
          <div key={stat.k} className="rounded-3xl border border-white/10 bg-ink/60 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">{stat.k}</p>
            <p className="font-display mt-1 text-3xl font-bold">{stat.v}</p>
          </div>
        ))}
      </section>

      {snap && (
        <section className="mt-6 rounded-3xl border border-[#CCFF00]/25 bg-[#CCFF00]/5 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#CCFF00]">
                Cubes contract · live
              </p>
              <p className="font-display mt-1 text-3xl font-bold tabular-nums">
                {minted.toLocaleString()}
                <span className="text-xl text-steel"> / {max.toLocaleString()}</span>
              </p>
            </div>
            <p className="font-mono text-[11px] text-steel">
              {snap.paused ? 'Paused' : 'On-chain phases()'} · reserve {CCFF00_RESERVED}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[#CCFF00]" style={{ width: `${fill}%` }} />
          </div>
        </section>
      )}

      <section className="mt-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#CCFF00]">
          Market thesis
        </p>
        <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">
          Not tokenized Wall Street. A market built for crypto.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
          {BRAND_HOOD_STANCE} HoodStreet is building the street: membership, a token-bound wallet,
          and an agent-ready identity. Launch, collect, and keep history on the same 0x you use on
          Base.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {HOODSTREET_LAYERS.map((layer) => (
          <article key={layer.id} className="rounded-3xl border border-white/10 bg-ink/60 p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-xl font-bold">{layer.name}</h3>
              <span className="rounded-full border border-[#CCFF00]/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#CCFF00]">
                {layer.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-steel">{layer.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {layer.internal && (
                <button
                  type="button"
                  onClick={() => setCurrentPath(layer.internal!)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#CCFF00]"
                >
                  Use on DEX <ArrowRight className="h-3 w-3" />
                </button>
              )}
              <a
                href={layer.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#CCFF00]"
              >
                Open {layer.name} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-3xl border border-white/10 bg-ink/60 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#CCFF00]">
          Your NFT is the wallet
        </p>
        <h2 className="font-display mt-2 text-2xl font-bold">ERC-6551 token-bound Square</h2>
        <ul className="mt-4 space-y-2 text-sm text-steel">
          {HOODSTREET_FACTS.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[11px] text-steel">
          Token supply {CCFF00_TOKEN_SUPPLY.toLocaleString()} $CCFF00 · Cubes{' '}
          <span className="break-all text-white">{CUBES_CONTRACT}</span>
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <a
          href={CUBES_MINT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-ink"
        >
          Mint on Square Apes
        </a>
        <a
          href={HOODSTREET_NEON_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold"
        >
          Open My Neon
        </a>
        <a
          href={hoodStreetExplorerToken()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold"
        >
          Explorer
        </a>
        <button
          type="button"
          onClick={() => {
            setAddError(null);
            void addHoodToWallet().then(setAddError);
          }}
          className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold"
        >
          Add Hood 4663
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedProjectId?.(HOODSTREET_PROJECT_ID);
            window.location.assign(`/explore?id=${HOODSTREET_PROJECT_ID}`);
          }}
          className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold"
        >
          Catalog story
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('hood')}
          className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold"
        >
          Honest hop
        </button>
      </div>
      {addError && <p className="mt-3 text-xs text-amber-200/90">{addError}</p>}

      <p className="mt-8 font-mono text-[10px] leading-relaxed text-steel">
        {HOOD_DISCLAIMER} Planned member benefits are HoodStreet&apos;s, not ours.{' '}
        <a
          href={HOODSTREET_DISCLOSURES}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#CCFF00] underline-offset-2 hover:underline"
        >
          Their disclosures
        </a>
        .
      </p>
    </div>
  );
}
