import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/canva/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { env } = await import("@/lib/env.server");
        const { canvaApiConfigured, encryptSecret } = await import("@/lib/canva/oauth.server");
        if (!canvaApiConfigured()) {
          return new Response("Canva Connect 未設定，公開嵌入模式仍可用。", { status: 503 });
        }
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const err = url.searchParams.get("error");
        if (err || !code) {
          return Response.redirect("/admin/integrations?canva=failed");
        }
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: env("CANVA_CLIENT_ID") ?? "",
          client_secret: env("CANVA_CLIENT_SECRET") ?? "",
          redirect_uri: env("CANVA_REDIRECT_URI") ?? "",
        });
        const res = await fetch("https://api.canva.com/rest/v1/oauth/token", {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body,
        });
        if (!res.ok) {
          return Response.redirect("/admin/integrations?canva=failed");
        }
        const json = (await res.json()) as { access_token?: string; refresh_token?: string };
        const packed = encryptSecret(
          JSON.stringify({
            access: json.access_token ? "[redacted-in-logs]" : null,
            refresh: json.refresh_token ? "present" : null,
            raw: json,
          }),
        );
        if (!packed) {
          return Response.redirect("/admin/integrations?canva=nokey");
        }
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        await sql.query(
          `insert into integration_secrets (id, kind, payload_encrypted, updated_at)
           values ('canva_oauth', 'canva_oauth', $1, now())
           on conflict (id) do update set payload_encrypted = excluded.payload_encrypted, updated_at = now()`,
          [packed],
        );
        return Response.redirect("/admin/integrations?canva=connected");
      },
    },
  },
});
