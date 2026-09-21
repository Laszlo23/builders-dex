import React from 'react';
import { neonLevel, squareLoopPhaseLabel } from '../data/squareLoop';
import { useSquareLoop } from '../hooks/useSquareLoop';

type Props = {
  setCurrentPath: (path: string) => void;
};

const EMPTY_SLOTS = 8;

export default function SquareStorefronts({ setCurrentPath }: Props) {
  const { listed } = useSquareLoop(null);
  const tiles = Array.from({ length: EMPTY_SLOTS }, (_, i) => listed[i] ?? null);

  return (
    <section className="relative z-10 mt-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#CCFF00]">
        Your storefronts
      </p>
      <h2 className="font-display mt-2 text-3xl font-bold tracking-tight">
        Parked Squares light the street.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
        This row is your Squares on this device — not a fake city of other wallets. Unlit tiles are
        empty. Neon grows from parked time and stalls, never from rarity.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((entry, i) => {
          const glow = entry
            ? neonLevel({ phase: entry.phase, parkedAt: entry.parkedAt })
            : 6;
          return (
            <button
              key={entry ? `sq-${entry.tokenId}` : `empty-${i}`}
              type="button"
              onClick={() => setCurrentPath(entry ? 'ccff00' : 'earn')}
              className="hood-storefront rounded-3xl p-4 text-left"
              style={{ boxShadow: `0 0 ${8 + glow / 4}px rgba(204,255,0,${glow / 180})` }}
            >
              <div
                className="mb-3 h-16 rounded-2xl"
                style={{
                  background: `rgba(204,255,0,${0.08 + glow / 140})`,
                  boxShadow: entry ? 'inset 0 0 24px rgba(204,255,0,0.35)' : undefined,
                }}
              />
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#CCFF00]">
                {entry ? `#${entry.tokenId}` : 'Unlit'}
              </p>
              <p className="mt-1 text-sm font-semibold">
                {entry
                  ? entry.stallProjectId
                    ? `Stall · ${entry.stallProjectId}`
                    : squareLoopPhaseLabel(entry.phase)
                  : 'Empty bay'}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
