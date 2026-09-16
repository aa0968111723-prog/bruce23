const SKIP_DIR = new Set([
  "node_modules",
  ".git",
  "dist",
  ".output",
  ".vercel",
  "coverage",
  ".next",
]);

const PURPOSE_BY_PATH: Array<{ test: RegExp; purpose: string; stage: string }> = [
  { test: /^client(\/|$)/, purpose: "前端介面", stage: "呈現" },
  { test: /^server(\/|$)/, purpose: "後端與 API", stage: "生成／審批" },
  { test: /^shared(\/|$)/, purpose: "前後端共用模型", stage: "世界觀" },
  { test: /^docs(\/|$)/, purpose: "產品與限制說明", stage: "來源" },
  { test: /^src\/lib\/commands/, purpose: "同一套指令層", stage: "修復" },
  { test: /^src\/lib\/zen/, purpose: "本地回應引擎", stage: "對話" },
  { test: /^engine(\/|$)/, purpose: "像素／OpenCV 引擎", stage: "檢測" },
  { test: /^src\/core/, purpose: "空間計算核心", stage: "場佈" },
  { test: /^src\/cloud/, purpose: "雲端房間與權限", stage: "對稿" },
  { test: /^README/i, purpose: "能力與限制原文", stage: "來源" },
];

export function annotateTreePath(path: string): { purpose?: string; stage?: string } {
  const hit = PURPOSE_BY_PATH.find((item) => item.test.test(path));
  if (!hit) return {};
  return { purpose: hit.purpose, stage: hit.stage };
}

export function shouldSkipPath(path: string): boolean {
  return path.split("/").some((part) => SKIP_DIR.has(part));
}

