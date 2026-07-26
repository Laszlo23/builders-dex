import { randomBytes, randomUUID } from 'crypto';
import { webhookCallback } from 'grammy';
import { getSqlite } from '../db/sqlite';
import { createTelegramBot, type TelegramBotHandle } from './bot';

export type RegisteredBotRow = {
  id: string;
  telegram_bot_id: number;
  username: string;
  first_name: string;
  token: string;
  webhook_secret: string;
  label: string;
  active: number;
  webhook_url: string;
  created_at: string;
  updated_at: string;
};

export type RegisteredBotPublic = {
  id: string;
  username: string;
  firstName: string;
  label: string;
  webhookUrl: string;
  deepLink: string;
  createdAt: string;
};

const TOKEN_RE = /^\d{6,}:[A-Za-z0-9_-]{20,}$/;
const MAX_REGISTERED = 40;

const handles = new Map<string, TelegramBotHandle>();

function appBaseUrl(): string {
  return (process.env.APP_URL || 'https://dex.buildingcultureid.space').replace(
    /\/$/,
    '',
  );
}

export function getRegisteredBotHandle(id: string): TelegramBotHandle | undefined {
  return handles.get(id);
}

function mountHandle(row: RegisteredBotRow): TelegramBotHandle {
  const bot = createTelegramBot(row.token, row.id);
  const middleware = webhookCallback(bot, 'express', {
    secretToken: row.webhook_secret,
  });
  const handle: TelegramBotHandle = { bot, webhookMiddleware: middleware };
  handles.set(row.id, handle);
  return handle;
}

export function loadRegisteredBotHandles(): number {
  getSqlite();
  const rows = getSqlite()
    .prepare(`SELECT * FROM registered_bots WHERE active = 1`)
    .all() as RegisteredBotRow[];
  let n = 0;
  for (const row of rows) {
    try {
      mountHandle(row);
      n += 1;
    } catch (err) {
      console.error('[telegram] failed to mount bot', row.id, err);
    }
  }
  if (n) console.log(`[telegram] mounted ${n} registered bot(s)`);
  return n;
}

async function telegramApi<T>(
  token: string,
  method: string,
  body?: Record<string, string>,
): Promise<T> {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const res = await fetch(
    url,
    body
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(body),
        }
      : undefined,
  );
  const data = (await res.json()) as { ok: boolean; description?: string; result?: T };
  if (!data.ok) {
    throw new Error(data.description || `Telegram ${method} failed`);
  }
  return data.result as T;
}

export type RegisterBotResult =
  | { ok: true; bot: RegisteredBotPublic }
  | { ok: false; error: string; code?: number };

export async function registerBot(input: {
  token: string;
  label?: string;
}): Promise<RegisterBotResult> {
  const token = input.token.trim();
  if (!TOKEN_RE.test(token)) {
    return {
      ok: false,
      error: 'Invalid bot token. Copy it from @BotFather (looks like 123456:AA…).',
      code: 400,
    };
  }

  getSqlite();
  const count = (
    getSqlite()
      .prepare(`SELECT COUNT(*) AS n FROM registered_bots WHERE active = 1`)
      .get() as { n: number }
  ).n;
  if (count >= MAX_REGISTERED) {
    return {
      ok: false,
      error: 'Registration limit reached. Contact the Builders DEX team.',
      code: 429,
    };
  }

  let me: { id: number; username?: string; first_name: string };
  try {
    me = await telegramApi(token, 'getMe');
  } catch (err: unknown) {
    return {
      ok: false,
      error: String((err as Error)?.message || 'Token rejected by Telegram'),
      code: 400,
    };
  }

  const existing = getSqlite()
    .prepare(`SELECT * FROM registered_bots WHERE telegram_bot_id = ?`)
    .get(me.id) as RegisteredBotRow | undefined;

  const id = existing?.id || randomUUID();
  const webhookSecret =
    existing?.webhook_secret || randomBytes(24).toString('hex');
  const webhookUrl = `${appBaseUrl()}/api/telegram/webhook/${id}`;
  const label = (input.label || me.username || me.first_name || 'Builder bot')
    .trim()
    .slice(0, 64);

  try {
    await telegramApi(token, 'setWebhook', {
      url: webhookUrl,
      secret_token: webhookSecret,
      allowed_updates: JSON.stringify([
        'message',
        'callback_query',
        'my_chat_member',
      ]),
    });
  } catch (err: unknown) {
    return {
      ok: false,
      error: String((err as Error)?.message || 'Failed to set webhook'),
      code: 502,
    };
  }

  getSqlite()
    .prepare(
      `INSERT INTO registered_bots
        (id, telegram_bot_id, username, first_name, token, webhook_secret, label, active, webhook_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'), datetime('now'))
       ON CONFLICT(telegram_bot_id) DO UPDATE SET
         username = excluded.username,
         first_name = excluded.first_name,
         token = excluded.token,
         webhook_secret = excluded.webhook_secret,
         label = excluded.label,
         active = 1,
         webhook_url = excluded.webhook_url,
         updated_at = datetime('now')`,
    )
    .run(
      id,
      me.id,
      me.username || '',
      me.first_name || '',
      token,
      webhookSecret,
      label,
      webhookUrl,
    );

  const row = getSqlite()
    .prepare(`SELECT * FROM registered_bots WHERE id = ?`)
    .get(id) as RegisteredBotRow;

  mountHandle(row);

  return {
    ok: true,
    bot: toPublic(row),
  };
}

function toPublic(row: RegisteredBotRow): RegisteredBotPublic {
  const username = row.username;
  return {
    id: row.id,
    username,
    firstName: row.first_name,
    label: row.label,
    webhookUrl: row.webhook_url,
    deepLink: username ? `https://t.me/${username}` : '',
    createdAt: row.created_at,
  };
}

export function listRegisteredBotsPublic(): RegisteredBotPublic[] {
  getSqlite();
  const rows = getSqlite()
    .prepare(
      `SELECT * FROM registered_bots WHERE active = 1 ORDER BY created_at DESC LIMIT 100`,
    )
    .all() as RegisteredBotRow[];
  return rows.map(toPublic);
}

export async function getPlatformBotStatus(): Promise<{
  configured: boolean;
  username: string | null;
  firstName: string | null;
  webhookUrl: string;
  deepLink: string | null;
}> {
  const webhookUrl = `${appBaseUrl()}/api/telegram/webhook`;
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return {
      configured: false,
      username: null,
      firstName: null,
      webhookUrl,
      deepLink: null,
    };
  }
  try {
    const me = await telegramApi<{
      id: number;
      username?: string;
      first_name: string;
    }>(token, 'getMe');
    return {
      configured: true,
      username: me.username || null,
      firstName: me.first_name || null,
      webhookUrl,
      deepLink: me.username ? `https://t.me/${me.username}` : null,
    };
  } catch {
    return {
      configured: true,
      username: null,
      firstName: null,
      webhookUrl,
      deepLink: null,
    };
  }
}

export function getRegisteredBotRow(id: string): RegisteredBotRow | undefined {
  getSqlite();
  return getSqlite()
    .prepare(`SELECT * FROM registered_bots WHERE id = ? AND active = 1`)
    .get(id) as RegisteredBotRow | undefined;
}
