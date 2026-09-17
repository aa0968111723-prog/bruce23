import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { Sql } from "../db.ts";

export type CanvaOAuthMode = "oauth" | "public-embed";

export const CANVA_AUTHORIZE_URL = "https://www.canva.com/api/oauth/authorize";
export const CANVA_API = "https://api.canva.com/rest/v1";
export const CANVA_OAUTH_SCOPES = "design:meta:read design:content:read";
export const CANVA_TOKEN_ROW_ID = "canva-oauth";
const PENDING_PREFIX = "canva-pending:";
const TOKEN_ROW_PROVIDER = "canva";

export class CanvaConfigError extends Error {
  readonly status = 503;
  readonly code: string;
  constructor(message: string, code = "canva_unconfigured") {
    super(message);
    this.name = "CanvaConfigError";
    this.code = code;
  }
}

export function canvaClientId(): string | undefined {
  return process.env.CANVA_CLIENT_ID?.trim() || undefined;
}

export function canvaClientSecret(): string | undefined {
  return process.env.CANVA_CLIENT_SECRET?.trim() || undefined;
}

export function canvaTokenKeyPresent(): boolean {
  return Boolean(process.env.CANVA_TOKEN_KEY?.trim() || process.env.PORTFOLIO_TOKEN_KEY?.trim());
}

export function canvaCredentialsPresent(): boolean {
  return Boolean(canvaClientId() && canvaClientSecret());
}

export function canvaConnectMode(): CanvaOAuthMode {
  return canvaCredentialsPresent() ? "oauth" : "public-embed";
}

export function canvaRedirectUri(origin?: string | null): string {
  const explicit = process.env.CANVA_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  const base = origin?.replace(/\/$/, "") ?? "";
  if (!base) {
    throw new CanvaConfigError(
      "尚未設定 CANVA_REDIRECT_URI，也無法從請求推導回呼網址。OAuth 已關閉。",
      "canva_redirect_missing",
    );
  }
  return `${base}/api/canva/oauth/callback`;
}

function tokenKeyMaterial(): string | undefined {
  return process.env.CANVA_TOKEN_KEY?.trim() || process.env.PORTFOLIO_TOKEN_KEY?.trim() || undefined;
}

