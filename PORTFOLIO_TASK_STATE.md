# Portfolio Task State

Cycle: per-work playtest vs original spec (not complete)
Updated: 2026-09-16

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Featured works (8): `ai-director-os`, `framelab`, `poster-vision-ai`, `planform`, `duigao`, `folio`, `hermes-console`, `tku-zen-ai`
- Featured repos read: `ai_os`, `FrameLab`, `poster-vision-ai`, `planform-iso`, `duigao`, `canva2`, `hermes-console`, `tku-zen-ai`, `urban-green-rose-pixel`, `ever-marble-flora-clover`, `healing-studio`
- Drive indexed, not published as folders: `平面設計作品集`, `柏能作品集.pdf` still not in this MCP account
- Canva originals hosted locally: TKU Zen poster + deck pages (SVG translations)
- Notion: disconnected. Adapter stub only.
- Canva MCP this environment: `needsAuth`; previous `mcp_auth` failed (`Interaction query handler is not initialized`). No design list. Connect OAuth is not claimed connected.
- Drive MCP: last known ready as `aaassswwwyyy17@gmail.com` (not the allowlisted admin). PNG/architecture files are owner-only. Spreadsheets (禪師開示、招生總表) and a 1GB Filmora video refused. No public PDF Canva download.
- Public GitHub READMEs / homepages: no live `canva.com/design/{DAG…}` share URLs.
- Web + GitHub trees this cycle: canva2 has `public/og.jpg` + tiny favicon + Grok chrome. tku-zen-ai has only Next.js default SVGs/favicon (refused as product shots). Related: `urban-green-rose-pixel/attachments/淡江大學 禪學社 (1).png` club illustration. Refused: Grok install chrome, Next defaults, wood-ivory tea/lecture, tamsui drama sprites, urban-green quiz screenshots (leader-quiz), ever-marble game shots.
- Wired GitHub exports under `/media/github-exports/` for all 8 featured works. Folio: canva2 `public/og.jpg` (share card / F wordmark, not editor UI). TKU Zen: compressed JPEG of public `urban-green-rose-pixel` club illustration (not tku-zen-ai chat, not Canva). tku-zen-ai itself has zero product-operation images (Next.js default SVGs refused). Archive stays SVG translations.
- Site share card: custom `public/og.jpg` (1200×630 Luminous Studio light-studio lockup, not the og.grok.me placeholder). PWA raster icons: `public/icon-192.png` and `public/icon-512.png` from the light favicon. Platform `/__grok/icon-180.png` stays Grok chrome and is not overwritten.

## CI (PR #4)

- Combined status: CodeRabbit **SUCCESS** (review skipped for OSS).
- Check runs: none (no `.github/workflows` in repo).
- Copilot Code Review: **failure** is environment-only monthly quota **402**. Not a code failure. Codex review also quota.
- Review threads: none.
- PR comments: Cursor bot, Codex quota, CodeRabbit skip. No human review threads.

## This cycle (playtest)

- Folio walkthrough now draws a stage from saved `walkthrough` steps (canvas / command / audit / MCP), not a blank 1/4 card.
- Poster Vision auto-runs heatmap + region estimates when the sample loads; still labeled as pixel estimate, not eye-tracking.
- AI Director OS nodes show GitHub source paths on the chips, plus process summary in the panel.
- Planform / 對稿 live demos stay iframe-only when hydrate marks them verified+embeddable (Zeabur HTML, no frame-bust). AI Director OS and Hermes remain open-in-new-tab (`frame-ancestors none`).

## This cycle (CODE leftovers)

- Admin `/admin/projects` list: loading vs empty vs error; live E2E waits for `/edit` links, not the 新增 button; duplicate-slug create recovers by opening the existing row.
- Homepage/about SEO reads `locale.zh/en.seoTitle|seoDescription` then row fields.
- Admin settings + ProjectForm edit locale SEO / problem / role overlays.
- JSON-LD description prefers `seoDescription`.
- Visual / media-gallery tabs use MediaFrame (poster + error). GitHub export PNGs use object-contain.
- Hint-tree keyboard actually moves DOM focus.
- Admin home/archive/preview/integrations show loading instead of a false empty list.
- Empty stored `timeline.frames` / `processNodes` / spatial objects now restore catalog defaults so FrameLab play is not a blank strip.
- GitHub-export shots (including Folio og.jpg dark desk) sit in warm matte `bg-mat` gallery chrome with a GitHub 匯出 label. Not dark mode.
- Live admin E2E pastes the existing `DAGfixtureEmbedShape` fixture onto `live-e2e-work` only, asserts pending not verified, publishes, checks public iframe or honest fallback, then unpublishes. Fixture is not seeded onto the eight featured works.
- Admin Canva fields (project, archive, integrations, experience page labels) show empty-state copy: paste `canva.com/design/{id}` share links. No invented page IDs. Public Canva stage only shows paging when real `pageIds` exist.

## Not done / blocked

- Original photography and event photos (Drive originals not on a public CDN)
- Original AI video files (too large for git; old Manus URLs are dead)
- Real public Canva share/embed URLs for the 8 works
- Canva Connect credentials + CANVA_TOKEN_KEY (OAuth cannot be live-proved)
- Canva MCP auth in this environment
- Google Drive as the allowlisted owner (current connector identity is not the admin)
- Google login as `aa0968111723@gmail.com` to browser-prove admin as a human
- `GITHUB_READ_TOKEN` for private repos
- Notion connection
- Full bilingual UI toggle (zh/en fields are stored and read; no language switcher)
- Folio still has no public editor-operation screenshot (only og.jpg share card)
- tku-zen-ai still has no public chat-UI screenshot (wired related club illustration only)
- Platform PWA apple-touch / `__grok` install icon remains Grok chrome (not overwritten)
