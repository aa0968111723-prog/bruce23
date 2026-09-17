# Portfolio Task State

Cycle: 2 CMS + interactive experiences
Updated: 2026-09-16
Branch: cursor/portfolio-interactive-cms-da82

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Featured repos: `ai_os`, `FrameLab`, `poster-vision-ai`, `planform-iso`, `duigao`, `canva2`, `hermes-console`, `tku-zen-ai`
- Static TypeScript files in `src/content/` are seed only
- Public site reads published CMS rows only

## Done this cycle

- Auth ON + Postgres CMS (`migrations/0002_portfolio_cms.sql`)
- Admin routes, draft/publish/archive/revisions
- Server-only GitHub sync with ETag cache; narrative fields never auto-overwritten
- Canva public embed + reserved Connect API (no fake OAuth)
- ExperiencePanel on case pages; 8 projects kept
- Homepage exploration nodes from real published data

## Owner config (do not put secrets in the repo)

- `PORTFOLIO_ADMIN_EMAILS` (required in production; fail-closed if missing)
- `GITHUB_READ_TOKEN` (optional, private repos / higher rate limit)
- `CANVA_CLIENT_ID` + `CANVA_CLIENT_SECRET` (optional Connect API)

## Still needs from you

- Original photography / event photos on a public CDN
- Additional Canva share URLs for 美食地圖、淡水生存指南
- Confirm whether `https://ai-os-ten.vercel.app` should stay listed
