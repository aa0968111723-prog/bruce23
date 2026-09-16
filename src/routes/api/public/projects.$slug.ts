import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { getPublishedProject } from "@/lib/portfolio/cms";
import { assertPublicSafe } from "@/lib/portfolio/public";
import { ensureSeeded } from "@/lib/portfolio/seed";

export const Route = createFileRoute("/api/public/projects/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const sql = await getSql();
        await ensureSeeded(sql);
        const project = await getPublishedProject(sql, params.slug);
        if (!project) return Response.json({ error: "not_found" }, { status: 404 });
        assertPublicSafe(project);
        return Response.json(project);
      },
    },
  },
});
