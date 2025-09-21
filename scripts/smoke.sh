#!/usr/bin/env bash
set -euo pipefail

API="${API_URL:-http://localhost:4000}"
WEB="${WEB_URL:-http://localhost:3000}"
ORCH="${ORCH_URL:-http://localhost:4001}"
PREV="${PREV_URL:-http://localhost:4002}"

echo "Waiting for API..."
for i in {1..80}; do
  if curl -fsS "$API/health" >/dev/null; then break; fi
  sleep 1
done
curl -fsS "$API/metrics" | grep -E '^# HELP' >/dev/null

echo "Minting token..."
TOKEN_JSON=$(curl -fsS -X POST "$API/auth/token" -H 'content-type: application/json' -d '{"userId":"smoke"}')
ACCESS=$(printf '%s' "$TOKEN_JSON" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
REFRESH=$(printf '%s' "$TOKEN_JSON" | sed -n 's/.*"refreshToken":"\([^"]*\)".*/\1/p')

echo "Calling protected endpoint..."
curl -fsS "$API/api/demo" -H "authorization: Bearer $ACCESS" | grep -F '"ok":true' >/dev/null

echo "SSE stream..."
curl -fsS -N "$API/sse" -H "authorization: Bearer $ACCESS" --max-time 10 | grep -F 'event: end' >/dev/null

echo "Orchestrator health..."
curl -fsS "$ORCH/health" | grep -F '"ok":true' >/dev/null

echo "Preview manager health and header forward..."
curl -fsS "$PREV/echo-proxy" -X POST -H "content-type: application/json" -H "authorization: Bearer $ACCESS" -H "x-user-id: smoke" -d '{}' | grep -F '"forwarded":true' >/dev/null

echo "Refreshing token..."
NEW_JSON=$(curl -fsS -X POST "$API/auth/refresh" -H 'content-type: application/json' -d "{"refreshToken":"$REFRESH"}")
NEW_ACCESS=$(printf '%s' "$NEW_JSON" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[ -n "$NEW_ACCESS" ]

echo "Logout..."
curl -fsS -X POST "$API/auth/logout" -H "authorization: Bearer $NEW_ACCESS" | grep -F '"ok":true' >/dev/null

echo "Web up..."
for i in {1..80}; do
  if curl -fsS "$WEB/" >/dev/null; then break; fi
  sleep 1
done

echo "SMOKE PASS ✅"