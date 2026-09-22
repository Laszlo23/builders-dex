import React, { useEffect, useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BadgeCheck, Copy, ExternalLink, Search, Share2 } from 'lucide-react';
import { fetchReputationDossier, type ReputationDossier } from '../lib/reputation/client';
import { useBuilderPassportByWallet } from '../hooks/useBuilderPassport';
import { getPassportExplorerUrl, PASSPORT_DEPLOYED } from '../lib/builderPassport';
import { useNetwork } from '../providers/NetworkProvider';

type Props = {
  walletAddress?: string;
  setCurrentPath: (path: string, state?: { wallet?: string | null }) => void;
  onOpenStory: (projectId: string) => void;
};

function walletFromSearch(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('w')?.trim() || '';
}

function shortWallet(w: string): string {
  if (w.length < 10) return w;
  return `${w.slice(0, 4)}…${w.slice(-4)}`;
}

function outcomeLabel(value: string | null | undefined): string {
  switch (value) {
    case 'hit':
      return 'Hit';
    case 'miss':
      return 'Miss';
    case 'pending':
      return 'Pending';
    default:
      return 'Unscored';
  }
}

export default function ReputationDossierView({
  walletAddress,
  setCurrentPath,
  onOpenStory,
}: Props) {
  const [lookup, setLookup] = useState(() => walletFromSearch() || walletAddress || '');
  const [active, setActive] = useState(() => walletFromSearch() || walletAddress || '');
  const [row, setRow] = useState<ReputationDossier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const { network } = useNetwork();
  const onChainKey = useMemo(() => {
    try {
      return active ? new PublicKey(active) : null;
    } catch {
      return null;
    }
  }, [active]);
  const onChain = useBuilderPassportByWallet(onChainKey);

  useEffect(() => {
    const next = walletFromSearch() || walletAddress || '';
    setLookup(next);
    setActive(next);
  }, [walletAddress]);

  useEffect(() => {
    if (!active) {
      setRow(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setBusy(true);
    setError(null);
    void fetchReputationDossier(active)
      .then((data) => {
        if (cancelled) return;
        setRow(data);
        if (!data) setError('No published Passport on this wallet yet.');
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Ledger read failed');
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const shareHref = useMemo(() => {
    if (!active || typeof window === 'undefined') return '';
    return `${window.location.origin}/dossier?w=${encodeURIComponent(active)}`;
  }, [active]);

  const load = (wallet: string) => {
    const next = wallet.trim();
    setActive(next);
    setCurrentPath('dossier', { wallet: next || null });
  };

  const copyShare = async () => {
    if (!shareHref) return;
    try {
      await navigator.clipboard.writeText(shareHref);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Copy failed');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-white sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Public dossier
      </p>
      <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        Look up who called it.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">
        Signed Builder Passport on the shared ledger. Scout hit-rate is scored calls only.
        Desk heat on this device is not this page.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
          placeholder="Solana wallet"
          className="min-h-[44px] min-w-[220px] flex-1 rounded-full border border-white/15 bg-ink px-4 font-mono text-sm"
        />
        <button
          type="button"
          onClick={() => load(lookup)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-4 text-xs font-bold text-ink"
        >
          <Search className="h-3.5 w-3.5" /> Open
        </button>
        {walletAddress && (
          <button
            type="button"
            onClick={() => load(walletAddress)}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold"
          >
            My wallet
          </button>
        )}
        <button
          type="button"
          onClick={() => setCurrentPath('profile')}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold"
        >
          Publish Passport
        </button>
      </div>

      {busy && <p className="mt-6 font-mono text-xs text-steel">Reading ledger…</p>}
      {error && (
        <p className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/5 px-4 py-3 text-sm text-amber-100">
          {error}
        </p>
      )}

      {row && (
        <section className="desk-call-foil relative mt-8 rounded-[1.75rem] p-6 sm:p-8">
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#CCFF00]">
                {row.verified ? 'Signed ledger' : 'Unverified row'}
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">
                {row.displayName || shortWallet(row.wallet)}
                {row.verified && (
                  <BadgeCheck className="ml-2 inline h-5 w-5 text-[#CCFF00]" />
                )}
              </h2>
              <p className="mt-1 break-all font-mono text-[11px] text-white/55">{row.wallet}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copyShare()}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
              >
                <Share2 className="h-3 w-3" /> {copied ? 'Copied' : 'Share'}
              </button>
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(row.wallet)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
              >
                <Copy className="h-3 w-3" /> Wallet
              </button>
            </div>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-4">
            <div>
              <p className="font-mono text-[10px] uppercase text-white/45">Level</p>
              <p className="font-display mt-1 text-2xl font-bold">{row.levelName}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-white/45">Published XP</p>
              <p className="font-display mt-1 text-2xl font-bold">{row.builderXp.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-white/45">Scout accuracy</p>
              <p className="font-display mt-1 text-2xl font-bold">
                {row.scoutAccuracy == null ? '—' : `${row.scoutAccuracy}%`}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-white/45">Scout XP</p>
              <p className="font-display mt-1 text-2xl font-bold">{row.scoutXp.toLocaleString()}</p>
            </div>
          </div>
          <p className="relative mt-3 font-mono text-[10px] text-white/40">
            Accuracy is hits / (hits + misses) on scored 30-day calls. Empty means none scored
            yet — not 0%.
          </p>
        </section>
      )}

      {active && PASSPORT_DEPLOYED && (
        <section className="mt-8 rounded-[1.75rem] border border-white/10 bg-ink/60 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Solana PDA · separate score
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold">On-chain Passport</h2>
          {onChain.loading && (
            <p className="mt-3 font-mono text-xs text-steel">Reading {network}…</p>
          )}
          {!onChain.loading && onChain.passport && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="font-mono text-[10px] uppercase text-steel">Level</p>
                <p className="font-display mt-1 text-2xl font-bold">{onChain.passport.level}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-steel">Score</p>
                <p className="font-display mt-1 text-2xl font-bold">{onChain.passport.score}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-steel">Updated</p>
                <p className="mt-1 font-mono text-sm">
                  {onChain.passport.lastUpdated.toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          {!onChain.loading && !onChain.passport && (
            <p className="mt-3 text-sm text-steel">
              No PDA on {network} yet. Mint from Profile on Devnet — mainnet mint stays gated.
              This number is not ledger XP.
            </p>
          )}
          {onChainKey && getPassportExplorerUrl(onChainKey, network) && (
            <a
              href={getPassportExplorerUrl(onChainKey, network) || '#'}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent"
            >
              View PDA on Explorer <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </section>
      )}

      {row && row.scoutCalls.length > 0 && (
        <section className="mt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Signed scout tape
          </p>
          <ul className="mt-4 space-y-2">
            {row.scoutCalls.map((call, i) => (
              <li key={`${call.projectId}-${call.createdAt}-${i}`}>
                <button
                  type="button"
                  onClick={() => onOpenStory(call.projectId)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink/60 px-4 py-3 text-left"
                >
                  <span>
                    <span className="font-mono text-sm text-white">{call.projectId}</span>
                    <span className="mt-1 block font-mono text-[10px] text-steel">
                      {new Date(call.createdAt).toLocaleDateString()}
                      {call.earlyCall ? ' · early' : ''}
                    </span>
                  </span>
                  <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                    {outcomeLabel(call.outcome30d)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
