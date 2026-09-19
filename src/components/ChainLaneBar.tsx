import React from 'react';
import { CHAIN_LANES, type ChainLaneId } from '../data/chainLanes';

type Props = {
  active: ChainLaneId;
  setCurrentPath: (path: string) => void;
  compact?: boolean;
};

export default function ChainLaneBar({ active, setCurrentPath, compact }: Props) {
  return (
    <div className={`chain-lane-bar ${compact ? 'chain-lane-bar--compact' : ''}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">
        Three rooms · do not mix wallets
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {CHAIN_LANES.map((lane) => {
          const on = lane.id === active;
          return (
            <button
              key={lane.id}
              type="button"
              onClick={() => setCurrentPath(lane.route)}
              className={`chain-lane-chip chain-lane-chip--${lane.id} ${on ? 'is-active' : ''}`}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{lane.label}</span>
              <span className="mt-1 block text-left text-xs font-semibold text-white">{lane.job}</span>
              <span className="mt-0.5 block text-left font-mono text-[10px] text-steel">
                {lane.wallet} · {lane.chain}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
