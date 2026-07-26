import { Bot, Context, GrammyError, InlineKeyboard, webhookCallback } from 'grammy';
import { getSqlite } from '../db/sqlite';
import {
  castVote,
  getTokenByTicker,
  getTrendThreshold,
  listTokensForChat,
  normalizeTicker,
  setTokenStatus,
  upsertChat,
} from './repo';
import {
  attachMenuMessageId,
  clearWizard,
  continueWizard,
  handleWizardCallback,
  hasWizard,
  startWizard,
} from './wizard';
import { defaultBigBuyUsd } from './validators';
import { getChain } from './chains';
import { refreshVotePostMessage, sendVotePostFromContext } from './postVote';
import { voteMiniAppUrl, welcomeNewGroupText } from './voteCard';

type BotContext = Context;

const upvoteBuckets = new Map<string, { count: number; resetAt: number }>();

function upvoteAllowed(userId: number, chatId: number): boolean {
  const key = `${chatId}:${userId}`;
  const now = Date.now();
  let b = upvoteBuckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + 30_000 };
    upvoteBuckets.set(key, b);
  }
  if (b.count >= 5) return false;
  b.count += 1;
  return true;
}

function isGroup(ctx: BotContext): boolean {
  const type = ctx.chat?.type;
  return type === 'group' || type === 'supergroup';
}

async function isChatAdmin(ctx: BotContext): Promise<boolean> {
  if (!ctx.from || !ctx.chat) return false;
  try {
    const member = await ctx.getChatMember(ctx.from.id);
    return member.status === 'creator' || member.status === 'administrator';
  } catch {
    return false;
  }
}

function dexTrendingUrl(): string {
  const base = (process.env.APP_URL || 'https://dex.buildingcultureid.space').replace(
    /\/$/,
    '',
  );
  return `${base}/#explore`;
}

function helpText(): string {
  const threshold = getTrendThreshold();
  const bigBuy = defaultBigBuyUsd();
  return [
    '*Builders DEX — Token Bot*',
    '',
    '*How voting works*',
    '1. Invite me to your community',
    '2. Manager `/newtoken` → menu buttons (Logo, Banner, Contract, …)',
    '3. After *Publish*, I post the vote message with images',
    `4. Members tap *▲ Upvote here* on that post (${threshold} → Community Trending)`,
    '',
    `Big buys (~$${bigBuy}+ USD) are announced here automatically.`,
    '',
    '*Manager commands*',
    '`/newtoken` — open the fill-in menu',
    '`/postvote TICKER` — re-post the vote card',
    '`/tokens` · `/status TICKER` · `/chatid` · `/help`',
    '',
    '_Members: no commands needed — tap the button on the vote post._',
  ].join('\n');
}

