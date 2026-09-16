import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExperiencePanel } from "@/components/experience/ExperiencePanel";
import { getAdminProjectBySlugFn } from "@/lib/cms/admin-fns";
import type { AdminProject } from "@/lib/cms/public-types";
import type { PublicProject } from "@/lib/cms/public-types";

export const Route = createFileRoute("/admin/preview")({
  validateSearch: (search: { slug?: string }) => ({
    slug: typeof search.slug === "string" ? search.slug : "",
  }),
  component: AdminPreview,
});

function AdminPreview() {
  const { slug } = Route.useSearch();
  const [project, setProject] = useState<AdminProject | null | undefined>(undefined);
  useEffect(() => {
    if (!slug) {
      setProject(null);
      return;
    }
    void getAdminProjectBySlugFn({ data: slug })
      .then(setProject)
      .catch(() => setProject(null));
  }, [slug]);

  if (!slug) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold">草稿預覽</h1>
        <p className="mt-3 text-sm text-muted">從作品編輯頁打開預覽，或帶上 ?slug=</p>
      </div>
    );
  }
  if (project === undefined) return <p className="text-sm text-muted">載入中…</p>;
  if (!project) return <p className="text-sm text-muted">找不到這個 slug。</p>;
  const pub = { ...project, publicationStatus: "published" as const } satisfies PublicProject;
  return (
    <div>
      <p className="text-sm text-muted">
        這是管理員預覽，發布狀態：{project.publicationStatus}。訪客看不到草稿。
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold">{project.title}</h1>
      <p className="mt-2 text-muted">{project.subtitle}</p>
      <div className="mt-8">
        <ExperiencePanel project={pub} />
      </div>
    </div>
  );
}
