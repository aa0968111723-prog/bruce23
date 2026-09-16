# Portfolio Task State

Cycle: source-aligned Folio/Zen reconstructions + playable experience quality (not complete)
Updated: 2026-09-16
HEAD: 56f91830c5ab4719d93d502e33b3f7ece6ccc9d2

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

## This cycle (real English overlays)

- Seed writes distinct `locale_json.en` for site headline/subhead/narrative/SEO and all eight featured works (title, subtitle, summary, problem, role, seoTitle, seoDescription, decisions, process, outputs, limitations, modalities, stack). Faithful translations of existing Chinese; product names expanded so en title ≠ zh title.
- `fillLocaleJsonGaps` / `fillArchiveLocaleGaps` / `fillSiteLocaleGaps` merge onto existing rows: existing zh wins, seed English fills empty or zh-duplicate fields only. Chinese row copy and GitHub/Canva/publication fields are not rewritten.
- Public `en` toggle overlays case-study lists via `pickLocaleList` / `overlayProject`. Admin ProjectForm edits zh/en list overlays in SEO / 語系.

## This cycle (admin EN experience chrome)

- ExperienceEditor now has structured EN overlay fields (not a primary JSON textarea). JSON stays a read-only 進階 preview. EN fields write `experience_config.locale.en` only; Chinese source fields stay Chinese. Empty EN falls through.
- Overlay order for public `lang=en`: saved `experience_config.locale.en` → dictionary `experienceCopyEn[slug]` → zh. `mergeExperienceConfig` preserves stored `locale` and does not fill it from the dictionary. No 0001/0002/0003 edit.
- Admin can save EN for: honesty/intro/Demo/Canva/GitHub/廊 notes, process node label/summary/purpose/stage, FrameLab demoDisclaimer, PLANFORM object name/use + circulation/compliance, 對稿 version labels + prompt/estimate, Zen/Hermes starter/disclaimer/placeholder/sourceNote, walkthrough title/body, existing Canva page labels. GitHub paths stay untranslated. Canva add-page still must not invent DAG ids.
- ProjectForm still dirties on `patch("experience_config")`, shows 有未儲存的修改, beforeunload, and sonner toasts. Tap targets stay ≥44px (`min-h-11`) on a light studio surface.

## This cycle (archive 中英文)

- `migrations/0003_archive_locale.sql` adds `archive_items.locale_json` (0002 untouched). Overlays: title, summary, caption, alt, originNote.
- Seed English for all eight archive cards. Public `overlayArchive` switches cards; Admin ArchiveForm edits zh/en overlays. Honesty copy (no public Canva share URL / cannot page) stays accurate in chrome and English item copy.
- Still zh-only: GitHub/Canva technical fields, JSON-LD (canonical zh), GitHub file paths.
- Experience playable UI chrome (tabs, FrameLab onion-skin, Canva unavailable, GitHub tab chrome, process/PLANFORM/對稿/Zen chrome) now follows the public zh|en preference. Saved Chinese `experience_config` node labels overlay from a parallel English map; missing en falls back to zh.

## This cycle (experience playable 中英文)

- `src/lib/locale/experience.ts` holds a zh|en chrome dictionary plus `experienceCopyEn` overlays. Catalog/defaults Chinese copy is unchanged.
- Public ExperiencePanel tabs, honesty labels, FrameLab onion-skin/compare, process-map stages, PLANFORM object labels, 對稿 version labels, Zen disclaimer, Canva unavailable fallback (including archive CanvaStage), and GitHub tab chrome switch with `luminous-studio-lang`.
- GitHub paths stay untranslated. JSON-LD stays canonical zh. Canva is still public-embed / unavailable — Connect is not claimed linked.

## This cycle (public 中英文 switcher)

- Public shell header (desktop nav + mobile cluster next to the menu) has a light-studio `zh | en` radiogroup, ≥44px, keyboard arrows/Home/End. Preference key `luminous-studio-lang` in localStorage only. CMS copy stays in Postgres.
- Homepage, about, work list, case study (title/summary/problem/role/decisions/process/outputs/limitations/modalities/stack/SEO document title), archive chrome/filters **and archive card titles/summaries/captions**, exploration headings/hubs/aria, privacy, 404, nav, footer switch via `locale_json` and chrome dictionaries. Empty English falls back to zh. JSON-LD stays canonical zh. Admin `/admin` and `/login` stay bare (no toggle). No dark mode. Grok branding untouched.
- Experience playable chrome now follows the same toggle (see experience cycle above).

