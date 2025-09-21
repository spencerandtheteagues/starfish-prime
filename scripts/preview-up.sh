#!/usr/bin/env bash
set -euo pipefail
docker compose -f docker-compose.yml -f docker-compose.preview.yml up -d --build
echo "Preview up:"
echo "  API:  http://api.lvh.me/health"
echo "  WEB:  http://web.lvh.me/"
echo "  Canary API: http://api-canary.lvh.me/health"
echo "  Canary WEB: http://web-canary.lvh.me/"
