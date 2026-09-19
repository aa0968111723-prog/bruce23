# IMPLEMENTATION CARD — PLANFORM-PUBLIC-HOME

- Project：planform-iso / PLANFORM (`planform`)
- Status：applied on branch `fix/planform-public-home`
- Date：2026-09-19

## Problem

Portfolio `/work/planform` process still started at 「選教室模板與人數」. The live SPA first screen is project home, not the canvas.

## Evidence (2026-09-19)

- `https://planform-iso-k7d2.zeabur.app/` → HTTP 200, title `PLANFORM｜活動空間彩排`
- `GET /version.json` → `{ version: "1.0.0", commit: "1b8513b", builtAt: "2026-09-16T15:09:46.926Z" }`
- PWA: `manifest.webmanifest` + `sw.js` present
- Live JS `/assets/index-BQWqIJUP.js` (1.5 MB): first-screen strings `我的專案` and `＋ 新建專案` from `src/ui/projectHome.ts`
- No `/api` routes in the bundle. Storage is localStorage / IndexedDB.
- Live JS: `本工具不做容留人數計算，也不做避難寬度計算`
- Production `/work/focus-challenge` already has PR #20 registration-first copy
- Production `/work/cutos` already says 不是 502 (PR #21)

This cycle did **not** create a project or drag objects in a browser. coreFlowPass stays false.

## Change

- Process / decisions / limitations / EN overlay match the live project-home screen
- Seed refresh `planform-public-home-20260919` rewrites process and decisions on existing CMS rows
- Do not mark coreFlowPass
- Do not invent CAD or occupancy-code claims

## Not claimed

- coreFlowPass remains false
- readiness >= 70 remains false
- PORTFOLIO_READY = FALSE

## Next exact step

After this PR deploys, verify production `/work/planform` process starts with 「我的專案」 / 「＋ 新建專案」. Then probe the next unrepaired official work (Folio / SkateHub / 對稿 / Hermes Console) for a real public core flow. Do not merge PR #10.