function tokenKey(): Buffer {
  const secret = tokenKeyMaterial();
  if (!secret) {
    throw new CanvaConfigError(
      "CANVA_TOKEN_KEY 尚未設定。拒絕加密或儲存 Canva token。",
      "canva_token_key_missing",
    );
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string): { ciphertext: string; iv: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: Buffer.concat([enc, tag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptSecret(ciphertext: string, iv: string): string {
  const buf = Buffer.from(ciphertext, "base64");
  const ivBuf = Buffer.from(iv, "base64");
  const tag = buf.subarray(buf.length - 16);
  const data = buf.subarray(0, buf.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", tokenKey(), ivBuf);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export type CanvaConnectionStatus = {
  mode: CanvaOAuthMode;
  connected: boolean;
  lastSyncAt?: string;
  status: "connected" | "not_configured" | "pending" | "failed";
  message: string;
  credentialsConfigured: boolean;
  tokenKeyConfigured: boolean;
  canSearch: boolean;
  canExport: boolean;
  canDisconnect: boolean;
};

export function disconnectedCanvaStatus(): CanvaConnectionStatus {
  if (!canvaCredentialsPresent()) {
    return {
      mode: "public-embed",
      connected: false,
      status: "not_configured",
      credentialsConfigured: false,
      tokenKeyConfigured: canvaTokenKeyPresent(),
      canSearch: false,
      canExport: false,
      canDisconnect: false,
      message:
        "公開嵌入模式。尚未設定 Canva Connect 憑證，不會假裝已 OAuth 連線，也不能在站內編輯 Canva。後台仍可貼上公開分享網址。",
    };
  }
  if (!canvaTokenKeyPresent()) {
    return {
      mode: "oauth",
      connected: false,
      status: "failed",
      credentialsConfigured: true,
      tokenKeyConfigured: false,
      canSearch: false,
      canExport: false,
      canDisconnect: false,
      message: "CANVA_TOKEN_KEY 尚未設定。拒絕開始授權與儲存 token。",
    };
  }
  return {
    mode: "oauth",
    connected: false,
    status: "pending",
    credentialsConfigured: true,
    tokenKeyConfigured: true,
    canSearch: false,
    canExport: false,
    canDisconnect: false,
    message: "Canva API 憑證已在伺服器，但這個後台還沒完成授權。",
  };
}

type StoredTokenPayload = {
  access_token: string;
  refresh_token: string;
  expiresAt: number;
  scope: string;
};

type SecretRow = {
  id: string;
  ciphertext: string;
  iv: string;
  last_status: string | null;
  last_sync_at: Date | string | null;
  meta_json: unknown;
};

function pendingId(state: string): string {
  return PENDING_PREFIX + createHash("sha256").update(state).digest("hex");
}

function basicAuthHeader(): string {
  const id = canvaClientId();
  const secret = canvaClientSecret();
  if (!id || !secret) {
    throw new CanvaConfigError("尚未設定 Canva Connect 憑證。", "canva_unconfigured");
  }
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export function pkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function buildCanvaAuthorizeUrl(input: {
  origin?: string | null;
  state: string;
  challenge: string;
}): string {
  const url = new URL(CANVA_AUTHORIZE_URL);
  url.search = new URLSearchParams({
    client_id: canvaClientId() ?? "",
    response_type: "code",
    redirect_uri: canvaRedirectUri(input.origin),
    scope: CANVA_OAUTH_SCOPES,
    code_challenge: input.challenge,
    code_challenge_method: "S256",
    state: input.state,
  }).toString();
  return url.toString();
}

export type CanvaStartResult =
  | { ok: true; authorizeUrl: string; status: CanvaConnectionStatus }
  | { ok: false; authorizeUrl?: undefined; status: CanvaConnectionStatus };

export async function startCanvaOAuth(
  sql: Sql,
  userId: string,
  origin?: string | null,
): Promise<CanvaStartResult> {
  const status = disconnectedCanvaStatus();
  if (!canvaCredentialsPresent() || status.status === "not_configured") {
    return { ok: false, status };
  }
  if (!canvaTokenKeyPresent()) {
    return { ok: false, status };
  }
  const state = randomBytes(32).toString("base64url");
  const { verifier, challenge } = pkcePair();
  let authorizeUrl: string;
  try {
    authorizeUrl = buildCanvaAuthorizeUrl({ origin, state, challenge });
  } catch (err) {
    if (err instanceof CanvaConfigError) {
      return {
        ok: false,
        status: { ...status, status: "failed", message: err.message },
      };
    }
    throw err;
  }
  const sealed = encryptSecret(JSON.stringify({ verifier, userId, createdAt: Date.now() }));
  await sql.query(
    `insert into integration_secrets (id, provider, ciphertext, iv, last_status, meta_json, updated_by, updated_at)
     values ($1, $2, $3, $4, 'pending', $5::jsonb, $6, now())
     on conflict (id) do update set
       ciphertext = excluded.ciphertext, iv = excluded.iv, last_status = 'pending',
       meta_json = excluded.meta_json, updated_by = excluded.updated_by, updated_at = now()`,
    [
      pendingId(state),
      TOKEN_ROW_PROVIDER,
      sealed.ciphertext,
      sealed.iv,
      JSON.stringify({ expiresAt: Date.now() + 600_000 }),
      userId,
    ],
  );
  return {
    ok: true,
    authorizeUrl,
    status: {
      ...status,
      status: "pending",
      message: "即將導向 Canva 授權。完成前不會標記為已連線。",
    },
  };
}

async function readSecretRow(sql: Sql, id: string): Promise<SecretRow | null> {
  const rows = await sql.query<SecretRow>(
    `select id, ciphertext, iv, last_status, last_sync_at, meta_json from integration_secrets where id = $1 limit 1`,
    [id],
  );
  return rows[0] ?? null;
}

function parseStoredTokens(row: SecretRow): StoredTokenPayload {
  const parsed = JSON.parse(decryptSecret(row.ciphertext, row.iv)) as StoredTokenPayload;
  if (!parsed?.access_token || !parsed?.refresh_token || !parsed?.expiresAt) {
    throw new CanvaConfigError("儲存的 Canva token 無法讀取。", "canva_token_corrupt");
  }
  return parsed;
}

async function writeTokens(
  sql: Sql,
  tokens: StoredTokenPayload,
  userId: string,
  lastStatus: string,
): Promise<void> {
  const sealed = encryptSecret(JSON.stringify(tokens));
  await sql.query(
    `insert into integration_secrets (id, provider, ciphertext, iv, last_status, last_sync_at, meta_json, updated_by, updated_at)
     values ($1, $2, $3, $4, $5, now(), $6::jsonb, $7, now())
     on conflict (id) do update set
       ciphertext = excluded.ciphertext, iv = excluded.iv, last_status = excluded.last_status,
       last_sync_at = now(), meta_json = excluded.meta_json, updated_by = excluded.updated_by, updated_at = now()`,
    [
      CANVA_TOKEN_ROW_ID,
      TOKEN_ROW_PROVIDER,
      sealed.ciphertext,
      sealed.iv,
      lastStatus,
      JSON.stringify({ scope: tokens.scope, expiresAt: tokens.expiresAt }),
      userId,
    ],
  );
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
};

async function exchangeToken(body: Record<string, string>): Promise<StoredTokenPayload> {
  let response: Response;
  try {
    response = await fetch(`${CANVA_API}/oauth/token`, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
      headers: {
        Authorization: basicAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(body),
    });
  } catch {
    throw new CanvaConfigError("Canva 授權交換中斷，請重新授權。", "canva_oauth_network");
  }
  const json = (await response.json().catch(() => ({}))) as TokenResponse;
  if (!response.ok || !json.access_token || !json.refresh_token || typeof json.expires_in !== "number") {
    throw new CanvaConfigError(
      "Canva 未接受授權交換。請核對 Client、Redirect URI 與權限範圍。",
      "canva_oauth_failed",
    );
  }
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
    scope: json.scope || CANVA_OAUTH_SCOPES,
  };
}

export async function completeCanvaOAuth(
  sql: Sql,
  input: { code: string; state: string; origin?: string | null },
): Promise<CanvaConnectionStatus> {
  if (!canvaCredentialsPresent()) {
    throw new CanvaConfigError(
      "公開嵌入模式。尚未設定 Canva Connect 憑證，回呼已關閉。",
      "canva_unconfigured",
    );
  }
  if (!canvaTokenKeyPresent()) {
    throw new CanvaConfigError("CANVA_TOKEN_KEY 尚未設定。拒絕儲存 Canva token。", "canva_token_key_missing");
  }
  const row = await readSecretRow(sql, pendingId(input.state));
  if (!row) {
    throw new CanvaConfigError("授權狀態無效或已過期，請重新開始。", "invalid_oauth_state");
  }
  const meta = typeof row.meta_json === "string" ? JSON.parse(row.meta_json) : row.meta_json;
  const expiresAt = Number((meta as { expiresAt?: number } | null)?.expiresAt ?? 0);
  if (expiresAt && expiresAt < Date.now()) {
    await sql.query(`delete from integration_secrets where id = $1`, [row.id]);
    throw new CanvaConfigError("授權狀態已過期，請重新開始。", "invalid_oauth_state");
  }
  let pending: { verifier: string; userId: string };
  try {
    pending = JSON.parse(decryptSecret(row.ciphertext, row.iv)) as { verifier: string; userId: string };
  } catch {
    throw new CanvaConfigError("授權狀態無法解密。", "invalid_oauth_state");
  }
  if (!pending.verifier) {
    throw new CanvaConfigError("授權狀態無效，請重新開始。", "invalid_oauth_state");
  }
  const tokens = await exchangeToken({
    grant_type: "authorization_code",
    code: input.code,
    code_verifier: pending.verifier,
    redirect_uri: canvaRedirectUri(input.origin),
  });
  await writeTokens(sql, tokens, pending.userId, "connected");
  await sql.query(`delete from integration_secrets where id = $1`, [row.id]);
  return loadCanvaConnectionStatus(sql);
}

const refreshes = (globalThis as typeof globalThis & {
  luminousCanvaRefreshes?: Map<string, Promise<StoredTokenPayload>>;
}).luminousCanvaRefreshes ??= new Map();

export async function canvaAccessToken(sql: Sql): Promise<string> {
  if (!canvaCredentialsPresent()) {
    throw new CanvaConfigError("尚未設定 Canva Connect 憑證。", "canva_unconfigured");
  }
  if (!canvaTokenKeyPresent()) {
    throw new CanvaConfigError("CANVA_TOKEN_KEY 尚未設定。拒絕讀取 token。", "canva_token_key_missing");
  }
  const row = await readSecretRow(sql, CANVA_TOKEN_ROW_ID);
  if (!row) {
    throw new CanvaConfigError("請先從整合頁完成 Canva 使用者授權。", "canva_authorization_required");
  }
  const tokens = parseStoredTokens(row);
  if (tokens.expiresAt > Date.now() + 60_000) return tokens.access_token;
  let pending = refreshes.get("current");
  if (!pending) {
    pending = exchangeToken({
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token,
    })
      .then(async (next) => {
        await writeTokens(sql, next, "refresh", "connected");
        return next;
      })
      .catch(async (err) => {
        await sql
          .query(`update integration_secrets set last_status = 'failed', updated_at = now() where id = $1`, [
            CANVA_TOKEN_ROW_ID,
          ])
          .catch(() => undefined);
        throw err;
      });
    refreshes.set("current", pending);
  }
  try {
    return (await pending).access_token;
  } finally {
    refreshes.delete("current");
  }
}

export async function loadCanvaConnectionStatus(sql: Sql): Promise<CanvaConnectionStatus> {
  const base = disconnectedCanvaStatus();
  if (!canvaCredentialsPresent() || !canvaTokenKeyPresent()) return base;
  const row = await readSecretRow(sql, CANVA_TOKEN_ROW_ID);
  if (!row) return base;
  try {
    parseStoredTokens(row);
  } catch {
    return {
      ...base,
      status: "failed",
      message: "已有加密 token 列，但無法解密。請檢查 CANVA_TOKEN_KEY 後重新授權。",
    };
  }
  if (row.last_status === "failed") {
    return {
      mode: "oauth",
      connected: false,
      status: "failed",
      credentialsConfigured: true,
      tokenKeyConfigured: true,
      canSearch: false,
      canExport: false,
      canDisconnect: true,
      message: "Canva token 刷新失敗。請重新授權。不會標記為已連線。",
    };
  }
  const lastSyncAt =
    row.last_sync_at instanceof Date
      ? row.last_sync_at.toISOString()
      : row.last_sync_at
        ? String(row.last_sync_at)
        : undefined;
  return {
    mode: "oauth",
    connected: true,
    lastSyncAt,
    status: "connected",
    credentialsConfigured: true,
    tokenKeyConfigured: true,
    canSearch: true,
    canExport: true,
    canDisconnect: true,
    message: "Canva Connect 已授權。token 只存在伺服器、已加密，不會送到瀏覽器。",
  };
}

export async function disconnectCanva(sql: Sql): Promise<CanvaConnectionStatus> {
  const row = await readSecretRow(sql, CANVA_TOKEN_ROW_ID);
  if (row && canvaCredentialsPresent() && canvaTokenKeyPresent()) {
    try {
      const tokens = parseStoredTokens(row);
      for (const token of [tokens.refresh_token, tokens.access_token]) {
        await fetch(`${CANVA_API}/oauth/revoke`, {
          method: "POST",
          redirect: "error",
          signal: AbortSignal.timeout(10_000),
          headers: {
            Authorization: basicAuthHeader(),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ token }),
        }).catch(() => undefined);
      }
    } catch {
      // Local disconnect still proceeds; Canva revoke is best-effort.
    }
  }
  await sql.query(`delete from integration_secrets where id = $1 or id like $2`, [
    CANVA_TOKEN_ROW_ID,
    `${PENDING_PREFIX}%`,
  ]);
  return disconnectedCanvaStatus();
}

export function canvaConfigErrorResponse(message: string, status = 503): Response {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}
