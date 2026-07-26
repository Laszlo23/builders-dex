import { isValidContract } from './chains';

export function isHttpsUrl(raw: string, maxLen = 500): boolean {
  const s = raw.trim();
  if (!s || s.length > maxLen) return false;
  try {
    const u = new URL(s);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeSocialUrl(
  raw: string,
  kind: 'website' | 'twitter' | 'telegram' | 'discord',
): string | null {
  const s = raw.trim();
  if (!s || s.toLowerCase() === 'skip' || s === '-') return null;
  if (isHttpsUrl(s)) return s.slice(0, 500);

  switch (kind) {
    case 'twitter': {
      const handle = s.replace(/^@/, '');
      if (/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
        return `https://x.com/${handle}`;
      }
      return null;
    }
    case 'telegram': {
      const handle = s.replace(/^@/, '').replace(/^https?:\/\/t\.me\//i, '');
      if (/^[A-Za-z0-9_]{3,64}$/.test(handle)) {
        return `https://t.me/${handle}`;
      }
      return null;
    }
    case 'discord': {
      if (/^[A-Za-z0-9]+$/.test(s) && s.length < 40) {
        return `https://discord.gg/${s}`;
      }
      return null;
    }
    case 'website':
      if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(s)) {
        return `https://${s.replace(/^\/\//, '')}`.slice(0, 500);
      }
      return null;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** @deprecated use isValidContract(chain, address) */
export function isValidMint(mint: string, chain = 'solana'): boolean {
  return isValidContract(chain, mint);
}

export function defaultBigBuyUsd(): number {
  const n = Number(process.env.TELEGRAM_BIG_BUY_USD || 1000);
  return Number.isFinite(n) && n > 0 ? n : 1000;
}
