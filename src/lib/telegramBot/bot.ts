import { Bot, Context, GrammyError, InlineKeyboard, webhookCallback } from 'grammy';
import { getSqlite } from '../db/sqlite';
import {
  attachTokenToChat,
  castVote,
  getOwnedTokenByTicker,
  getTokenByTicker,
  getTrendThreshold,
  getVoteCooldownHours,
  listTokensForChat,
  listTokensOwnedByUser,
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
import {
  refreshVotePostMessage,
  sendStatusCardFromContext,
  sendVotePostFromContext,
} from './postVote';
import { dexTrendingUrl, voteMiniAppUrl, welcomeNewGroupText } from './voteCard';
import type { TokenProfile } from './types';

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

function isPrivate(ctx: BotContext): boolean {
  return ctx.chat?.type === 'private';
}

async function isChatAdmin(ctx: BotContext): Promise<boolean> {
  if (!ctx.from || !ctx.chat) return false;
  if (isPrivate(ctx)) return true;
  try {
    const member = await ctx.getChatMember(ctx.from.id);
    return member.status === 'creator' || member.status === 'administrator';
  } catch {
    return false;
  }
}

function helpText(): string {
  const threshold = getTrendThreshold();
  const bigBuy = defaultBigBuyUsd();
  const cooldownH = getVoteCooldownHours();
  return [
    '*Builders DEX — Token Bot*',
    '',
    '*How it works*',
    '1. DM me `/newtoken` — fill Logo, Banner, Contract, …',
    '2. Invite me to your community',
    '3. In the group, `/postvote TICKER` — opens voting',
    `4. Members tap *👍 Vote* (once every ${cooldownH}h · ${threshold} → Community Trending)`,
    '',
    `Big buys (~$${bigBuy}+ USD) are announced in the community automatically.`,
    '',
    '*Commands*',
    '`/newtoken` — create a token (best in private chat)',
    '`/postvote TICKER` — link + post vote card in a group',
    '`/status TICKER` — Chart · Vote · Buy card',
    '`/tokens` · `/chatid` · `/help`',
  ].join('\n');
}

function formatCooldownRemaining(nextVoteAt?: string): string {
  if (!nextVoteAt) return `${getVoteCooldownHours()}h`;
  const ms = Date.parse(nextVoteAt) - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return 'soon';
  const totalMin = Math.ceil(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Resolve a token for /status: group chat first, else owner's draft. */
function resolveStatusToken(
  ctx: BotContext,
  ticker: string,
): TokenProfile | undefined {
  if (!ctx.chat) return undefined;
  const inChat = getTokenByTicker(ctx.chat.id, ticker);
  if (inChat) return inChat;
  if (ctx.from) return getOwnedTokenByTicker(ctx.from.id, ticker);
  return undefined;
}

/**
 * Resolve token for /postvote in a group: already in group, or owner's
 * privately created draft to attach.
 */
function resolvePostVoteToken(
  ctx: BotContext,
  ticker: string,
): TokenProfile | undefined {
  if (!ctx.chat || !ctx.from) return undefined;
  const inChat = getTokenByTicker(ctx.chat.id, ticker);
  if (inChat) return inChat;
  const owned = getOwnedTokenByTicker(ctx.from.id, ticker);
  if (!owned) return undefined;
  // Only auto-attach if still sitting on the owner's private chat (or same user)
  if (owned.created_by_user_id !== ctx.from.id) return undefined;
  return owned;
}

export function createTelegramBot(token: string, botKey = 'platform'): Bot {
  const bot = new Bot(token);

  bot.use(async (ctx, next) => {
    if (ctx.from?.is_bot) return;
    if (ctx.chat && (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup')) {
      try {
        upsertChat(ctx.chat.id, ctx.chat.title || 'Telegram group', botKey);
      } catch (err) {
        console.warn('[telegram] upsertChat failed', err);
      }
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
        'In this group, tap *👍 Vote* on the token status / vote post.\nManager: `/newtoken` (DM) then `/postvote TICKER` here.',
        { parse_mode: 'Markdown' },
      );
      return;
    }
    const kb = new InlineKeyboard().webApp('▲ Vote on tokens', voteMiniAppUrl());
    await ctx.reply(
      'Open the vote Mini App, or vote from *👍 Vote* on a group post / `/status` card.',
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
    if (!ctx.from || !ctx.chat) return;
    if (isGroup(ctx) && !(await isChatAdmin(ctx))) {
      await ctx.reply('Only group admins can create token profiles here. Or DM me `/newtoken`.');
      return;
    }
    const { text, keyboard } = startWizard(ctx.chat.id, ctx.from.id, botKey);
    const hint = isPrivate(ctx)
      ? '\n\n_You are in a private chat — after Save, invite me to your community and run `/postvote TICKER` there._'
      : '';
    const sent = await ctx.reply(text + hint, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
    attachMenuMessageId(ctx.chat.id, ctx.from.id, sent.message_id);
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

  bot.command(['openvotes', 'postvote', 'linktoken'], async (ctx) => {
    if (!isGroup(ctx)) {
      await ctx.reply(
        'Use `/postvote TICKER` *in your community group* after inviting me.\nCreate the token first with `/newtoken` in our private chat.',
        { parse_mode: 'Markdown' },
      );
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

    let token = resolvePostVoteToken(ctx, ticker);
    if (!token) {
      await ctx.reply(
        `No profile for $${ticker}.\nCreate it in a private chat with me first: \`/newtoken\`, then run \`/postvote ${ticker}\` here.`,
        { parse_mode: 'Markdown' },
      );
      return;
    }
    if (token.status === 'closed') {
      await ctx.reply(`$${ticker} is closed.`);
      return;
    }

    // Attach privately created token to this community
    if (token.chat_id !== ctx.chat!.id) {
      try {
        token = attachTokenToChat(
          token.id,
          ctx.chat!.id,
          ctx.chat!.title || 'Telegram group',
          botKey,
        )!;
      } catch (err: unknown) {
        const msg = String((err as Error)?.message || err);
        if (msg === 'ticker_taken') {
          await ctx.reply(`$${ticker} is already registered in this group.`);
          return;
        }
        throw err;
      }
    }

    const updated =
      token.status === 'candidate'
        ? setTokenStatus(token.id, 'voting')!
        : token;
    await sendVotePostFromContext(ctx, updated);
  });

  bot.command('upvote', async (ctx) => {
    if (!ctx.from || !ctx.chat) return;
    if (!upvoteAllowed(ctx.from.id, ctx.chat.id)) {
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
    if (!ctx.chat) return;
    const threshold = getTrendThreshold();

    if (isPrivate(ctx) && ctx.from) {
      const tokens = listTokensOwnedByUser(ctx.from.id);
      if (!tokens.length) {
        await ctx.reply('No tokens yet. Start with `/newtoken`.', {
          parse_mode: 'Markdown',
        });
        return;
      }
      const lines = tokens.map((t) => {
        const where =
          t.chat_id === ctx.chat!.id ? 'private (not linked)' : `chat \`${t.chat_id}\``;
        return `• *$${t.ticker}* — ${t.name} · \`${t.status}\` · ${t.vote_count}/${threshold} · ${where}`;
      });
      await ctx.reply(['*Your tokens*', ...lines].join('\n'), {
        parse_mode: 'Markdown',
      });
      return;
    }

    if (!isGroup(ctx)) {
      await ctx.reply('Use /tokens in a group or private chat with me.');
      return;
    }

    const tokens = listTokensForChat(ctx.chat.id);
    if (!tokens.length) {
      await ctx.reply(
        'No active token profiles in this chat yet.\nOwner: DM me `/newtoken`, then `/postvote TICKER` here.',
        { parse_mode: 'Markdown' },
      );
      return;
    }
    const lines = tokens.map(
      (t) =>
        `• *$${t.ticker}* — ${t.name} · \`${t.status}\` · ${t.vote_count}/${threshold}`,
    );
    await ctx.reply(['*Active profiles*', ...lines].join('\n'), {
      parse_mode: 'Markdown',
    });
  });

  bot.command('status', async (ctx) => {
    const ticker = normalizeTicker((ctx.match || '').toString());
    if (!ticker) {
      await ctx.reply('Usage: `/status TICKER`', { parse_mode: 'Markdown' });
      return;
    }
    const token = resolveStatusToken(ctx, ticker);
    if (!token) {
      await ctx.reply(
        `No profile for $${ticker}.\nCreate one with \`/newtoken\` (private chat), then \`/postvote ${ticker}\` in your community.`,
        { parse_mode: 'Markdown' },
      );
      return;
    }
    await sendStatusCardFromContext(ctx, token);
  });

  bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data || '';
    if (!ctx.chat) {
      await ctx.answerCallbackQuery({ text: 'Open in a chat' });
      return;
    }

    if (data.startsWith('nw:')) {
      if (isGroup(ctx) && !(await isChatAdmin(ctx))) {
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
        const token =
          getTokenByTicker(ctx.chat.id, ticker) ||
          getOwnedTokenByTicker(ctx.from.id, ticker);
        const threshold = getTrendThreshold();
        await ctx.answerCallbackQuery({
          text: token
            ? `Voted 👍 ${token.vote_count}/${threshold}`
            : 'Vote counted',
          show_alert: false,
        });
        if (token) await refreshVotePostMessage(ctx, token);
      } else if (result === 'cooldown')
        await ctx.answerCallbackQuery({
          text: `Already voted — try again in ${getVoteCooldownHours()}h`,
          show_alert: true,
        });
      else if (result === 'duplicate')
        await ctx.answerCallbackQuery({ text: 'Already voted', show_alert: true });
      else if (result === 'not_voting')
        await ctx.answerCallbackQuery({
          text: 'Voting not open — run /postvote in your community',
          show_alert: true,
        });
      else await ctx.answerCallbackQuery({ text: 'Could not vote', show_alert: true });
      return;
    }

    await ctx.answerCallbackQuery();
  });

  bot.catch((err) => {
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error('[telegram] GrammyError', e.method, e.description);
    } else if (e instanceof Error) {
      console.error('[telegram] bot error', e.message);
    } else {
      console.error('[telegram] bot error', String(e));
    }
  });

  return bot;
}

async function handleUpvote(
  ctx: BotContext,
  ticker: string,
  silent = false,
): Promise<'ok' | 'duplicate' | 'cooldown' | 'fail' | 'not_voting'> {
  if (!ctx.from || !ctx.chat) return 'fail';
  const result = castVote({
    chatId: ctx.chat.id,
    ticker,
    telegramUserId: ctx.from.id,
    username: ctx.from.username || ctx.from.first_name || null,
    ownerUserId: ctx.from.id,
  });

  if (result.ok === false) {
    const reason = result.reason;
    if (silent) {
      if (reason === 'duplicate' || reason === 'cooldown') return reason;
      if (reason === 'not_voting') return 'not_voting';
      return 'fail';
    }
    switch (reason) {
      case 'not_found':
        await ctx.reply(`No profile for $${ticker}.`);
        break;
      case 'not_voting':
        await ctx.reply(
          `$${ticker} is not open for votes yet. Owner: invite me to the community and run \`/postvote ${ticker}\`.`,
          { parse_mode: 'Markdown' },
        );
        break;
      case 'duplicate':
      case 'cooldown':
        await ctx.reply(
          `You already voted for *$${ticker}*. Next vote in *${formatCooldownRemaining(result.nextVoteAt)}*.`,
          { parse_mode: 'Markdown' },
        );
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
    if (reason === 'duplicate' || reason === 'cooldown') return reason;
    if (reason === 'not_voting') return 'not_voting';
    return 'fail';
  }

  const threshold = getTrendThreshold();
  const { token, becameTrending } = result;
  const remaining = Math.max(0, threshold - token.vote_count);
  const cooldownH = getVoteCooldownHours();

  if (!silent) {
    if (becameTrending) {
      await ctx.reply(
        [
          `🔥 *$${token.ticker}* is now *Community Trending* on Builders DEX!`,
          `${token.vote_count} votes.`,
          dexTrendingUrl(),
          '',
          '_Community signal — not curated for trade._',
        ].join('\n'),
        { parse_mode: 'Markdown' },
      );
    } else {
      await ctx.reply(
        `👍 Vote counted for *$${token.ticker}*: *${token.vote_count}* / ${threshold}` +
          (remaining > 0 ? ` (${remaining} to trending)` : '') +
          `\n_You can vote again in ${cooldownH}h._`,
        { parse_mode: 'Markdown' },
      );
    }
  } else if (becameTrending) {
    await ctx.reply(
      [
        `🔥 *$${token.ticker}* is now *Community Trending* on Builders DEX!`,
        `${token.vote_count} votes.`,
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
