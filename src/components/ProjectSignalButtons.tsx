import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SignalSide } from '../lib/projectSignal';

type Props = {
  up: number;
  down: number;
  mine: SignalSide | null;
  remaining: number;
  allowance: number;
  disabled?: boolean;
  compact?: boolean;
  onVote: (side: SignalSide) => void;
};

export default function ProjectSignalButtons({
  up,
  down,
  mine,
  remaining,
  allowance,
  disabled,
  compact,
  onVote,
}: Props) {
  const dry = remaining < 1 && !mine;
  return (
    <div
      className={`inline-flex items-center gap-1 ${compact ? '' : 'flex-wrap'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={disabled || (dry && mine !== 'up')}
        onClick={() => onVote('up')}
        className={`inline-flex min-h-[40px] items-center gap-1 rounded-xl border px-2.5 py-1.5 font-mono text-xs transition active:scale-95 disabled:opacity-40 ${
          mine === 'up'
            ? 'border-accent/50 bg-accent/15 font-bold text-accent'
            : 'border-white/10 bg-white/[0.03] text-steel hover:border-accent/30 hover:text-accent'
        }`}
        title={remaining < 1 && mine !== 'up' ? 'No signal left today' : 'Spend 1 signal to upvote'}
      >
        <ChevronUp className="h-3.5 w-3.5" />
        {up}
      </button>
      <button
        type="button"
        disabled={disabled || (dry && mine !== 'down')}
        onClick={() => onVote('down')}
        className={`inline-flex min-h-[40px] items-center gap-1 rounded-xl border px-2.5 py-1.5 font-mono text-xs transition active:scale-95 disabled:opacity-40 ${
          mine === 'down'
            ? 'border-rose-400/50 bg-rose-400/10 font-bold text-rose-200'
            : 'border-white/10 bg-white/[0.03] text-steel hover:border-rose-400/30 hover:text-rose-200'
        }`}
        title={remaining < 1 && mine !== 'down' ? 'No signal left today' : 'Spend 1 signal to downvote'}
      >
        <ChevronDown className="h-3.5 w-3.5" />
        {down}
      </button>
      {!compact && (
        <span className="pl-1 font-mono text-[10px] uppercase tracking-widest text-steel">
          {remaining}/{allowance} signal
        </span>
      )}
    </div>
  );
}
