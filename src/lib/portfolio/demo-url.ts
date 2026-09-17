const BLOCKED = new Set(["javascript:", "data:", "blob:", "file:"]);

export function isSafeHttpsUrl(input: string | null | undefined): boolean {
  if (!input) return false;
  try {
    const url = new URL(input);
    if (BLOCKED.has(url.protocol.toLowerCase())) return false;
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isPublicHttpsUrl(input: string | null | undefined): boolean {
  if (!isSafeHttpsUrl(input)) return false;
  const url = new URL(input!);
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.startsWith("169.254.") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  ) {
    return false;
  }
  return true;
}

export type DemoVerifyResult = {
  status: "verified" | "failed" | "unavailable";
  httpStatus: number | null;
  error: string | null;
  embeddableGuess: boolean;
};

export function interpretDemoResponse(opts: {
  ok: boolean;
  status: number;
  xFrameOptions: string | null;
  csp: string | null;
}): DemoVerifyResult {
  if (opts.status === 404 || opts.status === 410) {
    return {
      status: "unavailable",
      httpStatus: opts.status,
      error: `Demo responded ${opts.status}`,
      embeddableGuess: false,
    };
  }
  if (!opts.ok && opts.status >= 500) {
    return {
      status: "failed",
      httpStatus: opts.status,
      error: `Demo responded ${opts.status}`,
      embeddableGuess: false,
    };
  }
  if (!opts.ok && opts.status >= 400) {
    return {
      status: "failed",
      httpStatus: opts.status,
      error: `Demo responded ${opts.status}`,
      embeddableGuess: false,
    };
  }
  const frame = (opts.xFrameOptions ?? "").toLowerCase();
  const csp = (opts.csp ?? "").toLowerCase();
  const blocked =
    frame.includes("deny") ||
    frame.includes("sameorigin") ||
    /frame-ancestors\s+['"]?none['"]?/.test(csp);
  return {
    status: "verified",
    httpStatus: opts.status,
    error: null,
    embeddableGuess: !blocked,
  };
}

export function demoFallbackCopy(embeddableGuess: boolean) {
  if (!embeddableGuess) {
    return "這個 Demo 拒絕被嵌入（網站安全政策）。請改用新分頁開啟。";
  }
  return "Demo 暫時無法載入。這不是成功連線。";
}
