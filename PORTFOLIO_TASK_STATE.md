# Portfolio Task State

Cycle: 2 in progress — interactive CMS
Updated: 2026-09-16
Branch: cursor/portfolio-interactive-cms-da82

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Featured repos read: `ai_os`, `FrameLab`, `poster-vision-ai`, `planform-iso`, `duigao`, `canva2`, `hermes-console`, `tku-zen-ai`
- Auth ON, Database ON (PGLite preview / Neon deploy)
- Admin allowlist: `PORTFOLIO_ADMIN_EMAILS` (fail closed if unset)
- Static seed remains in `src/content/*` and is upserted once into CMS tables

## Done this cycle (implementing)

- Better Auth routes + Google/X login
- `migrations/0002_portfolio_cms.sql` with product_status vs publication_status
- Public site reads published CMS rows only
- Admin CMS routes: /admin, projects, new, edit, archive, settings, preview, integrations
- Server-side GitHub sync (metadata/README/languages/topics/commit/tree) that does not overwrite narrative
- Canva public embed allowlist + reserved Connect OAuth
- ExperiencePanel + per-project experiences
- Homepage relation space (2D cards / scroller on mobile)

## Not done / need from you

- Original photography and event photos (Drive originals not on a public CDN)
- Original AI video files
- More Canva share URLs for 美食地圖、淡水生存指南
- Notion connection
- Confirm whether `https://ai-os-ten.vercel.app` should stay listed
- Production env: `PORTFOLIO_ADMIN_EMAILS`, optional `GITHUB_READ_TOKEN`, optional Canva Connect secrets

## Next

- Prove gates: typecheck, test, lint, build, check:auth, smoke
