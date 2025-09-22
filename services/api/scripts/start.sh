#!/usr/bin/env sh
set -euo pipefail
# Generate client and run migrations idempotently (optional)
npx prisma generate >/dev/null 2>&1 || echo "Prisma generate skipped"
npx prisma migrate deploy >/dev/null 2>&1 || echo "Prisma migrate skipped"
exec node src/index.js