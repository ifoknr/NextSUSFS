#!/usr/bin/env bash
# Posts a release to its Telegram topic: the file itself, a short HTML caption
# with the CHANGELOG section, and link buttons. Official releases get pinned.
#
# Secrets:  TELEGRAM_TOKEN, TELEGRAM_TO, TELEGRAM_TOPIC (optional)
# Per tool: TOOL, ICON, LAYER, REQUIRES, AUTO_UPDATE (true/false)
# Release:  TAG, VERSION (the CHANGELOG heading), PRE (true/false), FILE
set -euo pipefail
export LC_ALL=C.UTF-8

if [ -z "${TELEGRAM_TOKEN:-}" ] || [ -z "${TELEGRAM_TO:-}" ]; then
  echo "Telegram secrets are not set, skipping."
  exit 0
fi

api="https://api.telegram.org/bot$TELEGRAM_TOKEN"
repo_url="https://github.com/$GITHUB_REPOSITORY"
release_url="$repo_url/releases/tag/$TAG"
# INFO: Without a file, Download opens the release page.
download_url="$release_url"
[ -n "${FILE:-}" ] && download_url="$repo_url/releases/download/$TAG/$(basename "$FILE")"

esc() { sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g'; }

# INFO: The CHANGELOG section for VERSION as bullets. "- " starts an item and
#         indented lines continue it; other lines are kept without ** markers.
notes=$(awk -v v="## $VERSION" '
  $0 == v { f = 1; next }
  /^## / { f = 0 }
  !f { next }
  /^- / { if (item != "") print item; item = "• " substr($0, 3); next }
  /^[ \t]+[^ \t]/ && item != "" { sub(/^[ \t]+/, ""); item = item " " $0; next }
  /^[ \t]*$/ { next }
  { if (item != "") print item; item = ""; gsub(/\*\*/, ""); print }
  END { if (item != "") print item }' CHANGELOG.md 2> /dev/null | esc || true)

# INFO: A caption holds 1024 characters, so long notes are cut at a line end.
max=560
if [ "${#notes}" -gt "$max" ]; then
  notes="${notes:0:$max}"
  notes="${notes%$'\n'*}"$'\n'"…"
fi
[ -n "$notes" ] || notes="See the release page."

{
  if [ "$PRE" = true ]; then
    echo "🧪 <b>$TOOL</b> <code>$TAG</code>"
    echo "<i>إصدار تجريبي، للاختبار فقط · ما يوصل كتحديث</i>"
  else
    echo "$ICON <b>$TOOL</b> <code>$TAG</code>"
    echo "<i>$LAYER</i>"
  fi
  echo
  echo "📝 <b>الجديد</b>"
  echo "<blockquote expandable>$notes</blockquote>"
  if [ "$PRE" != true ]; then
    echo "⚙️ <b>يحتاج:</b> $REQUIRES"
    [ "${AUTO_UPDATE:-false}" = true ] && echo "🔄 يوصلك التحديث من الروت مانجر تلقائياً"
    echo
    echo "⚠️ <i>Personal project, use at your own risk.</i>"
    echo "#$TOOL #تحديث"
  else
    echo
    echo "#$TOOL #تجريبي"
  fi
} > caption.html

profile="https://github.com/${GITHUB_REPOSITORY%%/*}"
if [ "$PRE" = true ]; then
  details="$release_url"
else
  details="$repo_url/blob/HEAD/CHANGELOG.md"
fi
jq -n --arg dl "$download_url" --arg det "$details" --arg repo "$repo_url" --arg me "$profile" \
  '{inline_keyboard: [[{text: "⬇️ Download", url: $dl}, {text: "📋 Details", url: $det}],
                      [{text: "⭐ Repository", url: $repo}, {text: "👤 GitHub", url: $me}]]}' > markup.json

# INFO: --form-string sends values as they are; with -F a chat id like @group
#         would be read as a file to upload.
args=(--form-string "chat_id=$TELEGRAM_TO" --form-string parse_mode=HTML -F "reply_markup=<markup.json")
[ -n "${TELEGRAM_TOPIC:-}" ] && args+=(--form-string "message_thread_id=$TELEGRAM_TOPIC")
# INFO: Test builds arrive silently.
[ "$PRE" = true ] && args+=(--form-string disable_notification=true)

# INFO: Bots can upload up to 50 MB; a bigger or missing file goes as a text message.
if [ -n "${FILE:-}" ] && [ -f "$FILE" ] && [ "$(stat -c %s "$FILE")" -lt 50000000 ]; then
  resp=$(curl -sS --fail-with-body "${args[@]}" -F "caption=<caption.html" -F "document=@$FILE" "$api/sendDocument")
else
  resp=$(curl -sS --fail-with-body "${args[@]}" -F "text=<caption.html" "$api/sendMessage")
fi
echo "Sent to Telegram."

if [ "$PRE" != true ]; then
  id=$(jq -r '.result.message_id' <<< "$resp")
  if curl -sS --fail-with-body -o /dev/null "$api/pinChatMessage" \
       --data-urlencode "chat_id=$TELEGRAM_TO" -d "message_id=$id" -d disable_notification=true; then
    echo "Pinned."
  else
    echo "::warning::Could not pin the message. Give the bot the Pin messages right."
  fi
fi
