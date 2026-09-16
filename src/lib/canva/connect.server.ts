import type { Sql } from "../db.ts";
import {
  CANVA_API,
  CanvaConfigError,
  canvaAccessToken,
  loadCanvaConnectionStatus,
} from "./oauth.server.ts";
import { canvaStableEditUrl, isAllowedCanvaMediaUrl, isAllowedCanvaUrl, parseCanvaDesign } from "./parse.ts";

const DESIGN_ID_RE = /^[A-Za-z0-9_-]{6,}$/;

export type CanvaDesignCard = {
  id: string;
  title: string;
  pageCount: number | null;
  updatedAt: string | null;
  thumbnailUrl: string | null;
  editUrl: string | null;
  viewUrl: string | null;
  temporaryUrls: boolean;
};

function allowlisted(url: string | null | undefined, media = false): string | null {
  if (!url) return null;
  return (media ? isAllowedCanvaMediaUrl(url) : isAllowedCanvaUrl(url)) ? url : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function sanitizeCanvaDesign(raw: unknown): CanvaDesignCard | null {
  const design = asRecord(asRecord(raw).design ?? raw);
  const id = typeof design.id === "string" ? design.id : "";
  if (!DESIGN_ID_RE.test(id)) return null;
  const urls = asRecord(design.urls);
  const thumb = asRecord(design.thumbnail);
  const pageCount = typeof design.page_count === "number" ? design.page_count : null;
  const updated =
    typeof design.updated_at === "number"
      ? new Date(design.updated_at * 1000).toISOString()
      : typeof design.updated_at === "string"
        ? design.updated_at
        : null;
  return {
    id,
    title: typeof design.title === "string" ? design.title : id,
    pageCount,
    updatedAt: updated,
    thumbnailUrl: allowlisted(typeof thumb.url === "string" ? thumb.url : null, true),
    editUrl: allowlisted(typeof urls.edit_url === "string" ? urls.edit_url : null) ?? canvaStableEditUrl(id),
    viewUrl: allowlisted(typeof urls.view_url === "string" ? urls.view_url : null),
    temporaryUrls: Boolean(urls.edit_url || urls.view_url),
  };
}

async function canvaJson(
  sql: Sql,
  path: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; json: unknown }> {
  if (
    !/^\/(designs(?:\/[A-Za-z0-9_-]+)?(?:\?query=[^#]*)?|exports(?:\/[A-Za-z0-9_-]+)?)$/.test(
      path,
    )
  ) {
    throw new CanvaConfigError("不允許此 Canva 操作。", "canva_path_rejected");
  }
  const access = await canvaAccessToken(sql);
  let response: Response;
  try {
    response = await fetch(CANVA_API + path, {
      ...init,
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
        Authorization: `Bearer ${access}`,
      },
    });
  } catch {
    throw new CanvaConfigError("Canva 請求中斷。", "canva_network");
  }
  const json = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, json };
}

export async function searchCanvaDesigns(
  sql: Sql,
  query = "",
): Promise<{ items: CanvaDesignCard[]; continuation?: string }> {
  const status = await loadCanvaConnectionStatus(sql);
  if (!status.connected) {
    throw new CanvaConfigError(status.message, "canva_authorization_required");
  }
  const path = query.trim()
    ? `/designs?query=${encodeURIComponent(query.trim().slice(0, 150))}`
    : "/designs";
  const result = await canvaJson(sql, path);
  if (!result.ok) {
    throw new CanvaConfigError("無法讀取 Canva 設計清單。請重新授權後再試。", "canva_search_failed");
  }
  const body = asRecord(result.json);
  const items = Array.isArray(body.items) ? body.items : [];
  return {
    items: items.map(sanitizeCanvaDesign).filter((item): item is CanvaDesignCard => Boolean(item)),
    continuation: typeof body.continuation === "string" ? body.continuation : undefined,
  };
}

export async function getCanvaDesign(sql: Sql, designId: string): Promise<CanvaDesignCard> {
  if (!DESIGN_ID_RE.test(designId)) {
    throw new CanvaConfigError("設計識別無效。", "invalid_design");
  }
  const status = await loadCanvaConnectionStatus(sql);
  if (!status.connected) {
    throw new CanvaConfigError(status.message, "canva_authorization_required");
  }
  const result = await canvaJson(sql, `/designs/${designId}`);
  if (!result.ok) {
    throw new CanvaConfigError("讀取設計失敗。可能無權限或設計不存在。", "canva_design_failed");
  }
  const card = sanitizeCanvaDesign(result.json);
  if (!card) throw new CanvaConfigError("Canva 回傳的設計無法使用。", "canva_design_invalid");
  return card;
}

export type CanvaExportResult = {
  exportId: string;
  status: "in_progress" | "success" | "failed";
  urls: string[];
  error?: string;
};

function parseExportJob(json: unknown): CanvaExportResult {
  const job = asRecord(asRecord(json).job ?? json);
  const urls = Array.isArray(job.urls)
    ? job.urls.filter((item): item is string => typeof item === "string").map((item) => allowlisted(item, true)).filter((item): item is string => Boolean(item))
    : [];
  const status =
    job.status === "success" || job.status === "failed" || job.status === "in_progress"
      ? job.status
      : "failed";
  return {
    exportId: typeof job.id === "string" ? job.id : "",
    status,
    urls,
    error: status === "failed" ? "Canva 匯出失敗。" : undefined,
  };
}

export async function exportCanvaDesign(
  sql: Sql,
  input: { designId: string; format: "png" | "pdf" },
): Promise<CanvaExportResult> {
  if (!DESIGN_ID_RE.test(input.designId)) {
    throw new CanvaConfigError("設計識別無效。", "invalid_design");
  }
  const status = await loadCanvaConnectionStatus(sql);
  if (!status.connected) {
    throw new CanvaConfigError(status.message, "canva_authorization_required");
  }
  const created = await canvaJson(sql, "/exports", {
    method: "POST",
    body: JSON.stringify({
      design_id: input.designId,
      format: { type: input.format, export_quality: "regular" },
    }),
  });
  if (!created.ok) {
    throw new CanvaConfigError("無法建立 Canva 匯出工作。", "canva_export_failed");
  }
  let job = parseExportJob(created.json);
  for (let i = 0; i < 8 && job.status === "in_progress" && job.exportId; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const polled = await canvaJson(sql, `/exports/${job.exportId}`);
    if (!polled.ok) break;
    job = parseExportJob(polled.json);
  }
  return job;
}

export type ApplyCanvaResult = {
  design: CanvaDesignCard;
  publicEmbedReady: boolean;
  message: string;
};

export async function applyCanvaDesignToProject(
  sql: Sql,
  input: { projectId: string; designId: string; publicShareUrl?: string; actor: string },
): Promise<ApplyCanvaResult> {
  const design = await getCanvaDesign(sql, input.designId);
  const parsedShare = parseCanvaDesign(input.publicShareUrl);
  const pageIds =
    design.pageCount && design.pageCount > 0
      ? Array.from({ length: Math.min(design.pageCount, 40) }, (_, index) => String(index + 1))
      : null;
  const publicEmbedReady = Boolean(parsedShare);
  const error = publicEmbedReady
    ? null
    : "已從 Canva Connect 寫入 design id。公開嵌入仍需 canva.com/design 分享網址；Connect 的 view/edit URL 是暫時的、只對授權使用者有效，不會當成訪客 iframe。";
  await sql.query(
    `update projects set
       canva_design_id = $2,
       canva_share_url = coalesce($3, canva_share_url),
       canva_embed_url = coalesce($4, canva_embed_url),
       canva_page_ids = coalesce($5::jsonb, canva_page_ids),
       canva_alt = coalesce(nullif(canva_alt, ''), $6),
       canva_caption = $7,
       canva_status = $8,
       canva_error = $9,
       canva_last_synced_at = now(),
       updated_by = $10,
       updated_at = now()
     where id = $1`,
    [
      input.projectId,
      design.id,
      parsedShare?.shareUrl ?? null,
      parsedShare?.embedUrl ?? null,
      pageIds ? JSON.stringify(pageIds) : null,
      design.title,
      `Canva Connect 同步「${design.title}」${design.pageCount ? ` · ${design.pageCount} 頁` : ""}。`,
      publicEmbedReady ? "pending" : "pending",
      error,
      input.actor,
    ],
  );
  return {
    design,
    publicEmbedReady,
    message: error ?? "已寫入 Canva 來源。請再測一次公開嵌入。",
  };
}
