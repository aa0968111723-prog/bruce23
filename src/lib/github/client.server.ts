import { parseGithubUrl, summarizeReadme, limitGithubTree, type GithubTreeNode } from "./parse.ts";
import type { IntegrationStatus } from "../cms/status.ts";

export type GithubFetchResult = {
  ok: boolean;
  status: IntegrationStatus;
  error?: string;
  errorCode?: "rate_limited" | "not_found" | "timeout" | "private" | "network" | "invalid_url";
  owner?: string;
  repo?: string;
  branch?: string;
  metadata?: {
    name: string;
    description: string | null;
    homepage: string | null;
    defaultBranch: string;
    updatedAt: string;
    pushedAt?: string;
    private: boolean;
    archived: boolean;
    htmlUrl: string;
    language: string | null;
  };
  readme?: string | null;
  readmeError?: string;
  languages?: Record<string, number>;
  topics?: string[];
  latestCommit?: {
    sha: string;
    message: string;
    date?: string;
    htmlUrl?: string;
  };
  fileTree?: GithubTreeNode[];
};

export type GithubCacheStore = {
  read(key: string): Promise<{ etag?: string; lastModified?: string; body?: string } | null>;
  write(key: string, value: { etag?: string; lastModified?: string; body: string; status: number }): Promise<void>;
};

type GithubClientOptions = {
  fetchImpl?: typeof fetch;
  token?: string;
  cache?: GithubCacheStore;
  timeoutMs?: number;
  now?: () => number;
};

function githubHeaders(token?: string, extra?: Record<string, string>): Headers {
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "User-Agent": "luminous-studio-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
    ...extra,
  });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function rateLimited(response: Response): boolean {
  return response.status === 429 || response.status === 403;
}

