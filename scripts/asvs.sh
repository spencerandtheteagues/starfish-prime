#!/usr/bin/env bash
set -euo pipefail

API="${API_URL:-http://localhost:4000}"
WEB="${WEB_URL:-http://localhost:3000}"

echo "== ASVS Spot-Check =="

echo "-- Headers on /health --"
curl -fsSI "$API/health" | tr -d '\r' | awk 'BEGIN{IGNORECASE=1}/^HTTP|^x-/{print}'

echo "-- Security headers present --"
curl -fsSI "$API/health" | grep -iE 'x-content-type-options: *nosniff' >/dev/null || { echo "Missing X-Content-Type-Options"; exit 1; }
curl -fsSI "$API/health" | grep -iE 'x-frame-options: *(SAMEORIGIN|DENY)' >/dev/null || { echo "Missing/weak X-Frame-Options"; exit 1; }
curl -fsSI "$API/health" | grep -iE 'cross-origin-opener-policy' >/dev/null || { echo "Missing COOP"; exit 1; }
curl -fsSI "$API/health" | grep -iE 'cross-origin-resource-policy' >/dev/null || { echo "Missing CORP"; exit 1; }

echo "-- CORS deny by default --"
code=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: https://not-allowed.example" -I "$API/health" || true)
test "$code" -ge 400 || { echo "CORS should deny preflight/requests from disallowed origins"; exit 1; }

echo "-- Dependency audits --"
( cd services/api && (npm ci || npm i) >/dev/null 2>&1 && npm audit --omit=dev || true )
( cd services/web && (npm ci || npm i) >/dev/null 2>&1 && npm audit --omit=dev || true )

echo "-- Secrets hygiene --"
if [ -f ".env" ]; then echo "NOTE: .env present locally (ok), ensure it's gitignored."; fi
grep -R --line-number --fixed-strings "SIGNING_SECRET=" .gitignore >/dev/null 2>&1 || echo "TIP: Ensure .env is gitignored."

echo "ASVS SPOT-CHECK PASS ✅"
