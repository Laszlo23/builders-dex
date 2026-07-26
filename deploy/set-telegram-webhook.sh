#!/usr/bin/env bash
# Set Telegram webhook for Builders DEX bot (run on VPS after TELEGRAM_BOT_TOKEN is in .env)
set -euo pipefail
ROOT="${1:-/var/www/dex-buildingculture}"
# shellcheck disable=SC1091
set -a
# shellcheck source=/dev/null
source "$ROOT/.env"
set +a

: "${TELEGRAM_BOT_TOKEN:?Set TELEGRAM_BOT_TOKEN in $ROOT/.env}"
: "${TELEGRAM_WEBHOOK_SECRET:?Set TELEGRAM_WEBHOOK_SECRET in $ROOT/.env}"
APP_URL="${APP_URL:-https://dex.buildingcultureid.space}"
URL="${APP_URL%/}/api/telegram/webhook"

echo "Setting webhook → $URL"
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -d "url=${URL}" \
  -d "secret_token=${TELEGRAM_WEBHOOK_SECRET}" \
  -d 'allowed_updates=["message","callback_query","my_chat_member"]'
echo
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
echo
