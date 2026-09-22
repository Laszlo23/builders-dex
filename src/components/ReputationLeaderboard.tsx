import React, { useEffect, useState } from 'react';
import { BadgeCheck, Trophy, Users, Swords } from 'lucide-react';
import {
  fetchReputationLeaderboard,
  type ReputationPublic,
} from '../lib/reputation/client';
import { getPassportLevel } from '../lib/builderScore';

function shortWallet(w: string): string {
  if (w.length < 10) return w;
  return `${w.slice(0, 4)}…${w.slice(-4)}`;
}

function sameWallet(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

type LocalPreview = {
  wallet?: string | null;
  xp: number;
  levelName?: string;
};

type Props = {
  onOpenProfile?: () => void;
  onOpenDossier?: (wallet: string) => void;
  onOpenEarn?: () => void;
  highlightWallet?: string | null;
  localPreview?: LocalPreview | null;
};

function medal(rank: number): string {
  if (rank === 1) return '01';
  if (rank === 2) return '02';
  if (rank === 3) return '03';
  return String(rank).padStart(2, '0');
}

export default function ReputationLeaderboard({
  onOpenProfile,
  onOpenDossier,
  onOpenEarn,
  highlightWallet,
  localPreview,
}: Props) {
  const [rows, setRows] = useState<ReputationPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchReputationLeaderboard(15)
      .then((list) => {
        if (!cancelled) setRows(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const publishedHere = rows.some((r) => sameWallet(r.wallet, highlightWallet));
  const ghostXp = localPreview?.xp ?? 0;
  const showGhost = Boolean(ghostXp > 0 && localPreview?.wallet && !publishedHere);

  return (
    <section className="desk-call-foil relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8">
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#CCFF00]">
            <Trophy className="h-3.5 w-3.5" />
            The Tape
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Who published. Who called it.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Device XP stays on this browser. Publish Passport signs the shared ledger.
            Mint Passport is a separate Solana PDA — a different number.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onOpenEarn && (
            <button
              type="button"
              onClick={onOpenEarn}
              className="rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] hover:bg-white/5"
            >
              Earn XP
            </button>
          )}
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="rounded-full border border-[#CCFF00]/40 bg-[#CCFF00]/10 px-4 py-2 font-mono text-[11px] text-[#CCFF00] hover:bg-[#CCFF00]/15"
            >
              Publish Passport →
            </button>
          )}
        </div>
      </div>

      <ol className="relative mt-5 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-widest text-white/45">
        <li className="rounded-full border border-white/10 px-2.5 py-1">1 · Play</li>
        <li className="rounded-full border border-white/10 px-2.5 py-1">2 · Sign publish</li>
        <li className="rounded-full border border-white/10 px-2.5 py-1">3 · Optional on-chain mint</li>
      </ol>

      {loading && (
        <p className="relative mt-6 font-mono text-xs text-steel">Reading the tape…</p>
      )}

      {showGhost && (
        <button
          type="button"
          onClick={onOpenProfile}
          className="relative mt-6 flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-[#CCFF00]/40 bg-[#CCFF00]/5 px-4 py-3 text-left"
        >
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#CCFF00]">
              On this device · unpublished
            </p>
            <p className="mt-1 truncate text-sm font-semibold">
              {shortWallet(localPreview?.wallet || '')} ·{' '}
              {localPreview?.levelName || getPassportLevel(ghostXp)}
            </p>
          </div>
          <p className="shrink-0 font-mono text-sm text-[#CCFF00]">
            {ghostXp.toLocaleString()} XP
          </p>
        </button>
      )}

      {!loading && rows.length === 0 && (
        <div className="relative mt-6 rounded-2xl border border-white/10 bg-ink/50 px-4 py-5 text-sm text-white/70">
          <Users className="mb-2 h-4 w-4 text-[#CCFF00]" />
          The public tape is empty. That is honest — nobody has signed Publish Passport yet.
          Earn on this device, then publish to take rank 1.
        </div>
      )}

      {rows.length > 0 && (
        <ol className="relative mt-6 space-y-2">
          {rows.map((r, i) => {
            const mine = sameWallet(r.wallet, highlightWallet);
            return (
              <li key={r.wallet}>
                <button
                  type="button"
                  onClick={onOpenDossier ? () => onOpenDossier(r.wallet) : undefined}
                  disabled={!onOpenDossier}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left ${
                    mine
                      ? 'border-[#CCFF00]/45 bg-[#CCFF00]/10'
                      : 'border-white/8 bg-ink/50'
                  } ${onOpenDossier ? 'hover:border-[#CCFF00]/35' : ''}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-8 font-mono text-xs text-[#CCFF00]/80">{medal(i + 1)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {r.displayName || shortWallet(r.wallet)}
                        {r.verified && (
                          <BadgeCheck className="ml-1 inline h-3.5 w-3.5 text-[#CCFF00]" />
                        )}
                        {mine && (
                          <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-[#CCFF00]">
                            you
                          </span>
                        )}
                      </p>
                      <p className="font-mono text-[10px] text-white/45">
                        {shortWallet(r.wallet)} · {r.levelName}
                        {r.scoutAccuracy != null ? ` · ${r.scoutAccuracy}% acc` : ''}
                        {` · ${r.completedTaskCount} tasks`}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm text-[#CCFF00]">
                      {r.builderXp.toLocaleString()} XP
                    </p>
                    <p className="font-mono text-[10px] text-white/40">
                      <Swords className="mr-1 inline h-3 w-3" />
                      {r.scoutXp.toLocaleString()} scout
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
