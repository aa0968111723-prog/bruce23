# Portfolio Task State

Cycle: Canva viewer-like Playwright resolve (not complete)
Updated: 2026-09-16

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Featured repos read: `ai_os`, `FrameLab`, `poster-vision-ai`, `planform-iso`, `duigao`, `canva2`, `hermes-console`, `tku-zen-ai`, `urban-green-rose-pixel`, `ever-marble-flora-clover`, `healing-studio`
- Drive indexed, not published as folders: `平面設計作品集`, `柏能作品集.pdf`
- Canva originals hosted locally: TKU Zen poster + deck pages
- Notion: disconnected. Adapter stub only.
- Canva MCP this environment: `needsAuth`; not used. No design list. Connect OAuth is not claimed connected.
- Public GitHub READMEs / homepages: no live `canva.com/design/{DAG…}` share URLs.

## Viewer navigation of healing-studio `/d/` links (Playwright Chromium)

All four public short URLs were opened in Chromium. Classification used `page.url()` after load (plus `page.title()` only to tell challenge / 404). HTML was not scraped for design ids. Raw fetch (studio UA and Chrome UA) stayed **403** with no Location.

| Short URL | Final `page.url()` class | Outcome |
|---|---|---|
| `/d/ysK5sYZisVEjZFe` | stayed `/d/` · Canva 404 roadblock | **unavailable** · no design id |
| `/d/WJgjSP967WEuhhN` | stayed `/d/` · Cloudflare then 404 roadblock | **unavailable** · no design id |
| `/d/g4tColMMj63-XRu` | stayed `/d/` · Cloudflare challenge | **unavailable** · no design id |
| `/d/kFV4KQpB2QzPjb0` | stayed `/d/` · Cloudflare challenge | **unavailable** · no design id |

No allowlisted `canva.com/design/{id}` landing. Public AI Director OS item keeps the first short URL for Open original + cover thumbnail, **no iframe**, status **unavailable** (not verified).

## Done in product code (still not the full /goal)

- Light-only luminous site + CMS 0002 + auth fail-closed
- 8 GitHub-backed case studies with distinct ExperiencePanel modes
- Admin ProjectForm + settings + GitHub hydrate v4 + stampede lock
- Canva: Location follow + Chrome UA retry + optional viewer `navigateImpl` (`page.url()`). Never `verified` from URL shape. HTML unread.
- Save prefers a parsed `/design/{id}` so leftover `/d/` cannot wipe a resolved embed
- Connect/OAuth fail-closed without credentials
- Unavailable + share URL shows thumbnail + Open original (no blank iframe)

## Not done / blocked

- Original photography and event photos (Drive originals not on a public CDN)
- Original AI video files (too large for git; old Manus URLs are dead)
- Real public Canva share/embed URLs for the 8 works — healing-studio `/d/` links did not land on `/design/{id}` (404 or Cloudflare)
- Canva Connect credentials + CANVA_TOKEN_KEY (OAuth cannot be live-proved)
- Google login as `aa0968111723@gmail.com` to browser-prove admin
- `GITHUB_READ_TOKEN` for private repos
- Notion connection