export function truncateReadme(text: string, max = 20_000): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n\n…（作品集只保存摘要，完整 README 請開 GitHub）`;
}

export type GithubSnapshot = {
  owner: string;
  repo: string;
  htmlUrl: string;
  description: string | null;
  homepage: string | null;
  defaultBranch: string | null;
  updatedAt: string | null;
  isPrivate: boolean;
  archived: boolean;
  topics: string[];
  languages: Record<string, number>;
  readme: string | null;
  latestCommit: {
    sha: string;
    message: string;
    committedAt?: string;
    htmlUrl?: string;
  } | null;
  fileTree: Array<{
    path: string;
    type: "file" | "dir";
    purpose?: string;
    stage?: string;
    githubUrl?: string;
  }>;
};

export type GithubFetchResult =
  | { ok: true; snapshot: GithubSnapshot; revalidated: boolean; rateLimit?: RateLimit }
  | {
      ok: false;
      status: "failed" | "unavailable";
      error: string;
      rateLimited: boolean;
      rateLimit?: RateLimit;
    };

export type RateLimit = {
  remaining: number | null;
  limit: number | null;
  reset: string | null;
};

export type GithubHttp = {
  fetch: typeof fetch;
  now?: () => number;
  token?: string | null;
  cache?: {
    get: (key: string) => Promise<{ etag?: string; lastModified?: string; body: unknown } | null>;
    set: (
      key: string,
      value: { etag?: string; lastModified?: string; body: unknown; status: number },
    ) => Promise<void>;
  };
};

function headers(token?: string | null, extra?: Record<string, string>) {
  const h = new Headers({
    Accept: "application/vnd.github+json",
    "User-Agent": "luminous-studio-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
    ...extra,
  });
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
}

function readRate(res: Response): RateLimit {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const limit = res.headers.get("x-ratelimit-limit");
  const reset = res.headers.get("x-ratelimit-reset");
  return {
    remaining: remaining ? Number(remaining) : null,
    limit: limit ? Number(limit) : null,
    reset: reset ? new Date(Number(reset) * 1000).toISOString() : null,
  };
}

async function ghJson(
  http: GithubHttp,
  url: string,
  cacheKey: string,
): Promise<{ status: number; body: unknown; rateLimit: RateLimit; revalidated: boolean }> {
  const cached = http.cache ? await http.cache.get(cacheKey) : null;
  const extra: Record<string, string> = {};
  if (cached?.etag) extra["If-None-Match"] = cached.etag;
  if (cached?.lastModified) extra["If-Modified-Since"] = cached.lastModified;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await http.fetch(url, {
      headers: headers(http.token, extra),
      signal: controller.signal,
    });
    const rateLimit = readRate(res);
    if (res.status === 304 && cached) {
      return { status: 200, body: cached.body, rateLimit, revalidated: false };
    }
    const text = await res.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    if (http.cache && res.ok) {
      await http.cache.set(cacheKey, {
        etag: res.headers.get("etag") ?? undefined,
        lastModified: res.headers.get("last-modified") ?? undefined,
        body,
        status: res.status,
      });
    }
    return { status: res.status, body, rateLimit, revalidated: true };
  } finally {
    clearTimeout(timer);
  }
}

function messageFromBody(body: unknown): string {
  if (body && typeof body === "object" && "message" in body) {
    return String((body as { message: unknown }).message);
  }
  return "GitHub 請求失敗";
}

export async function fetchPublicGithubSnapshot(
  owner: string,
  repo: string,
  http: GithubHttp,
): Promise<GithubFetchResult> {
  try {
    const repoRes = await ghJson(
      http,
      `https://api.github.com/repos/${owner}/${repo}`,
      `repo:${owner}/${repo}`,
    );
    if (repoRes.status === 404) {
      return {
        ok: false,
        status: "unavailable",
        error: "找不到這個公開儲存庫，或尚未授權讀取私有庫。",
        rateLimited: false,
        rateLimit: repoRes.rateLimit,
      };
    }
    if (repoRes.status === 403 || repoRes.status === 429) {
      return {
        ok: false,
        status: "failed",
        error: "GitHub 速率限制或拒絕存取。稍後再試，不會假裝同步成功。",
        rateLimited: true,
        rateLimit: repoRes.rateLimit,
      };
    }
    if (repoRes.status >= 400) {
      return {
        ok: false,
        status: "failed",
        error: messageFromBody(repoRes.body),
        rateLimited: false,
        rateLimit: repoRes.rateLimit,
      };
    }
    const meta = repoRes.body as Record<string, unknown>;
    const defaultBranch = typeof meta.default_branch === "string" ? meta.default_branch : "main";
    const isPrivate = Boolean(meta.private);

    const [langs, topics, commits, readme, tree] = await Promise.all([
      ghJson(http, `https://api.github.com/repos/${owner}/${repo}/languages`, `lang:${owner}/${repo}`),
      ghJson(
        http,
        `https://api.github.com/repos/${owner}/${repo}/topics`,
        `topics:${owner}/${repo}`,
      ),
      ghJson(
        http,
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
        `commit:${owner}/${repo}`,
      ),
      ghJson(
        http,
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        `readme:${owner}/${repo}`,
      ),
      ghJson(
        http,
        `https://api.github.com/repos/${owner}/${repo}/contents/`,
        `tree:${owner}/${repo}`,
      ),
    ]);

    let readmeText: string | null = null;
    if (readme.status === 200 && readme.body && typeof readme.body === "object") {
      const content = (readme.body as { content?: string; encoding?: string }).content;
      const encoding = (readme.body as { encoding?: string }).encoding;
      if (content && encoding === "base64") {
        readmeText = truncateReadme(Buffer.from(content, "base64").toString("utf8"));
      }
    } else if (readme.status === 404) {
      readmeText = null;
    }

    const languages =
      langs.status === 200 && langs.body && typeof langs.body === "object"
        ? (langs.body as Record<string, number>)
        : {};
    const topicList =
      topics.status === 200 && topics.body && typeof topics.body === "object"
        ? ((topics.body as { names?: string[] }).names ?? [])
        : [];

    let latestCommit: GithubSnapshot["latestCommit"] = null;
    if (Array.isArray(commits.body) && commits.body[0]) {
      const c = commits.body[0] as {
        sha: string;
        html_url?: string;
        commit?: { message?: string; committer?: { date?: string } };
      };
      latestCommit = {
        sha: c.sha.slice(0, 7),
        message: (c.commit?.message ?? "").split("\n")[0] ?? "",
        committedAt: c.commit?.committer?.date,
        htmlUrl: c.html_url,
      };
    }

    const fileTree: GithubSnapshot["fileTree"] = [];
    if (Array.isArray(tree.body)) {
      for (const entry of tree.body as Array<{ path?: string; name?: string; type?: string; html_url?: string }>) {
        const path = entry.path || entry.name;
        if (!path || shouldSkipPath(path)) continue;
        const type = entry.type === "dir" ? "dir" : "file";
        const note = annotateTreePath(path);
        fileTree.push({
          path,
          type,
          purpose: note.purpose,
          stage: note.stage,
          githubUrl:
            entry.html_url ??
            `https://github.com/${owner}/${repo}/${type === "dir" ? "tree" : "blob"}/${defaultBranch}/${path}`,
        });
        if (fileTree.length >= 40) break;
      }
    }

    return {
      ok: true,
      revalidated: repoRes.revalidated,
      rateLimit: repoRes.rateLimit,
      snapshot: {
        owner,
        repo,
        htmlUrl: typeof meta.html_url === "string" ? meta.html_url : `https://github.com/${owner}/${repo}`,
        description: typeof meta.description === "string" ? meta.description : null,
        homepage: typeof meta.homepage === "string" && meta.homepage ? meta.homepage : null,
        defaultBranch,
        updatedAt: typeof meta.updated_at === "string" ? meta.updated_at : null,
        isPrivate,
        archived: Boolean(meta.archived),
        topics: topicList,
        languages,
        readme: readmeText,
        latestCommit,
        fileTree,
      },
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      status: "failed",
      error: aborted ? "GitHub 連線逾時" : err instanceof Error ? err.message : "GitHub 連線失敗",
      rateLimited: false,
    };
  }
}

