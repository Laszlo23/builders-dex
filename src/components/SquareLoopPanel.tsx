import React, { useMemo, useState } from 'react';
import { Lamp, Lock, Sparkles, Store, Unlock, Timer } from 'lucide-react';
import { explorerTx } from '../data/buildToken';
import {
  FIRST_STALL_NAME,
  SQUARE_LOOP_MAX_PER_WALLET,
  SQUARE_LOOP_PHASES,
  SQUARE_LOOP_PERKS,
  SQUARE_LOOP_UNPARK_DAYS,
  formatFeeWei,
  squareLoopPhaseBlurb,
  squareLoopPhaseLabel,
  type SquareLoopPhase,
} from '../data/squareLoop';
import { formatCooldown } from '../data/earn';
import { useSquareLoop, type SquareLoopAction } from '../hooks/useSquareLoop';
import ComingSoonBanner from './ComingSoonBanner';

type Props = {
  tokenId?: number | null;
  compact?: boolean;
  setCurrentPath: (path: string, state?: { buy?: string | null; stall?: string | null }) => void;
  onActivated?: () => void;
  onParked?: () => void;
  onStalled?: () => void;
};

function phaseIndex(phase: SquareLoopPhase): number {
  return SQUARE_LOOP_PHASES.indexOf(phase);
}

