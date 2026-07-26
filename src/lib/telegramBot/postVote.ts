import type { Api, Context, RawApi } from 'grammy';
import type { TokenProfile } from './types';
import {
  logoCaptionHtml,
  spotlightIntroHtml,
  voteCardCaptionHtml,
  voteCardKeyboard,
  voteCardReplyMarkupJson,
} from './voteCard';

const CAPTION_MAX = 1024;

function captionFor(token: TokenProfile): string {
  const text = voteCardCaptionHtml(token);
  if (text.length <= CAPTION_MAX) return text;
  return `${text.slice(0, CAPTION_MAX - 1)}…`;
}

function httpsOrNull(url: string | null | undefined): string | null {
  if (!url || !/^https:\/\//i.test(url)) return null;
  return url;
}

type TgApi = Api<RawApi>;

/**
 * Marketing spotlight post:
 * intro → logo (brand mark) → banner (story + CTA buttons + socials)
 */
export async function sendVotePostWithApi(
  api: TgApi,
  chatId: number,
  token: TokenProfile,
): Promise<void> {
  const logo = httpsOrNull(token.logo_url);
  const banner = httpsOrNull(token.banner_url);
  const caption = captionFor(token);
  const keyboard = voteCardKeyboard(token);

  try {
    await api.sendMessage(chatId, spotlightIntroHtml(token), {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
  } catch {
    /* intro is optional polish */
  }

  if (logo && banner) {
    await api.sendPhoto(chatId, logo, {
      caption: logoCaptionHtml(token),
      parse_mode: 'HTML',
    });
    await api.sendPhoto(chatId, banner, {
      caption,
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
    return;
  }

  const photo = banner || logo;
  if (photo) {
    await api.sendPhoto(chatId, photo, {
      caption,
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
    return;
  }

  await api.sendMessage(chatId, caption, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
    link_preview_options: { is_disabled: true },
  });
}

export async function sendVotePostFromContext(
  ctx: Context,
  token: TokenProfile,
): Promise<void> {
  if (!ctx.chat) return;
  await sendVotePostWithApi(ctx.api, ctx.chat.id, token);
}

/** Refresh vote counts on the message that had the Upvote button */
export async function refreshVotePostMessage(
  ctx: Context,
  token: TokenProfile,
): Promise<void> {
  const msg = ctx.callbackQuery?.message;
  if (!msg) return;
  const caption = captionFor(token);
  const keyboard = voteCardKeyboard(token);
  try {
    if ('photo' in msg && msg.photo) {
      await ctx.editMessageCaption({
        caption,
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
      return;
    }
    if ('text' in msg && msg.text) {
      await ctx.editMessageText(caption, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
    }
  } catch {
    /* unchanged / too old */
  }
}

/** Raw HTTP announce (web form submit) — marketing media + CTAs */
export async function announceVoteCardWithMedia(
  botToken: string,
  token: TokenProfile,
): Promise<boolean> {
  const logo = httpsOrNull(token.logo_url);
  const banner = httpsOrNull(token.banner_url);
  const caption = captionFor(token);
  const replyMarkup = voteCardReplyMarkupJson(token);

  const send = async (method: string, body: Record<string, unknown>) => {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn(
        '[telegram]',
        method,
        (await res.text()).slice(0, 200),
      );
      return false;
    }
    return true;
  };

  await send('sendMessage', {
    chat_id: token.chat_id,
    text: spotlightIntroHtml(token),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });

  if (logo && banner) {
    const okLogo = await send('sendPhoto', {
      chat_id: token.chat_id,
      photo: logo,
      caption: logoCaptionHtml(token),
      parse_mode: 'HTML',
    });
    if (!okLogo) return false;
    return send('sendPhoto', {
      chat_id: token.chat_id,
      photo: banner,
      caption,
      parse_mode: 'HTML',
      reply_markup: replyMarkup,
    });
  }

  const photo = banner || logo;
  if (photo) {
    return send('sendPhoto', {
      chat_id: token.chat_id,
      photo,
      caption,
      parse_mode: 'HTML',
      reply_markup: replyMarkup,
    });
  }

  return send('sendMessage', {
    chat_id: token.chat_id,
    text: caption,
    parse_mode: 'HTML',
    reply_markup: replyMarkup,
    disable_web_page_preview: true,
  });
}
