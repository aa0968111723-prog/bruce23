import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { listPublishedProjects } from "@/lib/portfolio/cms";
import { assertPublicSafe } from "@/lib/portfolio/public";
import { ensureSeeded } from "@/lib/portfolio/seed";

export const Route = createFileRoute("/api/public/projects")({
  server: {
    handlers: {
      GET: async () => {
        const sql = await getSql();
        await ensureSeeded(sql);
        const projects = await listPublishedProjects(sql);
        assertPublicSafe(projects);
        return Response.json(projects);
      },
    },
  },
});
