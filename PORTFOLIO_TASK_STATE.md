# Portfolio Task State

Cycle: 1 complete
Updated: 2026-09-16

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Featured repos read: `ai_os`, `FrameLab`, `poster-vision-ai`, `planform-iso`, `duigao`, `canva2`, `hermes-console`, `tku-zen-ai`, `urban-green-rose-pixel`, `ever-marble-flora-clover`, `healing-studio`
- Drive indexed, not published as folders: `平面設計作品集`, `柏能作品集.pdf`
- Canva originals hosted locally: TKU Zen poster + deck pages
- Notion: disconnected. Adapter stub only.

## Done

- Light-only luminous site: `/` `/work` `/work/:slug` `/about` `/archive`
- 8 GitHub-backed case studies with honest status + limitations
- Archive with labeled visual translations + Canva originals
- Custom 404, category filter, keyboard skip link, reduced-motion orbs
- No fake metrics, no phone, no Drive folder dump, no service-role keys

## Verified

- typecheck pass
- production build pass
- desktop + mobile render, no overflow, no console errors
- production matches dev baseline
- Visual AI filter hides other projects
- FrameLab case shows GPU-unavailable limitations
- Custom 404 for unknown slugs

## Not done / need from you

- Original photography and event photos (Drive originals not on a public CDN)
- Original AI video files (too large for git; old Manus URLs are dead)
- More Canva posters: 美食地圖、淡水生存指南 — CDN blocked, need export or share
- Notion connection
- Confirm whether `https://ai-os-ten.vercel.app` should stay listed (status can drift)
- Push this rebuild back to `ai-director-portfolio-site` when you want GitHub updated

## Next cycle priority

1. Import public-safe original photos/posters if you point to exportable files
2. Add remaining Canva event posters via signed export
3. Case-study narrative polish + SEO per page
4. Accessibility pass on filter tabs (roving tabindex)
