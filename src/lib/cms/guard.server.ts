import { getRequest } from "@tanstack/react-start/server";
import { getSessionUser } from "@/lib/auth/verify.server";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { assertAdminAccess, isAllowedAdminOrigin } from "./admin";
import { ForbiddenError } from "./errors";

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
    const { UnauthorizedError } = await import("@/lib/auth/verify.server");
    throw new UnauthorizedError();
  }
  const { email } = assertAdminAccess({ userId, email: user.email });
  return { userId, email };
}
