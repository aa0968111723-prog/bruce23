# Portfolio Task State

Cycle: 2 in progress
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
- Server-side GitHub / Canva embed test / Demo verify
- Tests for privacy, allowlist, github/canva/demo, seed, publish round-trip

## Not done / honest gaps

- Canva Connect OAuth is reserved: works in public-embed mode until client id/secret exist
- Original large photos/videos still not on a public CDN
- GitHub sync metadata fills after an admin clicks 同步
