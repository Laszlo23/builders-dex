import { InlineKeyboard, type Context } from 'grammy';
import {
  createTokenProfile,
  getTokenByTicker,
  normalizeTicker,
  setTokenStatus,
} from './repo';
import {
  defaultBigBuyUsd,
  isHttpsUrl,
  normalizeSocialUrl,
} from './validators';
import { sendVotePostFromContext } from './postVote';
import {
  chainPickerKeyboard,
  getChain,
  isChainId,
  isValidContract,
  type ChainId,
} from './chains';

/** Field the manager is about to paste in the next message */
export type AwaitingField =
  | 'ticker'
  | 'name'
  | 'mint'
  | 'description'
  | 'logo'
  | 'banner'
  | 'website'
  | 'twitter'
  | 'telegram'
  | 'discord'
  | null;

type WizardData = {
  ticker?: string;
  name?: string;
  chain?: ChainId;
  mint?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  website?: string | null;
  twitter?: string | null;
  telegramUrl?: string | null;
  discord?: string | null;
};

type WizardSession = {
  awaiting: AwaitingField;
  data: WizardData;
  chatId: number;
  userId: number;
  botKey: string;
  menuMessageId?: number;
};

const sessions = new Map<string, WizardSession>();

const FIELD_PROMPTS: Record<Exclude<AwaitingField, null>, string> = {
  ticker: 'Send the *ticker* next (e.g. `CULT`).',
  name: 'Send the *token name* next (e.g. `Culture Node`).',
  mint: 'Send the *contract address* next (format depends on the chain you picked).',
  description: 'Send the *description* next (1–2 sentences).',
  logo: 'Send the *logo URL* next (`https://…` image).',
  banner: 'Send the *banner URL* next (`https://…` image).',
  website: 'Send the *website* next (URL or `skip`).',
  twitter: 'Send *X / Twitter* next (@handle, URL, or `skip`).',
  telegram: 'Send *Telegram* next (@group, t.me link, or `skip`).',
  discord: 'Send *Discord* next (invite, URL, or `skip`).',
};

function sessionKey(chatId: number, userId: number): string {
  return `${chatId}:${userId}`;
}

export function clearWizard(chatId: number, userId: number): void {
  sessions.delete(sessionKey(chatId, userId));
}

export function hasWizard(chatId: number, userId: number): boolean {
  return sessions.has(sessionKey(chatId, userId));
}

function mark(done: boolean, label: string): string {
  return `${done ? '✅' : '▫️'} ${label}`;
}

function fmtOptional(v: string | null | undefined): string {
  if (v === undefined) return '_tap to set_';
  if (v === null) return '_skipped_';
  return v;
}

function requiredReady(data: WizardData): boolean {
  return Boolean(
    data.ticker &&
      data.name &&
      data.chain &&
      data.mint &&
      data.description &&
      data.logoUrl &&
      data.bannerUrl,
  );
}

export function buildMenuKeyboard(data: WizardData): InlineKeyboard {
  const kb = new InlineKeyboard()
    .text(mark(!!data.chain, 'Chain'), 'nw:chain')
    .text(mark(!!data.ticker, 'Ticker'), 'nw:ticker')
    .row()
    .text(mark(!!data.name, 'Name'), 'nw:name')
    .text(mark(!!data.mint, 'Contract'), 'nw:mint')
    .row()
    .text(mark(!!data.description, 'Description'), 'nw:description')
    .row()
    .text(mark(!!data.logoUrl, 'Logo'), 'nw:logo')
    .text(mark(!!data.bannerUrl, 'Banner'), 'nw:banner')
    .row()
    .text(mark(data.website !== undefined, 'Website'), 'nw:website')
    .text(mark(data.twitter !== undefined, 'X / Twitter'), 'nw:twitter')
    .row()
    .text(mark(data.telegramUrl !== undefined, 'Telegram'), 'nw:telegram')
    .text(mark(data.discord !== undefined, 'Discord'), 'nw:discord')
    .row();

  if (requiredReady(data)) {
    kb.text('🚀 Save token', 'nw:publish').row();
  }
  kb.text('❌ Cancel', 'nw:cancel');
  return kb;
}

