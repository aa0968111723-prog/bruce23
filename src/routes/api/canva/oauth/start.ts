import { createFileRoute } from "@tanstack/react-router";
import { CanvaConfigError, canvaConfigErrorResponse, startCanvaOAuth } from "@/lib/canva/oauth.server";

export const Route = createFileRoute("/api/canva/oauth/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        try {
          const { getSql } = await import("@/lib/db");
          const { getSessionUser } = await import("@/lib/auth/verify.server");
          const { requireAdminActor } = await import("@/lib/cms/guard.server");
          const user = await getSessionUser();
          if (!user) {
            return canvaConfigErrorResponse("請先登入後台再連接 Canva。", 401);
          }
          const actor = await requireAdminActor(user.id);
          const sql = await getSql();
          const result = await startCanvaOAuth(sql, actor.userId, origin);
          if (!result.ok || !result.authorizeUrl) {
            return canvaConfigErrorResponse(result.status.message, result.status.status === "not_configured" ? 503 : 503);
          }
          return Response.redirect(result.authorizeUrl, 302);
        } catch (err) {
          if (err instanceof CanvaConfigError) {
            return canvaConfigErrorResponse(err.message, err.status);
          }
          const message = err instanceof Error ? err.message : "無法開始 Canva 授權。";
          return canvaConfigErrorResponse(message, 403);
        }
      },
    },
  },
});
