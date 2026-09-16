import type { Sql } from "../db.ts";
import { evaluateCanvaEmbedTest } from "../canva/embed.ts";
import { requireAdminActor } from "./guard.server.ts";

export type AuthedAdmin = { userId: string; bearerToken?: string };

/**
 * The gate every admin server function uses: same-site + origin + Better Auth
 * session + allowlist. Kept in a relative-import module so Node tests can call
 * the production function without Vite `@/` aliases.
 */
export async function runAdminSql(context: AuthedAdmin) {
  const actor = await requireAdminActor(context.userId, context.bearerToken);
  const { getSql } = await import("../db.ts");
  const { ensureSeed } = await import("./seed.ts");
  const sql = await getSql();
  await ensureSeed(sql);
  return { sql, actor };
}

export async function persistCanvaEmbedTest(
  sql: Sql,
  actorUserId: string,
  data: { id?: string; url?: string },
) {
  let raw = data.url ?? "";
  if (data.id && !raw) {
    const { getAdminProject } = await import("./store.ts");
    const project = await getAdminProject(sql, data.id);
    raw = project.canva_embed_url || project.canva_share_url || "";
  }
  const payload = evaluateCanvaEmbedTest(raw);
  if (!data.id) return payload;
  if (payload.status === "failed" && !("parsed" in payload)) {
    await sql.query(
      `update projects set canva_status = 'failed', canva_error = $2, updated_by = $3, updated_at = now() where id = $1`,
      [data.id, payload.error, actorUserId],
    );
    return payload;
  }
  const parsedOk = "parsed" in payload && payload.parsed === true;
  await sql.query(
    `update projects set canva_share_url = coalesce($2, canva_share_url),
      canva_embed_url = coalesce($3, canva_embed_url), canva_design_id = coalesce($4, canva_design_id),
      canva_status = $5, canva_error = $6, canva_last_synced_at = now(),
      updated_by = $7, updated_at = now() where id = $1`,
    [
      data.id,
      parsedOk ? payload.shareUrl : null,
      parsedOk ? payload.embedUrl : null,
      parsedOk ? payload.designId : null,
      payload.status,
      payload.error,
      actorUserId,
    ],
  );
  return payload;
}
