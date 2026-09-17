#!/bin/sh
set -eu
cd /workspace
# Fail closed: do not invent an allowlist here. Local preview may inject one
# via scripts/preview-local.mjs; production must set PORTFOLIO_ADMIN_EMAILS.
# :8081 is QA-only — a revive must never inherit a stale built-output preview.
node scripts/preview.mjs stop || true
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