export type GithubFieldChange = {
  field: string;
  from: string;
  to: string;
};

export type GithubSyncCurrent = {
  github_branch?: string | null;
  github_metadata?: {
    description?: string | null;
    homepage?: string | null;
    updated_at?: string | null;
    html_url?: string | null;
    archived?: boolean;
  } | null;
  github_languages?: { [language: string]: number } | null;
  github_topics?: string[] | null;
  github_latest_commit?: GithubSnapshot["latestCommit"];
  github_readme?: string | null;
  github_is_private?: boolean;
};

function encodeDiffValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export function diffGithubFields(
  current: GithubSyncCurrent,
  snapshot: GithubSnapshot,
): GithubFieldChange[] {
  const next: GithubSyncCurrent = {
    github_branch: snapshot.defaultBranch,
    github_metadata: {
      description: snapshot.description,
      homepage: snapshot.homepage,
      updated_at: snapshot.updatedAt,
      html_url: snapshot.htmlUrl,
      archived: snapshot.archived,
    },
    github_languages: snapshot.languages,
    github_topics: snapshot.topics,
    github_latest_commit: snapshot.latestCommit,
    github_readme: snapshot.readme,
    github_is_private: snapshot.isPrivate,
  };
  const changes: GithubFieldChange[] = [];
  for (const field of Object.keys(next) as Array<keyof GithubSyncCurrent>) {
    const from = current[field];
    const to = next[field];
    if (JSON.stringify(from ?? null) !== JSON.stringify(to ?? null)) {
      changes.push({ field, from: encodeDiffValue(from), to: encodeDiffValue(to) });
    }
  }
  return changes;
}
