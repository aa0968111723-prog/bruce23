import type { Sql } from "@/lib/db";
import {
  githubFileUrl,
  limitFileTree,
  parseGithubMetadata,
  parseGithubRateLimit,
  parseGithubUrl,
  summarizeReadme,
  type GithubMetadataInput,
} from "./github-url";
import type { FileTreeNode, GithubCommitPublic, GithubMetadataPublic } from "./types";

const API = "https://api.github.com";
const UA = "luminous-studio-portfolio";
const TIMEOUT_MS = 8000;

export type GithubFetchResult<T> =
  | { ok: true; status: "connected" | "verified"; data: T; rateLimited: false }
  | {
      ok: false;
      status: "failed" | "unavailable" | "not_configured";
      error: string;
      rateLimited: boolean;
      data?: T;
    };

function token(): string | undefined {
  return process.env.GITHUB_READ_TOKEN?.trim() || undefined;
}

function neverLogToken(headers: Headers) {
  const copy = new Headers(headers);
  if (copy.has("Authorization")) copy.set("Authorization", "Bearer [redacted]");
  return copy;
}

async function githubGet(
  sql: Sql,
  path: string,
  accept = "application/vnd.github+json",
): Promise<{ status: number; json: unknown; headers: Headers; rateLimited: boolean }> {
  const cacheKey = `GET ${path}`;
  const cached = await sql.query<{ etag: string | null; payload: unknown }>(
    "select etag, payload from github_http_cache where cache_key = $1",
    [cacheKey],
  );
  const headers: Record<string, string> = {
    Accept: accept,
    "User-Agent": UA,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const tok = token();
  if (tok) headers.Authorization = `Bearer ${tok}`;
  const etag = cached[0]?.etag;
  if (etag) headers["If-None-Match"] = etag;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    const message = err instanceof Error && err.name === "AbortError" ? "GitHub request timed out" : "GitHub request failed";
    throw Object.assign(new Error(message), { status: "failed" });
  } finally {
    clearTimeout(timer);
  }

  void neverLogToken(new Headers(headers));
  const rate = parseGithubRateLimit(response.headers);
  if (response.status === 304 && cached[0]) {
    return { status: 304, json: cached[0].payload, headers: response.headers, rateLimited: rate.limited };
  }
  let json: unknown = null;
  const text = await response.text();
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  if (response.ok) {
    await sql.query(
      `insert into github_http_cache (cache_key, etag, last_modified, payload, status_code, fetched_at)
       values ($1,$2,$3,$4::jsonb,$5, now())
       on conflict (cache_key) do update set etag = excluded.etag, last_modified = excluded.last_modified, payload = excluded.payload, status_code = excluded.status_code, fetched_at = now()`,
      [
        cacheKey,
        response.headers.get("etag"),
        response.headers.get("last-modified"),
        JSON.stringify(json),
        response.status,
      ],
    );
  }
  return { status: response.status, json, headers: response.headers, rateLimited: rate.limited || response.status === 403 && /rate limit/i.test(text) };
}

function decodeReadme(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const rec = payload as { encoding?: string; content?: string };
  if (typeof rec.content !== "string") return null;
  if (rec.encoding === "base64") {
    try {
      return Buffer.from(rec.content.replace(/\n/g, ""), "base64").toString("utf8");
    } catch {
      return null;
    }
  }
  return rec.content;
}

export type SyncedGithub = {
  owner: string;
  repo: string;
  url: string;
  branch: string;
  isPrivate: boolean;
  metadata: GithubMetadataPublic;
  readme: string | null;
  readmeSummary: string | null;
  fileTree: FileTreeNode[];
  languages: Record<string, number> | null;
  topics: string[];
  latestCommit: GithubCommitPublic | null;
};

