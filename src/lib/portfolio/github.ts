import { GITHUB_AUTO_FIELDS, NARRATIVE_FIELDS } from "./constants";
import type { FileTreeNode } from "./schema";
import { githubCommitSchema, githubMetadataSchema } from "./schema";

const GITHUB_HOSTS = new Set(["github.com", "www.github.com"]);

export type GithubParseOk = {
  ok: true;
  owner: string;
  repo: string;
  branch?: string;
};

export type GithubParseFail = { ok: false; error: string };
export type GithubParseResult = GithubParseOk | GithubParseFail;

export function parseGithubRepoUrl(input: string): GithubParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "empty" };
  if (!/^https:\/\//i.test(trimmed)) {
    return { ok: false, error: "https_required" };
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: "invalid_url" };
  }
  if (!GITHUB_HOSTS.has(url.hostname.toLowerCase())) {
    return { ok: false, error: "host_not_allowed" };
  }
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) return { ok: false, error: "missing_owner_repo" };
  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, "");
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
    return { ok: false, error: "invalid_owner_repo" };
  }
  let branch: string | undefined;
  if (parts[2] === "tree" && parts[3]) {
    branch = decodeURIComponent(parts.slice(3).join("/"));
  }
  return { ok: true, owner, repo, branch };
}

export function parseGithubRepoPayload(json: unknown) {
  if (!json || typeof json !== "object") {
    return { ok: false as const, error: "invalid_payload" };
  }
  const row = json as Record<string, unknown>;
  const parsed = githubMetadataSchema.safeParse({
    name: row.name,
    description: row.description ?? null,
    htmlUrl: row.html_url,
    defaultBranch: row.default_branch,
    updatedAt: row.updated_at,
    private: row.private,
    archived: row.archived ?? false,
    homepage: row.homepage ?? null,
    language: row.language ?? null,
  });
  if (!parsed.success) {
    return { ok: false as const, error: "invalid_payload" };
  }
  return { ok: true as const, metadata: parsed.data };
}

export function parseGithubCommitPayload(json: unknown) {
  if (!Array.isArray(json) || json.length === 0) {
    return { ok: false as const, error: "empty_commits" };
  }
  const first = json[0] as Record<string, unknown>;
  const commit = (first.commit ?? {}) as Record<string, unknown>;
  const author = (commit.author ?? {}) as Record<string, unknown>;
  const parsed = githubCommitSchema.safeParse({
    sha: String(first.sha ?? "").slice(0, 40),
    message: String(commit.message ?? "").split("\n")[0] ?? "",
    htmlUrl: String(first.html_url ?? ""),
    date: typeof author.date === "string" ? author.date : undefined,
    author:
      typeof author.name === "string"
        ? author.name
        : typeof (first.author as { login?: string } | null)?.login === "string"
          ? (first.author as { login: string }).login
          : undefined,
  });
  if (!parsed.success) return { ok: false as const, error: "invalid_commit" };
  return { ok: true as const, commit: parsed.data };
}

export function githubRateLimitState(input: {
  status: number;
  remainingHeader?: string | null;
}): "ok" | "rate_limited" {
  if (input.status === 429) return "rate_limited";
  if (input.status === 403 && input.remainingHeader === "0") {
    return "rate_limited";
  }
  return "ok";
}

export function readmeSyncState(status: number): "ok" | "failed" {
  if (status >= 200 && status < 300) return "ok";
  return "failed";
}

export function summarizeReadme(markdown: string, max = 4000): string {
  const text = markdown.replace(/\0/g, "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}\n\n…`;
}

const SKIP_TREE = /(?:^|\/)(?:node_modules|\.git|dist|\.next|\.vercel|coverage)(?:\/|$)/;

export type GithubTreeEntry = { path: string; type: "blob" | "tree" };

export function limitFileTree(
  entries: GithubTreeEntry[],
  options: { max?: number } = {},
): FileTreeNode[] {
  const max = options.max ?? 80;
  const filtered = entries.filter((entry) => !SKIP_TREE.test(entry.path));
  const sliced = filtered.slice(0, max);
  const root: FileTreeNode[] = [];
  const dirMap = new Map<string, FileTreeNode>();

  const ensureDir = (path: string): FileTreeNode => {
    const existing = dirMap.get(path);
    if (existing) return existing;
    const node: FileTreeNode = { path, type: "dir", children: [] };
    dirMap.set(path, node);
    const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
    if (!parent) root.push(node);
    else ensureDir(parent).children!.push(node);
    return node;
  };

  for (const entry of sliced) {
    if (entry.type === "tree") {
      ensureDir(entry.path);
      continue;
    }
    const node: FileTreeNode = { path: entry.path, type: "file" };
    const parent = entry.path.includes("/")
      ? entry.path.slice(0, entry.path.lastIndexOf("/"))
      : "";
    if (!parent) root.push(node);
    else ensureDir(parent).children!.push(node);
  }
  return root;
}

export function annotateFileTree(
  nodes: FileTreeNode[],
  filePurpose: Record<string, string> = {},
  pipelineStage: Record<string, string> = {},
): FileTreeNode[] {
  return nodes.map((node) => ({
    ...node,
    purpose: filePurpose[node.path],
    stage: pipelineStage[node.path],
    children: node.children
      ? annotateFileTree(node.children, filePurpose, pipelineStage)
      : undefined,
  }));
}

export function githubBlobUrl(
  owner: string,
  repo: string,
  branch: string,
  path: string,
): string {
  return `https://github.com/${owner}/${repo}/blob/${encodeURIComponent(branch)}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export type GithubIncoming = {
  github_owner: string;
  github_repo: string;
  github_branch: string;
  github_metadata: unknown;
  github_readme: string | null;
  github_file_tree: unknown;
  github_languages: unknown;
  github_topics: unknown;
  github_latest_commit: unknown;
  github_sync_status: string;
  github_last_synced_at: string;
};

export function githubSyncDiff(
  current: Record<string, unknown>,
  incoming: Partial<GithubIncoming>,
) {
  const auto: Array<{ field: string; from: unknown; to: unknown }> = [];
  const skippedNarrative: string[] = [];

  for (const field of GITHUB_AUTO_FIELDS) {
    const next = incoming[field as keyof GithubIncoming];
    if (next === undefined) continue;
    const prev = current[field];
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      auto.push({ field, from: prev ?? null, to: next });
    }
  }

  for (const field of NARRATIVE_FIELDS) {
    if (field in incoming) skippedNarrative.push(field);
  }

  return { auto, skippedNarrative };
}

export function applyGithubAutoFields<T extends Record<string, unknown>>(
  current: T,
  incoming: Partial<GithubIncoming>,
): T {
  const next = { ...current };
  for (const field of GITHUB_AUTO_FIELDS) {
    const value = incoming[field as keyof GithubIncoming];
    if (value !== undefined) {
      (next as Record<string, unknown>)[field] = value;
    }
  }
  return next;
}