export function createTelegramBot(token: string, botKey = 'platform'): Bot {
  const bot = new Bot(token);

  bot.use(async (ctx, next) => {
    if (ctx.from?.is_bot) return;
    if (ctx.chat && (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup')) {
      upsertChat(ctx.chat.id, ctx.chat.title || 'Telegram group', botKey);
    }
    await next();
  });

  // Bot invited into a community → leave a welcome / how-to post
  bot.on('my_chat_member', async (ctx) => {
    const update = ctx.myChatMember;
    const chat = update.chat;
    if (chat.type !== 'group' && chat.type !== 'supergroup') return;
    const was =
      update.old_chat_member.status === 'left' ||
      update.old_chat_member.status === 'kicked';
    const now =
      update.new_chat_member.status === 'member' ||
      update.new_chat_member.status === 'administrator';
    if (!was || !now) return;
    upsertChat(chat.id, chat.title || 'Telegram group', botKey);
    try {
      await ctx.api.sendMessage(chat.id, welcomeNewGroupText(), {
        parse_mode: 'Markdown',
      });
    } catch (err) {
      console.warn('[telegram] welcome post failed', err);
    }
  });

  bot.command(['start', 'help'], async (ctx) => {
    if (isGroup(ctx)) {
      await ctx.reply(helpText(), { parse_mode: 'Markdown' });
      return;
    }
    const kb = new InlineKeyboard().webApp('▲ Open vote Mini App', voteMiniAppUrl());
    await ctx.reply(helpText(), { parse_mode: 'Markdown', reply_markup: kb });
  });

  bot.command('vote', async (ctx) => {
    if (isGroup(ctx)) {
      await ctx.reply(
        'In this group, tap *▲ Upvote here* on the token vote post the manager created.\nManager: `/newtoken` or `/postvote TICKER` to publish that post.',
        { parse_mode: 'Markdown' },
      );
      return;
    }
    const kb = new InlineKeyboard().webApp('▲ Vote on tokens', voteMiniAppUrl());
    await ctx.reply(
      'Open the vote Mini App, or vote from the button on a group vote post.',
      { parse_mode: 'Markdown', reply_markup: kb },
    );
  });

  bot.command('chatid', async (ctx) => {
    if (!ctx.chat) return;
    await ctx.reply(
      `Chat id: \`${ctx.chat.id}\`\nUse this on the DEX *Telegram bot* page to submit a profile.`,
      { parse_mode: 'Markdown' },
    );
  });

  bot.command('newtoken', async (ctx) => {
    if (!isGroup(ctx)) {
      await ctx.reply('Use /newtoken in a group where I am a member.');
      return;
    }
    if (!(await isChatAdmin(ctx))) {
      await ctx.reply('Only group admins can create token profiles.');
      return;
    }
    if (!ctx.from) return;
    const { text, keyboard } = startWizard(ctx.chat!.id, ctx.from.id, botKey);
    const sent = await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
    attachMenuMessageId(ctx.chat!.id, ctx.from.id, sent.message_id);
  });

  bot.command('cancel', async (ctx) => {
    if (!ctx.from || !ctx.chat) return;
    if (hasWizard(ctx.chat.id, ctx.from.id)) {
      clearWizard(ctx.chat.id, ctx.from.id);
      await ctx.reply('Cancelled.');
    }
  });

  bot.on('message:text', async (ctx, next) => {
    if (!ctx.from || !ctx.chat) return next();
    if (!hasWizard(ctx.chat.id, ctx.from.id)) return next();
    const text = ctx.message.text || '';
    if (text.startsWith('/')) return next();
    await continueWizard(ctx, text);
  });

  bot.command(['openvotes', 'postvote'], async (ctx) => {
    if (!isGroup(ctx)) {
      await ctx.reply('Use this command in a group.');
      return;
    }
    if (!(await isChatAdmin(ctx))) {
      await ctx.reply('Only group admins can post vote cards.');
      return;
    }
    const ticker = normalizeTicker((ctx.match || '').toString());
    if (!ticker) {
      await ctx.reply('Usage: `/postvote TICKER`', { parse_mode: 'Markdown' });
      return;
    }
    const token = getTokenByTicker(ctx.chat!.id, ticker);
    if (!token) {
      await ctx.reply(`No profile for $${ticker} in this chat.`);
      return;
    }
    if (token.status === 'closed') {
      await ctx.reply(`$${ticker} is closed.`);
      return;
    }
    const updated =
      token.status === 'candidate'
        ? setTokenStatus(token.id, 'voting')!
        : token;
    await sendVotePostFromContext(ctx, updated);
  });

  bot.command('upvote', async (ctx) => {
    if (!isGroup(ctx)) {
      await ctx.reply('Vote inside the group that registered the token.');
      return;
    }
    if (!ctx.from) return;
    if (!upvoteAllowed(ctx.from.id, ctx.chat!.id)) {
      await ctx.reply('Slow down — try again in a few seconds.');
      return;
    }
    const ticker = normalizeTicker((ctx.match || '').toString());
    if (!ticker) {
      await ctx.reply('Usage: `/upvote TICKER`', { parse_mode: 'Markdown' });
      return;
    }
    await handleUpvote(ctx, ticker);
  });

  bot.command('tokens', async (ctx) => {
    if (!isGroup(ctx)) {
      await ctx.reply('Use /tokens in a group.');
      return;
    }
    const tokens = listTokensForChat(ctx.chat!.id);
    if (!tokens.length) {
      await ctx.reply('No active token profiles in this chat yet. Admin: /newtoken');
      return;
    }
    const threshold = getTrendThreshold();
    const lines = tokens.map(
      (t) =>
        `• *$${t.ticker}* — ${t.name} · \`${t.status}\` · ${t.vote_count}/${threshold}`,
    );
    await ctx.reply(['*Active profiles*', ...lines].join('\n'), {
      parse_mode: 'Markdown',
    });
  });

  bot.command('status', async (ctx) => {
    if (!isGroup(ctx)) {
      await ctx.reply('Use /status in a group.');
      return;
    }
    const ticker = normalizeTicker((ctx.match || '').toString());
    if (!ticker) {
      await ctx.reply('Usage: `/status TICKER`', { parse_mode: 'Markdown' });
      return;
    }
    const token = getTokenByTicker(ctx.chat!.id, ticker);
    if (!token) {
      await ctx.reply(`No profile for $${ticker}.`);
      return;
    }
    const threshold = getTrendThreshold();
    const remaining = Math.max(0, threshold - token.vote_count);
    const lines = [
      `*$${token.ticker}* — ${token.name}`,
      `Status: \`${token.status}\``,
      `Votes: *${token.vote_count}* / ${threshold}` +
        (token.status === 'voting' ? ` (${remaining} to trending)` : ''),
      `Chain: *${getChain(token.chain).label}*`,
      token.mint ? `Contract: \`${token.mint}\`` : 'Contract: _(none)_',
      `Big-buy alert: ~$${token.big_buy_usd}+`,
      token.website ? `Web: ${token.website}` : '',
      token.twitter ? `X: ${token.twitter}` : '',
      token.telegram_url ? `TG: ${token.telegram_url}` : '',
      token.discord ? `Discord: ${token.discord}` : '',
      token.description ? `_${token.description}_` : '',
      token.status === 'trending'
        ? `\nLive on DEX: ${dexTrendingUrl()}`
        : '',
    ].filter(Boolean);
    await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
  });

  bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data || '';
    if (!ctx.chat || !isGroup(ctx)) {
      await ctx.answerCallbackQuery({ text: 'Use in a group' });
      return;
    }

    if (data.startsWith('nw:')) {
      if (!(await isChatAdmin(ctx))) {
        await ctx.answerCallbackQuery({ text: 'Admins only', show_alert: true });
        return;
      }
      await handleWizardCallback(ctx, data);
      return;
    }

    if (data.startsWith('upvote:')) {
      if (!ctx.from) {
        await ctx.answerCallbackQuery();
        return;
      }
      if (!upvoteAllowed(ctx.from.id, ctx.chat.id)) {
        await ctx.answerCallbackQuery({ text: 'Slow down' });
        return;
      }
      const ticker = normalizeTicker(data.slice('upvote:'.length));
      const result = await handleUpvote(ctx, ticker, true);
      if (result === 'ok') {
        const token = getTokenByTicker(ctx.chat.id, ticker);
        const threshold = getTrendThreshold();
        await ctx.answerCallbackQuery({
          text: token
            ? `Voted ▲ ${token.vote_count}/${threshold}`
            : 'Vote counted',
          show_alert: false,
        });
        if (token) await refreshVotePostMessage(ctx, token);
      } else if (result === 'duplicate')
        await ctx.answerCallbackQuery({ text: 'Already voted', show_alert: true });
      else await ctx.answerCallbackQuery({ text: 'Could not vote', show_alert: true });
      return;
    }

    await ctx.answerCallbackQuery();
  });

  bot.catch((err) => {
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error('[telegram] GrammyError', e.description);
    } else {
      console.error('[telegram] bot error', e);
    }
  });

  return bot;
}

