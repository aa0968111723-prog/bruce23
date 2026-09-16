import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "@/lib/auth/verify.server";
import { getSql } from "@/lib/db";
import { adminAllowlistFromEnv, resolveAdminAccess } from "@/lib/portfolio/admin";
import { hasCanvaCredentials } from "@/lib/portfolio/canva";
import {
  exchangeCanvaCode,
  storeCanvaTokens,
} from "@/lib/portfolio/canva-connect";

export const Route = createFileRoute("/api/admin/canva/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const toIntegrations = (query: string) =>
          Response.redirect(new URL(`/admin/integrations?${query}`, url.origin), 302);
        if (!hasCanvaCredentials()) {
          return toIntegrations("canva=public_embed");
        }
        const user = await getSessionUser();
        const access = resolveAdminAccess({
          email: user?.email,
          allowlist: adminAllowlistFromEnv(),
        });
        if (!user || !access.ok) {
          return Response.redirect(new URL("/login?next=/admin/integrations", url.origin), 302);
        }
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");
        if (!code || error) return toIntegrations("canva=failed");
        try {
          const clientId = process.env.CANVA_CLIENT_ID?.trim();
          const clientSecret = process.env.CANVA_CLIENT_SECRET?.trim();
          if (!clientId || !clientSecret) return toIntegrations("canva=not_configured");
          const redirectUri = `${url.origin}/api/admin/canva/callback`;
          const bundle = await exchangeCanvaCode({
            code,
            redirectUri,
            clientId,
            clientSecret,
          });
          const sql = await getSql();
          await storeCanvaTokens(sql, bundle, user.id);
          return toIntegrations("canva=connected");
        } catch {
          return toIntegrations("canva=failed");
        }
      },
    },
  },
});
