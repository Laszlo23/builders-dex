import { InlineKeyboard } from 'grammy';
import type { TokenProfile } from './types';
import { getTrendThreshold, getVoteCooldownHours } from './repo';
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

export function dexTrendingUrl(): string {
  return `${appBaseUrl()}/#explore`;
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
  const raw = url?.trim();
  if (!raw || !/^https:\/\//i.test(raw)) return null;
  // Telegram rejects some button URLs if the scheme casing is weird (e.g. Https://)
  return raw.replace(/^https:\/\//i, 'https://');
}

/** DexScreener path segment for a Builders DEX chain id */
function dexscreenerNetwork(chainId: string): string {
  const map: Record<string, string> = {
    solana: 'solana',
    ethereum: 'ethereum',
    base: 'base',
    bsc: 'bsc',
    polygon: 'polygon',
    arbitrum: 'arbitrum',
    avalanche: 'avalanche',
    optimism: 'optimism',
    sui: 'sui',
    ton: 'ton',
  };
  return map[chainId] || 'solana';
}

export function chartUrl(token: TokenProfile): string | null {
  if (!token.mint) return null;
  return `https://dexscreener.com/${dexscreenerNetwork(token.chain)}/${token.mint}`;
}

export function buyUrl(token: TokenProfile): string | null {
  if (!token.mint) return null;
  if (token.chain === 'solana') {
    return `https://jup.ag/swap/SOL-${encodeURIComponent(token.mint)}`;
  }
  if (token.chain === 'base') {
    return `https://app.uniswap.org/swap?chain=base&outputCurrency=${encodeURIComponent(token.mint)}`;
  }
  if (token.chain === 'ethereum') {
    return `https://app.uniswap.org/swap?chain=mainnet&outputCurrency=${encodeURIComponent(token.mint)}`;
  }
  if (token.chain === 'arbitrum') {
    return `https://app.uniswap.org/swap?chain=arbitrum&outputCurrency=${encodeURIComponent(token.mint)}`;
  }
  if (token.chain === 'optimism') {
    return `https://app.uniswap.org/swap?chain=optimism&outputCurrency=${encodeURIComponent(token.mint)}`;
  }
  if (token.chain === 'polygon') {
    return `https://app.uniswap.org/swap?chain=polygon&outputCurrency=${encodeURIComponent(token.mint)}`;
  }
  if (token.chain === 'bsc') {
    return `https://pancakeswap.finance/swap?outputCurrency=${encodeURIComponent(token.mint)}`;
  }
  return chartUrl(token);
}

/**
 * Buy-bot style keyboard: Chart | Vote | Buy + trending row.
 * Used on status cards and community vote posts.
 *
 * Important: do NOT use InlineKeyboard.webApp() here.
 * Telegram only allows web_app buttons in private chats; in groups
 * sendPhoto/sendMessage fails with BUTTON_TYPE_INVALID and the bot
 * appears silent.
 */
export function voteCardKeyboard(token: TokenProfile): InlineKeyboard {
  const kb = new InlineKeyboard();
  const chart = chartUrl(token);
  const buy = buyUrl(token);

  if (chart) kb.url('📊 Chart', chart);
  kb.text('👍 Vote', `upvote:${token.ticker}`);
  if (buy) kb.url('💲 Buy', buy);

  const chain = getChain(token.chain);
  const links: { label: string; url: string }[] = [];
  const website = httpsUrl(token.website);
  const twitter = httpsUrl(token.twitter);
  const telegramUrl = httpsUrl(token.telegram_url);
  const discord = httpsUrl(token.discord);
  if (website) links.push({ label: '🌐 Web', url: website });
  if (twitter) links.push({ label: '𝕏', url: twitter });
  if (telegramUrl) links.push({ label: '✈️ Tg', url: telegramUrl });
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

  kb.row().url('🔥 Community Trending ↗️', dexTrendingUrl());
  // URL (not web_app) so the same keyboard works in groups + DMs
  kb.row().url('🗳️ Vote Mini App', voteDeepLink(token));
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
  lines.push('Tap <b>👍 Vote</b> — one vote every ' + getVoteCooldownHours() + 'h.');
  lines.push('<i>Community signal — not curated for trade.</i>');

  let html = lines.join('\n');
  if (html.length > 1024) {
    html = `${html.slice(0, 1020)}…`;
  }
  return html;
}

/** Buy-bot style /status body (HTML). */
export function statusCardHtml(token: TokenProfile): string {
  const threshold = getTrendThreshold();
  const remaining = Math.max(0, threshold - token.vote_count);
  const chain = getChain(token.chain);
  const desc = (token.description || '').trim().slice(0, 220);

  const lines: string[] = [
    '🔷 <b>TOKEN STATUS</b>',
    '<i>by Builders DEX</i>',
    '📢📢📢📢📢📢📢📢📢📢📢',
    '',
    `🪙 <b>$${esc(token.ticker)}</b> — ${esc(token.name)}`,
    `⛓ <b>Chain:</b> ${esc(chain.label)}`,
    `📌 <b>Status:</b> <code>${esc(token.status)}</code>`,
  ];

  if (token.status === 'trending') {
    lines.push(`🔥 <b>Votes:</b> ${token.vote_count} · Community Trending`);
  } else if (token.status === 'voting') {
    lines.push(
      `👍 <b>Votes:</b> ${token.vote_count} / ${threshold}` +
        (remaining > 0 ? ` · ${remaining} to trending` : ''),
    );
  } else if (token.status === 'candidate') {
    lines.push(
      '⏳ <b>Votes:</b> not open yet — invite the bot to your community, then <code>/postvote ' +
        esc(token.ticker) +
        '</code>',
    );
  } else {
    lines.push(`👍 <b>Votes:</b> ${token.vote_count}`);
  }

  if (token.mint) {
    const explorer = chain.explorerToken(token.mint);
    lines.push(
      `🔎 <b>Contract:</b> <code>${esc(shortAddr(token.mint))}</code> · <a href="${esc(explorer)}">Explorer</a>`,
    );
  }

  const socials: string[] = [];
  const tg = httpsUrl(token.telegram_url);
  const tw = httpsUrl(token.twitter);
  const web = httpsUrl(token.website);
  const dc = httpsUrl(token.discord);
  if (tg) socials.push(`<a href="${esc(tg)}">Tg</a>`);
  if (tw) socials.push(`<a href="${esc(tw)}">X</a>`);
  if (web) socials.push(`<a href="${esc(web)}">Web</a>`);
  if (dc) socials.push(`<a href="${esc(dc)}">Discord</a>`);
  if (socials.length) {
    lines.push(`📢 <b>Socials:</b> ${socials.join(' · ')}`);
  }

  lines.push(`💵 <b>Big-buy alert:</b> ~$${Math.round(token.big_buy_usd)}+`);

  if (desc) {
    lines.push('', `<i>${esc(desc)}</i>`);
  }

  lines.push(
    '',
    `<i>Tap 👍 Vote below — one vote every ${getVoteCooldownHours()}h.</i>`,
  );

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
    'Tap 👍 Vote',
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
  const cooldownH = getVoteCooldownHours();
  return [
    '*Builders DEX Token Bot* is in this community.',
    '',
    '*Owners*',
    '1. Create the token in a *private chat* with me: `/newtoken`',
    '2. In this group, run `/postvote TICKER` to open voting',
    `3. Members tap *👍 Vote* — once every ${cooldownH}h · at ${threshold} votes → Community Trending`,
    '',
    'Or run `/newtoken` here as an admin to create + post in one step.',
    '',
    '_Community signal — not curated for trade._',
  ].join('\n');
}

/** Inline keyboard JSON for raw Telegram HTTP API */
export function voteCardReplyMarkupJson(token: TokenProfile) {
  return { inline_keyboard: voteCardKeyboard(token).inline_keyboard };
}
