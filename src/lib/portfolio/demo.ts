export type DemoVerifyResult =
  | { ok: true; status: number; verifiedAt: string }
  | { ok: false; status: number | null; error: string };

export function demoIframeState(input: {
  url?: string | null;
  embedEnabled: boolean;
  failed: boolean;
}): "ready" | "fallback" | "not_configured" | "disabled" {
  if (!input.url) return "not_configured";
  if (!input.embedEnabled) return "disabled";
  if (input.failed) return "fallback";
  return "ready";
}

export function classifyDemoHttpStatus(status: number): "verified" | "failed" | "unavailable" {
  if (status >= 200 && status < 400) return "verified";
  if (status === 404 || status === 410) return "unavailable";
  return "failed";
}

export function isHttpsPublicUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    let host = url.hostname.toLowerCase();
    if (host.startsWith("[") && host.endsWith("]")) host = host.slice(1, -1);
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      host.endsWith(".localhost") ||
      host.startsWith("127.") ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      host.startsWith("169.254.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return false;
    }
    if (host.startsWith("::ffff:")) {
      return isHttpsPublicUrl(`https://${host.slice(7)}/`);
    }
    if (host.includes(":")) {
      if (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}
