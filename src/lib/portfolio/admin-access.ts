export class AdminConfigError extends Error {
  readonly status = 503;
  constructor(message: string) {
    super(message);
    this.name = "AdminConfigError";
  }
}

export class ForbiddenAdminError extends Error {
  readonly status = 403;
  constructor(message = "Not a portfolio admin") {
    super(message);
    this.name = "ForbiddenAdminError";
  }
}

export function parseAdminEmails(raw: string | undefined | null): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/[,;\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function readAdminAllowlist(
  env: Record<string, string | undefined> = typeof process === "undefined" ? {} : process.env,
): { ok: true; emails: string[] } | { ok: false; error: string } {
  const emails = parseAdminEmails(env.PORTFOLIO_ADMIN_EMAILS);
  if (emails.length === 0) {
    return {
      ok: false,
      error:
        "PORTFOLIO_ADMIN_EMAILS is not set. Admin is locked (fail closed). No signed-in user is an admin until the allowlist exists.",
    };
  }
  return { ok: true, emails };
}

export function isAllowlistedEmail(
  email: string | null | undefined,
  allowlist: string[],
): boolean {
  if (!email) return false;
  return allowlist.includes(email.trim().toLowerCase());
}

export function assertAdminAccess(opts: {
  email: string | null | undefined;
  env?: Record<string, string | undefined>;
}): { email: string; allowlist: string[] } {
  const parsed = readAdminAllowlist(opts.env);
  if (!parsed.ok) throw new AdminConfigError(parsed.error);
  if (!isAllowlistedEmail(opts.email, parsed.emails)) {
    throw new ForbiddenAdminError();
  }
  return { email: opts.email!.trim().toLowerCase(), allowlist: parsed.emails };
}
