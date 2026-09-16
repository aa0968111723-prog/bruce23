import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type CanvaOAuthMode = "oauth" | "public-embed";

export function canvaConnectMode(): CanvaOAuthMode {
  const id = process.env.CANVA_CLIENT_ID?.trim();
  const secret = process.env.CANVA_CLIENT_SECRET?.trim();
  return id && secret ? "oauth" : "public-embed";
}

export function canvaCredentialsPresent(): boolean {
  return canvaConnectMode() === "oauth";
}

function tokenKey(): Buffer {
  const secret =
    process.env.BETTER_AUTH_SECRET?.trim() ||
    process.env.PORTFOLIO_TOKEN_KEY?.trim() ||
    "preview-only-not-for-production";
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
};

export function disconnectedCanvaStatus(): CanvaConnectionStatus {
  if (!canvaCredentialsPresent()) {
    return {
      mode: "public-embed",
      connected: false,
      status: "not_configured",
      message: "公開嵌入模式。尚未設定 Canva Connect 憑證，不會假裝已 OAuth 連線，也不能在站內編輯 Canva。",
    };
  }
  return {
    mode: "oauth",
    connected: false,
    status: "pending",
    message: "Canva API 憑證已在伺服器，但這個後台還沒完成授權。",
  };
}
