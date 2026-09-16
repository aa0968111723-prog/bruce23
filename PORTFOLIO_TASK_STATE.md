# Portfolio Task State

Cycle: hunt shareable visuals (not complete)
Updated: 2026-09-16

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Featured repos read: `ai_os`, `FrameLab`, `poster-vision-ai`, `planform-iso`, `duigao`, `canva2`, `hermes-console`, `tku-zen-ai`, `urban-green-rose-pixel`, `ever-marble-flora-clover`, `healing-studio`
- Drive indexed, not published as folders: `平面設計作品集`, `柏能作品集.pdf` still not in this MCP account
- Canva originals hosted locally: TKU Zen poster + deck pages (SVG translations)
- Notion: disconnected. Adapter stub only.
- Canva MCP this environment: `needsAuth`; `mcp_auth` failed (`Interaction query handler is not initialized`). No design list. Connect OAuth is not claimed connected.
- Drive MCP: ready as `aaassswwwyyy17@gmail.com` (not the allowlisted admin). PNG/architecture files are owner-only. Spreadsheets (禪師開示、招生總表) and a 1GB Filmora video refused. No public PDF Canva download.
- Public GitHub READMEs / homepages: no live `canva.com/design/{DAG…}` share URLs.
- Web + GitHub code search this cycle: still **no** owner-tied public `canva.com/design/{id}` URLs. healing-studio `docs/design-reference.md` still only `/d/ysK5sYZisVEjZFe`.
- Wired this cycle: public GitHub PNG copies under `/media/github-exports/` for ai_os, FrameLab, poster-vision-ai, planform-iso, duigao, hermes-console. Folio (canva2) and tku-zen-ai have no product PNG in-repo. Archive stays SVG translations.

## CI (PR #4)

- Combined status: CodeRabbit **SUCCESS** (review skipped for OSS).
- Check runs: none (no `.github/workflows` in repo).
- Copilot Code Review: **failure** is environment-only monthly quota **402**. Not a code failure. Codex review also quota.
- Review threads: none.
- PR comments: Cursor bot, Codex quota, CodeRabbit skip. No human review threads.

## This cycle (CODE leftovers)

- Admin `/admin/projects` list: loading vs empty vs error; live E2E waits for `/edit` links, not the 新增 button; duplicate-slug create recovers by opening the existing row.
- Homepage/about SEO reads `locale.zh/en.seoTitle|seoDescription` then row fields.
- Admin settings + ProjectForm edit locale SEO / problem / role overlays.
- JSON-LD description prefers `seoDescription`.
- Visual / media-gallery tabs use MediaFrame (poster + error). GitHub export PNGs use object-contain.
- Hint-tree keyboard actually moves DOM focus.
- Admin home/archive/preview/integrations show loading instead of a false empty list.
- Empty stored `timeline.frames` / `processNodes` / spatial objects now restore catalog defaults so FrameLab play is not a blank strip.
- Seed appends missing GitHub-export media by `src` without replacing admin covers.

## Not done / blocked

- Original photography and event photos (Drive originals not on a public CDN)
- Original AI video files (too large for git; old Manus URLs are dead)
- Real public Canva share/embed URLs for the 8 works
- Canva Connect credentials + CANVA_TOKEN_KEY (OAuth cannot be live-proved)
- Canva MCP auth in this environment
- Google login as `aa0968111723@gmail.com` to browser-prove admin as a human
- `GITHUB_READ_TOKEN` for private repos
- Notion connection
- Full bilingual UI toggle (zh/en fields are stored and read; no language switcher)
- Folio / tku-zen-ai still lack public in-repo PNG/PDF product shots
