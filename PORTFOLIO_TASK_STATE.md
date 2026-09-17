# Portfolio Task State

Cycle: post-merge integrity vs original 10 — KEEP OPEN (not complete)
Updated: 2026-09-17
HEAD: (see this branch tip; recording commit follows the GitHub tree recovery)

## This cycle (2026-09-17, after PRs #2 / #3 / #4 merged)

PRs #2, #3, #4 on `aa0968111723-prog/bruce23` merged in that order. `origin/main` tip audited: `89e9111` (merge of PR #4). Parents: `131d0d6` (PR #3) + `94eaf85` (PR #4 tip). Tree of `origin/main` **equals** PR #4 / leftover-hunt `9f29b39` (`183e342`). Winning CMS is `src/lib/cms`. No leftover `src/lib/portfolio` on main. Public site does not import it.

New branch: `cursor/portfolio-cms-main-cfe4` from up-to-date `origin/main`. Do not mark complete.

### Merge integrity (file evidence)

- Routes: public `/` `/work` `/work/$slug` `/archive` `/about` `/privacy` + admin layout `/admin` with projects/archive/integrations/preview/settings/draft. No duplicate admin editors from PR #2/#3 (`ProjectEditor` / `src/lib/portfolio` deleted on the winning tree).
- Eight featured works still in catalog + seed: `ai-director-os`, `framelab`, `poster-vision-ai`, `planform`, `duigao`, `folio`, `hermes-console`, `tku-zen-ai`. Distinct ExperiencePanel modes survived.
- `DedupHydratedShells`, `unionByKey` Folio walkthrough (`畫布 → 畫板 → 指令層`), zh|en, integrations desk, Canva fallback, Luminous Studio light tokens: present.
- Catalog paths re-checked against live GitHub HEAD (FrameLab `context-engine.ts` / `execute.ts`, canva2 editor files, ai_os services, hermes `lib/server/canva.ts`, zen.ts, poster vision, planform core, duigao RoomWorkspace). Recursive trees not truncated (28–2832 entries).
- GitHub `search_code` `canva.com/design user:aa0968111723-prog`: parsers/fixtures only. **No real public DAG.** Healing-studio `/d/` shorts only. Canva MCP `needsAuth`; not faked connected. Drive private files not published. `project-manifest.json` `publicDesignIds: []`.

### CODE shipped this cycle (honest GitHub empty/stale gap)

- `fetchPublicRepo` backfills catalog `keepPaths` (and `README.md`) from GitHub contents when the recursive tree omitted them. 404 is not invented. Failed recursive tree still leaves `fileTree` unset so a stored tree is not replaced with a keepPath-only stub.
- `applyGithubSync` will not replace a stored non-empty tree with `[]`. That case is marked `stale` so hydrate v6 retries.
- `GITHUB_HYDRATE_VERSION` `5` → `6` so merged DBs rescan.

### Original 10 (not the wrap-up 14)

| # | Requirement | Verdict |
|---|---|---|
| 1 | Admin CMS (create/save/publish/unpublish/revisions/preview, fields persist to public published pages) | **CODE present** after merge. Human Google as `aa0968111723@gmail.com`: **owner-secret** |
| 2 | Auth fail-closed `PORTFOLIO_ADMIN_EMAILS` | **CODE present**. Production must set the env. Human login: **owner-secret** |
| 3 | DB 0002 (plus 0001/0003) | **present** (0001 untouched) |
| 4 | Server GitHub hydrate (tree/README/languages/topics/commit; no fake) | **CODE present** (hydrate v6 + keepPath contents backfill). Private token / live refresh of every path: **owner-secret** |
| 5 | ExperiencePanel per-work modes vs each repo HEAD | **CODE present** as labeled portfolio demos. Catalog paths match live HEAD. Not the live products. |
| 6 | Canva embed + Connect reserve | **CODE present** (paste `/design/{id}`, `/d/` fallback, no blank iframe, Connect fail-closed). Real public DAG for the eight: **owner-secret / not present**. Connect MCP: **needsAuth** |
| 7 | Interactive homepage (data-backed constellation) | **CODE present** (hubs pressable, modality-backed). |
| 8 | Privacy | **present** |
| 9 | Tests from the original list | **CODE present** (handlers, isolation, Canva/demo iframe, keyboard, GitHub parse, keep-last, keepPath backfill, empty-tree preserve). Not a substitute for owner Canva/Connect. |
| 10 | Gates (typecheck/test/lint/build/check:auth/smoke/preview) | **re-run on this branch** (see below / recording commit) |

Should parent mark goal complete? **KEEP OPEN.** Owner public Canva DAG, Connect, human Google as `aa0968111723@gmail.com`, `GITHUB_READ_TOKEN`, Notion, Folio/Zen operation shots, Drive media are still required by the original ask.

---

# Prior wrap-up (stale HEAD; kept for history)

Cycle: final wrap-up — CODE closed on this branch; OWNER blockers remain (not complete)
Updated: 2026-09-16
HEAD: a6ef72e5e427d7d63c4a099600263b01cd18dfc4

## Wrap-up (2026-09-16)

Wrap-up owns from 5695b30 onward. Recording commit: `a6ef72e5e427d7d63c4a099600263b01cd18dfc4`. Confirmed prior HEAD: `617762dba5005745405a19d6c8678323d6b3b2de` (not the stale 6fb52a7 note). Code SHA for homepage alts + §13 public-path tests: `5695b304ef5e9fa3a41acebad7825d079d9bfef5`. Last gate-record commit: `617762d`.

No owner-provided `canva.com/design/{id}` exists in production content. `project-manifest.json` `publicDesignIds` is `[]`. Healing-studio `/d/` shorts stay honest unavailable fallback (browser follow stays on `/d/`, 404). Fixture DAG ids (`DAGfixtureEmbedShape`, `DAGroundTrip1`, …) stay in tests / `live-e2e-work` only.

