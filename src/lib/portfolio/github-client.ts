import {
  annotateFileTree,
  githubRateLimitState,
  limitFileTree,
  parseGithubCommitPayload,
  parseGithubRepoPayload,
  parseGithubRepoUrl,
  readmeSyncState,
  summarizeReadme,
  type GithubIncoming,
  type GithubTreeEntry,
} from "./github.ts";
import { isHttpsPublicUrl } from "./demo.ts";
import type { Sql } from "./sql.ts";

const API = "https://api.github.com";
const TIMEOUT_MS = 8000;
const UA = "luminous-studio-portfolio";

export type GithubFetchResult =
  | { ok: true; incoming: GithubIncoming; rateLimited?: false }
  | {
      ok: false;
      status: "failed" | "unavailable" | "rate_limited";
      error: string;
      rateLimited?: boolean;
      readmeFailed?: boolean;
    };

type CacheRow = {
  cache_key: string;
  etag: string | null;
  last_modified: string | null;
  body: string | null;
  status_code: number | null;
};

async function cachedGet(
  sql: Sql,
  cacheKey: string,
  url: string,
  token?: string,
): Promise<{ status: number; json: unknown; remaining: string | null; notModified: boolean }> {
  const cached = (
    await sql.query<CacheRow>(`select * from http_cache where cache_key = $1`, [cacheKey])
  )[0];
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": UA,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cached?.etag) headers["If-None-Match"] = cached.etag;
  if (cached?.last_modified) headers["If-Modified-Since"] = cached.last_modified;

  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const remaining = response.headers.get("x-ratelimit-remaining");
  if (response.status === 304 && cached?.body) {
    return {
      status: cached.status_code ?? 200,
      json: JSON.parse(cached.body),
      remaining,
      notModified: true,
    };
  }
  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  await sql.query(
    `insert into http_cache (cache_key, etag, last_modified, body, status_code, fetched_at)
     values ($1,$2,$3,$4,$5,now())
     on conflict (cache_key) do update set
       etag=excluded.etag, last_modified=excluded.last_modified,
       body=excluded.body, status_code=excluded.status_code, fetched_at=now()`,
    [
      cacheKey,
      response.headers.get("etag"),
      response.headers.get("last-modified"),
      text.slice(0, 200_000),
      response.status,
    ],
  );
  return { status: response.status, json, remaining, notModified: false };
}

function tokenFromEnv(): string | undefined {
  return process.env.GITHUB_READ_TOKEN?.trim() || undefined;
}

