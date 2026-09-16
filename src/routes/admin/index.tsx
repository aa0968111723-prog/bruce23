import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminProjectsFn, listIntegrationsFn } from "@/lib/cms/admin-fn";
import type { AdminProject } from "@/lib/cms/store";
import { publicationStatusLabel } from "@/lib/cms/status";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([listAdminProjectsFn(), listIntegrationsFn()])
      .then(([list]) => setProjects(list))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "讀取失敗"));
  }, []);

  const published = projects.filter((item) => item.publication_status === "published").length;
  const drafts = projects.filter((item) => item.publication_status === "draft").length;

  return (
    <div>
      <h1 className="font-display text-3xl">內容總覽</h1>
      {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="作品" value={projects.length} />
        <Stat label="已發布" value={published} />
        <Stat label="草稿" value={drafts} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/projects/new" className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground">
          新增作品
        </Link>
        <Link to="/admin/integrations" className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm shadow-card">
          整合狀態
        </Link>
      </div>
      <ul className="mt-8 grid gap-2">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              to="/admin/projects/$id/edit"
              params={{ id: project.id }}
              className="flex min-h-11 items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-card"
            >
              <span>
                <span className="font-medium">{project.title}</span>
                <span className="ml-2 text-xs text-muted">{publicationStatusLabel[project.publication_status]}</span>
              </span>
              <span className="text-xs text-muted">{project.github_sync_status}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-card">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}
