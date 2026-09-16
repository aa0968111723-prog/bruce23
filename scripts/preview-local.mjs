import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const DEFAULT_PGLITE_DATA_DIR = join(ROOT, ".grok/pglite");
export const PREVIEW_AUTH_SECRET_FILE = join(ROOT, ".grok/preview-auth-secret");
export const ADMIN_SESSION_FILE = join(ROOT, ".grok/admin-e2e-session.json");
export const SESSION_TOKEN_COOKIE = "__Host-grok-auth.session_token";
export const BEARER_STORAGE_KEY = "grok-auth.bearer-token";
export const ADMIN_EMAIL = "aa0968111723@gmail.com";

export function projectRoot() {
  return ROOT;
}

function hasDatabaseUrl(env) {
  return Boolean(String(env.DATABASE_URL ?? "").trim());
}

function onVercel(env) {
  return Boolean(String(env.VERCEL ?? "").trim());
}

export function readOrCreatePreviewAuthSecret(root = ROOT) {
  const file = join(root, ".grok/preview-auth-secret");
  try {
    const existing = readFileSync(file, "utf8").trim();
    if (existing.length >= 32) return existing;
  } catch {
    // first preview boot
  }
  mkdirSync(dirname(file), { recursive: true });
  const secret = randomBytes(32).toString("hex");
  writeFileSync(file, `${secret}\n`, { encoding: "utf8", mode: 0o600 });
  return secret;
}

/**
 * Local preview/dev only. Production (DATABASE_URL or VERCEL) stays on Neon
 * and never receives a workspace PGLite path or a generated preview secret.
 */
export function applyPreviewLocalDefaults(env, options = {}) {
  const next = { ...env };
  if (hasDatabaseUrl(next) || onVercel(next)) return next;
  if (!String(next.BETTER_AUTH_SECRET ?? "").trim()) {
    next.BETTER_AUTH_SECRET = readOrCreatePreviewAuthSecret(options.root ?? ROOT);
  }
  const forceFile = Boolean(options.forcePgliteFile);
  const isViteDev = options.command === "vite" && options.args?.[0] === "dev";
  if ((forceFile || isViteDev) && !String(next.PGLITE_DATA_DIR ?? "").trim()) {
    next.PGLITE_DATA_DIR = options.pgliteDataDir ?? DEFAULT_PGLITE_DATA_DIR;
  }
  return next;
}

export function writeAdminSessionFile(payload, root = ROOT) {
  const file = join(root, ".grok/admin-e2e-session.json");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(payload)}\n`, { encoding: "utf8", mode: 0o600 });
  return file;
}

export function readAdminSessionFile(root = ROOT) {
  const file = join(root, ".grok/admin-e2e-session.json");
  return JSON.parse(readFileSync(file, "utf8"));
}
