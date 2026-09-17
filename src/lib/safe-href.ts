/** Shared allowlist for public/admin hrefs and demo probes. Never javascript:/data:. */

export function isBlockedPrivateHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host === "::1" || host === "0.0.0.0" || host === "0:0:0:0:0:0:0:1") return true;
  if (host.startsWith("127.")) return true;
  if (host.startsWith("10.")) return true;
  if (host.startsWith("192.168.")) return true;
  if (host.startsWith("169.254.")) return true;
  if (host.startsWith("fe80:")) return true;
  const match = host.match(/^172\.(\d+)\./);
  if (match) {
    const octet = Number(match[1]);
    if (octet >= 16 && octet <= 31) return true;
  }
  return false;
}

export function isSafeHttpUrl(raw: string | null | undefined): boolean {
  const value = raw?.trim() ?? "";
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return !isBlockedPrivateHost(url.hostname);
  } catch {
    return false;
  }
}

/** Site-relative paths or http(s) public URLs. Empty is allowed (optional field). */
export function isSafePublicHref(raw: string | null | undefined): boolean {
  const value = raw?.trim() ?? "";
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return isSafeHttpUrl(value);
}

export function sanitizePublicHref(raw: string | null | undefined): string | undefined {
  const value = raw?.trim() ?? "";
  if (!value) return undefined;
  return isSafePublicHref(value) ? value : undefined;
}
