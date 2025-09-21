#!/usr/bin/env bash
set -euo pipefail
# naive patterns
grep -RIn --exclude-dir=.git --exclude='*.png' --exclude='*.jpg' --exclude-dir=node_modules -E '(AKIA[0-9A-Z]{16}|-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----|xox[baprs]-[0-9A-Za-z-]{10,}|ghp_[0-9A-Za-z]{36})' . && { echo "Potential secret found."; exit 1; } || true
# entropy-ish base64 strings > 80 chars
grep -RIn --exclude-dir=.git --exclude-dir=node_modules -E '([A-Za-z0-9+/]{80,}={0,2})' . | head -n 5 && { echo "High-entropy strings detected (review)."; exit 1; } || true
