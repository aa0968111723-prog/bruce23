export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class AdminConfigError extends Error {
  readonly status = 503;
  constructor(
    message = "PORTFOLIO_ADMIN_EMAILS is not configured. Admin access is closed.",
  ) {
    super(message);
    this.name = "AdminConfigError";
  }
}

export function parseAdminAllowlist(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;\n]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export type AdminAccess =
  | { ok: true; email: string }
  | { ok: false; reason: "missing_allowlist" | "not_allowlisted" };

export function resolveAdminAccess(input: {
  email: string | null | undefined;
  allowlist: string[];
}): AdminAccess {
  if (input.allowlist.length === 0) {
    return { ok: false, reason: "missing_allowlist" };
  }
  const email = input.email?.trim().toLowerCase();
  if (!email || !input.allowlist.includes(email)) {
    return { ok: false, reason: "not_allowlisted" };
  }
  return { ok: true, email };
}

export function adminAllowlistFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  return parseAdminAllowlist(env.PORTFOLIO_ADMIN_EMAILS);
}

export function assertAdmin(
  access: AdminAccess,
): asserts access is { ok: true; email: string } {
  if (!access.ok && access.reason === "missing_allowlist") {
    throw new AdminConfigError();
  }
  if (!access.ok) throw new ForbiddenError();
}
