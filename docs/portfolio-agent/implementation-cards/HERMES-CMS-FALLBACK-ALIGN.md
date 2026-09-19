# IMPLEMENTATION CARD — HERMES-CMS-FALLBACK-ALIGN

- Priority: P0
- Owner: Main Agent
- Repo: aa0968111723-prog/bruce23 only
- Branch suggestion: repair/hermes/cms-fallback-align
- Do not: rewrite UI, merge, push main/master, touch hermes-console app code, touch data/tamkang/, echo secrets, mark READY

## Goal
Visitor-facing Hermes live URL must be the canonical dashboard `https://hermes-agent-k7q2.zeabur.app/` (sessions path allowed). `https://455.zeabur.app` is a stale host returning HTTP 502.

## Evidence (2026-09-19T20:01 CST)
- k7q2 `/` and `/sessions` HTTP 200, title `Sign in — Hermes Agent`
- k7q2 `/api/status` version `0.18.2`, gateway_running true
- 455 `/` and `/sessions` HTTP 502 Bad Gateway
- Service ID (already corrected in PR #6 state): `6aad03324850645efd210d94`
- main seed already defines `HERMES_DASHBOARD_LIVE_VERSION` and `STALE_HERMES_LIVE_HOST`; production CMS row / static fallback may still lag

## Acceptance
1. Static fallback + CMS seed + existing DB row (if seed refresh is the project contract) all point at k7q2.
2. Public serializer never emits 455 as canonical live URL.
3. Login boundary remains visible (AUTH REQUIRED / Sign in). Do not fake an authenticated session.
4. Tests that still plant 455 as current live URL are updated to treat 455 as stale fixture only.
5. No Featured / ready / coreFlowPass=true from HTTP 200 alone.

## Out of scope
- Hermes version upgrade 0.18.2 → 0.21.3
- hermes-console application
- FrameLab product invention
- Authenticated tool execution (needs isolated demo credentials from owner)

## Agent Prompt (copy-paste)

```
You are the Bruce23 Main Agent.
Read docs/PORTFOLIO_AGENT_PLAN.md, docs/portfolio-agent/state.json, docs/portfolio-agent/implementation-cards/HERMES-CMS-FALLBACK-ALIGN.md.

Task: HERMES-CMS-FALLBACK-ALIGN on repo aa0968111723-prog/bruce23 only.
Work on a new branch repair/hermes/cms-fallback-align. Open a draft PR. Do not merge. Do not push main or master.

1. Search static content, CMS seed, serializers, and tests for 455.zeabur.app and hermes-agent-k7q2.
2. Canonical live URL = https://hermes-agent-k7q2.zeabur.app/ (sessions: /sessions).
3. Keep 455.zeabur.app only as an explicit stale / superseded host label. Do not delete history; do not present it as live.
4. Preserve existing human-written Chinese/English copy. Do not invent new product names.
5. Do not edit hermes-console application code or data/tamkang/.
6. Do not change Zeabur env vars or restart other services.
7. Do not print tokens or secrets.
8. After edit: run the smallest relevant unit tests for CMS/store/seed. Do not mark readiness ready.
9. Report files changed, test output, and leftover 455 references.
```
