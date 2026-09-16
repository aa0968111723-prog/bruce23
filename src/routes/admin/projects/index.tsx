import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminProjectsFn } from "@/lib/cms/admin-fn";
import type { AdminProject } from "@/lib/cms/store";
import { publicationStatusLabel } from "@/lib/cms/status";

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
        <h1 className="font-display text-3xl">作品</h1>
        <Link
          to="/admin/projects/new"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
        >
          新增
        </Link>
      </div>
      <ul className="mt-6 grid gap-2">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              to="/admin/projects/$id/edit"
              params={{ id: project.id }}
              className="flex min-h-11 items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-card"
            >
              <span>
                {project.title}
                <span className="ml-2 text-xs text-muted">{publicationStatusLabel[project.publication_status]}</span>
              </span>
              <span className="text-xs text-muted">{project.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
