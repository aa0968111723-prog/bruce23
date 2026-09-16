import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getAdminProjectFn } from "@/lib/cms/admin-fn";
import type { AdminProject } from "@/lib/cms/store";

export const Route = createFileRoute("/admin/projects/$id/edit")({
  component: EditProject,
});

function EditProject() {
  const { id } = Route.useParams();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getAdminProjectFn({ data: { id } })
      .then(setProject)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "讀取失敗"));
  }, [id]);

  if (error) return <p className="text-sm text-alert">{error}</p>;
  if (!project) return <p className="text-sm text-muted">載入作品…</p>;
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">編輯 {project.title}</h1>
      <ProjectForm project={project} />
    </div>
  );
}
