import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getCanvaConnectStatus,
  listIntegrations,
  setAdminPublication,
  syncGithubProject,
  testCanvaEmbed,
  verifyGithubReadme,
  verifyLiveDemoProject,
} from "@/lib/portfolio/server-admin";

export const Route = createFileRoute("/admin/integrations")({
  component: Integrations,
});

function Integrations() {
  const [data, setData] = useState<Awaited<ReturnType<typeof listIntegrations>> | null>(null);
  const [canva, setCanva] = useState<Awaited<ReturnType<typeof getCanvaConnectStatus>> | null>(null);

  const reload = () => {
    listIntegrations().then(setData);
    getCanvaConnectStatus().then(setCanva);
  };

  useEffect(() => {
    reload();
  }, []);

  if (!data) return <p className="text-sm text-muted">載入整合狀態…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Integrations</h1>
      <p className="mt-2 text-sm text-muted">
        Canva：{canva?.mode === "public_embed" ? "公開嵌入模式" : canva?.status}。
        GitHub token：{data.githubTokenConfigured ? "已在伺服器設定" : "未設定（公開庫仍可讀）"}。
      </p>
      <div className="mt-6 grid gap-4">
        {data.projects.map((project) => (
          <article key={project.id} className="rounded-2xl bg-surface p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">{project.title}</h2>
                <p className="text-xs text-muted">{project.slug}</p>
              </div>
              <Link
                to="/admin/projects/$id/edit"
                params={{ id: project.id }}
                className="text-sm text-mint-deep"
              >
                編輯
              </Link>
            </div>
            <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-3">
              <li>GitHub {String(project.github.status)}</li>
              <li>Canva {String(project.canva.status)}</li>
              <li>Demo {String(project.demo.status)}</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-4 text-sm"
                onClick={async () => {
                  const result = await syncGithubProject({ data: { id: project.id, apply: true } });
                  toast.message(result.ok ? "GitHub 已同步" : result.error);
                  reload();
                }}
              >
                同步 GitHub
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-4 text-sm"
                onClick={async () => {
                  const result = await verifyGithubReadme({ data: { id: project.id } });
                  toast.message(result.ok ? "README 可讀" : "README 失敗");
                }}
              >
                驗證 README
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-4 text-sm"
                onClick={async () => {
                  const result = await verifyLiveDemoProject({ data: { id: project.id } });
                  toast.message(result.ok ? "Demo verified" : String(result.status));
                  reload();
                }}
              >
                驗證 Demo
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-4 text-sm"
                onClick={async () => {
                  const result = await testCanvaEmbed({
                    data: { id: project.id, url: String(project.canva.embedUrl ?? "") },
                  });
                  toast.message(result.ok ? "Canva OK" : result.error);
                  reload();
                }}
              >
                測試 Canva
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-bg"
                onClick={async () => {
                  const next = project.publication_status === "published" ? "unpublished" : "published";
                  await setAdminPublication({ data: { id: project.id, status: next } });
                  toast.success(next);
                  reload();
                }}
              >
                {project.publication_status === "published" ? "取消發布" : "發布"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