export async function fetchGithubSnapshot(
  sql: Sql,
  githubUrl: string,
  filePurpose: Record<string, string> = {},
  pipelineStage: Record<string, string> = {},
): Promise<GithubFetchResult> {
  const parsed = parseGithubRepoUrl(githubUrl);
  if (!parsed.ok) {
    return { ok: false, status: "failed", error: parsed.error };
  }
  const token = tokenFromEnv();
  const repoPath = `${API}/repos/${parsed.owner}/${parsed.repo}`;

  try {
    const repoRes = await cachedGet(sql, `gh:repo:${parsed.owner}/${parsed.repo}`, repoPath, token);
    if (githubRateLimitState({ status: repoRes.status, remainingHeader: repoRes.remaining }) === "rate_limited") {
      return {
        ok: false,
        status: "rate_limited",
        error: "rate_limited",
        rateLimited: true,
      };
    }
    if (repoRes.status === 404) {
      return { ok: false, status: "unavailable", error: "repo_not_found" };
    }
    if (repoRes.status === 401 || repoRes.status === 403) {
      return { ok: false, status: "unavailable", error: "private_or_forbidden" };
    }
    const meta = parseGithubRepoPayload(repoRes.json);
    if (!meta.ok) {
      return { ok: false, status: "failed", error: meta.error };
    }
    if (meta.metadata.private && !token) {
      return { ok: false, status: "unavailable", error: "private_repo" };
    }

    const branch = parsed.branch || meta.metadata.defaultBranch;
    const [readmeRes, langRes, topicsRes, commitRes, treeRes] = await Promise.all([
      cachedGet(
        sql,
        `gh:readme:${parsed.owner}/${parsed.repo}`,
        `${repoPath}/readme`,
        token,
      ),
      cachedGet(
        sql,
        `gh:lang:${parsed.owner}/${parsed.repo}`,
        `${repoPath}/languages`,
        token,
      ),
      cachedGet(
        sql,
        `gh:topics:${parsed.owner}/${parsed.repo}`,
        `${repoPath}/topics`,
        token,
      ),
      cachedGet(
        sql,
        `gh:commit:${parsed.owner}/${parsed.repo}:${branch}`,
        `${repoPath}/commits?sha=${encodeURIComponent(branch)}&per_page=1`,
        token,
      ),
      cachedGet(
        sql,
        `gh:tree:${parsed.owner}/${parsed.repo}:${branch}`,
        `${repoPath}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
        token,
      ),
    ]);

    if (
      [readmeRes, langRes, topicsRes, commitRes, treeRes].some(
        (item) =>
          githubRateLimitState({
            status: item.status,
            remainingHeader: item.remaining,
          }) === "rate_limited",
      )
    ) {
      return {
        ok: false,
        status: "rate_limited",
        error: "rate_limited",
        rateLimited: true,
      };
    }

    let readme: string | null = null;
    let readmeFailed = false;
    if (readmeSyncState(readmeRes.status) === "ok") {
      const payload = readmeRes.json as { content?: string; encoding?: string } | null;
      if (payload?.content) {
        const decoded =
          payload.encoding === "base64"
            ? Buffer.from(payload.content.replace(/\n/g, ""), "base64").toString("utf8")
            : payload.content;
        readme = summarizeReadme(decoded);
      }
    } else {
      readmeFailed = true;
    }

    const languages =
      langRes.status >= 200 && langRes.status < 300 && langRes.json && typeof langRes.json === "object"
        ? (langRes.json as Record<string, number>)
        : {};
    const topicsRaw = topicsRes.json as { names?: string[] } | null;
    const topics = Array.isArray(topicsRaw?.names) ? topicsRaw.names : [];
    const commitParsed = parseGithubCommitPayload(commitRes.json);
    const treeJson = treeRes.json as { tree?: Array<{ path?: string; type?: string }> } | null;
    const entries: GithubTreeEntry[] = Array.isArray(treeJson?.tree)
      ? treeJson.tree
          .filter((item) => item.path && (item.type === "blob" || item.type === "tree"))
          .map((item) => ({
            path: String(item.path),
            type: item.type === "tree" ? "tree" : "blob",
          }))
      : [];
    const fileTree = annotateFileTree(
      limitFileTree(entries),
      filePurpose,
      pipelineStage,
    );

    return {
      ok: true,
      incoming: {
        github_owner: parsed.owner,
        github_repo: parsed.repo,
        github_branch: branch,
        github_metadata: meta.metadata,
        github_readme: readme,
        github_file_tree: fileTree,
        github_languages: languages,
        github_topics: topics,
        github_latest_commit: commitParsed.ok ? commitParsed.commit : null,
        github_sync_status: readmeFailed ? "failed" : "verified",
        github_last_synced_at: new Date().toISOString(),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.name : "fetch_failed";
    if (message === "TimeoutError" || message === "AbortError") {
      return { ok: false, status: "failed", error: "timeout" };
    }
    return { ok: false, status: "failed", error: "fetch_failed" };
  }
}

export async function verifyLiveDemo(url: string): Promise<{
  status: "verified" | "failed" | "unavailable";
  httpStatus: number | null;
  error?: string;
}> {
  if (!isHttpsPublicUrl(url)) {
    return { status: "failed", httpStatus: null, error: "url_not_public_https" };
  }
  try {
    let target = url;
    let response = await fetch(target, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const location = response.headers.get("location");
    if (location && [301, 302, 303, 307, 308].includes(response.status)) {
      const next = new URL(location, target);
      if (!isHttpsPublicUrl(next.toString())) {
        return { status: "failed", httpStatus: response.status, error: "redirect_not_public" };
      }
      target = next.toString();
      response = await fetch(target, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    }
    if (response.status === 404 || response.status === 410) {
      return { status: "unavailable", httpStatus: response.status };
    }
    if (response.status >= 200 && response.status < 400) {
      return { status: "verified", httpStatus: response.status };
    }
    if (response.status === 405) {
      const getRes = await fetch(target, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { Range: "bytes=0-0" },
      });
      if (getRes.status >= 200 && getRes.status < 400) {
        return { status: "verified", httpStatus: getRes.status };
      }
      return { status: "failed", httpStatus: getRes.status };
    }
    return { status: "failed", httpStatus: response.status };
  } catch {
    return { status: "failed", httpStatus: null, error: "network" };
  }
}

