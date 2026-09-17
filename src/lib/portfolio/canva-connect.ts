import { randomBytes, timingSafeEqual } from "node:crypto";
import { decryptSecret, encryptSecret, tokenKeyFromEnv } from "./crypto.ts";
import { hasCanvaCredentials } from "./canva.ts";
import type { Sql } from "./sql.ts";

const CANVA_AUTHORIZE = "https://www.canva.com/api/oauth/authorize";
const CANVA_TOKEN = "https://api.canva.com/rest/v1/oauth/token";
const CANVA_DESIGNS = "https://api.canva.com/rest/v1/designs";
const SCOPES = [
  "design:content:read",
  "design:meta:read",
  "folder:read",
].join(" ");

export type CanvaTokenBundle = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
};

export function canvaAuthorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL(CANVA_AUTHORIZE);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", input.state);
  return url.toString();
}

export async function exchangeCanvaCode(input: {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}): Promise<CanvaTokenBundle> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    client_id: input.clientId,
    client_secret: input.clientSecret,
  });
  const response = await fetch(CANVA_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    signal: AbortSignal.timeout(8000),
    body,
  });
  if (!response.ok) {
    throw new Error(`canva_token_${response.status}`);
  }
  const json = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!json.access_token) throw new Error("canva_token_missing");
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: json.expires_in
      ? Date.now() + json.expires_in * 1000
      : undefined,
  };
}

export async function createCanvaOAuthState(sql: Sql, userId: string): Promise<string> {
  const state = randomBytes(24).toString("hex");
  await sql.query(
    `insert into integration_secrets (id, kind, ciphertext, updated_by, updated_at)
     values ($1, 'canva_state', $2, $3, now())
     on conflict (id) do update set ciphertext=excluded.ciphertext, updated_by=excluded.updated_by, updated_at=now()`,
    [`canva-state-${userId}`, state, userId],
  );
  return state;
}

export async function consumeCanvaOAuthState(sql: Sql, userId: string, state: string | null): Promise<boolean> {
  if (!state) return false;
  const rows = await sql.query<{ ciphertext: string }>(
    `select ciphertext from integration_secrets where id = $1 and kind = 'canva_state'`,
    [`canva-state-${userId}`],
  );
  const expected = rows[0]?.ciphertext;
  await sql.query(`delete from integration_secrets where id = $1`, [`canva-state-${userId}`]);
  if (!expected || expected.length !== state.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(state));
}

export async function storeCanvaTokens(
  sql: Sql,
  bundle: CanvaTokenBundle,
  actorId: string,
): Promise<void> {
  const secret = tokenKeyFromEnv();
  if (!secret) throw new Error("token_key_missing");
  const ciphertext = encryptSecret(JSON.stringify(bundle), secret);
  await sql.query(
    `insert into integration_secrets (id, kind, ciphertext, updated_by, updated_at)
     values ('canva-default', 'canva', $1, $2, now())
     on conflict (id) do update set ciphertext=excluded.ciphertext, updated_by=excluded.updated_by, updated_at=now()`,
    [ciphertext, actorId],
  );
  await sql.query(
    `insert into canva_connect_status (id, status, last_synced_at, last_error)
     values ('default', 'connected', now(), null)
     on conflict (id) do update set status='connected', last_error=null, last_synced_at=now()`,
  );
}

export async function loadCanvaTokens(sql: Sql): Promise<CanvaTokenBundle | null> {
  const secret = tokenKeyFromEnv();
  if (!secret) return null;
  const rows = await sql.query<{ ciphertext: string }>(
    `select ciphertext from integration_secrets where kind = $1 limit 1`,
    ["canva"],
  );
  if (!rows[0]?.ciphertext) return null;
  try {
    return JSON.parse(decryptSecret(rows[0].ciphertext, secret)) as CanvaTokenBundle;
  } catch {
    return null;
  }
}

export async function searchCanvaDesignsApi(
  accessToken: string,
  query?: string,
): Promise<{
  ok: boolean;
  status: number;
  designs: Array<{
    id: string;
    title?: string;
    thumbnail?: { url?: string };
    urls?: { edit_url?: string; view_url?: string };
  }>;
  error?: string;
}> {
  const url = new URL(CANVA_DESIGNS);
  if (query) url.searchParams.set("query", query);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    return { ok: false, status: response.status, designs: [], error: "search_failed" };
  }
  const json = (await response.json()) as {
    items?: Array<{
      id: string;
      title?: string;
      thumbnail?: { url?: string };
      urls?: { edit_url?: string; view_url?: string };
    }>;
  };
  return { ok: true, status: response.status, designs: json.items ?? [] };
}

export async function exportCanvaDesignApi(
  accessToken: string,
  designId: string,
  format: "png" | "pdf",
): Promise<{ ok: boolean; jobId?: string; error?: string; status: number }> {
  const response = await fetch("https://api.canva.com/rest/v1/exports", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      design_id: designId,
      format: { type: format },
    }),
  });
  if (!response.ok) {
    return { ok: false, status: response.status, error: "export_failed" };
  }
  const json = (await response.json()) as { job?: { id?: string } };
  return { ok: true, status: response.status, jobId: json.job?.id };
}

export function connectAvailability() {
  if (!hasCanvaCredentials()) {
    return {
      mode: "public_embed" as const,
      status: "not_configured" as const,
      labelZh: "公開嵌入模式",
    };
  }
  if (!tokenKeyFromEnv()) {
    return {
      mode: "connect_api" as const,
      status: "failed" as const,
      error: "token_key_missing",
      labelZh: "Connect API 金鑰在伺服器，但缺少加密金鑰，無法存 token。",
    };
  }
  return { mode: "connect_api" as const, status: "pending" as const };
}
