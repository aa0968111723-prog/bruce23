export class UntrustedOriginError extends Error {
  readonly status = 403;
  constructor(message = "Forbidden: origin mismatch") {
    super(message);
    this.name = "UntrustedOriginError";
  }
}

const LOOPBACK_HOSTS = new Set([
  "localhost:8080",
  "127.0.0.1:8080",
  "[::1]:8080",
]);

export function originMatchesHost(
  origin: string | null,
  host: string | null,
): boolean {
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  if (!host) return true;
  if (originHost === host) return true;
  return LOOPBACK_HOSTS.has(originHost) && LOOPBACK_HOSTS.has(host);
}

export function assertOriginMatchesHost(
  origin: string | null,
  host: string | null,
): void {
  if (!originMatchesHost(origin, host)) {
    throw new UntrustedOriginError();
  }
}
