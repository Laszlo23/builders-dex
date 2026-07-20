import React, { useEffect, useRef } from 'react';

type Props = {
  /** hero = brighter blooms; app = subtler ambient */
  variant?: 'hero' | 'app';
  className?: string;
};

/**
 * Cinematic atmosphere: mesh light, drifting orbs, grid, film grain, cursor spotlight.
 */
export default function Atmosphere({ variant = 'app', className = '' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const spot = spotRef.current;
    if (!root || !spot) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      spot.style.transform = `translate(${cx - 280}px, ${cy - 280}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const bloomStrength = variant === 'hero' ? 0.55 : 0.32;

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {/* Cursor spotlight */}
      <div
        ref={spotRef}
        className="absolute left-0 top-0 h-[560px] w-[560px] rounded-full opacity-60 mix-blend-screen will-change-transform"
        style={{
          background: `radial-gradient(circle, rgba(200, 232, 104,${bloomStrength * 0.18}) 0%, transparent 62%)`,
        }}
      />

      {/* Volumetric champagne blooms */}
      <div
        className="atm-orb absolute -left-[20%] top-[10%] h-[55vh] w-[55vh] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, rgba(200, 232, 104,${bloomStrength * 0.55}) 0%, transparent 70%)`,
          animationDelay: '0s',
        }}
      />
      <div
        className="atm-orb absolute -right-[15%] top-[35%] h-[45vh] w-[45vh] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, rgba(160, 190, 80,${bloomStrength * 0.35}) 0%, transparent 70%)`,
          animationDelay: '-4s',
        }}
      />
      <div
        className="atm-orb absolute bottom-[-10%] left-[30%] h-[40vh] w-[50vh] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, rgba(255,255,255,${bloomStrength * 0.12}) 0%, transparent 70%)`,
          animationDelay: '-8s',
        }}
      />

      {/* Perspective grid floor */}
      <div className="atm-grid absolute inset-x-0 bottom-0 h-[55%]" />

      {/* Horizon light line */}
      <div className="absolute inset-x-0 top-[42%] h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent opacity-70" />
      <div className="absolute inset-x-[15%] top-[42%] h-8 bg-gradient-to-b from-accent/15 to-transparent blur-xl" />

      {/* Film grain */}
      <div className="atm-grain absolute inset-0 opacity-[0.12] mix-blend-overlay" />
    </div>
  );
}
