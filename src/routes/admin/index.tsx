import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getIntegrationsOverviewFn, listAdminProjectsFn } from "@/lib/cms/admin-fns";
import { statusLabelZh } from "@/lib/integrations/status";
import type { AdminProject } from "@/lib/cms/public-types";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const [projects, setProjects] = useState<AdminProject[] | null>(null);
  const [canvaMode, setCanvaMode] = useState("公開嵌入模式");
  useEffect(() => {
    void listAdminProjectsFn()
      .then(setProjects)
      .catch(() => setProjects([]));
    void getIntegrationsOverviewFn()
      .then((d) => setCanvaMode(d.canva.mode === "public_embed" ? "公開嵌入模式" : "Connect"))
      .catch(() => undefined);
  }, []);
  if (!projects) return <p className="text-sm text-muted">載入中…</p>;
  const drafts = projects.filter((p) => p.publicationStatus === "draft").length;
  const published = projects.filter((p) => p.publicationStatus === "published").length;
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">總覽</h1>
      <p className="mt-2 text-sm text-muted">草稿、發布與整合狀態都來自資料庫，不會把失敗顯示成成功。</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card label="已發布" value={String(published)} />
        <Card label="草稿" value={String(drafts)} />
        <Card label="Canva" value={canvaMode} />
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-surface shadow-card">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="px-4 py-3">作品</th>
              <th className="px-4 py-3">產品狀態</th>
              <th className="px-4 py-3">發布</th>
              <th className="px-4 py-3">GitHub</th>
              <th className="px-4 py-3">Canva</th>
              <th className="px-4 py-3">Demo</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-line/60">
                <td className="px-4 py-3">
                  <Link
                    to="/admin/projects/$id/edit"
                    params={{ id: p.id }}
                    className="font-medium text-mint-deep"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.productStatus}</td>
                <td className="px-4 py-3">{p.publicationStatus}</td>
                <td className="px-4 py-3">{statusLabelZh[p.githubSyncStatus]}</td>
                <td className="px-4 py-3">{statusLabelZh[p.canva?.status ?? "not_configured"]}</td>
                <td className="px-4 py-3">{statusLabelZh[p.demo?.status ?? "not_configured"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-card">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}
