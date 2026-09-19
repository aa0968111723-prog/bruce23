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
      githubVisibility: "public" as const,
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
      githubVisibility: "public" as const,
      githubUrl: "https://github.com/aa0968111723-prog/lunar-crystal-falcon-granite",
      role: "en-public-landing",
      runtimeStatus: "RUNNING" as const,
    },
  ],
} as const;

export const FRAMELAB_IDENTITY_VERSION = "framelab-identity-zh-canonical-20260919";

export const STALE_502_NOTE_VERSION = "stale-502-xiaocai-zen-20260919";

export const STALE_502_NOTE_SLUGS = ["xiaocai", "tku-zen-agent"] as const;

export const AIOS_LIVE_PROBE_VERSION = "aios-live-probe-20260919";

export const AIOS_LIVE_PROBE_SLUG = "ai-director-os";

export const TY_CONTRACT_VERSION = "ty-public-flow-honesty-20260919";

export const TY_CONTRACT_SLUGS = ["focus-challenge"] as const;

export const CUTOS_LIVE_PROBE_VERSION = "cutos-live-200-20260919";

export const CUTOS_LIVE_PROBE_SLUG = "cutos";

export const PLANFORM_LIVE_PROBE_VERSION = "planform-public-home-20260919";

export const PLANFORM_LIVE_PROBE_SLUG = "planform";

export const DUIGAO_LIVE_PROBE_VERSION = "duigao-live-title-20260919";

export const DUIGAO_LIVE_PROBE_SLUG = "duigao";

export const FOLIO_LIVE_PROBE_VERSION = "folio-file-cabinet-20260919";

export const FOLIO_LIVE_PROBE_SLUG = "folio";

export const HERMES_CONSOLE_LIVE_PROBE_VERSION = "hermes-console-live-home-20260919";

export const HERMES_CONSOLE_LIVE_PROBE_SLUG = "hermes-console";

export const SKATEHUB_LIVE_PROBE_VERSION = "skatehub-live-slogan-20260919";

export const SKATEHUB_LIVE_PROBE_SLUG = "skatehub";

export const TAMKANG_LIVE_PROBE_VERSION = "tamkang-campus-pass-20260919";

export const TAMKANG_LIVE_PROBE_SLUG = "tamkang-world";

export const LUMEN_LIVE_PROBE_VERSION = "lumen-not-hermes-20260919";

export const LUMEN_LIVE_PROBE_SLUG = "lumen";

export const ZEN_STUDIO_LIVE_PROBE_VERSION = "zen-studio-live-home-20260919";

export const ZEN_STUDIO_LIVE_PROBE_SLUG = "zen-studio";

/**
 * Zeabur service IDs and provisioned domains, queried 2026-09-19.
 * No secrets. Live URLs in the portfolio must match these domains.
 */
export const ZEABUR_SERVICES = {
  bruce23: {
    serviceId: "6aaab333a91f86e0dd4fc7d9",
    name: "bruce23",
    domains: ["bruce23-k7m2.zeabur.app"],
  },
  "forge-bloom-quiet-falcon": {
    serviceId: "6aacaf57876b84b22db34f58",
    name: "forge-bloom-quiet-falcon",
    domains: ["forge-bloom-k7xq.zeabur.app"],
  },
  "lunar-crystal-falcon-granite": {
    serviceId: "6aaca645758929bf546bbdaa",
    name: "lunar-crystal-falcon-granite",
    domains: ["lunar-falcon-8p2r.zeabur.app"],
  },
  "tku-tamsui-drama-world": {
    serviceId: "6aaca70a876b84b22db34b03",
    name: "tku-tamsui-drama-world",
    domains: ["tku-tamsui-drama-world-k4x9.zeabur.app"],
  },
  dd: {
    serviceId: "6aaca598876b84b22db34a2b",
    name: "dd",
    domains: ["dd-k3f9.zeabur.app"],
  },
  canva2: {
    serviceId: "6aaca53a876b84b22db34a06",
    name: "canva2",
    domains: ["canva2-k7qm.zeabur.app"],
  },
  "delta-horizon-cliff-fern": {
    serviceId: "6aaab265905b4aaea95dbc53",
    name: "delta-horizon-cliff-fern",
    domains: ["delta-horizon-k7f2.zeabur.app"],
  },
  ty: {
    serviceId: "6aa110fe6c3d9581b7154726",
    name: "leader-dna-sheet-sync",
    domains: ["leader-dna-mcp-a7k2.zeabur.app"],
  },
  "cabin-shale-raven-swift": {
    serviceId: "6aaca5054870d6099a7b0da1",
    name: "cabin-shale-raven-swift",
    domains: ["cabin-shale-k7q2.zeabur.app"],
  },
  "hermes-agent": {
    serviceId: "6aad03324850645efd210d94",
    name: "hermes-agent",
    domains: ["hermes-agent-k7q2.zeabur.app", "hermes-agent-api.zeabur.app"],
    role: "canonical-dashboard",
  },
  "hermes-agent-legacy-455": {
    serviceId: "6a9a385273ef6eb935f2f8a2",
    name: "hermes-agent",
    domains: ["455.zeabur.app"],
    role: "stale-502",
  },
  "hermes-console": {
    serviceId: "6a9a7463aeaf8610e9063723",
    name: "hermes-console",
    domains: ["344.zeabur.app"],
  },
  "wood-ivory-blaze-maple": {
    serviceId: "6a9a37c039c2940e7ee0751d",
    name: "wood-ivory-blaze-maple",
    domains: ["ai-chat-8rq3.zeabur.app"],
  },
  "-1": {
    serviceId: "6a864f6b34ae7498ec9bafab",
    name: "srv-1",
    domains: ["untitled-5.zeabur.app"],
  },
  "tku-zen-agent": {
    serviceId: "6a83e9072b4272705cd3558e",
    name: "tku-zen-agent",
    domains: ["tku-zen-agent-k7f2.zeabur.app"],
  },
  duigao: {
    serviceId: "6a82c974bdeaa87e2c5313b4",
    name: "duigao",
    domains: ["duigao-k7q2.zeabur.app"],
  },
  "planform-iso": {
    serviceId: "6a82c2832b4272705cd2f2c6",
    name: "planform-iso",
    domains: ["planform-iso-k7d2.zeabur.app"],
  },
  ai_os: {
    serviceId: "6a59b4459ae692d1d8d95d70",
    name: "ai-os-app",
    domains: ["ai-os-app.zeabur.app", "vexlark.co"],
  },
  CUTOS: {
    serviceId: "6a8546dfad299e5b15f5a16c",
    name: "cutos",
    domains: ["cutos.zeabur.app"],
  },
} as const;

/** Owner paste listed the wrong public domain for these two repos. Zeabur API disagrees. */
export const REJECTED_OWNER_DOMAIN_GUESSES = [
  {
    repo: "tku-tamsui-drama-world",
    dumpedDomain: "lunar-falcon-8p2r.zeabur.app",
    actualDomain: "tku-tamsui-drama-world-k4x9.zeabur.app",
    actualProduct: "淡江新生導覽",
  },
  {
    repo: "canva2",
    dumpedDomain: "dd-k3f9.zeabur.app",
    actualDomain: "canva2-k7qm.zeabur.app",
    actualProduct: "Folio",
  },
] as const;

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
  "ai-director-os": {
    officialKey: "ai_os" as const,
    liveUrl: "https://ai-os-app.zeabur.app",
    customDomain: "https://vexlark.co",
    httpStatus: 200,
    title: "Aios · AI 創作作業系統｜把想法變成可執行的團隊計畫",
    runtimeStatus: "RUNNING" as const,
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
