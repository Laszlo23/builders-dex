import React, { useEffect, useRef } from 'react';

const RGB = { r: 204, g: 255, b: 0 };

type Floater = {
  x: number;
  y: number;
  size: number;
  phase: number;
  spin: number;
  spinSpeed: number;
  drift: number;
  depth: number;
};

type Hero = {
  x: number;
  y: number;
  size: number;
  spin: number;
  spinSpeed: number;
  phase: number;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeFloaters(count: number, rand: () => number): Floater[] {
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    size: 5 + rand() * 18,
    phase: rand() * Math.PI * 2,
    spin: rand() * Math.PI,
    spinSpeed: (rand() - 0.5) * 0.18,
    drift: 0.008 + rand() * 0.018,
    depth: 0.25 + rand() * 0.75,
  }));
}

function makeHeroes(rand: () => number): Hero[] {
  return [
    { x: 0.82, y: 0.22, size: 92, spin: 0.35, spinSpeed: 0.12, phase: rand() },
    { x: 0.12, y: 0.58, size: 58, spin: -0.4, spinSpeed: -0.09, phase: rand() },
    { x: 0.9, y: 0.74, size: 34, spin: 0.8, spinSpeed: 0.16, phase: rand() },
    { x: 0.28, y: 0.18, size: 22, spin: 0.2, spinSpeed: -0.14, phase: rand() },
  ];
}

function fillSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rot: number,
  alpha: number,
  glow: number,
) {
  if (alpha < 0.01 || size < 0.5) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  if (glow > 0.04) {
    ctx.shadowColor = `rgba(${RGB.r},${RGB.g},${RGB.b},${Math.min(0.85, glow)})`;
    ctx.shadowBlur = 18 + glow * 28;
  }
  ctx.fillStyle = `rgba(${RGB.r},${RGB.g},${RGB.b},${alpha})`;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.28})`;
  ctx.lineWidth = Math.max(0.6, size * 0.03);
  ctx.beginPath();
  ctx.moveTo(-size / 2, size / 2);
  ctx.lineTo(-size / 2, -size / 2);
  ctx.lineTo(size / 2, -size / 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(0,0,0,${alpha * 0.22})`;
  ctx.beginPath();
  ctx.moveTo(size / 2, -size / 2);
  ctx.lineTo(size / 2, size / 2);
  ctx.lineTo(-size / 2, size / 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Site-wide CCFF00 Square field — identical tiles, slow breath, living street.
 */
export default function Ccff00Field() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 640px)').matches;
    const rand = mulberry32(0xccff00);
    const floaters = makeFloaters(mobile ? 18 : 28, rand);
    const heroes = makeHeroes(rand);

    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let t0 = performance.now();
    let rippleT = 2.4;
    let rippleX = 0.72;
    let rippleY = 0.3;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawStreet = (now: number) => {
      const rows = mobile ? 9 : 12;
      const cols = mobile ? 9 : 13;
      const horizon = h * 0.38;
      for (let r = 0; r < rows; r += 1) {
        const depth = (r + 1) / rows;
        const y = horizon + depth * depth * (h * 0.7);
        const size = 6 + depth * 34;
        const gap = 8 + depth * 22;
        const rowPulse = 0.55 + 0.45 * Math.sin(now * 0.7 + r * 0.55);
        for (let c = 0; c < cols; c += 1) {
          const x = w / 2 + (c - (cols - 1) / 2) * (size + gap);
          if (x < -size || x > w + size) continue;
          const dx = x / w - rippleX;
          const dy = y / h - rippleY;
          const dist = Math.hypot(dx * 1.4, dy);
          const wave = Math.abs(dist - (now - rippleT) * 0.22);
          const ripple = wave < 0.08 ? (1 - wave / 0.08) * 0.55 : 0;
          const alpha = (0.04 + depth * 0.16) * rowPulse + ripple * 0.28;
          fillSquare(ctx, x, y, size, 0, alpha, depth * 0.2 + ripple * 0.55);
        }
      }
    };

    const drawFloaters = (now: number, dt: number) => {
      for (const f of floaters) {
        f.y -= f.drift * dt * 0.045;
        f.x += Math.sin(now * 0.22 + f.phase) * 0.00012;
        if (f.y < -0.08) {
          f.y = 1.08;
          f.x = rand();
        }
        f.spin += f.spinSpeed * dt * 0.0012;
        const px = f.x * w + Math.sin(now * 0.15 + f.phase) * 18;
        const py = f.y * h;
        const breath = 0.5 + 0.5 * Math.sin(now * 1.1 + f.phase);
        const alpha = (0.07 + f.depth * 0.2) * (0.55 + breath * 0.45);
        fillSquare(ctx, px, py, f.size * (0.85 + f.depth * 0.4), f.spin, alpha, f.depth * 0.2);
      }
    };

    const drawHeroes = (now: number, dt: number) => {
      for (const hero of heroes) {
        hero.spin += hero.spinSpeed * dt * 0.0009;
        const breath = 0.5 + 0.5 * Math.sin(now * 0.85 + hero.phase * 6);
        const px = hero.x * w;
        const py = hero.y * h + Math.sin(now * 0.4 + hero.phase) * 10;
        fillSquare(
          ctx,
          px,
          py,
          hero.size * (0.94 + breath * 0.06),
          hero.spin,
          0.28 + breath * 0.16,
          0.62 + breath * 0.38,
        );
      }
    };

    const frame = (stamp: number) => {
      if (!running) return;
      const now = (stamp - t0) / 1000;
      const dt = 16.6;
      if (now - rippleT > 7.2) {
        rippleT = now;
        const hero = heroes[Math.floor(rand() * heroes.length)] ?? heroes[0];
        rippleX = hero.x;
        rippleY = hero.y;
      }
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * 0.72, h * 0.18, 20, w * 0.55, h * 0.4, Math.max(w, h) * 0.85);
      g.addColorStop(0, 'rgba(204,255,0,0.11)');
      g.addColorStop(0.45, 'rgba(204,255,0,0.03)');
      g.addColorStop(1, 'rgba(7,8,10,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      drawStreet(now);
      drawFloaters(now, dt);
      drawHeroes(now, dt);
      raf = requestAnimationFrame(frame);
    };

    const paintStatic = () => {
      ctx.clearRect(0, 0, w, h);
      drawStreet(1.2);
      drawHeroes(1.2, 0);
      drawFloaters(1.2, 0);
    };

    const onVis = () => {
      if (document.hidden || reduce) {
        running = false;
        cancelAnimationFrame(raf);
        return;
      }
      if (!running) {
        running = true;
        t0 = performance.now() - 1000;
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    if (reduce) {
      paintStatic();
    } else {
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div className="ccff00-field" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  );
}
