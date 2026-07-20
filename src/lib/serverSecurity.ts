/**
 * Lightweight Express security helpers for Builders DEX API.
 * No extra deps — headers, rate limits, input caps.
 */

import type { Request, Response, NextFunction } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';

/** Security headers for all responses */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  if (IS_PROD) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function clientKey(req: Request): string {
  const xf = req.headers['x-forwarded-for'];
  const forwarded = typeof xf === 'string' ? xf.split(',')[0]?.trim() : '';
  return forwarded || req.socket.remoteAddress || 'unknown';
}

/**
 * Simple fixed-window rate limiter.
 * @param max requests per window
 * @param windowMs window length
 */
export function rateLimit(max: number, windowMs: number, name: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${name}:${clientKey(req)}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now >= b.resetAt) {
      b = { count: 0, resetAt: now + windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - b.count)));
    if (b.count > max) {
      const retry = Math.ceil((b.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retry));
      return res.status(429).json({ error: 'Too many requests. Slow down and try again.' });
    }
    next();
  };
}

/** Periodically prune rate-limit buckets */
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(k);
  }
}, 60_000).unref?.();

export function safeErrorMessage(error: unknown, fallback: string): string {
  if (!IS_PROD && error instanceof Error && error.message) {
    // Never leak secrets even in dev
    const msg = error.message;
    if (/api[_-]?key|secret|token|password|GEMINI|JUPITER|NEYNAR/i.test(msg)) {
      return fallback;
    }
    return msg.slice(0, 200);
  }
  return fallback;
}

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '::1', '0.0.0.0']);

/** Avantis sidecar must stay on loopback to avoid SSRF */
export function assertLoopbackUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('Invalid sidecar URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Sidecar URL must be http(s)');
  }
  if (!LOOPBACK.has(url.hostname)) {
    throw new Error('Sidecar URL must be loopback only');
  }
  return url.origin;
}

export const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
export const AMOUNT_RE = /^\d{1,18}$/;
export const REQUEST_ID_RE = /^[a-zA-Z0-9_-]{8,128}$/;
export const BASE64_RE = /^[A-Za-z0-9+/]+=*$/;
export const CANDLE_INTERVALS = new Set([
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '6h',
  '12h',
  '1d',
]);

export const MAX_SLIPPAGE_BPS = 500; // 5%
export const MAX_SIGNED_TX_CHARS = 24_000;
export const MAX_AI_MESSAGES = 24;
export const MAX_AI_MESSAGE_CHARS = 4_000;
export const MAX_FEEDBACK_CHARS = 4_000;

export function sanitizeChatMessages(
  messages: unknown
): { role: 'user' | 'model'; content: string }[] | null {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_AI_MESSAGES) {
    return null;
  }
  const out: { role: 'user' | 'model'; content: string }[] = [];
  for (const m of messages) {
    if (!m || typeof m !== 'object') return null;
    const role = (m as { role?: string }).role;
    const content = (m as { content?: string }).content;
    if (role !== 'user' && role !== 'model') return null;
    if (typeof content !== 'string') return null;
    const trimmed = content.trim().slice(0, MAX_AI_MESSAGE_CHARS);
    if (!trimmed) continue;
    out.push({ role, content: trimmed });
  }
  return out.length ? out : null;
}

export function clampSlippageBps(raw: string | undefined): string | undefined {
  if (!raw || !/^\d+$/.test(raw)) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return String(Math.min(MAX_SLIPPAGE_BPS, Math.floor(n)));
}
