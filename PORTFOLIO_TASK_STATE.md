# Portfolio Task State

Cycle: independent CODE audit vs original spec (not complete)
Updated: 2026-09-16

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Featured repos read: `ai_os`, `FrameLab`, `poster-vision-ai`, `planform-iso`, `duigao`, `canva2`, `hermes-console`, `tku-zen-ai`, `urban-green-rose-pixel`, `ever-marble-flora-clover`, `healing-studio`
- Drive indexed, not published as folders: `平面設計作品集`, `柏能作品集.pdf`
- Canva originals hosted locally: TKU Zen poster + deck pages
- Notion: disconnected. Adapter stub only.
- Canva MCP this environment: `needsAuth`; not used. No design list. Connect OAuth is not claimed connected.
- Public GitHub READMEs / homepages: no live `canva.com/design/{DAG…}` share URLs.
- Web + GitHub code search this cycle: still **no** owner-tied public `canva.com/design/{id}` URLs. Only healing-studio `/d/` shorts (already probed).

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
- Visual / media-gallery tabs use MediaFrame (poster + error).
- Hint-tree keyboard actually moves DOM focus.
- Admin home/archive/preview/integrations show loading instead of a false empty list.

## Not done / blocked

- Original photography and event photos (Drive originals not on a public CDN)
- Original AI video files (too large for git; old Manus URLs are dead)
- Real public Canva share/embed URLs for the 8 works
- Canva Connect credentials + CANVA_TOKEN_KEY (OAuth cannot be live-proved)
- Google login as `aa0968111723@gmail.com` to browser-prove admin as a human
- `GITHUB_READ_TOKEN` for private repos
- Notion connection
- Full bilingual UI toggle (zh/en fields are stored and read; no language switcher)
