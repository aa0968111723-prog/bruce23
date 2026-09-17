import { parseCanvaDesign } from "../canva/parse.ts";
import type { ExperienceConfig, LocaleCopy, ProjectMedia, SourceEvidence } from "./schema.ts";
import type { IntegrationStatus } from "./status.ts";

export type GithubPublicSlice = {
  url: string | null;
  owner: string | null;
  repo: string | null;
  branch: string | null;
  syncStatus: IntegrationStatus;
  lastSyncedAt: string | null;
  name?: string;
  description?: string | null;
  languages?: Record<string, number>;
  topics?: string[];
  latestCommit?: {
    sha: string;
    message: string;
    date?: string;
    htmlUrl?: string;
  };
  readme?: string | null;
  fileTree?: Array<{ path: string; type: "file" | "dir"; size?: number }>;
  htmlUrl?: string;
  updatedAt?: string;
};

export type CanvaPublicSlice = {
  shareUrl: string | null;
  embedUrl: string | null;
  designId: string | null;
  pageIds?: string[];
  thumbnailUrl: string | null;
  status: IntegrationStatus;
  lastSyncedAt: string | null;
  alt?: string | null;
  caption?: string | null;
};

export type DemoPublicSlice = {
  url: string | null;
  label: string | null;
  type: string | null;
  embedEnabled: boolean;
  status: IntegrationStatus;
  lastVerifiedAt: string | null;
  error?: string | null;
};

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  productStatus: string;
  featured: boolean;
  sortOrder: number;
  summary: string;
  problem: string;
  role: string;
  decisions: string[];
  modalities: string[];
  process: string[];
  outputs: string[];
  stack: string[];
  limitations: string[];
  media: ProjectMedia[];
  locale: { zh?: LocaleCopy; en?: LocaleCopy };
  seoTitle?: string | null;
  seoDescription?: string | null;
  experienceMode: string | null;
  experienceConfig: ExperienceConfig;
  interactionSteps: string[];
  sourceEvidence: SourceEvidence[];
  github: GithubPublicSlice;
  canva: CanvaPublicSlice;
  demo: DemoPublicSlice;
};

export function publicCanvaEmbedUrl(embedUrl: string | null | undefined): string | null {
  return parseCanvaDesign(embedUrl)?.embedUrl ?? null;
}

/** Public pages only get a Canva /design/{id} share. Short /d/ and Connect-only ids stay admin-only. */
export function publicCanvaSlice(input: CanvaPublicSlice): CanvaPublicSlice {
  const parsed = parseCanvaDesign(input.embedUrl || input.shareUrl);
  if (!parsed) {
    const hadPrivateLink = Boolean(input.shareUrl || input.embedUrl || input.designId);
    return {
      shareUrl: null,
      embedUrl: null,
      designId: null,
      pageIds: undefined,
      thumbnailUrl: input.thumbnailUrl,
      status:
        input.status === "unavailable" || input.status === "failed"
          ? input.status
          : hadPrivateLink
            ? "unavailable"
            : input.status === "not_configured"
              ? "not_configured"
              : "unavailable",
      lastSyncedAt: input.lastSyncedAt,
      alt: input.alt,
      caption: input.caption,
    };
  }
  return {
    shareUrl: parsed.shareUrl,
    embedUrl: parsed.embedUrl,
    designId: parsed.designId,
    pageIds: input.pageIds,
    thumbnailUrl: input.thumbnailUrl,
    status: input.status === "verified" || input.status === "connected" ? "pending" : input.status,
    lastSyncedAt: input.lastSyncedAt,
    alt: input.alt,
    caption: input.caption,
  };
}

export function publicGithubSlice(isPrivate: boolean, slice: GithubPublicSlice): GithubPublicSlice {
  if (!isPrivate) return slice;
  return {
    url: null,
    owner: null,
    repo: null,
    branch: null,
    syncStatus: "not_configured",
    lastSyncedAt: null,
    readme: null,
  };
}

export function canvaViewerState(canva: CanvaPublicSlice, failed: boolean) {
  const embeddable = publicCanvaEmbedUrl(canva.embedUrl);
  if (embeddable && !failed && canva.status !== "unavailable" && canva.status !== "failed") {
    return "embed" as const;
  }
  if (canva.status === "unavailable" || canva.status === "failed") {
    if (canva.shareUrl) return "fallback" as const;
    if (canva.thumbnailUrl) return "local" as const;
    return "empty" as const;
  }
  if (canva.embedUrl || canva.shareUrl) return "fallback" as const;
  if (canva.thumbnailUrl) return "local" as const;
  return "empty" as const;
}

export function demoViewerState(demo: DemoPublicSlice, failed: boolean) {
  if (!demo.url) return "empty" as const;
  if (failed || !demo.embedEnabled || demo.status !== "verified") {
    return "fallback" as const;
  }
  return "embed" as const;
}

const SECRET_KEYS = [
  "ciphertext",
  "token",
  "access_token",
  "refresh_token",
  "client_secret",
  "GITHUB_READ_TOKEN",
  "CANVA_CLIENT_SECRET",
  "CANVA_TOKEN_KEY",
  "code_verifier",
  "ciphertext",
  "service_role",
  "invite",
  "phone",
  "password",
  "private_key",
];

export function stripSecrets<T>(value: T): T {
  return stripSecretsInner(value, 0) as T;
}

function stripSecretsInner(value: unknown, depth: number): unknown {
  if (depth > 8) return undefined;
  if (Array.isArray(value)) return value.map((item) => stripSecretsInner(item, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEYS.some((secret) => key.toLowerCase().includes(secret.toLowerCase()))) continue;
      out[key] = stripSecretsInner(nested, depth + 1);
    }
    return out;
  }
  return value;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}
