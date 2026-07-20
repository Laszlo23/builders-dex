/** Daily Growth Wheel — one spin every 24 hours */

export const SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const SPIN_STORAGE_KEY = 'bdx_last_growth_spin';

export type SpinPrize = {
  id: string;
  label: string;
  /** Short chip on the wheel */
  short: string;
  xp: number;
  /** Accent segment tint (CSS color) */
  tint: string;
};

export const SPIN_PRIZES: SpinPrize[] = [
  { id: 'xp40', label: '+40 XP', short: '40 XP', xp: 40, tint: '#1a1f14' },
  { id: 'xp80', label: '+80 XP', short: '80 XP', xp: 80, tint: '#243018' },
  { id: 'xp120', label: '+120 XP', short: '120', xp: 120, tint: '#2e3a1c' },
  { id: 'scout', label: '+60 XP · Scout boost', short: 'SCOUT', xp: 60, tint: '#1a1f14' },
  { id: 'xp25', label: '+25 XP', short: '25 XP', xp: 25, tint: '#243018' },
  { id: 'signal', label: '+90 XP · Signal', short: 'SIGNAL', xp: 90, tint: '#2e3a1c' },
  { id: 'xp150', label: '+150 XP · Jackpot', short: 'JACKPOT', xp: 150, tint: '#C8E868' },
  { id: 'xp55', label: '+55 XP', short: '55 XP', xp: 55, tint: '#1a1f14' },
];

export function getLastSpinAt(): number | null {
  try {
    const raw = localStorage.getItem(SPIN_STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function setLastSpinAt(ts: number = Date.now()): void {
  try {
    localStorage.setItem(SPIN_STORAGE_KEY, String(ts));
  } catch {
    /* ignore */
  }
}

export function msUntilNextSpin(now = Date.now()): number {
  const last = getLastSpinAt();
  if (last == null) return 0;
  return Math.max(0, last + SPIN_COOLDOWN_MS - now);
}

export function canSpin(now = Date.now()): boolean {
  return msUntilNextSpin(now) === 0;
}

export function formatSpinCooldown(ms: number): string {
  if (ms <= 0) return 'Ready';
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Weighted random prize index — jackpot rarer */
export function pickPrizeIndex(): number {
  const weights = SPIN_PRIZES.map((p) => (p.id === 'xp150' ? 1 : p.id === 'xp120' ? 2 : 4));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return 0;
}
