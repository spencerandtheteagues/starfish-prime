#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 1 ]; then
  echo "Usage: $0 "New Project Name" [slug] [--dry-run]"
  exit 1
fi
NEW_NAME="$1"
SLUG="${2:-}"
shift || true
shift || true || true
if [ -n "${SLUG:-}" ]; then
  python3 scripts/scrub-repo.py --to "$NEW_NAME" --slug "$SLUG" "$@"
else
  python3 scripts/scrub-repo.py --to "$NEW_NAME" "$@"
fi

echo ""
echo "Verification search for old tokens (case-insensitive):"
grep -RniE "(one[- ]?shot|oneshot)" --exclude-dir .git --exclude-dir node_modules --exclude-dir .next || true
