import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminProjectsFn } from "@/lib/portfolio/cms-fns";
import type { AdminProject } from "@/lib/portfolio/types";

export const Route = createFileRoute("/admin/projects/")({
  component: AdminProjects,
});

function AdminProjects() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  useEffect(() => {
    void listAdminProjectsFn().then(setProjects);
  }, []);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">作品</h1>
        <Link to="/admin/projects/new" className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold">
          新增
        </Link>
      </div>
      <ul className="mt-6 grid gap-3">
        {projects.map((project) => (
          <li key={project.id} className="rounded-2xl bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{project.title}</p>
                <p className="text-xs text-muted">
                  {project.slug} · {project.publicationStatus} · {project.productStatus}
                </p>
              </div>
              <Link
                to="/admin/projects/$id/edit"
                params={{ id: project.id }}
                className="inline-flex min-h-11 items-center text-sm text-mint-deep"
              >
                編輯
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
