/**
 * Scout referral codes — wallet-stable when connected, device-local otherwise.
 * Inbound `?ref=` is captured once and never overwritten.
 */

const CODE_KEY = 'bdx_ref_code';
const INBOUND_KEY = 'bdx_ref_inbound';
const CODE_RE = /^[a-z0-9]{6,12}$/i;
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

let currentWallet: string | null = null;

export function setReferralWallet(wallet: string | null | undefined): void {
  currentWallet = wallet?.trim() || null;
}

export function isReferralCode(value: string | null | undefined): value is string {
  return Boolean(value && CODE_RE.test(value));
}

function mixSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function codeFromSeed(seed: string): string {
  let n = mixSeed(seed.toLowerCase());
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[n % ALPHABET.length];
    n = Math.imul(n ^ (n >>> 16), 2246822519) >>> 0;
  }
  return out;
}

function persistOwnCode(code: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CODE_KEY, code);
  } catch {
    /* ignore quota */
  }
}

function randomCode(): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

/** Stable scout code for the current visitor. */
export function getOrCreateScoutCode(wallet: string | null = currentWallet): string {
  if (wallet) {
    const code = codeFromSeed(wallet);
    persistOwnCode(code);
    return code;
  }
  if (typeof window !== 'undefined') {
    try {
      const existing = window.localStorage.getItem(CODE_KEY);
      if (isReferralCode(existing)) return existing;
    } catch {
      /* ignore */
    }
  }
  const code = randomCode();
  persistOwnCode(code);
  return code;
}

export function getInboundReferral(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(INBOUND_KEY);
    return isReferralCode(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Persist the first inbound `ref` that is not the visitor's own code. */
export function captureInboundReferral(search?: string): string | null {
  if (typeof window === 'undefined') return getInboundReferral();
  const q = new URLSearchParams(
    search ?? window.location.search.replace(/^\?/, ''),
  );
  const incoming = (q.get('ref') || q.get('r') || '').trim().toLowerCase();
  if (!isReferralCode(incoming)) return getInboundReferral();
  const own = getOrCreateScoutCode();
  if (incoming === own) return getInboundReferral();
  const already = getInboundReferral();
  if (already) return already;
  try {
    window.localStorage.setItem(INBOUND_KEY, incoming);
  } catch {
    /* ignore */
  }
  return incoming;
}

export function withReferralParam(url: string, code = getOrCreateScoutCode()): string {
  const parsed = new URL(url, 'https://dex.buildingcultureid.space');
  if (isReferralCode(code)) parsed.searchParams.set('ref', code);
  return parsed.toString();
}
