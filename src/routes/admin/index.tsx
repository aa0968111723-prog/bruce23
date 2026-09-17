import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminProjectsFn, listIntegrationsFn } from "@/lib/portfolio/cms-fns";
import type { AdminProject } from "@/lib/portfolio/types";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [canvaMode, setCanvaMode] = useState("");
  useEffect(() => {
    void listAdminProjectsFn().then(setProjects);
    void listIntegrationsFn().then((data) => setCanvaMode(data.canvaMode));
  }, []);
  const published = projects.filter((p) => p.publicationStatus === "published").length;
  const drafts = projects.filter((p) => p.publicationStatus === "draft").length;
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-3xl font-semibold">後台總覽</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="作品" value={projects.length} />
        <Stat label="已發布" value={published} />
        <Stat label="草稿" value={drafts} />
      </div>
      <p className="text-sm text-muted">Canva：{canvaMode || "讀取中…"}。沒有 Connect 憑證時只走公開嵌入，不會假裝已 OAuth。</p>
      <div className="flex flex-wrap gap-2">
        <Link to="/admin/projects/new" className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold">
          新增作品
        </Link>
        <Link to="/admin/integrations" className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm shadow-card">
          整合狀態
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-card">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}
