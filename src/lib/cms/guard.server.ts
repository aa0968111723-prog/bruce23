import { getRequest } from "@tanstack/react-start/server";
import { getSessionUser } from "@/lib/auth/verify.server";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { assertAdminAccess } from "./admin";
import { ForbiddenError } from "./errors";

const LOCAL_HOSTS = new Set(["localhost:8080", "127.0.0.1:8080", "[::1]:8080"]);

export function assertAdminOrigin(): void {
  const request = getRequest();
  if (!request) return;
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("host");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ForbiddenError("Invalid origin");
  }
  if (host && originHost === host) return;
  if (LOCAL_HOSTS.has(originHost) && host && LOCAL_HOSTS.has(host)) return;
  throw new ForbiddenError("Invalid origin");
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
