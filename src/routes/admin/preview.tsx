import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminProjectsFn } from "@/lib/portfolio/cms-fns";
import { ExperiencePanel } from "@/components/experience/ExperiencePanel";
import { toPublicProject } from "@/lib/portfolio/privacy";
import type { AdminProject } from "@/lib/portfolio/types";

export const Route = createFileRoute("/admin/preview")({
  component: AdminPreview,
});

function AdminPreview() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [id, setId] = useState<string>("");
  useEffect(() => {
    void listAdminProjectsFn().then((list) => {
      setProjects(list);
      setId(list[0]?.id ?? "");
    });
  }, []);
  const current = projects.find((p) => p.id === id);
  const publicShape = current ? toPublicProject({ ...current, publicationStatus: "published" }) : null;
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">草稿預覽</h1>
      <p className="mt-2 text-sm text-muted">這裡可看未發布作品的體驗區，不會出現在公開列表。</p>
      <select className="input mt-4 max-w-md" value={id} onChange={(e) => setId(e.target.value)}>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title} · {project.publicationStatus}
          </option>
        ))}
      </select>
      {publicShape ? (
        <div className="mt-6">
          <p className="text-xs text-muted">發布狀態：{current?.publicationStatus}</p>
          <h2 className="font-display text-2xl font-semibold">{publicShape.title}</h2>
          <ExperiencePanel project={publicShape} />
          {current?.publicationStatus === "published" ? (
            <Link className="mt-4 inline-flex min-h-11 items-center text-sm text-mint-deep" to="/work/$slug" params={{ slug: publicShape.slug }}>
              公開頁
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
