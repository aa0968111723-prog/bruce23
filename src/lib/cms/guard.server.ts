import { getRequest } from "@tanstack/react-start/server";
import { getSessionUser } from "../auth/verify.server.ts";
import { assertSameSiteRequest } from "../auth/isolation.server.ts";
import { assertAdminAccess, isAllowedAdminOrigin } from "./admin.ts";
import { ForbiddenError } from "./errors.ts";

export function assertAdminOrigin(): void {
  const request = getRequest();
  if (!request) return;
  if (!isAllowedAdminOrigin(request.headers.get("origin"), request.headers.get("host"))) {
    throw new ForbiddenError("Invalid origin");
  }
}

export async function requireAdminActor(userId: string, bearerToken?: string) {
  assertSameSiteRequest();
  assertAdminOrigin();
  const user = await getSessionUser(bearerToken);
  if (!user || user.id !== userId) {
    const { UnauthorizedError } = await import("../auth/verify.server.ts");
    throw new UnauthorizedError();
  }
  const { email } = assertAdminAccess({ userId, email: user.email });
  return { userId, email };
}
