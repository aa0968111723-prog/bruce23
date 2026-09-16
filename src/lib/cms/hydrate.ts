import type { Sql } from "../db.ts";
import { fetchPublicRepo } from "../github/client.server.ts";
import { githubClientOptions } from "../github/sql-cache.ts";
import { applyGithubSync } from "./store.ts";
import { verifyDemoUrl } from "../demo/verify.ts";
import { resolveCanvaShareUrl } from "../canva/resolve.ts";
import { CANVA_SHORTLINK_CANDIDATES, collectCanvaShortUrlsFromText } from "../canva/inventory.ts";
import { parseCanvaDesign } from "../canva/parse.ts";

export const GITHUB_HYDRATE_KEY = "github_hydrate";
export const GITHUB_HYDRATE_VERSION = "4";
export const CANVA_SHORTLINK_HYDRATE_KEY = "canva_shortlink_hydrate";
export const CANVA_SHORTLINK_HYDRATE_VERSION = "3";

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
    or (
      github_sync_status = 'verified'
      and github_file_tree is null
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

let githubHydrateInflight: Promise<HydrateGithubResult> | null = null;

export async function hydratePendingGithub(
  sql: Sql,
  options: { fetchImpl?: typeof fetch; force?: boolean } = {},
): Promise<HydrateGithubResult> {
  if (!options.force && githubHydrateInflight) return githubHydrateInflight;
  const run = hydratePendingGithubOnce(sql, options);
  if (!options.force) {
    githubHydrateInflight = run.finally(() => {
      githubHydrateInflight = null;
    });
    return githubHydrateInflight;
  }
  return run;
}

async function hydratePendingGithubOnce(
  sql: Sql,
  options: { fetchImpl?: typeof fetch; force?: boolean } = {},
): Promise<HydrateGithubResult> {
  let storedVersion: string | undefined;
  if (!options.force) {
    const meta = await sql.query<{ value: string; updated_at: string | Date | null }>(
      `select value, updated_at from cms_meta where key = $1 limit 1`,
      [GITHUB_HYDRATE_KEY],
    );
    storedVersion = meta[0]?.value;
    if (storedVersion === GITHUB_HYDRATE_VERSION) {
      const leftover = await incompleteGithubRows(sql);
      if (leftover.length === 0) {
        return { attempted: 0, verified: 0, failed: 0, skipped: true, rateLimited: false };
      }
    } else if (storedVersion === "retry" && meta[0]?.updated_at) {
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

  const rescanTrees =
    options.force ||
    (storedVersion !== undefined && storedVersion !== GITHUB_HYDRATE_VERSION);

  const rows = await sql.query<{ id: string; github_url: string }>(
    rescanTrees
      ? `select id, github_url from projects
         where github_sync_enabled = true
           and github_url is not null
           and github_url <> ''
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
  if (!options.fetchImpl && !shouldHydrateGithub()) {
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

export type HydrateCanvaResult = {
  attempted: number;
  resolved: number;
  unavailable: number;
  skipped: boolean;
};

let canvaHydrateInflight: Promise<HydrateCanvaResult> | null = null;

export async function hydratePendingCanvaShortLinks(
  sql: Sql,
  options: { fetchImpl?: typeof fetch; force?: boolean; navigateImpl?: (url: string) => Promise<{ url: string; title?: string | null }> } = {},
): Promise<HydrateCanvaResult> {
  if (!options.force && canvaHydrateInflight) return canvaHydrateInflight;
  const run = hydratePendingCanvaShortLinksOnce(sql, options);
  if (!options.force) {
    canvaHydrateInflight = run.finally(() => {
      canvaHydrateInflight = null;
    });
    return canvaHydrateInflight;
  }
  return run;
}

async function hydratePendingCanvaShortLinksOnce(
  sql: Sql,
  options: { fetchImpl?: typeof fetch; force?: boolean; navigateImpl?: (url: string) => Promise<{ url: string; title?: string | null }> } = {},
): Promise<HydrateCanvaResult> {
  if (!options.force && !shouldHydrateGithub()) {
    return { attempted: 0, resolved: 0, unavailable: 0, skipped: true };
  }
  if (!options.force) {
    const meta = await sql.query<{ value: string }>(
      `select value from cms_meta where key = $1 limit 1`,
      [CANVA_SHORTLINK_HYDRATE_KEY],
    );
    if (meta[0]?.value === CANVA_SHORTLINK_HYDRATE_VERSION) {
      return { attempted: 0, resolved: 0, unavailable: 0, skipped: true };
    }
  }

  const rows = await sql.query<{
    id: string;
    slug: string;
    canva_share_url: string | null;
    canva_embed_url: string | null;
    source_evidence: unknown;
  }>(
    `select id, slug, canva_share_url, canva_embed_url, source_evidence from projects`,
  );

  let attempted = 0;
  let resolved = 0;
  let unavailable = 0;

  for (const row of rows) {
    if (parseCanvaDesign(row.canva_embed_url || row.canva_share_url)) continue;
    const evidenceText =
      typeof row.source_evidence === "string"
        ? row.source_evidence
        : JSON.stringify(row.source_evidence ?? []);
    const urls = [
      ...(CANVA_SHORTLINK_CANDIDATES[row.slug] ?? []),
      ...collectCanvaShortUrlsFromText(evidenceText),
      ...(row.canva_share_url ? [row.canva_share_url] : []),
    ];
    const unique = [...new Set(urls.filter((item) => item.includes("/d/")))];
    if (unique.length === 0) continue;

    let landed = false;
    let lastError =
      "Canva 短網址沒有公開轉到 /design/{id}（登入牆、403、Cloudflare 或失效連結）。不會嵌入空白 iframe，也不會標成已驗證。";
    for (const url of unique) {
      attempted += 1;
      const result = await resolveCanvaShareUrl(url, {
        fetchImpl: options.fetchImpl,
        navigateImpl: options.navigateImpl,
      });
      if (result.status === "pending" && result.parsed) {
        await sql.query(
          `update projects set
            canva_share_url = $2, canva_embed_url = $3, canva_design_id = $4,
            canva_status = 'pending', canva_error = $5, canva_last_synced_at = now(),
            updated_at = now()
           where id = $1`,
          [row.id, result.shareUrl, result.embedUrl, result.designId, result.error],
        );
        resolved += 1;
        landed = true;
        break;
      }
      lastError = result.error;
      if (result.status === "unavailable") unavailable += 1;
    }
    if (!landed && unique.length > 0) {
      await sql.query(
        `update projects set
          canva_share_url = coalesce(nullif(canva_share_url, ''), $3),
          canva_status = 'unavailable',
          canva_embed_url = null,
          canva_design_id = null,
          canva_error = $2,
          canva_last_synced_at = now(),
          updated_at = now()
         where id = $1 and (canva_embed_url is null or canva_embed_url = '')`,
        [row.id, lastError, unique[0]],
      );
    }
  }

  await sql.query(
    `insert into cms_meta (key, value) values ($1, $2)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [CANVA_SHORTLINK_HYDRATE_KEY, CANVA_SHORTLINK_HYDRATE_VERSION],
  );
  return { attempted, resolved, unavailable, skipped: false };
}
