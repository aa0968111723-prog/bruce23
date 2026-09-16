# Portfolio Task State

Cycle: hostile-audit continuation (not complete)
Updated: 2026-09-16

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Featured repos read: `ai_os`, `FrameLab`, `poster-vision-ai`, `planform-iso`, `duigao`, `canva2`, `hermes-console`, `tku-zen-ai`, `urban-green-rose-pixel`, `ever-marble-flora-clover`, `healing-studio`
- Drive indexed, not published as folders: `平面設計作品集`, `柏能作品集.pdf`
- Canva originals hosted locally: TKU Zen poster + deck pages
- Notion: disconnected. Adapter stub only.
- Canva MCP this environment: `needsAuth`; `mcp_auth` failed (`Interaction query handler is not initialized`). No design list.
- Public GitHub READMEs / homepages: no `canva.com/design/{DAG…}` share URLs. Only `ai_os` has homepage `https://ai-os-ten.vercel.app`. healing-studio docs contain a nonstandard `canva.com/d/…` internal reference — **not** published as a public embed.

## Done in product code (still not the full /goal)

- Light-only luminous site + CMS 0002 + auth fail-closed
- 8 GitHub-backed case studies with distinct ExperiencePanel modes
- Admin ProjectForm can edit narrative, SEO, zh/en, media/video, Canva fields, page ids, experience_config JSON, GitHub current-vs-incoming table
- Settings persist homepage highlight slugs and locale JSON (no wipe)
- Canva public-embed paste path + fixture embed test; Connect stays disconnected without credentials

## Not done / blocked

- Original photography and event photos (Drive originals not on a public CDN)
- Original AI video files (too large for git; old Manus URLs are dead)
- Real public Canva share/embed URLs for the 8 works
- Canva Connect credentials
- Google login as `aa0968111723@gmail.com` to browser-prove admin
- `GITHUB_READ_TOKEN` for private repos
- Notion connection
