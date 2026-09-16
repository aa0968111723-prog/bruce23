import type { Sql } from "../db.ts";
import type { GithubCacheStore } from "./client.server.ts";

export function createGithubSqlCache(sql: Sql): GithubCacheStore {
  return {
    async read(key: string) {
      const rows = await sql.query<{ etag: string | null; last_modified: string | null; body: string | null }>(
        `select etag, last_modified, body from github_http_cache where cache_key = $1 limit 1`,
        [key],
      );
      const row = rows[0];
      if (!row?.body) return null;
      return { etag: row.etag ?? undefined, lastModified: row.last_modified ?? undefined, body: row.body };
    },
    async write(key: string, value: { etag?: string; lastModified?: string; body: string; status: number }) {
      await sql.query(
        `insert into github_http_cache (cache_key, etag, last_modified, body, status, fetched_at)
         values ($1,$2,$3,$4,$5, now())
         on conflict (cache_key) do update set etag = excluded.etag, last_modified = excluded.last_modified,
           body = excluded.body, status = excluded.status, fetched_at = now()`,
        [key, value.etag ?? null, value.lastModified ?? null, value.body, value.status],
      );
    },
  };
}

export function githubClientOptions(sql: Sql, fetchImpl?: typeof fetch) {
  return {
    token: typeof process === "undefined" ? undefined : process.env.GITHUB_READ_TOKEN?.trim(),
    cache: createGithubSqlCache(sql),
    fetchImpl,
  };
}
