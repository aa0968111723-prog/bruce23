import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env.server";

export function canvaApiConfigured(): boolean {
  return Boolean(env("CANVA_CLIENT_ID") && env("CANVA_CLIENT_SECRET"));
}

function tokenKey(): Buffer | null {
  const secret =
    env("CANVA_TOKEN_KEY") || env("BETTER_AUTH_SECRET") || env("AUTH_SECRET");
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string): string | null {
  const key = tokenKey();
  if (!key) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}

export function decryptSecret(packed: string): string | null {
  const key = tokenKey();
  if (!key) return null;
  const [ivB64, tagB64, dataB64] = packed.split(".");
  if (!ivB64 || !tagB64 || !dataB64) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    const out = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64")),
      decipher.final(),
    ]);
    return out.toString("utf8");
  } catch {
    return null;
  }
}

export type CanvaOAuthStatus =
  | { mode: "public_embed"; connected: false }
  | {
      mode: "connect";
      connected: boolean;
      lastSync: string | null;
    };

export function canvaModeStatus(connected: boolean, lastSync: string | null): CanvaOAuthStatus {
  if (!canvaApiConfigured()) {
    return { mode: "public_embed", connected: false };
  }
  return { mode: "connect", connected, lastSync };
}
