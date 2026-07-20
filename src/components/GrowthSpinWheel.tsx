import React, { useEffect, useMemo, useState } from 'react';
import { Dices, Timer, Sparkles } from 'lucide-react';
import {
  SPIN_PRIZES,
  canSpin,
  formatSpinCooldown,
  getLastSpinAt,
  msUntilNextSpin,
  pickPrizeIndex,
  setLastSpinAt,
  SpinPrize,
} from '../data/growthWheel';

type Props = {
  onWin: (prize: SpinPrize) => void;
};

const SEG = SPIN_PRIZES.length;
const SEG_DEG = 360 / SEG;

export default function GrowthSpinWheel({ onWin }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [lastPrize, setLastPrize] = useState<SpinPrize | null>(null);

  const ready = canSpin(now);
  const remaining = msUntilNextSpin(now);

  useEffect(() => {
    if (ready && !spinning) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [ready, spinning]);

  const conic = useMemo(() => {
    const stops: string[] = [];
    SPIN_PRIZES.forEach((p, i) => {
      const a0 = i * SEG_DEG;
      const a1 = (i + 1) * SEG_DEG;
      const c = i % 2 === 0 ? 'rgba(200,232,104,0.22)' : 'rgba(255,255,255,0.06)';
      const jack = p.id === 'xp150' ? 'rgba(200,232,104,0.45)' : c;
      stops.push(`${jack} ${a0}deg ${a1}deg`);
    });
    return `conic-gradient(from -90deg, ${stops.join(', ')})`;
  }, []);

  const spin = () => {
    if (!ready || spinning) return;
    const prizeIdx = pickPrizeIndex();
    const prize = SPIN_PRIZES[prizeIdx];
    // Pointer at top; segment center = prizeIdx * SEG + SEG/2 from -90deg baseline
    const segmentCenter = prizeIdx * SEG_DEG + SEG_DEG / 2;
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const target = extraTurns * 360 + (360 - segmentCenter);
    setSpinning(true);
    setLastPrize(null);
    setRotation((prev) => prev + target);

    window.setTimeout(() => {
      setLastSpinAt(Date.now());
      setNow(Date.now());
      setSpinning(false);
      setLastPrize(prize);
      onWin(prize);
    }, 4200);
  };

  const lastAt = getLastSpinAt();

  return (
    <section
      id="growth-spin-wheel"
      className="overflow-hidden rounded-[1.75rem] border border-accent/30 bg-gradient-to-b from-accent/10 via-surface to-ink p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            <Dices className="h-3.5 w-3.5" />
            Daily Growth Wheel
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Spin once every 24h
          </h2>
          <p className="mt-2 max-w-md text-sm text-steel">
            Member growth lottery — XP for showing up. Come back tomorrow for another spin.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink/50 px-4 py-3 text-right">
          <p className="font-mono text-[9px] uppercase text-steel">Cooldown</p>
          {ready ? (
            <p className="mt-0.5 font-display text-lg font-bold text-accent">Ready</p>
          ) : (
            <p className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-sm text-white">
              <Timer className="h-3.5 w-3.5 text-accent" />
              {formatSpinCooldown(remaining)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-12">
        <div className="relative h-64 w-64 sm:h-72 sm:w-72">
          {/* Pointer */}
          <div
            className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-0.5"
            aria-hidden
          >
            <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-accent drop-shadow-[0_2px_8px_rgba(200,232,104,0.5)]" />
          </div>

          <div
            className="absolute inset-2 rounded-full border-2 border-accent/40 shadow-[0_0_40px_-8px_rgba(200,232,104,0.35)]"
            style={{
              background: conic,
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? 'transform 4.2s cubic-bezier(0.12, 0.75, 0.08, 1)'
                : 'none',
            }}
          >
            {SPIN_PRIZES.map((p, i) => {
              const mid = i * SEG_DEG + SEG_DEG / 2;
              return (
                <span
                  key={p.id}
                  className="absolute left-1/2 top-1/2 origin-center font-mono text-[9px] font-bold uppercase tracking-wide text-white sm:text-[10px]"
                  style={{
                    transform: `rotate(${mid - 90}deg) translate(0, -5.5rem) rotate(${90 - mid}deg)`,
                    width: '3.5rem',
                    marginLeft: '-1.75rem',
                    textAlign: 'center',
                    color: p.id === 'xp150' ? '#07080A' : undefined,
                  }}
                >
                  {p.short}
                </span>
              );
            })}
            <div className="absolute inset-[28%] rounded-full border border-white/15 bg-ink/90" />
            <div className="absolute inset-[38%] flex items-center justify-center rounded-full border border-accent/30 bg-ink">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-4 text-center lg:text-left">
          <button
            type="button"
            disabled={!ready || spinning}
            onClick={spin}
            className="btn-sheen w-full rounded-full bg-accent py-3.5 text-sm font-bold text-ink hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-45"
          >
            {spinning ? 'Spinning…' : ready ? 'Spin the wheel' : 'Come back in 24h'}
          </button>

          {lastPrize && (
            <div className="rounded-2xl border border-accent/35 bg-accent/10 px-4 py-3">
              <p className="font-mono text-[10px] uppercase text-accent">You won</p>
              <p className="font-display mt-1 text-xl font-bold">{lastPrize.label}</p>
            </div>
          )}

          {!ready && !spinning && lastAt && (
            <p className="text-xs text-steel">
              Last spin locked in. Next unlock in {formatSpinCooldown(remaining)}.
            </p>
          )}

          <ul className="grid grid-cols-2 gap-1.5 text-left font-mono text-[10px] text-steel">
            {SPIN_PRIZES.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-white/8 bg-ink/40 px-2 py-1.5 text-white/80"
              >
                {p.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
