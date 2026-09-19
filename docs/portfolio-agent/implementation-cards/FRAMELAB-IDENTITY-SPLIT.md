# IMPLEMENTATION CARD — FRAMELAB-IDENTITY-SPLIT

- Project：framelab (lunar-crystal-falcon-granite + cabin-shale-raven-swift)
- Status：applied on branch `fix/framelab-identity-zh-canonical`
- Date：2026-09-19

## Problem

Registry listed lunar and cabin as two unknown works. Production FrameLab evidence said cabin「可能 502」and used the English host as Live Demo.

## Evidence (2026-09-19)

- `https://cabin-shale-k7q2.zeabur.app/` → title FrameLab, h1「給它關鍵影格。只修壞掉的那幾格。」
- `https://lunar-falcon-8p2r.zeabur.app/` → title FrameLab, h1 Give it keyframes. Repair only the frames that break.
- Both `/api/health` → `{ ok:true, name:"FrameLab", version:"0.4.0" }`
- GitHub `FrameLab` is public. `lunar-crystal-falcon-granite` and `cabin-shale-raven-swift` are private.

## Change

- Canonical product name stays FrameLab. Do not invent a second product.
- Chinese portfolio Live Demo → `https://cabin-shale-k7q2.zeabur.app`
- English host kept as evidence, not as a second work.
- CMS seed refresh `framelab_identity_version` rewrites existing rows.

## Not claimed

- coreFlowPass remains false (studio needs sign-in).
- readiness >= 70 remains false.
- PORTFOLIO_READY = FALSE

## Next exact step

After this PR deploys, verify production `/work/framelab` Live Demo is cabin-shale-k7q2 and cabin is not labeled 502. Then probe the next stale「可能 502」claims: `untitled-5.zeabur.app` (小財) and `tku-zen-agent-k7f2.zeabur.app`.
