# Portfolio Task State

Cycle: 3 complete (gates verified)
Updated: 2026-09-16

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Public site reads published CMS rows (seeded from static content)
- Admin writes are allowlisted (`PORTFOLIO_ADMIN_EMAILS`)

## Done this cycle

- Auth ON + Neon/PGLite schema `0002_portfolio_cms.sql`
- Public work/case/archive/home read published data
- ExperiencePanel + per-project operable exhibits
- Admin CMS: projects, archive, settings, preview, integrations
- Server-side GitHub / Canva embed test / Demo verify / README verify
- Nested GitHub file tree, homepage exploration nodes, custom share card
- Tests for privacy, allowlist, github/canva/demo, seed, publish round-trip
- `/sitemap.xml` via dotted TanStack filename
- Local production preview copies `pglite.data` + `pglite.wasm` + `initdb.wasm`
- Gates: typecheck, test (92), lint (0 errors), build, check:auth, desktop+mobile smoke, production smoke non-diverging

## Not done / honest gaps

- Canva Connect OAuth is reserved: public-embed mode works; full Connect search/export/edit-in-app is not live until client id/secret exist and OAuth is finished
- Original large photos/videos still not on a public CDN
- GitHub sync metadata fills after an admin clicks 同步 (seed has repo URLs, not REST payloads)
- Archive Canva items currently have thumbnails + notes; share/embed URLs can be added in admin
- GitHub MCP cannot create the PR (403 on personal access token); compare URL is used instead
