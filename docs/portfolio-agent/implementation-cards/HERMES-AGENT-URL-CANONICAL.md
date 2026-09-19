# IMPLEMENTATION CARD — HERMES-AGENT-URL-CANONICAL

- Project：hermes-agent + bruce23
- Status：applied on branch `research-impl/hermes-agent/HERMES-AGENT-URL-CANONICAL`
- Date：2026-09-19

## Problem

PR #6 最初把 Hermes Agent canonical URL 寫成 `https://455.zeabur.app/sessions`。該主機根路徑與 `/sessions` 皆 HTTP 502。

## Evidence

- `https://455.zeabur.app/` → HTTP 502
- `https://455.zeabur.app/sessions` → HTTP 502
- `https://hermes-agent-k7q2.zeabur.app/` → 302 `/login`，標題 `Sign in — Hermes Agent`
- `GET https://hermes-agent-k7q2.zeabur.app/api/status` → version 0.18.2，`auth_required: true`
- 作品集頁 https://bruce23-k7m2.zeabur.app/work 已顯示 k7q2 與「需登入」

## Goal

- `links.live` / CMS `live_demo_url` 只指向 k7q2
- 455 只以 stale-502 證據存在，不當 Live Demo
- 訪客案例頁只承諾看得到 Sign in
- 不標記 `coreFlowPass` 或 readiness >= 70

## Files

- `src/content/linked-works.ts`
- 既有 `src/lib/cms/seed.ts`（`STALE_HERMES_LIVE_HOST` + `refreshHermesDashboardLive` + `fillLiveDemoAndEvidenceGaps`）
- 既有 `src/lib/cms/store.test.ts`

## Definition of Done

- [x] canonical live = `https://hermes-agent-k7q2.zeabur.app/`
- [x] 455 標 stale-502，不是 live 按鈕
- [x] 登入邊界寫進 summary / process / limitations
- [ ] 授權後的 sessions 核心流程：仍未驗證
- [ ] readiness >= 70：否

PORTFOLIO_READY = FALSE
