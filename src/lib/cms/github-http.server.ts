import type { Sql } from "@/lib/db";
import { env } from "@/lib/env.server";
import type { GithubHttp } from "@/lib/github/client";
import { parseJson } from "./json";

export async function githubHttp(sql: Sql): Promise<GithubHttp> {
  const token = env("GITHUB_READ_TOKEN") ?? null;
  return {
    fetch,
    token,
    cache: {
      async get(key) {
        const rows = await sql.query<{ etag: string | null; last_modified: string | null; body: unknown }>(
          `select etag, last_modified, body from http_cache where cache_key = $1`,
          [key],
        );
        if (!rows[0]) return null;
        return {
          etag: rows[0].etag ?? undefined,
          lastModified: rows[0].last_modified ?? undefined,
          body: parseJson(rows[0].body, null),
        };
      },
      async set(key, value) {
        await sql.query(
          `insert into http_cache (cache_key, etag, last_modified, body, status, fetched_at)
           values ($1,$2,$3,$4::jsonb,$5,now())
           on conflict (cache_key) do update set
             etag = excluded.etag,
             last_modified = excluded.last_modified,
             body = excluded.body,
             status = excluded.status,
             fetched_at = now()`,
          [
            key,
            value.etag ?? null,
            value.lastModified ?? null,
            JSON.stringify(value.body ?? null),
            value.status,
          ],
        );
      },
    },
  };
}