ManagePullRequest / GitHub PATCH on PR #4: previous cycle 403. PR body already lists SHA `617762d` from another worker; this recording does not invent a successful PATCH.

### Gates (proven after 5695b30 / 617762d)

- `npm run typecheck` pass
- `npm test` pass (207 script + 245 src, fail 0; admin session E2E ok; admin live E2E ok — bearer `grok-auth.bearer-token`, no `__Host-` on http)
- `npm run lint` pass (0 errors, 3 existing warnings: LocaleProvider / use-current-user)
- `npm run build` pass
- `npm run check:auth` pass (sign-in on)
- `sh /workspace/startup.sh` → `npm run dev` via `scripts/with-app-env.mjs` on `0.0.0.0:8080` (200)
- `node scripts/browser-smoke.mjs` desktop+mobile pass; no overflow; empty console/page errors; no brand/auth warnings
- `npm run preview:restart` (`127.0.0.1:8081`) vs baseline: `divergesFromBaseline: false`, same bodyTextHash
- Interactive: EN home, FrameLab Canva honest fallback, Folio studio reconstruction + og.jpg, Zen local chat honesty, unsigned `/admin` Google-only, 390 AI Director no overflow, unpublished slug 404

### 14-section audit (wrap-up)

| § | Requirement | Verdict |
|---|---|---|
| 1 | Platform/stack: TanStack Start/React/TS/Tailwind/Vite/Nitro/PWA/PreviewHostBridge/grokPwaPlugin/`0.0.0.0:8080` Light Luminous Studio | **proven** |
| 2 | Fail-closed admin: Google allowlist `aa0968111723@gmail.com`; no mock admin; no tokens on client; no localStorage-only CMS | **proven** (CODE). Human Google login as that address: **owner-secret** |
| 3 | Postgres/PGLite CMS (`0001` auth, `0002` portfolio, `0003` archive locale) | **proven** |
| 4 | Public reads published rows only; `product_status` ≠ `publication_status` | **proven** |
| 5 | 8 featured works, distinct ExperiencePanel modes | **proven** |
| 6 | Honest GitHub sync (server-only; no overwrite of Chinese narrative) | **proven** (CODE). Private-repo token: **owner-secret** |
| 7 | Honest Canva: paste `/design/{id}` only; `/d/` until resolve; no invented DAG; no blank iframe | **proven** (CODE). Real public `/design/{id}` for the eight works: **owner-secret / not present** |
| 8 | Admin CMS (create/save/publish/unpublish/revisions/preview drafts) | **proven** (CODE + live E2E). Browser as human admin: **owner-secret** |
| 9 | Integrations desk (Canva paste, demo verify, GitHub diff, Notion fail-closed, Connect fail-closed) | **proven** (CODE). Connect/Notion/`GITHUB_READ_TOKEN` live: **owner-secret** |
| 10 | Public zh\|en via `luminous-studio-lang`; CMS copy in Postgres; JSON-LD canonical zh | **proven** |
| 11 | Playable experience quality (process map, heatmap honesty, Folio/Zen, Planform, 對稿) | **proven** as labeled portfolio demos |
| 12 | Mobile overflow / 44px / reduced-motion | **proven** (smoke + tests) |
| 13 | Test matrix: handlers, public isolation, Canva/demo iframe, keyboard, GitHub parse | **proven** |
| 14 | Honest Folio/Zen evidence (labeled reconstructions, not operation screenshots) | **proven** as reconstructions. True product screenshots: **owner-secret / not present** |

Should parent mark goal complete? **KEEP OPEN.** CODE on this branch is wrap-up-complete; original ask still needs owner secrets (real Canva `/design/{id}`, Drive media, Connect, human Google login, tokens, Folio/Zen operation shots).

## Gates this cycle (2026-09-16, after fc94029 / eb95eac / 5695b30 / 617762d)

- `npm run typecheck` pass
- `npm test` pass (207 script + 245 src, fail 0; admin session E2E ok; admin live E2E ok)
- `npm run lint` pass (0 errors, 3 existing warnings)
- `npm run build` pass
- `npm run check:auth` pass (sign-in on)
- `node scripts/browser-smoke.mjs` desktop+mobile pass; no console/page errors; no overflow
- `npm run preview:restart` + smoke vs baseline: `divergesFromBaseline: false`
- Interactive: numbered AI Director pipeline, studio heatmap honesty badge, Folio editor-shell, Zen local chat, Planform isometric, 對稿 pins, unsigned `/admin` Google-only, zh|en overlay
- GitHub `update_pull_request` on PR #4 returned 403 in an earlier cycle (token cannot PATCH). No fake PR-body success. Later PR HTML already shows SHA `617762d` from another worker.

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

## This cycle (typecheck + process map + studio heatmap)

- `HermesPreview` locale starter effect depends on `starter` only. `lang` is not referenced after it was removed from the hook destructure (typecheck).
- AI Director OS process pipeline SVG now numbers stages 1–n and labels them with `node.stage` (overlaid zh|en). Full names stay on the keyboard tabs.
- Poster Vision heatmap uses mint/sky studio tokens (`data-heatmap-palette="studio"`), not a fire-orange overlay. Still a pixel estimate, not eye-tracking.
- Folio document walkthrough stage aria-label uses `ex.folioDocumentLayer` (zh 文件層 / en document layer).
- Experience images (Canva thumbs, Poster Vision sample, 對稿 posters) lazy-load. Hero remains eager. Video fallback copy is bilingual.
- No public `canva.com/design/{id}` invented. Canva Connect still fail-closed.

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
