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
  ".grok/skills/",
];

export function limitGithubTree(
  entries: Array<{ path: string; type: string; size?: number }>,
  options: { maxEntries?: number; maxDepth?: number } = {},
): GithubTreeNode[] {
  const maxEntries = options.maxEntries ?? 80;
  const maxDepth = options.maxDepth ?? 3;
  const out: GithubTreeNode[] = [];
  for (const entry of entries) {
    const path = entry.path.replace(/^\/+/, "");
    if (!path) continue;
    if (SKIP_FRAGMENTS.some((frag) => path.includes(frag))) continue;
    const depth = path.split("/").length;
    if (depth > maxDepth) continue;
    const type = entry.type === "tree" || entry.type === "dir" ? "dir" : "file";
    out.push({ path, type, size: type === "file" ? entry.size : undefined });
    if (out.length >= maxEntries) break;
  }
  return out;
}
