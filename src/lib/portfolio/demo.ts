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
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
      return false;
    }
    if (
      host.endsWith(".local") ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      host.startsWith("127.")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
