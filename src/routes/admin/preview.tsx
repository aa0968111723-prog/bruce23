import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminProjectsFn } from "@/lib/cms/admin-fn";
import type { AdminProject } from "@/lib/cms/store";
import { publicationStatusLabel } from "@/lib/cms/status";

export const Route = createFileRoute("/admin/preview")({
  component: PreviewPage,
});

function PreviewPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  useEffect(() => {
    void listAdminProjectsFn().then(setProjects);
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl">草稿預覽</h1>
      <p className="mt-2 text-sm text-muted">草稿不會出現在前台列表、個案、sitemap 或 JSON-LD。這裡只給後台看。</p>
      <ul className="mt-6 grid gap-2">
        {projects.map((project) => (
          <li key={project.id} className="flex min-h-11 items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-card">
            <span>
              {project.title}
              <span className="ml-2 text-xs text-muted">{publicationStatusLabel[project.publication_status]}</span>
            </span>
            <span className="flex gap-3 text-sm">
              <Link to="/admin/projects/$id/edit" params={{ id: project.id }} className="text-mint-deep">
                編輯
              </Link>
              <a href={`/admin/draft/${project.slug}`} className="text-mint-deep">
                後台預覽
              </a>
              {project.publication_status === "published" ? (
                <a href={`/work/${project.slug}`} className="text-mint-deep" target="_blank" rel="noreferrer">
                  前台
                </a>
              ) : (
                <span className="text-muted">未發布，前台 404</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
