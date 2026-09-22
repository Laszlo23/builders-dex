import React, { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink, Radio } from 'lucide-react';
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
import SquareLoopPanel from './SquareLoopPanel';
import SquareStorefronts from './SquareStorefronts';

type Props = {
  setCurrentPath: (path: string, state?: { buy?: string | null; stall?: string | null }) => void;
  setSelectedProjectId?: (id: string) => void;
};

const TICKER = [
  `CHAIN ${HOOD_CHAIN_ID}`,
  'SAME 0x ACROSS L2s',
  '10,000 SQUARES',
  'ERC-6551 TBA',
  'PROOF OF NEON',
  'NO RARITY THEATER',
  'CUBES · ETH MINT',
  'THE STREET IS ONCHAIN',
  'ACTIVATE · PARK · STALL',
  'FEE DUST NOT APR',
];

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
    <div className="hood-lane-page hood-street relative mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
      <div className="hood-street-floor" aria-hidden />

      <div className="hood-ticker ticker-mask relative z-10 overflow-hidden rounded-full px-2 py-2">
        <div className="animate-marquee gap-8 whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#CCFF00]">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center gap-8">
              <span className="h-1 w-1 rounded-full bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-5">
        <ChainLaneBar active="hood" setCurrentPath={setCurrentPath} />
      </div>

      <section className="hood-hero relative z-10 mt-6">
        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="hood-hud rounded-full px-3 py-1 text-[10px]">
                <Radio className="mr-1.5 inline h-3 w-3" />
                Live 4663
              </span>
              <span className="hood-hud rounded-full px-3 py-1 text-[10px]">#CCFF00</span>
              <span className="hood-hud rounded-full px-3 py-1 text-[10px]">
                {BRAND_MULTICHAIN}
              </span>
            </div>
            <h1 className="hood-title font-display mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              The street is
              <span className="hood-title-neon block">onchain.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              HoodStreet is an onchain market for humans and AI agents — launch, own, and operate
              with a persistent wallet identity. CCFF00 is the founding membership. Cubes is the
              ETH mint we already list. We are not HoodStreet and not Robinhood. We are here to
              participate.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <a
                href={HOODSTREET_SITE}
                target="_blank"
                rel="noopener noreferrer"
                className="hood-cta-fill btn-sheen inline-flex min-h-[48px] items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold"
              >
                Enter the street <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={HOODSTREET_CCFF00_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hood-cta inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
              >
                Proof of Neon
              </a>
              <button
                type="button"
                onClick={() => setCurrentPath('ccff00')}
                className="hood-cta inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
              >
                CCFF00 Wallet <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPath('build')}
                className="hood-cta inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
              >
                $BUILD launch <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPath('cubes')}
                className="hood-cta inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
              >
                Live phases <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPath('stacc')}
                className="hood-cta inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
              >
                staccpad book <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72">
              <div className="absolute inset-6 rounded-[2rem] bg-[#CCFF00] opacity-40 blur-3xl" />
              <div className="neon-cube-scene relative">
                <div className="neon-cube" aria-hidden>
                  <span className="f1" />
                  <span className="f2" />
                  <span className="f3" />
                  <span className="f4" />
                  <span className="f5" />
                  <span className="f6" />
                </div>
              </div>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-[#CCFF00]">
              Immutable square · one color
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { k: 'Squares', v: CCFF00_SUPPLY.toLocaleString() },
          { k: 'Public mint', v: CCFF00_PUBLIC.toLocaleString() },
          { k: '$CCFF00 / Square', v: CCFF00_PER_NFT.toLocaleString() },
        ].map((stat) => (
          <div key={stat.k} className="hood-led rounded-3xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">{stat.k}</p>
            <p className="hood-led-value font-display mt-1 text-3xl font-bold sm:text-4xl">{stat.v}</p>
          </div>
        ))}
      </section>

      {snap && (
        <section className="hood-led relative z-10 mt-4 overflow-hidden rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#CCFF00]">
                Cubes contract · live tape
              </p>
              <p className="font-display mt-1 text-3xl font-bold tabular-nums sm:text-4xl">
                <span className="hood-led-value">{minted.toLocaleString()}</span>
                <span className="text-xl text-white/40"> / {max.toLocaleString()}</span>
              </p>
            </div>
            <p className="font-mono text-[11px] text-white/50">
              {snap.paused ? 'Paused' : 'On-chain phases()'} · reserve {CCFF00_RESERVED}
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/50">
            <div
              className="h-full rounded-full bg-[#CCFF00] shadow-[0_0_16px_#CCFF00]"
              style={{ width: `${fill}%` }}
            />
          </div>
        </section>
      )}

      <div className="relative z-10 mt-10">
        <SquareLoopPanel setCurrentPath={setCurrentPath} compact />
      </div>

      <SquareStorefronts setCurrentPath={setCurrentPath} />

      <section className="relative z-10 mt-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#CCFF00]">
          Market thesis
        </p>
        <h2 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Not tokenized Wall Street.
          <span className="hood-title-neon block">A market built for crypto.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
          {BRAND_HOOD_STANCE} HoodStreet is building the street: membership, a token-bound wallet,
          and an agent-ready identity. Launch, collect, and keep history on the same 0x you use on
          Base.
        </p>
      </section>

      <section className="relative z-10 mt-10 grid gap-4 md:grid-cols-3">
        {HOODSTREET_LAYERS.map((layer) => (
          <article key={layer.id} className="hood-storefront rounded-3xl p-6 pl-7">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-2xl font-bold tracking-tight">{layer.name}</h3>
              <span className="rounded-full border border-[#CCFF00]/40 bg-[#CCFF00]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#CCFF00]">
                {layer.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/65">{layer.blurb}</p>
            <div className="mt-5 flex flex-wrap gap-3">
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

      <section className="hood-led relative z-10 mt-10 rounded-3xl p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#CCFF00]">
          Your NFT is the wallet
        </p>
        <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">
          ERC-6551 token-bound Square
        </h2>
        <ul className="mt-5 space-y-3 text-sm text-white/70">
          {HOODSTREET_FACTS.map((fact) => (
            <li key={fact} className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 break-all font-mono text-[11px] text-white/40">
          Token supply {CCFF00_TOKEN_SUPPLY.toLocaleString()} $CCFF00 · Cubes {CUBES_CONTRACT}
        </p>
      </section>

      <div className="relative z-10 mt-8 flex flex-wrap gap-2">
        <a
          href={CUBES_MINT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hood-cta-fill inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-xs font-bold"
        >
          Mint on Square Apes
        </a>
        <a
          href={HOODSTREET_NEON_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hood-cta inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-xs font-semibold"
        >
          Open My Neon
        </a>
        <a
          href={hoodStreetExplorerToken()}
          target="_blank"
          rel="noopener noreferrer"
          className="hood-cta inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-xs font-semibold"
        >
          Explorer
        </a>
        <button
          type="button"
          onClick={() => {
            setAddError(null);
            void addHoodToWallet().then(setAddError);
          }}
          className="hood-cta inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-xs font-semibold"
        >
          Add Hood 4663
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedProjectId?.(HOODSTREET_PROJECT_ID);
            window.location.assign(`/explore?id=${HOODSTREET_PROJECT_ID}`);
          }}
          className="hood-cta inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-xs font-semibold"
        >
          Catalog story
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('hood')}
          className="hood-cta inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-xs font-semibold"
        >
          Honest hop
        </button>
      </div>
      {addError && <p className="relative z-10 mt-3 text-xs text-amber-200/90">{addError}</p>}

      <p className="relative z-10 mt-10 font-mono text-[10px] leading-relaxed text-white/40">
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
