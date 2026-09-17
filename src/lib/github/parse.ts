export type ParsedGithubRepo = {
  owner: string;
  repo: string;
  url: string;
};

const GITHUB_HOSTS = new Set(["github.com", "www.github.com"]);

export function parseGithubUrl(input: string | null | undefined): ParsedGithubRepo | null {
  const raw = input?.trim() ?? "";
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!GITHUB_HOSTS.has(url.hostname.toLowerCase())) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, "");
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) return null;
  if (owner === "." || owner === ".." || repo === "." || repo === "..") return null;
  return {
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`,
  };
}

export function githubBlobUrl(owner: string, repo: string, branch: string, path: string): string {
  const clean = path.replace(/^\/+/, "");
  return `https://github.com/${owner}/${repo}/blob/${encodeURIComponent(branch)}/${clean
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export function githubTreeUrl(owner: string, repo: string, branch: string, path = ""): string {
  if (!path) return `https://github.com/${owner}/${repo}/tree/${encodeURIComponent(branch)}`;
  const clean = path.replace(/^\/+/, "");
  return `https://github.com/${owner}/${repo}/tree/${encodeURIComponent(branch)}/${clean
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export function summarizeReadme(markdown: string, maxChars = 4000): string {
  const trimmed = markdown.split("\0").join("").trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trimEnd()}\n\n…（README 已截斷，完整內容請到 GitHub 查看）`;
}

export type GithubTreeNode = {
  path: string;
  type: "file" | "dir";
  size?: number;
};

const SKIP_FRAGMENTS = [
  "node_modules/",
  "dist/",
  ".output/",
  "coverage/",
  ".git/",
  "pnpm-lock",
  "package-lock.json",
  ".grok/",
];

const LOW_VALUE_PREFIXES = [".github/", ".grok/", ".cursor/", ".vscode/", ".manus/"];
const MAX_LOW_VALUE_ENTRIES = 12;

function treeScore(path: string): number {
  const lower = path.toLowerCase();
  if (lower === "readme.md" || lower.endsWith("/readme.md")) return 100;
  if (lower === "package.json" || lower === "agents.md") return 90;
  if (
    path.startsWith("src/") ||
    path.startsWith("client/") ||
    path.startsWith("server/") ||
    path.startsWith("shared/") ||
    path.startsWith("app/") ||
    path.startsWith("packages/")
  ) {
    return 80;
  }
  if (LOW_VALUE_PREFIXES.some((prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix))) {
    return 8;
  }
  return 40;
}

export function limitGithubTree(
  entries: Array<{ path: string; type: string; size?: number }>,
  options: { maxEntries?: number; maxDepth?: number; keepPaths?: string[] } = {},
): GithubTreeNode[] {
  const maxEntries = options.maxEntries ?? 80;
  const maxDepth = options.maxDepth ?? 4;
  const keep = new Set(
    (options.keepPaths ?? []).map((path) => path.replace(/^\/+/, "")).filter(Boolean),
  );
  const pinned: GithubTreeNode[] = [];
  const pinnedSeen = new Set<string>();
  const scored: Array<{ node: GithubTreeNode; score: number }> = [];
  for (const entry of entries) {
    const path = entry.path.replace(/^\/+/, "");
    if (!path) continue;
    if (SKIP_FRAGMENTS.some((frag) => path.includes(frag))) continue;
    const type = entry.type === "tree" || entry.type === "dir" ? "dir" : "file";
    const node: GithubTreeNode = { path, type, size: type === "file" ? entry.size : undefined };
    if (keep.has(path) && !pinnedSeen.has(path)) {
      pinned.push(node);
      pinnedSeen.add(path);
      continue;
    }
    const depth = path.split("/").length;
    if (depth > maxDepth) continue;
    scored.push({ node, score: treeScore(path) });
  }
  scored.sort((a, b) => b.score - a.score || a.node.path.localeCompare(b.node.path));
  const high: GithubTreeNode[] = [];
  const low: GithubTreeNode[] = [];
  for (const item of scored) {
    if (item.score <= 8) low.push(item.node);
    else high.push(item.node);
  }
  const rest = [...high, ...low.slice(0, MAX_LOW_VALUE_ENTRIES)].filter((item) => !pinnedSeen.has(item.path));
  // Catalog source paths stay even if they would otherwise exceed maxEntries.
  const limited = [...pinned, ...rest].slice(0, Math.max(maxEntries, pinned.length));
  return sortGithubTree(limited);
}

export function mergeGithubTreeNodes(base: GithubTreeNode[], extra: GithubTreeNode[]): GithubTreeNode[] {
  const seen = new Set(base.map((node) => node.path));
  const out = [...base];
  for (const node of extra) {
    const path = node.path.replace(/^\/+/, "");
    if (!path || seen.has(path)) continue;
    seen.add(path);
    out.push({ ...node, path });
  }
  return sortGithubTree(out);
}

function sortGithubTree(nodes: GithubTreeNode[]): GithubTreeNode[] {
  return [...nodes].sort((a, b) => treeScore(b.path) - treeScore(a.path) || a.path.localeCompare(b.path));
}