async function fetchJson(
  url: string,
  options: GithubClientOptions,
  cacheKey: string,
): Promise<{ status: number; json: unknown; fromCache: boolean; error?: string; errorCode?: GithubFetchResult["errorCode"] }> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 8000;
  const cached = options.cache ? await options.cache.read(cacheKey) : null;
  const extra: Record<string, string> = {};
  if (cached?.etag) extra["If-None-Match"] = cached.etag;
  if (cached?.lastModified) extra["If-Modified-Since"] = cached.lastModified;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      headers: githubHeaders(options.token, extra),
      signal: controller.signal,
    });
    if (response.status === 304 && cached?.body) {
      return { status: 304, json: JSON.parse(cached.body) as unknown, fromCache: true };
    }
    if (rateLimited(response)) {
      return {
        status: response.status,
        json: null,
        fromCache: false,
        error: "GitHub API 速率限制，稍後再同步。",
        errorCode: "rate_limited",
      };
    }
    const text = await response.text();
    if (options.cache && response.ok) {
      await options.cache.write(cacheKey, {
        etag: response.headers.get("etag") ?? undefined,
        lastModified: response.headers.get("last-modified") ?? undefined,
        body: text,
        status: response.status,
      });
    }
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    return { status: response.status, json, fromCache: false };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      status: 0,
      json: null,
      fromCache: false,
      error: aborted ? "GitHub 連線逾時。" : "GitHub 連線失敗。",
      errorCode: aborted ? "timeout" : "network",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPublicRepo(
  githubUrl: string,
  options: GithubClientOptions = {},
): Promise<GithubFetchResult> {
  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) {
    return { ok: false, status: "failed", error: "GitHub 網址無效。", errorCode: "invalid_url" };
  }
  const { owner, repo } = parsed;
  const repoRes = await fetchJson(
    `https://api.github.com/repos/${owner}/${repo}`,
    options,
    `repo:${owner}/${repo}`,
  );
  if (repoRes.errorCode) {
    return { ok: false, status: "failed", error: repoRes.error, errorCode: repoRes.errorCode, owner, repo };
  }
  if (repoRes.status === 404) {
    return { ok: false, status: "failed", error: "找不到這個公開儲存庫。", errorCode: "not_found", owner, repo };
  }
  if (repoRes.status < 200 || repoRes.status >= 300 || !repoRes.json || typeof repoRes.json !== "object") {
    return { ok: false, status: "failed", error: `GitHub metadata 讀取失敗（HTTP ${repoRes.status}）。`, owner, repo };
  }
  const data = repoRes.json as Record<string, unknown>;
  const isPrivate = Boolean(data.private);
  if (isPrivate && !options.token) {
    return {
      ok: false,
      status: "unavailable",
      error: "這是私人儲存庫，且伺服器沒有 GITHUB_READ_TOKEN。",
      errorCode: "private",
      owner,
      repo,
    };
  }

  const defaultBranch = typeof data.default_branch === "string" ? data.default_branch : "main";
  const metadata = {
    name: typeof data.name === "string" ? data.name : repo,
    description: typeof data.description === "string" ? data.description : null,
    homepage: typeof data.homepage === "string" && data.homepage ? data.homepage : null,
    defaultBranch,
    updatedAt: typeof data.updated_at === "string" ? data.updated_at : "",
    pushedAt: typeof data.pushed_at === "string" ? data.pushed_at : undefined,
    private: isPrivate,
    archived: Boolean(data.archived),
    htmlUrl: typeof data.html_url === "string" ? data.html_url : parsed.url,
    language: typeof data.language === "string" ? data.language : null,
  };

  const [readmeRes, langRes, commitRes, treeRes] = await Promise.all([
    fetchJson(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { ...options, fetchImpl: wrapRawAccept(options.fetchImpl) },
      `readme:${owner}/${repo}`,
    ),
    fetchJson(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      options,
      `languages:${owner}/${repo}`,
    ),
    fetchJson(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      options,
      `commit:${owner}/${repo}`,
    ),
    fetchJson(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
      options,
      `tree:${owner}/${repo}:${defaultBranch}`,
    ),
  ]);

  let readme: string | null = null;
  let readmeError: string | undefined;
  if (readmeRes.errorCode === "rate_limited") {
    return { ok: false, status: "failed", error: readmeRes.error, errorCode: "rate_limited", owner, repo, metadata };
  }
  if (readmeRes.status === 404) {
    readmeError = "這個儲存庫沒有 README，或 README 無法公開讀取。";
  } else if (readmeRes.status >= 200 && readmeRes.status < 300) {
    readme = extractReadme(readmeRes.json);
  } else if (readmeRes.status !== 304) {
    readmeError = `README 讀取失敗（HTTP ${readmeRes.status}）。`;
  }

  const languages =
    langRes.json && typeof langRes.json === "object" && !Array.isArray(langRes.json)
      ? (langRes.json as Record<string, number>)
      : undefined;

  let latestCommit: GithubFetchResult["latestCommit"];
  if (Array.isArray(commitRes.json) && commitRes.json[0] && typeof commitRes.json[0] === "object") {
    const commit = commitRes.json[0] as Record<string, unknown>;
    const inner = (commit.commit as Record<string, unknown> | undefined) ?? {};
    const author = (inner.author as Record<string, unknown> | undefined) ?? {};
    latestCommit = {
      sha: typeof commit.sha === "string" ? commit.sha : "",
      message: typeof inner.message === "string" ? inner.message.split("\n")[0] : "",
      date: typeof author.date === "string" ? author.date : undefined,
      htmlUrl: typeof commit.html_url === "string" ? commit.html_url : undefined,
    };
  }

  let fileTree: GithubTreeNode[] | undefined;
  if (treeRes.json && typeof treeRes.json === "object") {
    const tree = (treeRes.json as { tree?: Array<{ path: string; type: string; size?: number }> }).tree;
    if (Array.isArray(tree)) {
      fileTree = limitGithubTree(tree, { maxEntries: 80, maxDepth: 3 });
    }
  }

  const topics = Array.isArray(data.topics) ? data.topics.filter((t): t is string => typeof t === "string") : [];

  return {
    ok: true,
    status: "verified",
    owner,
    repo,
    branch: defaultBranch,
    metadata,
    readme,
    readmeError,
    languages,
    topics,
    latestCommit,
    fileTree,
  };
}

function wrapRawAccept(fetchImpl?: typeof fetch): typeof fetch {
  const inner = fetchImpl ?? fetch;
  return (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/vnd.github.raw+json");
    return inner(input, { ...init, headers });
  }) as typeof fetch;
}

function extractReadme(json: unknown): string | null {
  if (typeof json === "string") return summarizeReadme(json);
  if (json && typeof json === "object" && "content" in json && typeof json.content === "string") {
    try {
      const decoded = Buffer.from(json.content.replace(/\n/g, ""), "base64").toString("utf8");
      return summarizeReadme(decoded);
    } catch {
      return null;
    }
  }
  return null;
}

export const GITHUB_SYNC_FIELDS = [
  "github_url",
  "github_owner",
  "github_repo",
  "github_branch",
  "github_sync_status",
  "github_last_synced_at",
  "github_metadata",
  "github_readme",
  "github_file_tree",
  "github_languages",
  "github_topics",
  "github_latest_commit",
] as const;

export const NARRATIVE_FIELDS = [
  "title",
  "subtitle",
  "summary",
  "problem",
  "role",
  "decisions",
  "modalities",
  "process",
  "outputs",
  "limitations",
  "media",
  "locale_json",
  "seo_title",
  "seo_description",
  "experience_mode",
  "experience_config",
  "interaction_steps",
] as const;
