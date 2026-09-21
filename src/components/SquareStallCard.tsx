import React from 'react';
import { Store } from 'lucide-react';
import { FIRST_STALL_NAME, FIRST_STALL_PROJECT_ID } from '../data/squareLoop';
import { isBuildLoopLive } from '../data/buildToken';

type Props = {
  projectId: string;
  projectName: string;
  setCurrentPath: (path: string, state?: { buy?: string | null; stall?: string | null }) => void;
};

export default function SquareStallCard({ projectId, projectName, setCurrentPath }: Props) {
  const first = projectId === FIRST_STALL_PROJECT_ID;
  if (!first) return null;

  return (
    <div className="rounded-3xl border border-[#CCFF00]/35 bg-[#CCFF00]/[0.06] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#CCFF00]">
        Square stall
      </p>
      <h3 className="font-display mt-1 text-lg font-bold">{FIRST_STALL_NAME}</h3>
      <p className="mt-2 text-xs leading-relaxed text-steel">
        Park an activated CCFF00 Square, then take a stall on {projectName}. The share NFT sits in
        the Square TBA. {isBuildLoopLive()
          ? 'Stall vault is published — sign from the Square loop.'
          : 'Vault is not deployed yet. Preview the stall, then mint the live Aura share as the Square.'}
      </p>
      <button
        type="button"
        onClick={() => setCurrentPath('ccff00', { buy: 'p5', stall: '1' })}
        className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#CCFF00] text-xs font-bold text-ink"
      >
        <Store className="h-3.5 w-3.5" /> Take stall · mint as Square
      </button>
      <button
        type="button"
        onClick={() => setCurrentPath('earn')}
        className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[#CCFF00]/40 text-xs font-semibold text-[#CCFF00]"
      >
        Square loop preview
      </button>
    </div>
  );
}
