import { parseCanvaInput } from "./canva-url";
import { canEncryptSecrets, decryptSecret, encryptSecret } from "./crypto.server";
import type { Sql } from "@/lib/db";

export function canvaConnectConfigured(): boolean {
  return Boolean(process.env.CANVA_CLIENT_ID?.trim() && process.env.CANVA_CLIENT_SECRET?.trim());
}

export async function testCanvaEmbed(input: string) {
  const parsed = parseCanvaInput(input);
  if (!parsed.ok) {
    return { ok: false as const, status: "failed" as const, error: parsed.error, value: null };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(parsed.value.embedUrl, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "luminous-studio-portfolio" },
    });
    if (response.status === 401 || response.status === 403) {
      return {
        ok: false as const,
        status: "unavailable" as const,
        error: "this design may need permission",
        value: parsed.value,
      };
    }
    if (!response.ok) {
      return {
        ok: false as const,
        status: "failed" as const,
        error: `Canva embed HTTP ${response.status}`,
        value: parsed.value,
      };
    }
    return { ok: true as const, status: "verified" as const, error: null, value: parsed.value };
  } catch {
    return {
      ok: false as const,
      status: "failed" as const,
      error: "Canva embed request failed",
      value: parsed.value,
    };
  } finally {
    clearTimeout(timer);
  }
}

export type CanvaTokenPayload = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

export async function storeCanvaTokens(sql: Sql, ownerUserId: string, tokens: CanvaTokenPayload) {
  const encrypted = encryptSecret(JSON.stringify(tokens));
  await sql.query(
    `insert into integration_secrets (id, owner_user_id, provider, encrypted_payload, status, last_synced_at, updated_at)
     values ($1,$2,'canva',$3,'connected', now(), now())
     on conflict (owner_user_id, provider) do update set encrypted_payload = excluded.encrypted_payload, status = 'connected', last_synced_at = now(), updated_at = now()`,
    [`canva:${ownerUserId}`, ownerUserId, encrypted],
  );
}

export async function readCanvaTokens(sql: Sql, ownerUserId: string): Promise<CanvaTokenPayload | null> {
  const rows = await sql.query<{ encrypted_payload: string }>(
    "select encrypted_payload from integration_secrets where owner_user_id = $1 and provider = 'canva'",
    [ownerUserId],
  );
  if (!rows[0]) return null;
  const parsed = JSON.parse(decryptSecret(rows[0].encrypted_payload)) as CanvaTokenPayload;
  return parsed;
}

export async function clearCanvaTokens(sql: Sql, ownerUserId: string) {
  await sql.query(
    "delete from integration_secrets where owner_user_id = $1 and provider = 'canva'",
    [ownerUserId],
  );
}

export function canvaModeLabel() {
  if (canvaConnectConfigured() && canEncryptSecrets()) return "Canva Connect API";
  return "公開嵌入模式";
}
