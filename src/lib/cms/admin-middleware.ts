import { createMiddleware } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { env } from "@/lib/env.server";
import {
  AdminConfigError,
  ForbiddenError,
  assertAdminAccess,
  parseAdminAllowlist,
} from "./guard";

export { AdminConfigError, ForbiddenError };

/** Forward preview bearer without requiring a session. */
export const optionalSessionMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => next({ context }));

/**
 * Admin-only. authMiddleware verifies the user; allowlist is fail-closed.
 * Email comes from the Better Auth user row, never from the client.
 */
export const adminMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{ email: string }>(
      `select email from "user" where id = $1 limit 1`,
      [context.userId],
    );
    const allowlist = parseAdminAllowlist(env("PORTFOLIO_ADMIN_EMAILS"));
    const access = assertAdminAccess({
      allowlist,
      userId: context.userId,
      email: rows[0]?.email ?? null,
    });
    return next({
      context: {
        userId: context.userId,
        adminEmail: access.email,
      },
    });
  });
