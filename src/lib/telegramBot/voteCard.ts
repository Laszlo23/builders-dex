import { InlineKeyboard } from 'grammy';
import type { TokenProfile } from './types';
import { getTrendThreshold } from './repo';
import { getChain } from './chains';

export function appBaseUrl(): string {
  return (process.env.APP_URL || 'https://dex.buildingcultureid.space').replace(
    /\/$/,
    '',
  );
}

export function voteMiniAppUrl(): string {
  return `${appBaseUrl()}/tg`;
}

export function voteDeepLink(token: TokenProfile): string {
  const u = new URL(`${appBaseUrl()}/tg`);
  u.searchParams.set('token', String(token.id));
  u.searchParams.set('chat', String(token.chat_id));
  return u.toString();
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function shortAddr(addr: string): string {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function httpsUrl(url: string | null | undefined): string | null {
  if (!url || !/^https:\/\//i.test(url.trim())) return null;
  return url.trim();
}

/** Marketing keyboard — vote + project links */
export function voteCardKeyboard(token: TokenProfile): InlineKeyboard {
  const kb = new InlineKeyboard().text('▲ Back this builder', `upvote:${token.ticker}`);

  const chain = getChain(token.chain);
  const links: { label: string; url: string }[] = [];
  const website = httpsUrl(token.website);
  const twitter = httpsUrl(token.twitter);
  const telegramUrl = httpsUrl(token.telegram_url);
  const discord = httpsUrl(token.discord);
  if (website) links.push({ label: '🌐 Website', url: website });
  if (twitter) links.push({ label: '𝕏 Twitter', url: twitter });
  if (telegramUrl) links.push({ label: '✈️ Telegram', url: telegramUrl });
  if (discord) links.push({ label: '💬 Discord', url: discord });
  if (token.mint) {
    links.push({ label: '🔎 Contract', url: chain.explorerToken(token.mint) });
  }

  for (let i = 0; i < links.length; i += 2) {
    kb.row();
    const a = links[i]!;
    kb.url(a.label, a.url);
    const b = links[i + 1];
    if (b) kb.url(b.label, b.url);
  }

  kb.row().webApp('🗳️ Open vote card', voteDeepLink(token));
  return kb;
}

/**
 * Rich HTML caption for the banner — marketing spotlight, not a dry form dump.
 * Telegram caption limit: 1024 chars.
 */
export function voteCardCaptionHtml(token: TokenProfile): string {
  const threshold = getTrendThreshold();
  const remaining = Math.max(0, threshold - token.vote_count);
  const chain = getChain(token.chain);
  const desc = (token.description || '').trim().slice(0, 280);

  const lines: string[] = [
    '✦ <b>COMMUNITY SPOTLIGHT</b> ✦',
    '',
    `<b>$${esc(token.ticker)}</b> · ${esc(token.name)}`,
    `<i>${esc(chain.label)}</i>`,
    '',
  ];

  if (desc) {
    lines.push(esc(desc), '');
  }

  lines.push('<b>Why it matters</b>');
  lines.push(
    'This builder asked the community for signal — not ads. Your upvote puts them on Builders DEX <b>Community Trending</b>.',
    '',
  );

  if (token.mint) {
    lines.push(`<b>Contract</b> <code>${esc(shortAddr(token.mint))}</code>`);
  }

  const socialBits: string[] = [];
  if (token.website) socialBits.push('Web');
  if (token.twitter) socialBits.push('X');
  if (token.telegram_url) socialBits.push('TG');
  if (token.discord) socialBits.push('Discord');
  if (socialBits.length) {
    lines.push(`<b>Links</b> ${socialBits.join(' · ')} — use the buttons below`);
  }

  lines.push('');
  if (token.status === 'trending') {
    lines.push(`🔥 <b>Trending</b> · ${token.vote_count} community votes`);
  } else {
    lines.push(
      `📊 <b>${token.vote_count}</b> / ${threshold} votes` +
        (remaining > 0 ? ` · <i>${remaining} to trending</i>` : ''),
    );
  }

  lines.push('');
  lines.push('Tap <b>▲ Back this builder</b> — one vote per member.');
  lines.push('<i>Community signal — not curated for trade.</i>');

  let html = lines.join('\n');
  if (html.length > 1024) {
    html = `${html.slice(0, 1020)}…`;
  }
  return html;
}

/** @deprecated use voteCardCaptionHtml — kept for any text-only fallbacks */
export function voteCardText(token: TokenProfile): string {
  // Plain-ish fallback without HTML tags for rare text posts
  const threshold = getTrendThreshold();
  const chain = getChain(token.chain);
  return [
    `✦ COMMUNITY SPOTLIGHT ✦`,
    `$${token.ticker} · ${token.name}`,
    chain.label,
    token.description?.slice(0, 200) || '',
    token.mint ? `Contract: ${shortAddr(token.mint)}` : '',
    `${token.vote_count}/${threshold} votes`,
    'Tap ▲ Back this builder',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 1024);
}

export function logoCaptionHtml(token: TokenProfile): string {
  return `🪙 <b>$${esc(token.ticker)}</b>\n${esc(token.name)}`;
}

export function spotlightIntroHtml(token: TokenProfile): string {
  const chain = getChain(token.chain);
  return [
    '🚀 <b>New builder drop in the community</b>',
    '',
    `<b>$${esc(token.ticker)}</b> just listed on <b>${esc(chain.label)}</b>.`,
    'Scroll for the banner, story, and one-tap upvote ↓',
  ].join('\n');
}

export function welcomeNewGroupText(): string {
  const threshold = getTrendThreshold();
  return [
    '*Builders DEX Token Bot* is in this community.',
    '',
    '*Community managers*',
    '1. `/newtoken` — use the menu (Chain, Logo, Banner, Contract, …)',
    '2. Tap *Publish* → I post a marketing spotlight (logo + banner + links)',
    `3. Members tap *▲ Back this builder* — at ${threshold} votes → Community Trending`,
    '',
    'Members do not need commands — just press the button on the vote post.',
    '',
    '_Community signal — not curated for trade._',
  ].join('\n');
}

/** Inline keyboard JSON for raw Telegram HTTP API */
export function voteCardReplyMarkupJson(token: TokenProfile) {
  return { inline_keyboard: voteCardKeyboard(token).inline_keyboard };
}
