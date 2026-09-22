import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import ChainLaneBar from './ChainLaneBar';
import { BRAND_HOOD_STANCE } from '../data/brand';
import { HOOD_DISCLAIMER, addHoodToWallet } from '../data/hoodChain';
import {
  STACCPAD_CCFF00_COLLECTION,
  STACCPAD_CCFF00_TERMINAL,
  STACCPAD_CCFF00_VAULT,
  STACCPAD_DESKS,
  STACCPAD_DISCLAIMER,
  STACCPAD_FACTS,
  STACCPAD_HOOK,
  STACCPAD_NEONS_URL,
  STACCPAD_POOL_MANAGER,
  STACCPAD_SOLANA_LAUNCHPAD,
  staccpadCollectionExplorer,
  staccpadHookExplorer,
  staccpadVaultExplorer,
} from '../data/staccpad';
import { shortenHex } from '../lib/ccff00Wallet';

type PathSetter = (path: string) => void;

export function StaccpadOutbound({ compact = false }: { compact?: boolean }) {
  const desks = compact ? STACCPAD_DESKS.filter((d) => d.ours) : STACCPAD_DESKS;
  return (
    <section className={compact ? 'rounded-3xl border border-[#CCFF00]/25 bg-[#CCFF00]/[0.04] p-5' : undefined}>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#CCFF00]">
        Live Hood book · outbound
      </p>
      <h2 className={`font-display mt-2 font-bold ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
        staccpad already trades the Square.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
        Same CCFF00 NFT. Their Uniswap v4 vault and Neons launch. We list the official URLs and
        inspected addresses — we do not sign their router from this app.
      </p>
      <div className={`mt-5 grid gap-3 ${compact ? 'sm:grid-cols-2' : 'md:grid-cols-2'}`}>
        {desks.map((desk) => (
          <article
            key={desk.id}
            className="rounded-2xl border border-white/10 bg-ink/60 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold">{desk.name}</h3>
              <span className="rounded-full border border-[#CCFF00]/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#CCFF00]">
                {desk.tag}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-steel">{desk.blurb}</p>
            <a
              href={desk.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#CCFF00] px-4 text-xs font-bold text-ink"
            >
              Open on staccpad <ExternalLink className="h-3 w-3" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function StaccpadDeskView({ setCurrentPath }: { setCurrentPath: PathSetter }) {
  return (
    <div className="hood-lane-page relative mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
      <ChainLaneBar active="hood" setCurrentPath={setCurrentPath} />

      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-[#CCFF00]">
        Hood 4663 · not our terminal
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight sm:text-6xl">
        The live book
        <span className="hood-title-neon block">is already on-chain.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
        {BRAND_HOOD_STANCE} staccpad runs the NGU / CLMM / Neons desks on Robinhood Chain. The
        CCFF00 terminal is the same Square collection we wallet here. Happy Apes{' '}
        <span className="font-mono text-[#CCFF00]">ngu-ef264ab6</span> is their example rising-only
        curve — not a Builders mint.
      </p>

      <div className="mt-7 flex flex-wrap gap-2">
        <a
          href={STACCPAD_CCFF00_TERMINAL}
          target="_blank"
          rel="noopener noreferrer"
          className="hood-cta-fill inline-flex min-h-[48px] items-center gap-2 rounded-full px-6 text-xs font-bold"
        >
          CCFF00 desk <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a
          href={STACCPAD_NEONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hood-cta inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 text-xs font-semibold"
        >
          Neons · Square launch
        </a>
        <button
          type="button"
          onClick={() => setCurrentPath('ccff00')}
          className="hood-cta inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 text-xs font-semibold"
        >
          Square wallet <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => void addHoodToWallet()}
          className="hood-cta inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 text-xs font-semibold"
        >
          Add Hood 4663
        </button>
      </div>

      <div className="mt-10">
        <StaccpadOutbound />
      </div>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { k: 'Collection', v: shortenHex(STACCPAD_CCFF00_COLLECTION), href: staccpadCollectionExplorer() },
          { k: 'CCFF00 vault', v: shortenHex(STACCPAD_CCFF00_VAULT), href: staccpadVaultExplorer() },
          { k: 'v4 hook', v: shortenHex(STACCPAD_HOOK), href: staccpadHookExplorer() },
        ].map((row) => (
          <a
            key={row.k}
            href={row.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hood-led rounded-3xl p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">{row.k}</p>
            <p className="font-display mt-1 text-2xl font-bold">{row.v}</p>
          </a>
        ))}
      </section>

      <ul className="mt-8 space-y-3 text-sm text-white/70">
        {STACCPAD_FACTS.map((fact) => (
          <li key={fact} className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#CCFF00]" />
            <span>{fact}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 break-all font-mono text-[11px] text-white/40">
        PoolManager {STACCPAD_POOL_MANAGER}
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" onClick={() => setCurrentPath('hoodstreet')} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold">
          HoodStreet
        </button>
        <button type="button" onClick={() => setCurrentPath('cubes')} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold">
          Cubes phases
        </button>
        <a
          href={STACCPAD_SOLANA_LAUNCHPAD}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold"
        >
          Separate Solana staccpad
        </a>
      </div>

      <p className="mt-10 font-mono text-[10px] leading-relaxed text-white/40">
        {HOOD_DISCLAIMER} {STACCPAD_DISCLAIMER}
      </p>
    </div>
  );
}
