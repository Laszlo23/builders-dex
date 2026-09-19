import React, { useEffect, useState } from 'react';
import { Copy, ExternalLink, Loader2, Wallet } from 'lucide-react';
import {
  CUBES_CONTRACT,
  CUBES_MINT_URL,
  HOOD_CHAIN_ID,
  HOOD_DISCLAIMER,
  HOOD_RELAY_URL,
  addHoodToWallet,
  hoodExplorerAddressUrl,
  hoodExplorerTokenUrl,
} from '../data/hoodChain';
import { BRAND_HOOD_STANCE, BRAND_MULTICHAIN } from '../data/brand';
import { shortenHex } from '../data/crossChainRegistry';
import type { CubesLiveSnapshot, CubesPhaseSnapshot } from '../lib/hoodLive';
import ChainLaneBar from './ChainLaneBar';

type Props = {
  setCurrentPath: (path: string) => void;
};

function gateLabel(phase: CubesPhaseSnapshot): string {
  switch (phase.gate) {
    case 'public':
      return 'Public';
    case 'allowlist':
      return 'Allowlist';
    case 'squares':
      return 'Squares';
    case 'unknown':
      return `Gate ${phase.gateCode}`;
    default: {
      const _never: never = phase.gate;
      return _never;
    }
  }
}

