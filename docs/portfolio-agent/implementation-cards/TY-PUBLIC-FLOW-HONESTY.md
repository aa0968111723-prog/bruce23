# IMPLEMENTATION CARD — TY-PUBLIC-FLOW-HONESTY

- Project：ty / 專注力挑戰賽 (`focus-challenge`)
- Status：applied on branch `fix/ty-public-flow-honesty`
- Date：2026-09-19

## Problem

Production `/work/focus-challenge` still used booth-summary language after PR #18:

- 一句話：暖身、正式挑戰、即時看活動狀態
- 問題：不是再填一張表

That contradicts the live product. PR #18 rewrote process/walkthrough/limitations, but `refreshTyContractCopy` did not rewrite `summary` / `problem`, so existing CMS rows kept the old one-liner.

## Evidence (2026-09-19)

- `https://leader-dna-mcp-a7k2.zeabur.app/` → HTTP 200, title `淡江大學禪學社｜專注力挑戰賽`. SPA starts on the registration screen (`RegisterScreen`), not a play button.
- Official path from public `src/routes/index.tsx`: register (host, name, dept, grade, phone) → 2 tutorial questions → 15s warmup (`skipSave`) → official 60s (`POST /api/register` then `POST /api/result`).
- `GET /api/health` → `{ status: "ok", sheets: true, smtp: false }`
- `GET /api/leaderboard?scope=today` → `count: 0`, `public: true`
- `GET /api/leaderboard?scope=history` → `count: 67`, masked names only (no phone / full name)
- Production `/work/ai-director-os` no longer says 可能 502 / 可能暫停 (PR #17 live)
- Production `/work/framelab` Live Demo is still `cabin-shale-k7q2`

This cycle did **not** POST `/api/register` or `/api/result` (that would submit booth PII). coreFlowPass stays false.

## Change

- Rewrite summary, problem, process, walkthrough, limitations, EN overlay
- Seed refresh `ty-public-flow-honesty-20260919` now also rewrites summary / problem / role / seo / experience_config
- Do not mark coreFlowPass

## Not claimed

- coreFlowPass remains false
- readiness >= 70 remains false
- PORTFOLIO_READY = FALSE

## Next exact step

After this PR deploys, verify production `/work/focus-challenge` no longer says 「即時看活動狀態」 or 「不是再填一張表」, and the walkthrough starts on the registration screen. Then operate `planform` core flow on `https://planform-iso-k7d2.zeabur.app/` without inventing a second product. Do not merge PR #10 (CJK corruption).
