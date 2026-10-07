#!/usr/bin/env bash
# Posts the NEXT intro posts (banner + caption + buttons) from .github/announce
# to a Telegram topic. Usage: announce.sh <post|all>
set -euo pipefail

if [ -z "${TELEGRAM_TOKEN:-}" ] || [ -z "${TELEGRAM_TO:-}" ]; then
  echo "Telegram secrets are not set, skipping."
  exit 0
fi

api="https://api.telegram.org/bot$TELEGRAM_TOKEN"
dir=.github/announce
me="https://github.com/ifoknr"
declare -A repo=([wheel]=NextWheel [zygisk]=NexTZygisk [susfs]=NextSUSFS)

markup() {
  if [ "$1" = next ]; then
    jq -n --arg me "$me" '{inline_keyboard: [
      [{text: "🎡 NextWheel", url: ($me + "/NextWheel")},
       {text: "⚡ NextZygisk", url: ($me + "/NexTZygisk")},
       {text: "🛡️ NextSUSFS", url: ($me + "/NextSUSFS")}],
      [{text: "👤 GitHub", url: $me}]]}'
  else
    jq -n --arg r "$me/${repo[$1]}" --arg me "$me" '{inline_keyboard: [
      [{text: "⬇️ Download", url: ($r + "/releases/latest")}, {text: "📖 README", url: ($r + "#readme")}],
      [{text: "👤 GitHub", url: $me}]]}'
  fi
}

posts=("$1")
[ "$1" = all ] && posts=(next wheel zygisk susfs)

for p in "${posts[@]}"; do
  markup "$p" > markup.json
  args=(--form-string "chat_id=$TELEGRAM_TO" --form-string parse_mode=HTML)
  [ -n "${TELEGRAM_TOPIC:-}" ] && args+=(--form-string "message_thread_id=$TELEGRAM_TOPIC")
  curl -sS --fail-with-body -o /dev/null "${args[@]}" \
    -F "photo=@$dir/$p.png" -F "caption=<$dir/$p.html" -F "reply_markup=<markup.json" "$api/sendPhoto"
  echo "Posted $p."
  sleep 2
done
