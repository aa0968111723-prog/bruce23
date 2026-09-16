export type ParsedGithubRepo = {
  owner: string;
  repo: string;
  url: string;
};

const REPO_RE =
  /^https:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?(?:[?#].*)?$/i;

export function parseGithubUrl(input: string | null | undefined): ParsedGithubRepo | null {
  if (!input) return null;
  const trimmed = input.trim();
  const match = REPO_RE.exec(trimmed);
  if (!match) return null;
  const owner = match[1];
  const repo = match[2];
  if (!owner || !repo) return null;
  if (owner === "." || repo === "." || owner.toLowerCase() === "orgs") return null;
  return {
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`,
  };
}

export function validateGithubUrl(input: string): { ok: true; value: ParsedGithubRepo } | { ok: false; error: string } {
  const parsed = parseGithubUrl(input);
  if (!parsed) {
    return {
      ok: false,
      error: "GitHub URL must look like https://github.com/owner/repo",
    };
  }
  return { ok: true, value: parsed };
}

export function githubFileUrl(owner: string, repo: string, branch: string, path: string): string {
  const clean = path.replace(/^\/+/, "");
  return `https://github.com/${owner}/${repo}/blob/${encodeURIComponent(branch)}/${clean
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export function summarizeReadme(markdown: string, maxChars = 720): string {
  const withoutBadges = markdown
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[>|`*_]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (withoutBadges.length <= maxChars) return withoutBadges;
  return `${withoutBadges.slice(0, maxChars).trimEnd()}…`;
}

const SKIP_TREE = new Set([
  "node_modules",
  ".git",
  "dist",
  ".next",
  "coverage",
  ".output",
  ".vercel",
  ".nitro",
]);

export type GithubTreeEntry = { path: string; type: "blob" | "tree" };

export function limitFileTree(
  entries: GithubTreeEntry[],
  opts?: { max?: number; maxDepth?: number },
): { path: string; type: "file" | "dir" }[] {
  const max = opts?.max ?? 80;
  const maxDepth = opts?.maxDepth ?? 3;
  const out: { path: string; type: "file" | "dir" }[] = [];
  for (const entry of entries) {
    const parts = entry.path.split("/").filter(Boolean);
    if (parts.some((part) => SKIP_TREE.has(part))) continue;
    if (parts.length > maxDepth) continue;
    out.push({
      path: entry.path,
      type: entry.type === "tree" ? "dir" : "file",
    });
    if (out.length >= max) break;
  }
  return out;
}

export type GithubMetadataInput = {
  name?: unknown;
  full_name?: unknown;
  description?: unknown;
  homepage?: unknown;
  default_branch?: unknown;
  updated_at?: unknown;
  pushed_at?: unknown;
  language?: unknown;
  private?: unknown;
  visibility?: unknown;
  archived?: unknown;
  html_url?: unknown;
};

export function parseGithubMetadata(raw: GithubMetadataInput) {
  const visibility =
    raw.private === true || raw.visibility === "private" ? "private" : "public";
  return {
    name: typeof raw.name === "string" ? raw.name : "",
    fullName: typeof raw.full_name === "string" ? raw.full_name : "",
    description: typeof raw.description === "string" ? raw.description : null,
    homepage: typeof raw.homepage === "string" ? raw.homepage : null,
    defaultBranch: typeof raw.default_branch === "string" ? raw.default_branch : "main",
    updatedAt: typeof raw.updated_at === "string" ? raw.updated_at : null,
    pushedAt: typeof raw.pushed_at === "string" ? raw.pushed_at : null,
    language: typeof raw.language === "string" ? raw.language : null,
    visibility: visibility as "public" | "private",
    archived: raw.archived === true,
    htmlUrl: typeof raw.html_url === "string" ? raw.html_url : "",
  };
}

export type GithubRateLimitState = {
  remaining: number | null;
  resetAt: string | null;
  limited: boolean;
};

export function parseGithubRateLimit(headers: Headers): GithubRateLimitState {
  const remainingRaw = headers.get("x-ratelimit-remaining");
  const resetRaw = headers.get("x-ratelimit-reset");
  const remaining = remainingRaw === null ? null : Number(remainingRaw);
  const resetAt =
    resetRaw && Number.isFinite(Number(resetRaw))
      ? new Date(Number(resetRaw) * 1000).toISOString()
      : null;
  return {
    remaining: Number.isFinite(remaining) ? remaining : null,
    resetAt,
    limited: remaining === 0,
  };
}

export function readmeFetchState(httpStatus: number): {
  ok: boolean;
  status: "verified" | "unavailable" | "failed";
  error: string | null;
} {
  if (httpStatus === 404) {
    return { ok: false, status: "unavailable", error: "README not found on this repository" };
  }
  if (httpStatus === 403) {
    return { ok: false, status: "failed", error: "GitHub refused README (rate limit or permission)" };
  }
  if (httpStatus >= 400) {
    return { ok: false, status: "failed", error: `README fetch HTTP ${httpStatus}` };
  }
  return { ok: true, status: "verified", error: null };
}

export type NestedTreeNode = {
  path: string;
  name: string;
  type: "file" | "dir";
  children: NestedTreeNode[];
  purpose?: string;
  workflowStage?: string;
  githubUrl?: string;
};

export function nestFileTree(
  nodes: Array<{
    path: string;
    type: "file" | "dir";
    purpose?: string;
    workflowStage?: string;
    githubUrl?: string;
  }>,
): NestedTreeNode[] {
  const root: NestedTreeNode[] = [];
  const map = new Map<string, NestedTreeNode>();
  const sorted = [...nodes].sort((a, b) => a.path.localeCompare(b.path));
  for (const node of sorted) {
    const parts = node.path.split("/").filter(Boolean);
    let prefix = "";
    for (let i = 0; i < parts.length; i += 1) {
      const name = parts[i]!;
      const path = prefix ? `${prefix}/${name}` : name;
      const isLeaf = i === parts.length - 1;
      if (!map.has(path)) {
        const created: NestedTreeNode = {
          path,
          name,
          type: isLeaf ? node.type : "dir",
          children: [],
          purpose: isLeaf ? node.purpose : undefined,
          workflowStage: isLeaf ? node.workflowStage : undefined,
          githubUrl: isLeaf ? node.githubUrl : undefined,
        };
        map.set(path, created);
        if (prefix) map.get(prefix)?.children.push(created);
        else root.push(created);
      } else if (isLeaf) {
        const existing = map.get(path)!;
        existing.type = node.type;
        existing.purpose = node.purpose;
        existing.workflowStage = node.workflowStage;
        existing.githubUrl = node.githubUrl;
      }
      prefix = path;
    }
  }
  return root;
}

export function annotateFileTree<
  T extends { path: string; purpose?: string; workflowStage?: string },
>(
  nodes: T[],
  steps: Array<{ githubPath?: string; body: string; workflowStage?: string }>,
): T[] {
  return nodes.map((node) => {
    const step = steps.find(
      (item) =>
        item.githubPath &&
        (node.path === item.githubPath || node.path.startsWith(`${item.githubPath}/`)),
    );
    if (!step) return node;
    return {
      ...node,
      purpose: node.purpose ?? step.body,
      workflowStage: node.workflowStage ?? step.workflowStage,
    };
  });
}
