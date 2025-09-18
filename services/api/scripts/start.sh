#!/usr/bin/env sh
set -euo pipefail
# Generate client and run migrations idempotently
npx prisma generate >/dev/null 2>&1 || true
npx prisma migrate deploy >/dev/null 2>&1 || true
exec node src/index.js