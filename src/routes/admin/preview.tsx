import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExperiencePanel } from "@/components/experience/ExperiencePanel";
import { getPublicProjectPreview } from "@/lib/portfolio/server-public";
import type { PublicProject } from "@/lib/portfolio/public";

export const Route = createFileRoute("/admin/preview")({
  validateSearch: (search: Record<string, unknown>) => ({
    slug: typeof search.slug === "string" ? search.slug : "ai-director-os",
  }),
  component: AdminPreview,
});

function AdminPreview() {
  const { slug } = Route.useSearch();
  const [project, setProject] = useState<PublicProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublicProjectPreview({ data: { slug, previewDraft: true } }).then((result) => {
      setProject(result.project);
      setError("error" in result ? result.error ?? null : null);
    });
  }, [slug]);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">草稿預覽</h1>
      <p className="mt-2 text-sm text-muted">只有管理員看得到草稿。這不是公開頁。</p>
      {error ? <p className="mt-4 text-sm">{error}</p> : null}
      {project ? (
        <div className="mt-6">
          <h2 className="mb-4 font-display text-2xl">{project.title}</h2>
          <ExperiencePanel project={project} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">找不到 slug：{slug}</p>
      )}
    </div>
  );
}
