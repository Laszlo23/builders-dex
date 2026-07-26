# Telegram Builder Token Bot — admin playbook

Community groups register builder token profiles; members upvote once per token. At **25** unique votes (tunable via `TELEGRAM_TREND_THRESHOLD`) the profile appears under **Community Trending** on Builders DEX. This is a community signal lane — not curated for trade and not auto-listed on Jupiter.

## Env (PM2 / `.env` on VPS)

```bash
TELEGRAM_BOT_TOKEN=<from @BotFather>
TELEGRAM_WEBHOOK_SECRET=<long random string>
TELEGRAM_TREND_THRESHOLD=25
TELEGRAM_VOTE_COOLDOWN_HOURS=3
TELEGRAM_DB_PATH=/var/www/dex-buildingculture/data/builder-bot.sqlite
APP_URL=https://dex.buildingcultureid.space
```

Ensure `data/` exists and is writable by the PM2 user:

```bash
sudo mkdir -p /var/www/dex-buildingculture/data
sudo chown -R "$USER":"$USER" /var/www/dex-buildingculture/data
```

## Vote Mini App (not the full DEX)

The bot Menu Button must open the **vote app**, not the homepage:

- URL: `https://dex.buildingcultureid.space/tg`
- In chat: `/vote` → “Open vote Mini App”
- Opening inside Telegram auto-routes to the vote UI (no Trade/Explore chrome)

If BotFather still has a Main Mini App / Menu URL pointing at `/`, change it to `/tg`.

```bash
curl -sS -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{"menu_button":{"type":"web_app","text":"Vote","web_app":{"url":"https://dex.buildingcultureid.space/tg"}}}'
```

## Connect webhook (no SSH required for community bots)

**Official bot:** set `TELEGRAM_BOT_TOKEN` on the VPS, restart PM2, then run `set-telegram-webhook.sh` (already done for `@buildersdexbot`).

**Anyone else:** open DEX → **More → Telegram bot** (or route `telegram-bot`), paste a BotFather token, click **Connect webhook**. That calls `POST /api/telegram/bots/register` and points Telegram at `/api/telegram/webhook/:id`.

Manual platform webhook:

```bash
bash /var/www/dex-buildingculture/deploy/set-telegram-webhook.sh
```

Or manually:

```bash
export BOT_TOKEN=...
export SECRET=...   # same as TELEGRAM_WEBHOOK_SECRET

curl -sS "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -d "url=https://dex.buildingcultureid.space/api/telegram/webhook" \
  -d "secret_token=${SECRET}" \
  -d "allowed_updates=[\"message\",\"callback_query\"]"
```

Verify:

```bash
curl -sS "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
curl -sS https://dex.buildingcultureid.space/api/telegram/trending
```

## Group setup (intended product flow)

1. **Owner DMs the bot** `/newtoken` → fill Chain, Logo, Banner, Contract, … → *Save token*.
2. Invite `@buildersdexbot` into the community → bot posts a welcome / how-to message.
3. **Owner (admin)** runs `/postvote TICKER` in the group → bot attaches the token and posts a vote card with **📊 Chart · 👍 Vote · 💲 Buy**.
4. **Members** tap **👍 Vote** (or `/status TICKER`). One vote every **3 hours** per Telegram user per token.
5. At threshold → Community Trending on DEX. Manager can `/postvote TICKER` again to re-pin the card.
6. **Big buys:** bot posts whale buys (default ≥ `$TELEGRAM_BIG_BUY_USD`) for that mint.

Admins can still run `/newtoken` inside the group to create + open voting in one step.

## Commands

| Command | Who | Effect |
|---------|-----|--------|
| `/help` | anyone | Explain the bot |
| `/newtoken` | owner (DM) or group admin | Create token profile |
| `/postvote TICKER` | group admin | Link private draft → open votes + post card |
| `/status TICKER` | anyone | Rich card with Chart · Vote · Buy |
| `/upvote TICKER` | member | Vote (once every 3h per token) |
| `/tokens` | anyone | List profiles (DM = yours; group = chat) |

## APIs

- `GET /api/telegram/trending` — public list
- `GET /api/telegram/tokens?chat_id=` — debug (requires `x-admin-token` if `FEEDBACK_ADMIN_TOKEN` is set)
- `POST /api/telegram/webhook` — Telegram only (secret header)

## Notes

- Votes are scoped **per chat** (same mint in two groups = two campaigns).
- Never mix Telegram trending into curated / `TRADEABLE_*` without a human review step.
- Rebuild + restart after code deploy: `npm run build && pm2 restart builders-dex`
