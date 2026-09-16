#!/bin/sh
set -eu
cd /workspace
# Preview-only admin allowlist. Deployed apps must set PORTFOLIO_ADMIN_EMAILS
# in platform env. This is the public site email, not a secret.
export PORTFOLIO_ADMIN_EMAILS="${PORTFOLIO_ADMIN_EMAILS:-aa0968111723@gmail.com}"
# :8081 is QA-only — a revive must never inherit a stale built-output preview.
node scripts/preview.mjs stop || true
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
