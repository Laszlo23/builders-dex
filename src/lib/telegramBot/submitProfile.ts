import { announceVoteCard } from './announce';
import {
  createTokenProfile,
  getTokenByTicker,
  normalizeTicker,
  setTokenStatus,
} from './repo';
import { getSqlite } from '../db/sqlite';
import type { TokenProfile } from './types';
import { isChainId, isValidContract } from './chains';
import {
  defaultBigBuyUsd,
  isHttpsUrl,
  normalizeSocialUrl,
} from './validators';

export type SubmitProfileBody = {
  chatId: number | string;
  ticker: string;
  name: string;
  chain?: string;
  mint: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  website?: string;
  twitter?: string;
  telegramUrl?: string;
  discord?: string;
  bigBuyUsd?: number;
  createdByUserId?: number;
};

export type SubmitResult =
  | { ok: true; profile: TokenProfile }
  | { ok: false; error: string; code: number };

export function submitTokenProfile(body: SubmitProfileBody): SubmitResult {
  const chatId = Number(body.chatId);
  if (!Number.isFinite(chatId)) {
    return { ok: false, error: 'chatId required (use /chatid in your Telegram group)', code: 400 };
  }
  const knownChat = getSqlite()
    .prepare(`SELECT chat_id FROM chats WHERE chat_id = ?`)
    .get(chatId) as { chat_id: number } | undefined;
  if (!knownChat) {
    return {
      ok: false,
      error: 'Unknown chat — add the bot to the group and run /chatid first',
      code: 403,
    };
  }

  const ticker = normalizeTicker(body.ticker || '');
  if (!/^[A-Z0-9]{2,16}$/.test(ticker)) {
    return { ok: false, error: 'Invalid ticker (2–16 A–Z / 0–9)', code: 400 };
  }

  const name = String(body.name || '').trim().slice(0, 80);
  if (name.length < 2) {
    return { ok: false, error: 'Token name required', code: 400 };
  }

  const chainRaw = String(body.chain || 'solana').trim().toLowerCase();
  if (!isChainId(chainRaw)) {
    return { ok: false, error: 'Unsupported blockchain', code: 400 };
  }
  const mint = String(body.mint || '').trim();
  if (!isValidContract(chainRaw, mint)) {
    return {
      ok: false,
      error: `Contract address is not valid for ${chainRaw}`,
      code: 400,
    };
  }

  const description = String(body.description || '').trim().slice(0, 500);
  if (description.length < 8) {
    return { ok: false, error: 'Description must be at least 8 characters', code: 400 };
  }

  const logoUrl = String(body.logoUrl || '').trim();
  const bannerUrl = String(body.bannerUrl || '').trim();
  if (!isHttpsUrl(logoUrl)) {
    return { ok: false, error: 'Logo must be an https:// image URL', code: 400 };
  }
  if (!isHttpsUrl(bannerUrl)) {
    return { ok: false, error: 'Banner must be an https:// image URL', code: 400 };
  }

  const website = body.website
    ? normalizeSocialUrl(body.website, 'website')
    : null;
  const twitter = body.twitter
    ? normalizeSocialUrl(body.twitter, 'twitter')
    : null;
  const telegramUrl = body.telegramUrl
    ? normalizeSocialUrl(body.telegramUrl, 'telegram')
    : null;
  const discord = body.discord
    ? normalizeSocialUrl(body.discord, 'discord')
    : null;

  if (body.website && !website) {
    return { ok: false, error: 'Invalid website URL', code: 400 };
  }
  if (body.twitter && !twitter) {
    return { ok: false, error: 'Invalid X/Twitter handle or URL', code: 400 };
  }
  if (body.telegramUrl && !telegramUrl) {
    return { ok: false, error: 'Invalid Telegram link', code: 400 };
  }
  if (body.discord && !discord) {
    return { ok: false, error: 'Invalid Discord invite/URL', code: 400 };
  }

  if (getTokenByTicker(chatId, ticker)) {
    return { ok: false, error: `$${ticker} already exists in that chat`, code: 409 };
  }

  const bigBuy =
    typeof body.bigBuyUsd === 'number' && body.bigBuyUsd > 0
      ? body.bigBuyUsd
      : defaultBigBuyUsd();

  try {
    const created = createTokenProfile({
      chatId,
      chatTitle: `Chat ${chatId}`,
      ticker,
      name,
      chain: chainRaw,
      mint,
      description,
      logoUrl,
      bannerUrl,
      website,
      twitter,
      telegramUrl,
      discord,
      bigBuyUsd: bigBuy,
      servingBotKey: 'platform',
      createdByUserId:
        typeof body.createdByUserId === 'number' ? body.createdByUserId : 0,
    });
    const profile = setTokenStatus(created.id, 'voting')!;
    // Fire-and-forget vote post in the Telegram group
    void announceVoteCard(profile);
    return { ok: true, profile };
  } catch (err: unknown) {
    const msg = String((err as Error)?.message || err);
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return { ok: false, error: `$${ticker} already exists`, code: 409 };
    }
    throw err;
  }
}