async function handleUpvote(
  ctx: BotContext,
  ticker: string,
  silent = false,
): Promise<'ok' | 'duplicate' | 'fail'> {
  if (!ctx.from || !ctx.chat) return 'fail';
  const result = castVote({
    chatId: ctx.chat.id,
    ticker,
    telegramUserId: ctx.from.id,
    username: ctx.from.username || ctx.from.first_name || null,
  });

  if (result.ok === false) {
    const reason = result.reason;
    if (silent) return reason === 'duplicate' ? 'duplicate' : 'fail';
    switch (reason) {
      case 'not_found':
        await ctx.reply(`No profile for $${ticker}.`);
        break;
      case 'not_voting':
        await ctx.reply(
          `$${ticker} is not open for votes yet. Admin must /openvotes ${ticker}.`,
        );
        break;
      case 'duplicate':
        await ctx.reply('You already voted for this token.');
        break;
      case 'closed':
        await ctx.reply(`$${ticker} is closed.`);
        break;
      default: {
        const _exhaustive: never = reason;
        void _exhaustive;
        await ctx.reply('Could not record vote.');
      }
    }
    return reason === 'duplicate' ? 'duplicate' : 'fail';
  }

  const threshold = getTrendThreshold();
  const { token, becameTrending } = result;
  const remaining = Math.max(0, threshold - token.vote_count);

  if (!silent) {
    if (becameTrending) {
      await ctx.reply(
        [
          `🔥 *$${token.ticker}* is now *Community Trending* on Builders DEX!`,
          `${token.vote_count} unique votes.`,
          dexTrendingUrl(),
          '',
          '_Community signal — not curated for trade._',
        ].join('\n'),
        { parse_mode: 'Markdown' },
      );
    } else {
      await ctx.reply(
        `▲ Vote counted for *$${token.ticker}*: *${token.vote_count}* / ${threshold}` +
          (remaining > 0 ? ` (${remaining} to trending)` : ''),
        { parse_mode: 'Markdown' },
      );
    }
  } else if (becameTrending) {
    await ctx.reply(
      [
        `🔥 *$${token.ticker}* is now *Community Trending* on Builders DEX!`,
        `${token.vote_count} unique votes.`,
        dexTrendingUrl(),
      ].join('\n'),
      { parse_mode: 'Markdown' },
    );
  }

  return 'ok';
}

export type TelegramBotHandle = {
  bot: Bot;
  webhookMiddleware: ReturnType<typeof webhookCallback>;
};

export function initTelegramBot(): TelegramBotHandle | null {
  getSqlite();

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.log('[telegram] TELEGRAM_BOT_TOKEN unset — platform bot disabled');
    return null;
  }

  const bot = createTelegramBot(token, 'platform');
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const webhookMiddleware = webhookCallback(bot, 'express', {
    secretToken: secret || undefined,
  });

  console.log('[telegram] platform bot ready (webhook mode)');
  return { bot, webhookMiddleware };
}
