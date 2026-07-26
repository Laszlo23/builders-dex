import { getBotTokenForKey } from './repo';
import { announceVoteCardWithMedia } from './postVote';
import type { TokenProfile } from './types';
import { welcomeNewGroupText } from './voteCard';

/** Post the vote card (logo + banner + buttons) into the Telegram group. */
export async function announceVoteCard(token: TokenProfile): Promise<boolean> {
  const botToken = getBotTokenForKey(token.serving_bot_key || 'platform');
  if (!botToken) return false;
  return announceVoteCardWithMedia(botToken, token);
}

export async function announceWelcome(
  chatId: number,
  botKey = 'platform',
): Promise<boolean> {
  const botToken = getBotTokenForKey(botKey);
  if (!botToken) return false;
  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: welcomeNewGroupText(),
        parse_mode: 'Markdown',
      }),
    },
  );
  return res.ok;
}
