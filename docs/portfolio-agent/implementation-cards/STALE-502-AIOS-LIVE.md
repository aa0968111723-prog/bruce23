# IMPLEMENTATION CARD — STALE-502-AIOS-LIVE

- Project：ai-director-os (`ai_os`)
- Status：applied on branch `fix/stale-502-aios-live`
- Date：2026-09-19

## Problem

Production `/work/ai-director-os` still said the public host 「可能暫停」and vexlark.co 「可能 502／暫停」.

## Evidence (2026-09-19)

- `https://ai-os-app.zeabur.app/` → HTTP 200, title `Aios · AI 創作作業系統｜把想法變成可執行的團隊計畫`
- `https://vexlark.co/` → HTTP 200, same title (custom domain of Zeabur service `ai-os-app`)
- Production `/work/framelab` Live Demo is already `cabin-shale-k7q2` (PR #11 live)
- Production `/work/xiaocai` and `/work/tku-zen-agent` no longer say 502 (PR #13 live)
- Production `/work/focus-challenge` no longer says Folio canvas (PR #15 live)

## Change

- Rewrite AI Director OS source notes and limitations
- CMS seed refresh `aios_live_probe_version` rewrites existing rows
- If stored live demo status is failed/unavailable, reset to pending so it re-probes
- Do not mark coreFlowPass (SPA still shows 載入中; team OS flow not operated)

## Not claimed

- coreFlowPass remains false
- readiness >= 70 remains false
- PORTFOLIO_READY = FALSE

## Next exact step

After this PR deploys, verify production `/work/ai-director-os` no longer says 502 or 暫停. Then operate `ty` core flow on `https://leader-dna-mcp-a7k2.zeabur.app/` without using sheet credentials in the portfolio. Do not merge PR #10 (CJK corruption).
