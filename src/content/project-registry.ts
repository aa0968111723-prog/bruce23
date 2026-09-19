/**
 * Canonical source for the 17 official external works.
 * bruce23 itself is the portfolio hub and is not in this list.
 *
 * lunar-crystal-falcon-granite and cabin-shale-raven-swift are FrameLab
 * locale deploys of the same product, not two different works.
 */

export const PORTFOLIO_HUB = {
  repository: "aa0968111723-prog/bruce23",
  publicUrl: "https://bruce23-k7m2.zeabur.app/",
} as const;

export const OFFICIAL_PROJECT_KEYS = [
  "forge-bloom-quiet-falcon",
  "lunar-crystal-falcon-granite",
  "tku-tamsui-drama-world",
  "dd",
  "canva2",
  "delta-horizon-cliff-fern",
  "ty",
  "cabin-shale-raven-swift",
  "hermes-agent",
  "hermes-console",
  "wood-ivory-blaze-maple",
  "-1",
  "tku-zen-agent",
  "duigao",
  "planform-iso",
  "ai_os",
  "CUTOS",
] as const;

export type OfficialProjectKey = (typeof OFFICIAL_PROJECT_KEYS)[number];

export const FRAMELAB_IDENTITY = {
  product: "FrameLab",
  portfolioSlug: "framelab",
  canonicalGithub: "https://github.com/aa0968111723-prog/FrameLab",
  canonicalGithubVisibility: "public" as const,
  /** Chinese portfolio canonical live: the ZH public landing, same build as the EN host. */
  canonicalLiveUrl: "https://cabin-shale-k7q2.zeabur.app",
  canonicalLiveLocale: "zh" as const,
  health: {
    name: "FrameLab",
    version: "0.4.0",
    checkedAt: "2026-09-19T16:00:00Z",
  },
  deploys: [
    {
      key: "cabin-shale-raven-swift" satisfies OfficialProjectKey,
      liveUrl: "https://cabin-shale-k7q2.zeabur.app",
      locale: "zh" as const,
      title: "FrameLab",
      headline: "給它關鍵影格。只修壞掉的那幾格。",
      githubVisibility: "private" as const,
      githubUrl: "https://github.com/aa0968111723-prog/cabin-shale-raven-swift",
      role: "zh-public-landing",
      runtimeStatus: "RUNNING" as const,
    },
    {
      key: "lunar-crystal-falcon-granite" satisfies OfficialProjectKey,
      liveUrl: "https://lunar-falcon-8p2r.zeabur.app",
      locale: "en" as const,
      title: "FrameLab",
      headline: "Give it keyframes. Repair only the frames that break.",
      githubVisibility: "private" as const,
      githubUrl: "https://github.com/aa0968111723-prog/lunar-crystal-falcon-granite",
      role: "en-public-landing",
      runtimeStatus: "RUNNING" as const,
    },
  ],
} as const;

export const FRAMELAB_IDENTITY_VERSION = "framelab-identity-zh-canonical-20260919";

export const STALE_502_NOTE_VERSION = "stale-502-xiaocai-zen-20260919";

export const STALE_502_NOTE_SLUGS = ["xiaocai", "tku-zen-agent"] as const;

export const LIVE_PROBES_20260919 = {
  xiaocai: {
    officialKey: "-1" as const,
    liveUrl: "https://untitled-5.zeabur.app",
    httpStatus: 200,
    title: "小財記帳",
    runtimeStatus: "RUNNING" as const,
    coreFlowPass: false,
  },
  "tku-zen-agent": {
    officialKey: "tku-zen-agent" as const,
    liveUrl: "https://tku-zen-agent-k7f2.zeabur.app/?mode=ask",
    httpStatus: 200,
    title: "淡江大學領袖禪學社 · 工作台",
    runtimeStatus: "RUNNING" as const,
    authBoundary: "authorization-code" as const,
    coreFlowPass: false,
  },
} as const;

export function officialProjectCount(): number {
  return OFFICIAL_PROJECT_KEYS.length;
}

export function isOfficialProjectKey(key: string): key is OfficialProjectKey {
  return (OFFICIAL_PROJECT_KEYS as readonly string[]).includes(key);
}

export function framelabDeployByKey(key: string) {
  return FRAMELAB_IDENTITY.deploys.find((item) => item.key === key) ?? null;
}
