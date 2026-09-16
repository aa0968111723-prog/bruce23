# Portfolio Task State

Cycle: independent Canva Connect path/export + public spatial map (not complete)
Updated: 2026-09-16

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Featured repos read: `ai_os`, `FrameLab`, `poster-vision-ai`, `planform-iso`, `duigao`, `canva2`, `hermes-console`, `tku-zen-ai`, `urban-green-rose-pixel`, `ever-marble-flora-clover`, `healing-studio`
- Drive indexed, not published as folders: `平面設計作品集`, `柏能作品集.pdf`
- Canva originals hosted locally: TKU Zen poster + deck pages
- Notion: disconnected. Adapter stub only.
- Canva MCP this environment: `needsAuth`; not used. No design list.
- Public GitHub READMEs / homepages: no live `canva.com/design/{DAG…}` share URLs. Re-scanned 11 READMEs 2026-09-16. Search hits are helper functions and test fixtures (`duigao`, `hermes-console`). Only `ai_os` has homepage `https://ai-os-ten.vercel.app`. healing-studio `canva.com/d/…` is not a public embed.

## Done in product code (still not the full /goal)

- Light-only luminous site + CMS 0002 + auth fail-closed
- 8 GitHub-backed case studies with distinct ExperiencePanel modes
- Admin ProjectForm: narrative, SEO, zh/en, media/video, Canva fields, page ids, structured experience editors, GitHub diff, source_evidence editor
- Settings persist homepage highlight slugs and locale JSON
- Canva public-embed paste path + fixture embed test
- Official Canva Connect/OAuth shape: PKCE start + callback, AES-GCM tokens in `integration_secrets`, search/metadata/pages/export/apply/disconnect. Export poll allows Canva `e:uuid` job ids. Search continuation. Select fetches design metadata. Fail-closed without `CANVA_CLIENT_ID`/`CANVA_CLIENT_SECRET`/`CANVA_TOKEN_KEY`. Connect button does not toast success when unconfigured. Refresh failure marks disconnected. Stored covers refuse expiring CDN thumbs. Admin Canva paste drops non-allowlisted URLs.
- Homepage constellation on all viewports, ≥20vh, hubs/chips only for modalities the visible works use
- Admin `/admin/preview` is a viewer chrome around CaseStudyView without JSON-LD
- Archive graphic + stroop have honest local translations (not Drive originals)

## Not done / blocked

- Original photography and event photos (Drive originals not on a public CDN)
- Original AI video files (too large for git; old Manus URLs are dead)
- Real public Canva share/embed URLs for the 8 works
- Canva Connect credentials + CANVA_TOKEN_KEY in this environment (OAuth cannot be live-proved)
- Google login as `aa0968111723@gmail.com` to browser-prove admin
- `GITHUB_READ_TOKEN` for private repos
- Notion connection
