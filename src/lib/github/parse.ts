const GITHUB_HOSTS = new Set(["github.com", "www.github.com"]);

export type ParsedGithubRepo = {
  owner: string;
  repo: string;
  htmlUrl: string;
};

export function parseGithubRepoUrl(
  raw: string | null | undefined,
): ParsedGithubRepo | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const ssh = /^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i.exec(trimmed);
  if (ssh) {
    return normalize(ssh[1], ssh[2]);
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!GITHUB_HOSTS.has(url.hostname.toLowerCase())) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  if (parts[0] === "orgs" || parts[0] === "users" || parts[0] === "settings") {
    return null;
  }
  return normalize(parts[0], parts[1]);
}

function normalize(owner: string, repo: string): ParsedGithubRepo | null {
  const cleanRepo = repo.replace(/\.git$/i, "");
  if (!/^[A-Za-z0-9_.-]+$/.test(owner)) return null;
  if (!/^[A-Za-z0-9_.-]+$/.test(cleanRepo)) return null;
  return {
    owner,
    repo: cleanRepo,
    htmlUrl: `https://github.com/${owner}/${cleanRepo}`,
  };
}

export function githubFileUrl(
  owner: string,
  repo: string,
  branch: string,
  path: string,
): string {
  const clean = path.replace(/^\//, "");
  return `https://github.com/${owner}/${repo}/blob/${encodeURIComponent(branch)}/${clean
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export const GITHUB_AUTO_FIELDS = [
  "github_metadata",
  "github_readme",
  "github_languages",
  "github_topics",
  "github_latest_commit",
  "github_branch",
  "github_file_tree",
  "github_sync_status",
  "github_last_synced_at",
  "github_is_private",
] as const;

export const GITHUB_NARRATIVE_FIELDS = [
  "title",
  "title_en",
  "subtitle",
  "subtitle_en",
  "summary",
  "summary_en",
  "problem",
  "role",
  "decisions",
  "copy_zh",
  "copy_en",
  "experience_config",
  "interaction_steps",
] as const;
