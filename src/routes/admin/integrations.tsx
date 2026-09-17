import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EXPERIENCE_MODES } from "@/lib/portfolio/constants";
import {
  disconnectCanvaApi,
  getCanvaConnectStatus,
  listIntegrations,
  searchCanvaDesigns,
  setAdminPublication,
  startCanvaConnect,
  syncGithubProject,
  testCanvaEmbed,
  updateAdminIntegration,
  verifyGithubReadme,
  verifyLiveDemoProject,
} from "@/lib/portfolio/server-admin";

export const Route = createFileRoute("/admin/integrations")({
  component: Integrations,
});

function Integrations() {
  const [data, setData] = useState<Awaited<ReturnType<typeof listIntegrations>> | null>(null);
  const [canva, setCanva] = useState<Awaited<ReturnType<typeof getCanvaConnectStatus>> | null>(null);
  const [designs, setDesigns] = useState<Array<{ id: string; title?: string; viewUrl?: string }>>([]);
  const [canvaUrl, setCanvaUrl] = useState<Record<string, string>>({});
  const [cover, setCover] = useState<Record<string, string>>({});

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
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={async () => {
            const result = await startCanvaConnect();
            if ("authorizeUrl" in result && result.authorizeUrl) {
              window.location.href = result.authorizeUrl;
              return;
            }
            toast.message(
              result.mode === "public_embed" ? "公開嵌入模式（未設定 Connect API）" : String(result.status),
            );
          }}
        >
          連接 Canva API
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={async () => {
            const result = await searchCanvaDesigns({ data: {} });
            if (result.mode === "public_embed") {
              toast.message("公開嵌入模式，沒有站內 Canva 編輯。");
              return;
            }
            setDesigns(result.designs);
            toast.message(result.status === "connected" ? `找到 ${result.designs.length} 件` : "尚未連線或搜尋失敗");
          }}
        >
          搜尋 Canva 設計
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={async () => {
            await disconnectCanvaApi();
            toast.success("已中斷 Connect（公開嵌入仍可用）");
            reload();
          }}
        >
          中斷 Connect
        </button>
      </div>
      {designs.length > 0 ? (
        <ul className="mt-4 grid gap-2 text-sm">
          {designs.map((item) => (
            <li key={item.id} className="rounded-xl bg-surface px-3 py-2 shadow-card">
              {item.title ?? item.id}
              {item.viewUrl ? (
                <a href={item.viewUrl} className="ml-2 text-mint-deep" rel="noreferrer" target="_blank">
                  開啟
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 grid gap-4">
        {data.projects.map((project) => (
          <article key={project.id} className="rounded-2xl bg-surface p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">{project.title}</h2>
                <p className="text-xs text-muted">
                  {project.slug} · 公開頁 {project.publication_status === "published" ? "會顯示" : "不會顯示"} · 體驗{" "}
                  {project.showExperience ? "開" : "關"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/admin/projects/$id/edit"
                  params={{ id: project.id }}
                  className="inline-flex min-h-11 items-center text-sm text-mint-deep"
                >
                  編輯
                </Link>
                <Link
                  to="/work/$slug"
                  params={{ slug: project.slug }}
                  className="inline-flex min-h-11 items-center text-sm text-muted"
                >
                  預覽公開頁
                </Link>
                <Link
                  to="/admin/preview"
                  search={{ slug: project.slug }}
                  className="inline-flex min-h-11 items-center text-sm text-muted"
                >
                  草稿預覽
                </Link>
              </div>
            </div>
            <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-3">
              <li>
                GitHub {String(project.github.status)}
                {project.github.public ? " · 公開" : " · 非公開"}
                {project.github.lastSyncedAt ? ` · ${String(project.github.lastSyncedAt)}` : ""}
                {project.github.error ? ` · ${String(project.github.error)}` : ""}
              </li>
              <li>
                Canva {String(project.canva.status)}
                {project.canva.lastSyncedAt ? ` · ${String(project.canva.lastSyncedAt)}` : ""}
                {project.canva.error ? ` · ${String(project.canva.error)}` : ""}
              </li>
              <li>
                Demo {String(project.demo.status)}
                {project.demo.lastVerifiedAt ? ` · ${String(project.demo.lastVerifiedAt)}` : ""}
                {project.demo.error ? ` · ${String(project.demo.error)}` : ""}
              </li>
            </ul>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                體驗模式
                <select
                  className="min-h-11 rounded-xl border border-line px-3"
                  defaultValue={project.experience_mode}
                  onChange={async (event) => {
                    await updateAdminIntegration({
                      data: {
                        id: project.id,
                        experience_mode: event.target.value as (typeof EXPERIENCE_MODES)[number],
                      },
                    });
                    toast.success("體驗模式已更新");
                    reload();
                  }}
                >
                  {EXPERIENCE_MODES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                Canva 分享連結
                <input
                  className="min-h-11 rounded-xl border border-line px-3"
                  value={canvaUrl[project.id] ?? String(project.canva.embedUrl ?? "")}
                  onChange={(event) => setCanvaUrl((current) => ({ ...current, [project.id]: event.target.value }))}
                />
              </label>
              <label className="grid gap-1 text-sm">
                更新封面 URL
                <input
                  className="min-h-11 rounded-xl border border-line px-3"
                  value={cover[project.id] ?? ""}
                  onChange={(event) => setCover((current) => ({ ...current, [project.id]: event.target.value }))}
                />
              </label>
            </div>
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
                    data: { id: project.id, url: canvaUrl[project.id] || String(project.canva.embedUrl ?? "") },
                  });
                  toast.message(result.ok ? "Canva OK" : result.error);
                  reload();
                }}
              >
                測試嵌入
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-4 text-sm"
                onClick={async () => {
                  await updateAdminIntegration({
                    data: {
                      id: project.id,
                      canva_share_url: canvaUrl[project.id],
                      canva_thumbnail_url: cover[project.id] || undefined,
                    },
                  });
                  toast.success("封面／Canva 已更新");
                  reload();
                }}
              >
                加入 Canva / 更新封面
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
                {project.publication_status === "published" ? "取消發布整合內容" : "發布整合內容"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
