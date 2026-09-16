import type { Sql } from "../db.ts";
import { fetchPublicRepo } from "../github/client.server.ts";
import { githubClientOptions } from "../github/sql-cache.ts";
import { applyGithubSync } from "./store.ts";
import { verifyDemoUrl } from "../demo/verify.ts";

export const GITHUB_HYDRATE_KEY = "github_hydrate";
export const GITHUB_HYDRATE_VERSION = "1";

export type HydrateGithubResult = {
  attempted: number;
  verified: number;
  failed: number;
  skipped: boolean;
  rateLimited: boolean;
};

export type HydrateDemoResult = {
  attempted: number;
  probed: number;
  skipped: boolean;
};

const INCOMPLETE_GITHUB_SQL = `
  github_sync_enabled = true
  and github_url is not null
  and github_url <> ''
  and (
    github_sync_status in ('pending', 'stale')
    or (
      github_sync_status = 'failed'
      and coalesce(github_metadata->>'errorCode', '') = 'rate_limited'
    )
  )
`;

async function incompleteGithubRows(sql: Sql) {
  return sql.query<{ id: string }>(`select id from projects where ${INCOMPLETE_GITHUB_SQL}`);
}

function shouldSkipLifecycle(): boolean {
  const event = typeof process === "undefined" ? "" : (process.env.npm_lifecycle_event ?? "");
  return event === "build" || event === "typecheck" || event === "lint";
}

export function shouldHydrateGithub(options: { skip?: boolean } = {}): boolean {
  if (options.skip) return false;
  if (typeof process !== "undefined" && process.env.CMS_SKIP_GITHUB_HYDRATE === "1") return false;
  return !shouldSkipLifecycle();
}

export async function hydratePendingGithub(
  sql: Sql,
  options: { fetchImpl?: typeof fetch; force?: boolean } = {},
): Promise<HydrateGithubResult> {
  if (!options.force) {
    const meta = await sql.query<{ value: string; updated_at: string | Date | null }>(
      `select value, updated_at from cms_meta where key = $1 limit 1`,
      [GITHUB_HYDRATE_KEY],
    );
    const value = meta[0]?.value;
    if (value === GITHUB_HYDRATE_VERSION) {
      const leftover = await incompleteGithubRows(sql);
      if (leftover.length === 0) {
        return { attempted: 0, verified: 0, failed: 0, skipped: true, rateLimited: false };
      }
    } else if (value === "retry" && meta[0]?.updated_at) {
      const at = new Date(meta[0].updated_at).getTime();
      if (Number.isFinite(at) && Date.now() - at < 10 * 60 * 1000) {
        return { attempted: 0, verified: 0, failed: 0, skipped: true, rateLimited: true };
      }
    }
  }

  await sql.query(
    `insert into cms_meta (key, value) values ($1, 'pending')
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [GITHUB_HYDRATE_KEY],
  );

  const rows = await sql.query<{ id: string; github_url: string }>(
    options.force
      ? `select id, github_url from projects
         where github_sync_enabled = true
           and github_url is not null
           and github_url <> ''
           and github_sync_status in ('pending', 'stale', 'failed')
         order by sort_order asc, title asc`
      : `select id, github_url from projects
         where ${INCOMPLETE_GITHUB_SQL}
         order by sort_order asc, title asc`,
  );
  if (rows.length > 0) {
    console.info(`[cms] hydrating ${rows.length} GitHub repos`);
  }

  const clientOptions = githubClientOptions(sql, options.fetchImpl);
  let verified = 0;
  let failed = 0;
  let rateLimited = false;

  for (const row of rows) {
    try {
      const result = await fetchPublicRepo(row.github_url, clientOptions);
      await applyGithubSync(sql, row.id, result, "hydrate");
      if (result.ok) verified += 1;
      else {
        failed += 1;
        if (result.errorCode === "rate_limited") rateLimited = true;
      }
    } catch {
      failed += 1;
      await sql.query(
        `update projects set github_sync_status = 'failed', github_last_synced_at = now(),
          github_metadata = coalesce(github_metadata, '{}'::jsonb) || '{"syncError":"hydrate failed","errorCode":"network"}'::jsonb
         where id = $1`,
        [row.id],
      );
    }
  }

  const leftoverAfter = await incompleteGithubRows(sql);
  const doneValue =
    leftoverAfter.length > 0
      ? rateLimited
        ? "retry"
        : "pending"
      : GITHUB_HYDRATE_VERSION;
  await sql.query(
    `insert into cms_meta (key, value) values ($1, $2)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [GITHUB_HYDRATE_KEY, doneValue],
  );

  return { attempted: rows.length, verified, failed, skipped: false, rateLimited };
}

export async function hydratePendingDemos(
  sql: Sql,
  options: { fetchImpl?: typeof fetch } = {},
): Promise<HydrateDemoResult> {
  if (!shouldHydrateGithub()) {
    return { attempted: 0, probed: 0, skipped: true };
  }

  const rows = await sql.query<{ id: string; live_demo_url: string }>(
    `select id, live_demo_url from projects
     where live_demo_url is not null
       and live_demo_url <> ''
       and (
         live_demo_last_verified_at is null
         or live_demo_status in ('pending', 'not_configured')
       )
     order by sort_order asc, title asc`,
  );
  if (rows.length === 0) return { attempted: 0, probed: 0, skipped: true };

  let probed = 0;
  for (const row of rows) {
    const result = await verifyDemoUrl(row.live_demo_url, { fetchImpl: options.fetchImpl });
    await sql.query(
      `update projects set live_demo_status = $2, live_demo_embed_enabled = $3,
        live_demo_error = $4, live_demo_last_verified_at = now(), updated_at = now()
       where id = $1`,
      [row.id, result.status, result.embedEnabled, result.error ?? null],
    );
    probed += 1;
  }
  return { attempted: rows.length, probed, skipped: false };
}
