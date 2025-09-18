#!/usr/bin/env bash
set -euo pipefail
echo "Rolling back canary services..."
docker compose -f docker-compose.yml -f docker-compose.preview.yml rm -sf api-canary web-canary || true
echo "Canary removed. Stable remains online."
