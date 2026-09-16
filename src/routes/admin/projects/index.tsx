import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminProjectsFn } from "@/lib/cms/admin-fns";
import { statusLabelZh } from "@/lib/integrations/status";
import type { AdminProject } from "@/lib/cms/public-types";

export const Route = createFileRoute("/admin/projects/")({
  component: AdminProjects,
});

function AdminProjects() {
  const [projects, setProjects] = useState<AdminProject[] | null>(null);
  useEffect(() => {
    void listAdminProjectsFn()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);
  if (!projects) return <p className="text-sm text-muted">載入中…</p>;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">作品</h1>
        <Link
          to="/admin/projects/new"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
        >
          新增作品
        </Link>
      </div>
      <ul className="mt-6 grid gap-3">
        {projects.map((p) => (
          <li key={p.id}>
            <Link
              to="/admin/projects/$id/edit"
              params={{ id: p.id }}
              className="flex min-h-16 flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 shadow-card"
            >
              <span>
                <span className="block font-medium">{p.title}</span>
                <span className="text-sm text-muted">
                  {p.slug} · {p.publicationStatus} · {p.productStatus}
                  {p.featured ? " · 精選" : ""}
                </span>
              </span>
              <span className="text-xs text-muted">
                GH {statusLabelZh[p.githubSyncStatus]} · 體驗 {p.experienceMode}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
