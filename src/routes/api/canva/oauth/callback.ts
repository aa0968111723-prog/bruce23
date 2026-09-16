import { createFileRoute } from "@tanstack/react-router";
import { CanvaConfigError, canvaConfigErrorResponse, completeCanvaOAuth } from "@/lib/canva/oauth.server";

export const Route = createFileRoute("/api/canva/oauth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = url.origin;
        const error = url.searchParams.get("error");
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (error) {
          return Response.redirect(new URL(`/admin/integrations?canva=error&reason=${encodeURIComponent(error)}`, origin), 302);
        }
        if (!code || !state) {
          return canvaConfigErrorResponse("Canva 回呼缺少 code 或 state。授權未完成，不會假裝已連線。", 400);
        }
        try {
          const { getSql } = await import("@/lib/db");
          const sql = await getSql();
          const status = await completeCanvaOAuth(sql, { code, state, origin });
          const dest = new URL("/admin/integrations", origin);
          dest.searchParams.set("canva", status.connected ? "connected" : "pending");
          return Response.redirect(dest, 302);
        } catch (err) {
          if (err instanceof CanvaConfigError) {
            return canvaConfigErrorResponse(err.message, err.status);
          }
          const message = err instanceof Error ? err.message : "Canva 回呼失敗。";
          return canvaConfigErrorResponse(message, 503);
        }
      },
    },
  },
});
