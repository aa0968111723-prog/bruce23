# Portfolio Task State

Cycle: Canva short-link server resolve (not complete)
Updated: 2026-09-16

## Source of truth

- GitHub user: `aa0968111723-prog` (Bruce / 陳柏能)
- Featured repos read: `ai_os`, `FrameLab`, `poster-vision-ai`, `planform-iso`, `duigao`, `canva2`, `hermes-console`, `tku-zen-ai`, `urban-green-rose-pixel`, `ever-marble-flora-clover`, `healing-studio`
- Drive indexed, not published as folders: `平面設計作品集`, `柏能作品集.pdf`
- Canva originals hosted locally: TKU Zen poster + deck pages
- Notion: disconnected. Adapter stub only.
- Canva MCP this environment: `needsAuth`; not used. No design list. Connect OAuth is not claimed connected.
- Public GitHub READMEs / homepages: no live `canva.com/design/{DAG…}` share URLs. Re-scanned 2026-09-16 (GitHub code search + content inventory).
- healing-studio `docs/design-reference.md` has public short links:
  - `https://www.canva.com/d/ysK5sYZisVEjZFe`
  - `/d/WJgjSP967WEuhhN`, `/d/g4tColMMj63-XRu`, `/d/kFV4KQpB2QzPjb0`
  These are **not** design ids. Server follows Location headers on `canva.com` / `www.canva.com` only. Live HEAD and GET in this sandbox returned Cloudflare **403** with no Location and no DAG id. They are **not** stored as verified embeds. Seed keeps the first `/d/` as a pending/unavailable share for “open original” only.

## Done in product code (still not the full /goal)

- Light-only luminous site + CMS 0002 + auth fail-closed
- 8 GitHub-backed case studies with distinct ExperiencePanel modes
- Admin ProjectForm: narrative, year, SEO, zh/en (incl. subtitles), media/video, Canva fields (`/d/` paste + server resolve + status/error), page ids, structured experience editors, GitHub diff, source_evidence editor, revision list that reloads after save/restore
- Settings persist homepage highlight slugs and locale JSON
- Canva public-embed paste path + **server-side short-link resolve** (fixtures: success redirect, relative Location, login-wall, open-redirect to evil.com, HTML body ignored, client modules do not fetch Canva HTML)
- Save prefers a parsed `/design/{id}` from embed or share so leftover `/d/` cannot wipe a resolved embed; admin save never writes Canva `verified`/`connected`
- Official Canva Connect/OAuth shape remains fail-closed without credentials. Connect button does not toast success when unconfigured. Connect apply without a public share is `unavailable`, not verified.
- GitHub file tree: skip `.grok/`, cap `.github` noise, rank README/`src`; tree fetched by commit tree sha; failed tree fetch is `stale` (does not overwrite a good tree with `[]`); hydrate v4 + in-process inflight + skip recent `pending` meta
- Homepage constellation + archive honesty copy unchanged: no invented Canva embeds

## Not done / blocked

- Original photography and event photos (Drive originals not on a public CDN)
- Original AI video files (too large for git; old Manus URLs are dead)
- Real public Canva share/embed URLs for the 8 works — healing-studio `/d/` links **did not resolve** here (403, no Location)
- Canva Connect credentials + CANVA_TOKEN_KEY (OAuth cannot be live-proved)
- Google login as `aa0968111723@gmail.com` to browser-prove admin
- `GITHUB_READ_TOKEN` for private repos
- Notion connection
