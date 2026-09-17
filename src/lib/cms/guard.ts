export class AdminConfigError extends Error {
  readonly status = 503;
  readonly code = "ADMIN_NOT_CONFIGURED";
  constructor(
    message = "PORTFOLIO_ADMIN_EMAILS is not set. Admin access is closed.",
  ) {
    super(message);
    this.name = "AdminConfigError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  readonly code = "FORBIDDEN";
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function parseAdminAllowlist(
  raw: string | undefined | null,
): string[] | null {
  if (raw == null) return null;
  const emails = raw
    .split(/[,;\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (emails.length === 0) return null;
  return emails;
}

export type AdminDecision =
  | { ok: true; email: string }
  | {
      ok: false;
      reason: "unauthenticated" | "not_configured" | "forbidden";
      message: string;
    };

export function evaluateAdminAccess(input: {
  allowlist: string[] | null;
  userId: string | null | undefined;
  email: string | null | undefined;
}): AdminDecision {
  if (!input.userId) {
    return {
      ok: false,
      reason: "unauthenticated",
      message: "Unauthorized",
    };
  }
  if (!input.allowlist) {
    return {
      ok: false,
      reason: "not_configured",
      message:
        "後台尚未設定 PORTFOLIO_ADMIN_EMAILS，已關閉管理權限（fail closed）。",
    };
  }
  const email = input.email?.trim().toLowerCase() ?? "";
  if (!email || !input.allowlist.includes(email)) {
    return {
      ok: false,
      reason: "forbidden",
      message: "此帳號不在管理員允許清單。",
    };
  }
  return { ok: true, email };
}

export function assertAdminAccess(input: {
  allowlist: string[] | null;
  userId: string | null | undefined;
  email: string | null | undefined;
}): { email: string } {
  const decision = evaluateAdminAccess(input);
  if (decision.ok) return { email: decision.email };
  if (decision.reason === "unauthenticated") {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    err.name = "UnauthorizedError";
    throw err;
  }
  if (decision.reason === "not_configured") {
    throw new AdminConfigError(decision.message);
  }
  throw new ForbiddenError(decision.message);
}