function menuText(data: WizardData, awaiting: AwaitingField): string {
  const lines = [
    '*New token — fill the menu*',
    'Tap a button, then send the value as your *next message*.',
    '',
    `Chain: ${data.chain ? `*${getChain(data.chain).label}*` : '_not set_'}`,
    `Ticker: ${data.ticker ? `*$${data.ticker}*` : '_not set_'}`,
    `Name: ${data.name || '_not set_'}`,
    `Contract: ${data.mint ? `\`${data.mint.slice(0, 12)}…\`` : '_not set_'}`,
    `Description: ${data.description ? '_set_' : '_not set_'}`,
    `Logo: ${data.logoUrl ? '_set_' : '_not set_'}`,
    `Banner: ${data.bannerUrl ? '_set_' : '_not set_'}`,
    `Website: ${fmtOptional(data.website)}`,
    `X: ${fmtOptional(data.twitter)}`,
    `TG: ${fmtOptional(data.telegramUrl)}`,
    `Discord: ${fmtOptional(data.discord)}`,
    '',
  ];
  if (awaiting) {
    lines.push(`⏳ Waiting for: *${awaiting}* — paste it now.`);
  } else if (requiredReady(data)) {
    lines.push('All required fields set — tap *Save token*.');
  } else {
    lines.push(
      'Required: Chain, Ticker, Name, Contract, Description, Logo, Banner.',
    );
  }
  return lines.join('\n');
}

export function startWizard(
  chatId: number,
  userId: number,
  botKey: string,
): { text: string; keyboard: InlineKeyboard } {
  const session: WizardSession = {
    awaiting: null,
    data: {},
    chatId,
    userId,
    botKey,
  };
  sessions.set(sessionKey(chatId, userId), session);
  return {
    text: menuText(session.data, null),
    keyboard: buildMenuKeyboard(session.data),
  };
}

export function attachMenuMessageId(
  chatId: number,
  userId: number,
  messageId: number,
): void {
  const session = sessions.get(sessionKey(chatId, userId));
  if (session) session.menuMessageId = messageId;
}

function getSession(chatId: number, userId: number): WizardSession | undefined {
  return sessions.get(sessionKey(chatId, userId));
}

async function showMenu(ctx: Context, session: WizardSession): Promise<void> {
  const text = menuText(session.data, session.awaiting);
  const keyboard = buildMenuKeyboard(session.data);
  try {
    if (session.menuMessageId && ctx.chat) {
      await ctx.api.editMessageText(ctx.chat.id, session.menuMessageId, text, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
      return;
    }
  } catch {
    /* fall through to new message */
  }
  const sent = await ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  });
  session.menuMessageId = sent.message_id;
}

/** Handle menu button presses: nw:logo, nw:publish, … */
export async function handleWizardCallback(
  ctx: Context,
  data: string,
): Promise<boolean> {
  if (!data.startsWith('nw:') || !ctx.from || !ctx.chat) return false;
  const session = getSession(ctx.chat.id, ctx.from.id);
  if (!session) {
    await ctx.answerCallbackQuery({
      text: 'Start with /newtoken first',
      show_alert: true,
    });
    return true;
  }

  // Keep menu message id for edits
  if (ctx.callbackQuery?.message?.message_id) {
    session.menuMessageId = ctx.callbackQuery.message.message_id;
  }

  const action = data.slice(3);

  if (action === 'cancel') {
    clearWizard(ctx.chat.id, ctx.from.id);
    await ctx.answerCallbackQuery({ text: 'Cancelled' });
    try {
      await ctx.editMessageText('Token registration cancelled.');
    } catch {
      await ctx.reply('Token registration cancelled.');
    }
    return true;
  }

  if (action === 'menu') {
    session.awaiting = null;
    await ctx.answerCallbackQuery();
    await showMenu(ctx, session);
    return true;
  }

  if (action === 'chain') {
    session.awaiting = null;
    await ctx.answerCallbackQuery({ text: 'Pick a chain' });
    await ctx.reply('Which *blockchain* is this token on?', {
      parse_mode: 'Markdown',
      reply_markup: chainPickerKeyboard(),
    });
    return true;
  }

  if (data.startsWith('nw:setchain:')) {
    const chainId = data.slice('nw:setchain:'.length);
    if (!isChainId(chainId)) {
      await ctx.answerCallbackQuery({ text: 'Unknown chain', show_alert: true });
      return true;
    }
    session.data.chain = chainId;
    if (session.data.mint && !isValidContract(chainId, session.data.mint)) {
      session.data.mint = undefined;
    }
    session.awaiting = null;
    await ctx.answerCallbackQuery({ text: getChain(chainId).label });
    await ctx.reply(`Chain set to *${getChain(chainId).label}*.`, {
      parse_mode: 'Markdown',
    });
    await showMenu(ctx, session);
    return true;
  }

  if (action === 'publish') {
    await ctx.answerCallbackQuery();
    const ok = await publishWizard(ctx, session);
    if (!ok) {
      await showMenu(ctx, session);
    }
    return true;
  }

  const fields: Exclude<AwaitingField, null>[] = [
    'ticker',
    'name',
    'mint',
    'description',
    'logo',
    'banner',
    'website',
    'twitter',
    'telegram',
    'discord',
  ];
  if (!(fields as string[]).includes(action)) {
    await ctx.answerCallbackQuery({ text: 'Unknown' });
    return true;
  }

  const field = action as Exclude<AwaitingField, null>;

  if (field === 'mint' && !session.data.chain) {
    await ctx.answerCallbackQuery({ text: 'Pick Chain first', show_alert: true });
    await ctx.reply('Pick *Chain* first, then Contract.', {
      parse_mode: 'Markdown',
      reply_markup: chainPickerKeyboard(),
    });
    return true;
  }

  session.awaiting = field;
  const prompt =
    field === 'mint' && session.data.chain
      ? `Send the *contract address* for *${getChain(session.data.chain).label}* next.`
      : FIELD_PROMPTS[field];
  await ctx.answerCallbackQuery({ text: `Paste ${field}` });
  await ctx.reply(prompt, { parse_mode: 'Markdown' });
  await showMenu(ctx, session);
  return true;
}

async function publishWizard(
  ctx: Context,
  session: WizardSession,
): Promise<boolean> {
  const d = session.data;
  if (!requiredReady(d)) {
    await ctx.reply('Still missing required fields. Use the menu to fill them.');
    return false;
  }
  if (
    !d.ticker ||
    !d.name ||
    !d.chain ||
    !d.mint ||
    !d.description ||
    !d.logoUrl ||
    !d.bannerUrl
  ) {
    return false;
  }

  if (getTokenByTicker(session.chatId, d.ticker)) {
    await ctx.reply(`$${d.ticker} already exists in this chat. Change the ticker.`);
    return false;
  }

  try {
    const isPrivate = ctx.chat?.type === 'private';
    const chatTitle = isPrivate
      ? ctx.from?.username
        ? `@${ctx.from.username}`
        : ctx.from?.first_name || 'Private chat'
      : ctx.chat?.title || 'Telegram group';

    const profile = createTokenProfile({
      chatId: session.chatId,
      chatTitle,
      ticker: d.ticker,
      name: d.name,
      chain: d.chain,
      mint: d.mint,
      description: d.description,
      logoUrl: d.logoUrl,
      bannerUrl: d.bannerUrl,
      website: d.website,
      twitter: d.twitter,
      telegramUrl: d.telegramUrl,
      discord: d.discord,
      bigBuyUsd: defaultBigBuyUsd(),
      servingBotKey: session.botKey,
      createdByUserId: session.userId,
    });
    clearWizard(session.chatId, session.userId);

    if (isPrivate) {
      // Keep as candidate until the owner links it in a community with /postvote
      await ctx.reply(
        [
          `✅ *$${profile.ticker}* saved in your private chat.`,
          '',
          '*Next steps*',
          '1. Invite me to your community group',
          `2. In that group, run \`/postvote ${profile.ticker}\``,
          '3. Members tap *👍 Vote* on the post',
          '',
          `Preview anytime: \`/status ${profile.ticker}\``,
        ].join('\n'),
        { parse_mode: 'Markdown' },
      );
      return true;
    }

    const voting = setTokenStatus(profile.id, 'voting')!;
    await ctx.reply(
      [
        `✅ *$${voting.ticker}* listed.`,
        'Members: tap *👍 Vote* on the vote post below.',
      ].join('\n'),
      { parse_mode: 'Markdown' },
    );
    await sendVotePostFromContext(ctx, voting);
    return true;
  } catch (err: unknown) {
    const msg = String((err as Error)?.message || err);
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      await ctx.reply(`$${d.ticker} already exists. Change the ticker.`);
      return false;
    }
    console.error('[telegram] publish wizard', err);
    await ctx.reply('Failed to publish. Try again.');
    return false;
  }
}

