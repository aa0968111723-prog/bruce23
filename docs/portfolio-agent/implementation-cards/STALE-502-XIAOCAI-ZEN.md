# IMPLEMENTATION CARD — STALE-502-XIAOCAI-ZEN

- Project：xiaocai (`-1`) + tku-zen-agent
- Status：applied on branch `fix/stale-502-xiaocai-zen-desk`
- Date：2026-09-19

## Problem

Portfolio still said both public hosts 「可能 502」. 小財 also reused Folio walkthrough chrome.

## Evidence (2026-09-19)

- `https://untitled-5.zeabur.app/` → HTTP 200, title `小財記帳`
- `https://tku-zen-agent-k7f2.zeabur.app/` and `?mode=ask` → HTTP 200, title `淡江大學領袖禪學社 · 工作台`, gate「請輸入授權碼 進入工作台」
- Production `/work/framelab` still shows pre-#11 copy (Zeabur MCP token invalid; deploy not confirmed)

## Change

- Remove stale 502 notes/limitations
- 小財 experience mode → media-gallery (not Folio walkthrough)
- 禪學社工作台 conversation preview states the access-code boundary; not Hermes runtime
- CMS seed refresh `stale_502_note_version`

## Not claimed

- coreFlowPass remains false
- PORTFOLIO_READY = FALSE
- bruce23 production deploy of #11: NOT VERIFIED

## Next exact step

1. Confirm production `/work/framelab` after Zeabur deploys main `504318e` (BLOCKED without ZEABUR_API_TOKEN).
2. After this PR deploys, confirm `/work/xiaocai` and `/work/tku-zen-agent` no longer say 502, and 小財 is not a Folio walkthrough.
3. Then pick the next lowest-readiness public tool with a real core flow (planform-iso or ty).