function fmtTime(unix: number): string {
  if (!unix) return '—';
  return new Date(unix * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function fmtEth(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '0 ETH';
  if (n >= 0.001) return `${n.toFixed(4)} ETH`;
  return `${n.toFixed(6)} ETH`;
}

function phaseStatus(phase: CubesPhaseSnapshot, now: number): string {
  if (phase.open) return 'Open';
  if (now < phase.start) return 'Upcoming';
  if (now >= phase.end) return 'Closed';
  return 'Window';
}

export default function CubesLiveView({ setCurrentPath }: Props) {
  const [snap, setSnap] = useState<CubesLiveSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const now = Math.floor(Date.now() / 1000);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch('/api/cubes/live')
        .then((r) => r.json())
        .then((data: CubesLiveSnapshot & { error?: string }) => {
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
  }, []);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const minted = snap?.totalMinted ?? 0;
  const max = snap?.maxSupply ?? 0;
  const fill = max > 0 ? Math.min(1, minted / max) : 0;

  return (
    <div className="hood-lane-page mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
      <ChainLaneBar active="hood" setCurrentPath={setCurrentPath} />
      <div className="relative mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#CCFF00]">
            {BRAND_MULTICHAIN} · HoodStreet · chain {HOOD_CHAIN_ID}
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            CCFF00 mint windows
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">
            {BRAND_HOOD_STANCE} HoodStreet&apos;s Cubes phases on-chain. Outbound Square Apes mint
            — not a Solana wrap.
          </p>
        </div>
        <p className="font-mono text-[10px] text-steel">on-chain phases() · every 30s · NFA</p>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-400/5 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {!snap && !error && (
        <p className="mt-8 inline-flex items-center gap-2 font-mono text-xs text-steel">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading Hood RPC…
        </p>
      )}

      {snap && (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">Minted</p>
              <p className="font-display mt-1 text-5xl font-bold tabular-nums sm:text-6xl">
                {minted.toLocaleString()}
                <span className="text-2xl text-steel"> / {max.toLocaleString()}</span>
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-[#CCFF00]" style={{ width: `${Math.round(fill * 100)}%` }} />
              </div>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">Status</p>
              <p className="font-display mt-1 text-3xl font-bold sm:text-4xl">
                {snap.paused ? 'Paused' : snap.publicRemaining > 0 ? 'Public remaining' : 'Sold out / allowlist'}
              </p>
              <p className="mt-2 font-mono text-[11px] text-steel">
                per-wallet {snap.perWallet} · reserve {snap.reserveMinted}/{snap.reserve} · config{' '}
                {snap.configFrozen ? 'frozen' : 'unfrozen'} · metadata{' '}
                {snap.metadataFrozen ? 'frozen' : 'unfrozen'}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <a
              href={CUBES_MINT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink"
            >
              Mint on Square Apes
            </a>
            <a
              href={HOOD_RELAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white"
            >
              Get Hood ETH (Relay)
            </a>
            <button
              type="button"
              onClick={() => setCurrentPath('hoodstreet')}
              className="rounded-full border border-[#CCFF00]/40 px-4 py-2 text-xs font-semibold text-[#CCFF00]"
            >
              HoodStreet
            </button>
            <button
              type="button"
              onClick={() => setCurrentPath('ccff00')}
              className="rounded-full border border-[#CCFF00]/40 px-4 py-2 text-xs font-semibold text-[#CCFF00]"
            >
              CCFF00 Wallet
            </button>
            <button
              type="button"
              onClick={() => setCurrentPath('hood')}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white"
            >
              Honest hop
            </button>
            <button
              type="button"
              onClick={() => {
                setAddError(null);
                void addHoodToWallet().then(setAddError);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs"
            >
              <Wallet className="h-3 w-3" />
              Add chain 4663
            </button>
          </div>
          {addError && <p className="mt-3 text-xs text-amber-200/90">{addError}</p>}

          <section className="mt-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">Mint windows</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {snap.phases.map((phase) => (
                <div
                  key={phase.id}
                  className="rounded-3xl border border-white/10 bg-ink/60 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-lg font-bold">Phase {phase.id}</p>
                    <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                      {phaseStatus(phase, now)} · {gateLabel(phase)}
                    </span>
                  </div>
                  <p className="mt-3 font-mono text-xs text-steel">
                    {fmtTime(phase.start)} → {fmtTime(phase.end)}
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {phase.minted.toLocaleString()} / {phase.cap.toLocaleString()} minted ·{' '}
                    {fmtEth(phase.priceEth)}
                  </p>
                  <p className="mt-2 break-all font-mono text-[10px] text-steel">
                    merkle {phase.merkleRoot === '0x' + '0'.repeat(64) ? 'empty' : shortenHex(phase.merkleRoot, 4, 4)}
                  </p>
                </div>
              ))}
              {snap.phases.length === 0 && (
                <p className="text-sm text-steel">No configured phases on-chain yet.</p>
              )}
            </div>
          </section>

          {snap.pair && (
            <section className="mt-8 rounded-3xl border border-white/10 bg-ink/60 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
                DexScreener pair
              </p>
              <p className="mt-2 text-sm text-white">
                {snap.pair.priceUsd ? `$${snap.pair.priceUsd}` : 'Quoted'} · LP{' '}
                {snap.pair.liquidityUsd ? `$${snap.pair.liquidityUsd.toLocaleString()}` : '—'}
              </p>
              <a
                href={snap.pair.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-accent"
              >
                Open pair <ExternalLink className="h-3 w-3" />
              </a>
            </section>
          )}

          <section className="mt-8 rounded-3xl border border-white/10 bg-ink/60 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">Contract</p>
            <p className="mt-2 break-all font-mono text-sm text-white">{CUBES_CONTRACT}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copy(CUBES_CONTRACT)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
              >
                <Copy className="h-3 w-3" />
                {copied ? 'Copied' : 'Copy'}
              </button>
              <a
                href={hoodExplorerTokenUrl(CUBES_CONTRACT)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
              >
                Explorer <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={hoodExplorerAddressUrl(snap.payout)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
              >
                Payout <ExternalLink className="h-3 w-3" />
              </a>
              <button
                type="button"
                onClick={() => {
                  window.location.assign('/hoodstreet');
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
              >
                HoodStreet story
              </button>
            </div>
          </section>
        </>
      )}

      <p className="mt-8 font-mono text-[10px] leading-relaxed text-steel">{HOOD_DISCLAIMER}</p>
    </div>
  );
}