export default function SquareLoopPanel({
  tokenId = null,
  compact = false,
  setCurrentPath,
  onActivated,
  onParked,
  onStalled,
}: Props) {
  const [manualId, setManualId] = useState(tokenId != null ? String(tokenId) : '');
  const resolvedId = tokenId ?? (manualId ? Number(manualId) : null);
  const loop = useSquareLoop(Number.isInteger(resolvedId) ? resolvedId : null);
  const cooldown = loop.entry?.unparkUnlockAt
    ? formatCooldown(Math.max(0, loop.entry.unparkUnlockAt - Date.now()))
    : null;
  const unparkReady = Boolean(
    loop.entry?.unparkUnlockAt && Date.now() >= loop.entry.unparkUnlockAt,
  );

  const nowIdx = phaseIndex(loop.phase);

  const act = async (action: SquareLoopAction) => {
    const ok = await loop.run(action);
    if (!ok) return;
    if (action === 'activate') onActivated?.();
    if (action === 'park') onParked?.();
    if (action === 'stall') onStalled?.();
  };

  const cta = useMemo(() => {
    switch (loop.phase) {
      case 'dormant':
        return { action: 'activate' as const, label: 'Activate Square' };
      case 'activated':
        return { action: 'park' as const, label: 'Park on the street' };
      case 'parked':
        return { action: 'stall' as const, label: `Take ${FIRST_STALL_NAME} stall` };
      case 'stalled':
        return { action: 'exit-stall' as const, label: 'Leave stall' };
      default: {
        const _exhaustive: never = loop.phase;
        return _exhaustive;
      }
    }
  }, [loop.phase]);

  return (
    <section className="rounded-[1.75rem] border border-[#CCFF00]/30 bg-[#CCFF00]/[0.05] p-5 sm:p-6">
      {loop.contractsReady ? (
        <ComingSoonBanner
          title="Square loop is on Hood 4663"
          detail="Activate, park, and take the Aura Share stall against the live overlay. $BUILD has a Bankr address — fee dust stays 0 until volume hits the splitter. We do not wrap the Square."
        />
      ) : (
        <ComingSoonBanner
          title="Preview — registry not on 4663 yet"
          detail="Activate → park → stall is the live design. $BUILD, the activation registry, stall vault, and fee splitter have no published addresses. Fees this week are 0."
        />
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#CCFF00]">
            Square loop · chain {loop.status.chainId}
          </p>
          <h2 className="font-display mt-1 text-2xl font-bold">
            {tokenId != null ? `Square #${tokenId}` : 'Activate, park, stall'}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-steel">
            {squareLoopPhaseBlurb(loop.phase)} Cap {SQUARE_LOOP_MAX_PER_WALLET} parked Squares.
            Unpark cooldown {SQUARE_LOOP_UNPARK_DAYS} days.
          </p>
        </div>
        <div className="rounded-2xl border border-[#CCFF00]/35 bg-ink/50 px-4 py-3 text-right">
          <p className="font-mono text-[10px] uppercase tracking-widest text-steel">Fees this week</p>
          <p className="font-display mt-1 text-2xl font-bold text-[#CCFF00]">
            {formatFeeWei(loop.feesThisWeek)}
          </p>
          <p className="mt-1 font-mono text-[10px] text-steel">Neon {loop.neon} / 100</p>
        </div>
      </div>

      {tokenId == null && (
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={manualId}
            onChange={(e) => setManualId(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="Square token id"
            inputMode="numeric"
            className="min-h-[44px] w-40 rounded-full border border-white/15 bg-ink px-4 font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setCurrentPath('ccff00')}
            className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-4 text-xs font-semibold"
          >
            Open CCFF00 Wallet
          </button>
        </div>
      )}
      {loop.listed.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {loop.listed.map((row) => (
            <button
              key={row.tokenId}
              type="button"
              onClick={() => setManualId(String(row.tokenId))}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] ${
                resolvedId === row.tokenId
                  ? 'border-[#CCFF00] bg-[#CCFF00]/20 text-[#CCFF00]'
                  : 'border-[#CCFF00]/35 text-[#CCFF00]'
              }`}
            >
              #{row.tokenId} · {squareLoopPhaseLabel(row.phase)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-2 sm:grid-cols-4">
        {SQUARE_LOOP_PHASES.map((phase, idx) => (
          <div
            key={phase}
            className={`rounded-2xl border px-3 py-3 ${
              idx === nowIdx
                ? 'border-[#CCFF00] bg-[#CCFF00]/15'
                : idx < nowIdx
                  ? 'border-[#CCFF00]/30 bg-[#CCFF00]/5'
                  : 'border-white/10 bg-ink/40'
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#CCFF00]">
              {String(idx + 1).padStart(2, '0')}
            </p>
            <p className="mt-1 text-sm font-semibold">{squareLoopPhaseLabel(phase)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loop.busy != null || resolvedId == null}
          onClick={() => void act(cta.action)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#CCFF00] px-5 text-xs font-bold text-ink disabled:opacity-50"
        >
          {cta.action === 'activate' ? (
            <Lamp className="h-3.5 w-3.5" />
          ) : cta.action === 'park' ? (
            <Sparkles className="h-3.5 w-3.5" />
          ) : (
            <Store className="h-3.5 w-3.5" />
          )}
          {loop.busy === cta.action ? 'Signing…' : cta.label}
        </button>
        {loop.phase === 'parked' && !loop.entry?.unparkUnlockAt && (
          <button
            type="button"
            disabled={loop.busy != null}
            onClick={() => void act('unpark-request')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 text-xs font-semibold disabled:opacity-50"
          >
            <Unlock className="h-3.5 w-3.5" /> Request unpark
          </button>
        )}
        {loop.entry?.unparkUnlockAt && (
          <button
            type="button"
            disabled={!unparkReady || loop.busy != null}
            onClick={() => void act('unpark')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-accent/40 px-4 text-xs font-semibold text-accent disabled:opacity-40"
          >
            <Timer className="h-3.5 w-3.5" />
            {unparkReady ? 'Unpark now' : cooldown}
          </button>
        )}
        <button
          type="button"
          disabled={loop.busy != null || resolvedId == null || loop.feesThisWeek === '0'}
          onClick={() => void act('claim')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 text-xs font-semibold disabled:opacity-40"
        >
          Claim fee dust
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('build')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 text-xs font-semibold"
        >
          <Lock className="h-3.5 w-3.5" /> $BUILD launch
        </button>
      </div>

      <p className="mt-3 font-mono text-[11px] text-steel">
        {loop.status.token.address
          ? '$BUILD address is live. ve-lock stays closed until a lock tx is published. Do not lock idle tokens from an EOA.'
          : 've-lock opens when a $BUILD address is published. Do not lock idle tokens from an EOA.'}
      </p>

      {loop.error && (
        <p className="mt-3 rounded-2xl border border-amber-300/25 bg-amber-300/5 px-3 py-2 text-xs text-amber-100">
          {loop.error}
        </p>
      )}
      {loop.tx && (
        <a
          href={explorerTx(loop.tx)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block break-all font-mono text-[11px] text-[#CCFF00]"
        >
          Tx {loop.tx}
        </a>
      )}

      {!compact && (
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {SQUARE_LOOP_PERKS.map((perk) => (
            <div key={perk.title} className="rounded-2xl border border-white/8 bg-ink/40 px-3 py-3">
              <p className="text-sm font-semibold">{perk.title}</p>
              <p className="mt-1 text-xs text-steel">{perk.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
