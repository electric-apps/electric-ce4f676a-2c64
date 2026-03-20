#!/bin/bash
# Forward AskUserQuestion hook events to Electric Agent studio.
# Blocks until the user answers in the web UI.
BODY="$(cat)"
RESPONSE=$(curl -s -X POST "http://host.docker.internal:4400/api/sessions/ce4f676a-3d92-4643-8f4f-9669df96d8c0/hook-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fa2b2788f9d2fd39f969cdb300c3fb8bf5e790bb6de58524b98b251386979754" \
  -d "${BODY}" \
  --max-time 360 \
  --connect-timeout 5 \
  2>/dev/null)
if echo "${RESPONSE}" | grep -q '"hookSpecificOutput"'; then
  echo "${RESPONSE}"
fi
exit 0