## This cycle (admin field round-trip)

- Distinctive `RT-*` values persist through `createProjectRecord` / `saveProjectRecord` / `persistDemoVerify` / `saveSiteSettings` / `upsertArchive` and are read back from `getAdminProject`, `getPublishedProject`, `toPreviewProject`, and `resolveHomepageCopy`.
- Drop-on-save fixes: Demo 測試 now writes `live_demo_url|type|status|embed` (`persistDemoVerify`) and returns `AdminProject` so a later 儲存 does not revert iframe; cover/video src rewrite keeps caption/poster; extra gallery images are editable; locale subhead is on Settings and merged into `locale_json`; public archive serializes `pageIds`; GitHub sync without a branch keeps the saved `github_branch`; Experience Demo/Canva/GitHub/廊 notes are always visible.
- Canva embed test still persists `pending` from allowlist syntax, never `verified`. Test-only DAG ids (`DAGroundTrip1`, `DAGarchiveRt1`) live in unit tests only, not on the eight featured works.

## This cycle (section 13 test matrix)

- Handler-level: unauthenticated and signed-in non-admin cannot `handleCreateProject` / `handleSaveDraft` / `handleSetPublication` (no allowlist mock, no production mint).
- Drafts stay off `publicSitemapPaths` and off `publishedCreativeWorkJsonLd` built from `listPublishedProjects`; public case still 404s.
- CanvaStage / LiveDemoStage: one iframe, only after empty/local/fallback (or embed) returns.
- `nextRovingTabIndex` unit + live ExperiencePanel/GitHub tree keyboard E2E.
- GitHub client parses repo JSON onto metadata (name/description/language/branch).

## This cycle (playtest)

- Folio walkthrough now draws a stage from saved `walkthrough` steps (canvas / command / audit / MCP), not a blank 1/4 card.
- Poster Vision auto-runs heatmap + region estimates when the sample loads; still labeled as pixel estimate, not eye-tracking.
- AI Director OS nodes show GitHub source paths on the chips, plus process summary in the panel.
- Planform / 對稿 live demos stay iframe-only when hydrate marks them verified+embeddable (Zeabur HTML, no frame-bust). AI Director OS and Hermes remain open-in-new-tab (`frame-ancestors none`).

## This cycle (honest visual evidence + playable quality)

- Folio visual tab now includes `/media/studio/folio-editor.svg`: a Luminous Studio reconstruction aligned with public canva2 `editor-shell.tsx` (top bar, tool rail, canvas, inspector, publish). Caption and source evidence say it is not an operation screenshot. `og.jpg` remains the only public raster from canva2.
- TKU Zen visual tab now includes `/media/studio/tku-zen-chat.svg`: a light-studio reconstruction aligned with public `src/app/page.tsx` + `src/lib/zen.ts` (header, bubbles, suggestion chips, breath, composer). Caption says the original UI is dark and this is a translation, not a product screenshot. Club illustration remains the only related public raster.
- Playable upgrades (still labeled portfolio demos): AI Director process pipeline SVG; FrameLab localized key/breakdown/generated labels; Poster Vision heatmap honesty badge on the overlay; PLANFORM isometric booth glyphs; 對稿 numbered pins; Zen/Hermes chat chrome with suggestion chips and breath/disconnected badges; Folio canvas stage drawn as editor-shell, command labels localized, MCP panel stays light.
- Admin ExperienceEditor can edit zh/en suggestion lines. `experience_config.conversation.suggestions` is schema-backed and overlays with `lang=en`.
- No public `canva.com/design/{id}` invented. Canva Connect still fail-closed.

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
- JSON-LD stays canonical zh (intentional). GitHub file paths stay untranslated (intentional).
- Folio still has no public editor-operation screenshot (og.jpg share card + labeled studio reconstruction from editor-shell.tsx)
- tku-zen-ai still has no public chat-UI screenshot (club illustration + labeled light reconstruction from page.tsx; original UI is dark)
- Platform PWA apple-touch / `__grok` install icon remains Grok chrome (not overwritten)
