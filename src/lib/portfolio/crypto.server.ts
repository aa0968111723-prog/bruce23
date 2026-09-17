import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

function keyMaterial(): Buffer | null {
  const raw =
    process.env.PORTFOLIO_TOKEN_KEY?.trim() ||
    process.env.BETTER_AUTH_SECRET?.trim() ||
    null;
  if (!raw) return null;
  return scryptSync(raw, "luminous-studio-portfolio", 32);
}

export function canEncryptSecrets(): boolean {
  return keyMaterial() !== null;
}

export function encryptSecret(plaintext: string): string {
  const key = keyMaterial();
  if (!key) {
    throw new Error("No server key available to encrypt integration tokens");
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${enc.toString("base64url")}`;
}

export function decryptSecret(payload: string): string {
  const key = keyMaterial();
  if (!key) throw new Error("No server key available to decrypt integration tokens");
  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Malformed secret payload");
  }
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}
