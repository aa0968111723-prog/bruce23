# Portfolio Task State

Cycle: independent Canva Connect implementation (not complete)
Updated: 2026-09-16

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Featured repos read: `ai_os`, `FrameLab`, `poster-vision-ai`, `planform-iso`, `duigao`, `canva2`, `hermes-console`, `tku-zen-ai`, `urban-green-rose-pixel`, `ever-marble-flora-clover`, `healing-studio`
- Drive indexed, not published as folders: `平面設計作品集`, `柏能作品集.pdf`
- Canva originals hosted locally: TKU Zen poster + deck pages
- Notion: disconnected. Adapter stub only.
- Canva MCP this environment: `needsAuth`; not used. No design list.
- Public GitHub READMEs / homepages: no live `canva.com/design/{DAG…}` share URLs. Search hits are helper functions and test fixtures (`duigao`, `hermes-console`). Only `ai_os` has homepage `https://ai-os-ten.vercel.app`. healing-studio `canva.com/d/…` is not a public embed.

## Done in product code (still not the full /goal)

- Light-only luminous site + CMS 0002 + auth fail-closed
- 8 GitHub-backed case studies with distinct ExperiencePanel modes
- Admin ProjectForm: narrative, SEO, zh/en, media/video, Canva fields, page ids, structured experience editors, GitHub diff, source_evidence editor
- Settings persist homepage highlight slugs and locale JSON
- Canva public-embed paste path + fixture embed test
- Official Canva Connect/OAuth shape: PKCE start + callback, AES-GCM tokens in `integration_secrets`, search/metadata/export/apply/disconnect. Fail-closed without `CANVA_CLIENT_ID`/`CANVA_CLIENT_SECRET`/`CANVA_TOKEN_KEY`. Connect button does not toast success when unconfigured.
- Homepage constellation positions works by real modality membership and year
- Admin draft preview uses public case chrome without JSON-LD

## Not done / blocked

- Original photography and event photos (Drive originals not on a public CDN)
- Original AI video files (too large for git; old Manus URLs are dead)
- Real public Canva share/embed URLs for the 8 works
- Canva Connect credentials + CANVA_TOKEN_KEY in this environment (OAuth cannot be live-proved)
- Google login as `aa0968111723@gmail.com` to browser-prove admin
- `GITHUB_READ_TOKEN` for private repos
- Notion connection
