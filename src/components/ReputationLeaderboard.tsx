import React, { useEffect, useState } from 'react';
import { BadgeCheck, Trophy, Users } from 'lucide-react';
import {
  fetchReputationLeaderboard,
  type ReputationPublic,
} from '../lib/reputation/client';

function shortWallet(w: string): string {
  if (w.length < 10) return w;
  return `${w.slice(0, 4)}…${w.slice(-4)}`;
}

type Props = {
  onOpenProfile?: () => void;
  highlightWallet?: string | null;
};

export default function ReputationLeaderboard({
  onOpenProfile,
  highlightWallet,
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

  return (
    <section className="rounded-[1.75rem] border border-accent/20 bg-surface/80 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            <Trophy className="h-3.5 w-3.5" />
            Shared ledger
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold tracking-tight">
            Public Builder Passports
          </h2>
          <p className="mt-2 max-w-xl text-sm text-steel">
            XP and Passport™ sync to the network when a wallet is connected — visible to
            everyone, not trapped in your browser.
          </p>
        </div>
        {onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="rounded-full border border-accent/35 px-4 py-2 font-mono text-[11px] text-accent hover:bg-accent/10"
          >
            Sync my Passport →
          </button>
        )}
      </div>

      {loading && (
        <p className="mt-6 font-mono text-xs text-steel">Loading ledger…</p>
      )}

      {!loading && rows.length === 0 && (
        <div className="mt-6 rounded-xl border border-white/10 bg-ink/40 px-4 py-5 text-sm text-steel">
          <Users className="mb-2 h-4 w-4 text-accent" />
          No public Passports yet. Connect a wallet, complete a growth task, and your XP
          lands on this board.
        </div>
      )}

      {rows.length > 0 && (
        <ol className="mt-6 space-y-2">
          {rows.map((r, i) => {
            const mine =
              highlightWallet &&
              r.wallet.toLowerCase() === highlightWallet.toLowerCase();
            return (
              <li
                key={r.wallet}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                  mine
                    ? 'border-accent/40 bg-accent/10'
                    : 'border-white/8 bg-ink/40'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 font-mono text-xs text-steel">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {r.displayName || shortWallet(r.wallet)}
                      {r.verified && (
                        <BadgeCheck className="ml-1 inline h-3.5 w-3.5 text-accent" />
                      )}
                    </p>
                    <p className="font-mono text-[10px] text-steel">
                      {shortWallet(r.wallet)} · {r.levelName} · {r.completedTaskCount}{' '}
                      tasks
                    </p>
                  </div>
                </div>
                <p className="shrink-0 font-mono text-sm text-accent">
                  {r.builderXp.toLocaleString()} XP
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
