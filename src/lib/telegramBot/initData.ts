import crypto from 'crypto';

export type TelegramWebAppUser = {
  userId: number;
  username: string | null;
  firstName: string | null;
  chatId: number | null;
  authDate: number;
};

/**
 * Validate Telegram Mini App initData (HMAC-SHA256).
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 86_400,
): TelegramWebAppUser | null {
  if (!initData?.trim() || !botToken?.trim()) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  // Newer clients may send signature — ignore for classic hash check
  params.delete('signature');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  const calculated = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculated !== hash) return null;

  const authDate = Number(params.get('auth_date') || 0);
  if (!Number.isFinite(authDate) || authDate <= 0) return null;
  const age = Math.floor(Date.now() / 1000) - authDate;
  if (age < 0 || age > maxAgeSec) return null;

  let user: { id?: number; username?: string; first_name?: string } = {};
  try {
    user = JSON.parse(params.get('user') || '{}');
  } catch {
    return null;
  }
  if (!user.id || !Number.isFinite(user.id)) return null;

  let chatId: number | null = null;
  const chatRaw = params.get('chat');
  if (chatRaw) {
    try {
      const chat = JSON.parse(chatRaw) as { id?: number };
      if (typeof chat.id === 'number') chatId = chat.id;
    } catch {
      /* ignore */
    }
  }

  return {
    userId: user.id,
    username: user.username || null,
    firstName: user.first_name || null,
    chatId,
    authDate,
  };
}

export function resolveBotTokenForInitData(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
}