/** Next chat message fills the field that was selected in the menu */
export async function continueWizard(
  ctx: Context,
  text: string,
): Promise<boolean> {
  if (!ctx.chat || !ctx.from) return false;
  const session = getSession(ctx.chat.id, ctx.from.id);
  if (!session) return false;

  const raw = text.trim();
  if (/^\/cancel\b/i.test(raw)) {
    clearWizard(ctx.chat.id, ctx.from.id);
    await ctx.reply('Cancelled token registration.');
    return true;
  }

  if (!session.awaiting) {
    await ctx.reply('Tap a button in the menu first (Logo, Banner, Contract, …).', {
      reply_markup: buildMenuKeyboard(session.data),
    });
    return true;
  }

  const field = session.awaiting;
  try {
    switch (field) {
      case 'ticker': {
        const ticker = normalizeTicker(raw.replace(/^\//, ''));
        if (!/^[A-Z0-9]{2,16}$/.test(ticker)) {
          await ctx.reply('Invalid ticker. Use 2–16 letters/numbers, then try again.');
          return true;
        }
        if (getTokenByTicker(session.chatId, ticker)) {
          await ctx.reply(`$${ticker} already exists. Pick another ticker.`);
          return true;
        }
        session.data.ticker = ticker;
        break;
      }
      case 'name': {
        if (raw.length < 2 || raw.length > 80) {
          await ctx.reply('Name must be 2–80 characters.');
          return true;
        }
        session.data.name = raw;
        break;
      }
      case 'mint': {
        if (!session.data.chain) {
          await ctx.reply('Pick *Chain* from the menu first, then paste the contract.', {
            parse_mode: 'Markdown',
          });
          return true;
        }
        if (!isValidContract(session.data.chain, raw)) {
          const label = getChain(session.data.chain).label;
          await ctx.reply(
            `That address doesn’t look valid for *${label}*. Check and paste again.`,
            { parse_mode: 'Markdown' },
          );
          return true;
        }
        session.data.mint = raw.trim();
        break;
      }
      case 'description': {
        if (raw.length < 8 || raw.length > 500) {
          await ctx.reply('Description must be 8–500 characters.');
          return true;
        }
        session.data.description = raw;
        break;
      }
      case 'logo': {
        if (!isHttpsUrl(raw)) {
          await ctx.reply('Logo must be an https:// image URL.');
          return true;
        }
        session.data.logoUrl = raw.trim();
        break;
      }
      case 'banner': {
        if (!isHttpsUrl(raw)) {
          await ctx.reply('Banner must be an https:// image URL.');
          return true;
        }
        session.data.bannerUrl = raw.trim();
        break;
      }
      case 'website': {
        const v = normalizeSocialUrl(raw, 'website');
        if (raw.toLowerCase() !== 'skip' && raw !== '-' && !v) {
          await ctx.reply('Invalid website. Send https URL or `skip`.');
          return true;
        }
        session.data.website = v;
        break;
      }
      case 'twitter': {
        const v = normalizeSocialUrl(raw, 'twitter');
        if (raw.toLowerCase() !== 'skip' && raw !== '-' && !v) {
          await ctx.reply('Invalid X/Twitter. Send @handle, URL, or `skip`.');
          return true;
        }
        session.data.twitter = v;
        break;
      }
      case 'telegram': {
        const v = normalizeSocialUrl(raw, 'telegram');
        if (raw.toLowerCase() !== 'skip' && raw !== '-' && !v) {
          await ctx.reply('Invalid Telegram. Send @group, t.me link, or `skip`.');
          return true;
        }
        session.data.telegramUrl = v;
        break;
      }
      case 'discord': {
        const v = normalizeSocialUrl(raw, 'discord');
        if (raw.toLowerCase() !== 'skip' && raw !== '-' && !v) {
          await ctx.reply('Invalid Discord. Send invite/URL or `skip`.');
          return true;
        }
        session.data.discord = v;
        break;
      }
      default: {
        const _exhaustive: never = field;
        void _exhaustive;
        break;
      }
    }
  } catch (err) {
    console.error('[telegram] wizard field', err);
    await ctx.reply('Could not save that. Try again.');
    return true;
  }

  session.awaiting = null;
  await ctx.reply(`Saved *${field}*.`, { parse_mode: 'Markdown' });
  await showMenu(ctx, session);
  return true;
}