export async function fetchGithubSnapshot(
  sql: Sql,
  githubUrl: string,
): Promise<GithubFetchResult<SyncedGithub>> {
  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) {
    return { ok: false, status: "not_configured", error: "Invalid GitHub URL", rateLimited: false };
  }
  try {
    const repoRes = await githubGet(sql, `/repos/${parsed.owner}/${parsed.repo}`);
    if (repoRes.status === 404) {
      return { ok: false, status: "unavailable", error: "Repository not found or private", rateLimited: repoRes.rateLimited };
    }
    if (repoRes.rateLimited) {
      return { ok: false, status: "failed", error: "GitHub rate limit reached", rateLimited: true };
    }
    if (repoRes.status >= 400) {
      return { ok: false, status: "failed", error: `GitHub metadata HTTP ${repoRes.status}`, rateLimited: repoRes.rateLimited };
    }
    const metadata = parseGithubMetadata(repoRes.json as GithubMetadataInput);
    const isPrivate = metadata.visibility === "private";
    const branch = metadata.defaultBranch || "main";

    const [readmeRes, langRes, topicsRes, commitRes, treeRes] = await Promise.all([
      githubGet(sql, `/repos/${parsed.owner}/${parsed.repo}/readme`),
      githubGet(sql, `/repos/${parsed.owner}/${parsed.repo}/languages`),
      githubGet(sql, `/repos/${parsed.owner}/${parsed.repo}/topics`),
      githubGet(sql, `/repos/${parsed.owner}/${parsed.repo}/commits?sha=${encodeURIComponent(branch)}&per_page=1`),
      githubGet(sql, `/repos/${parsed.owner}/${parsed.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`),
    ]);

    const readme = readmeRes.status < 400 ? decodeReadme(readmeRes.json) : null;
    const languages =
      langRes.status < 400 && langRes.json && typeof langRes.json === "object"
        ? (langRes.json as Record<string, number>)
        : null;
    const topics =
      topicsRes.status < 400 && topicsRes.json && typeof topicsRes.json === "object"
        ? ((topicsRes.json as { names?: string[] }).names ?? [])
        : [];
    let latestCommit: GithubCommitPublic | null = null;
    if (Array.isArray(commitRes.json) && commitRes.json[0]) {
      const c = commitRes.json[0] as {
        sha?: string;
        html_url?: string;
        commit?: { message?: string; committer?: { date?: string } };
      };
      latestCommit = {
        sha: (c.sha ?? "").slice(0, 40),
        message: (c.commit?.message ?? "").split("\n")[0] ?? "",
        committedAt: c.commit?.committer?.date ?? null,
        htmlUrl: c.html_url ?? null,
      };
    }
    const treePayload = treeRes.json as { tree?: { path: string; type: string }[]; truncated?: boolean } | null;
    const limited = limitFileTree(
      (treePayload?.tree ?? [])
        .filter((n) => n.type === "blob" || n.type === "tree")
        .map((n) => ({ path: n.path, type: n.type === "tree" ? "tree" : "blob" })),
    );
    const fileTree: FileTreeNode[] = limited.map((node) => ({
      ...node,
      githubUrl: githubFileUrl(parsed.owner, parsed.repo, branch, node.path),
    }));

    return {
      ok: true,
      status: "connected",
      rateLimited: false,
      data: {
        owner: parsed.owner,
        repo: parsed.repo,
        url: parsed.url,
        branch,
        isPrivate,
        metadata,
        readme,
        readmeSummary: readme ? summarizeReadme(readme) : null,
        fileTree,
        languages,
        topics,
        latestCommit,
      },
    };
  } catch (err) {
    return {
      ok: false,
      status: "failed",
      error: err instanceof Error ? err.message : "GitHub sync failed",
      rateLimited: false,
    };
  }
}

export function githubDiff(current: Partial<SyncedGithub> | null, incoming: SyncedGithub) {
  const fields: Array<{ field: string; from: string; to: string }> = [];
  const pairs: Array<[string, unknown, unknown]> = [
    ["branch", current?.branch ?? null, incoming.branch],
    ["description", current?.metadata?.description ?? null, incoming.metadata.description],
    ["updatedAt", current?.metadata?.updatedAt ?? null, incoming.metadata.updatedAt],
    ["languages", current?.languages ?? null, incoming.languages],
    ["topics", current?.topics ?? [], incoming.topics],
    ["latestCommit", current?.latestCommit?.sha ?? null, incoming.latestCommit?.sha ?? null],
    ["readmeSummary", current?.readmeSummary ?? null, incoming.readmeSummary],
    ["visibility", current?.metadata?.visibility ?? null, incoming.metadata.visibility],
    ["fileTreeCount", current?.fileTree?.length ?? 0, incoming.fileTree.length],
  ];
  for (const [field, from, to] of pairs) {
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      fields.push({ field, from: JSON.stringify(from), to: JSON.stringify(to) });
    }
  }
  return fields;
}
