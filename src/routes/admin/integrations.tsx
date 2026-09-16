import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  applyGithubSyncFn,
  canvaConnectStatusFn,
  connectCanvaApiFn,
  disconnectCanvaApiFn,
  listIntegrationsFn,
  previewGithubSyncFn,
  publishProjectFn,
  setExperienceModeFn,
  unpublishProjectFn,
  verifyCanvaFn,
  verifyDemoFn,
  verifyReadmeFn,
} from "@/lib/portfolio/cms-fns";
import type { ExperienceMode } from "@/lib/portfolio/types";

const MODES: Array<ExperienceMode | ""> = [
  "",
  "live-demo",
  "github-explorer",
  "canva-embed",
  "interactive-walkthrough",
  "image-comparison",
  "timeline",
  "process-map",
  "spatial-preview",
  "conversation-preview",
  "media-gallery",
];

export const Route = createFileRoute("/admin/integrations")({
  component: Integrations,
});

type Preview = Awaited<ReturnType<typeof previewGithubSyncFn>>;

function Integrations() {
  const [data, setData] = useState<Awaited<ReturnType<typeof listIntegrationsFn>> | null>(null);
  const [canva, setCanva] = useState<Awaited<ReturnType<typeof canvaConnectStatusFn>> | null>(null);
  const [previews, setPreviews] = useState<Record<string, Preview>>({});

  async function refresh() {
    const [next, connect] = await Promise.all([listIntegrationsFn(), canvaConnectStatusFn()]);
    setData(next);
    setCanva(connect);
  }
  useEffect(() => {
    void refresh();
  }, []);
  if (!data) return <p className="text-sm text-muted">載入中…</p>;
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">整合</h1>
      <p className="mt-2 text-sm text-muted">
        Canva 模式：{data.canvaMode}。Connect API {data.canvaConnectConfigured ? "憑證存在" : "未設定"}，沒有憑證就不會假裝已連接。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={async () => {
            const result = await connectCanvaApiFn();
            toast[result.ok ? "success" : "message"](result.ok ? "已連接" : result.error);
            await refresh();
          }}
        >
          連接 Canva API
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={async () => {
            await disconnectCanvaApiFn();
            toast.success("已中斷 Canva token（若有）");
            await refresh();
          }}
        >
          中斷 Canva
        </button>
      </div>
      {canva ? (
        <p className="mt-2 text-xs text-muted">
          Connect 狀態：{canva.status} · 憑證 {canva.credentialsPresent ? "有" : "無"} · 加密 {canva.encryptReady ? "就緒" : "未就緒"}
        </p>
      ) : null}
      <div className="mt-6 grid gap-4">
        {data.projects.map((project) => (
          <article key={project.id} className="rounded-2xl bg-surface p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-semibold">{project.title}</h2>
              <p className="text-xs text-muted">{project.public ? "公開" : "未公開"} · 體驗 {project.showExperience ? "開" : "關"}</p>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              <StatusBlock title="GitHub" status={project.github.status} extra={project.github.lastSyncedAt} error={project.github.error} />
              <StatusBlock title="Canva" status={project.canva.status} extra={project.canva.lastSyncedAt} error={project.canva.error} />
              <StatusBlock title="Demo" status={project.demo.status} extra={project.demo.lastVerifiedAt} error={project.demo.error} />
            </dl>
            <label className="mt-4 grid max-w-xs gap-1 text-sm">
              <span>體驗模式</span>
              <select
                className="input"
                value={project.experienceMode ?? ""}
                onChange={(event) => {
                  void setExperienceModeFn({
                    data: {
                      id: project.id,
                      experienceMode: (event.target.value || null) as ExperienceMode | null,
                    },
                  }).then(() => {
                    toast.success("已更新體驗模式");
                    return refresh();
                  });
                }}
              >
                {MODES.map((item) => (
                  <option key={item || "none"} value={item}>
                    {item || "（未選）"}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full bg-surface-blue px-4 text-sm"
                onClick={async () => {
                  const result = await previewGithubSyncFn({ data: { projectId: project.id } });
                  setPreviews((current) => ({ ...current, [project.id]: result }));
                  toast.message(result.ok ? `將變更 ${result.changingFields.length} 欄` : result.error);
                }}
              >
                預覽 GitHub
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-ink px-4 text-sm text-bg"
                onClick={async () => {
                  const result = await applyGithubSyncFn({ data: { projectId: project.id } });
                  toast[result.ok ? "success" : "error"](result.ok ? "已同步技術資料" : result.error);
                  await refresh();
                }}
              >
                同步 GitHub
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-surface-mint px-4 text-sm"
                onClick={async () => {
                  const result = await verifyReadmeFn({ data: { projectId: project.id } });
                  toast.message(result.ok ? "README 已核對" : result.error ?? "README 失敗");
                  await refresh();
                }}
              >
                核對 README
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-surface-mint px-4 text-sm"
                onClick={() => void verifyDemoFn({ data: { projectId: project.id } }).then((r) => toast.message(`Demo ${r.status}`)).then(refresh)}
              >
                驗證 Demo
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-surface-mint px-4 text-sm"
                onClick={() => void verifyCanvaFn({ data: { projectId: project.id } }).then((r) => toast.message(`Canva ${r.status}`)).then(refresh)}
              >
                測試 Canva
              </button>
              <Link to="/admin/projects/$id/edit" params={{ id: project.id }} className="inline-flex min-h-11 items-center text-sm text-mint-deep">
                編輯來源／封面
              </Link>
              <Link to="/admin/preview" className="inline-flex min-h-11 items-center text-sm text-mint-deep">
                預覽草稿
              </Link>
              <Link to="/work/$slug" params={{ slug: project.slug }} className="inline-flex min-h-11 items-center text-sm text-mint-deep">
                預覽公開頁
              </Link>
              {project.public ? (
                <button type="button" className="min-h-11 text-sm" onClick={() => void unpublishProjectFn({ data: { id: project.id } }).then(refresh)}>
                  下架
                </button>
              ) : (
                <button type="button" className="min-h-11 text-sm" onClick={() => void publishProjectFn({ data: { id: project.id } }).then(refresh)}>
                  發布整合內容
                </button>
              )}
            </div>
            {previews[project.id] ? <GithubPreview preview={previews[project.id]!} /> : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function GithubPreview({ preview }: { preview: Preview }) {
  if (!preview.ok) {
    return (
      <p className="mt-3 text-sm">
        無法預覽：{preview.error}
        {"rateLimited" in preview && preview.rateLimited ? "（GitHub 速率限制）" : ""}
      </p>
    );
  }
  return (
    <div className="mt-4 rounded-xl bg-surface-blue/70 p-3 text-sm">
      <p className="text-xs text-muted">上次同步：{preview.lastSyncedAt ?? "尚未"} · 敘事欄不會被覆蓋</p>
      <p className="mt-2 font-medium">
        GitHub 最新：{preview.incoming.name} · {preview.incoming.branch}
      </p>
      <p className="text-xs text-muted">{preview.incoming.description ?? "無描述"}</p>
      {preview.changingFields.length === 0 ? (
        <p className="mt-2 text-xs">沒有技術欄差異。</p>
      ) : (
        <ul className="mt-2 grid gap-1 text-xs">
          {preview.changingFields.map((field) => (
            <li key={field.field}>
              {field.field}：{field.from} → {field.to}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBlock({
  title,
  status,
  extra,
  error,
}: {
  title: string;
  status: string;
  extra: string | null;
  error: string | null;
}) {
  return (
    <div className="rounded-xl bg-surface-blue/70 p-3">
      <dt className="text-xs text-muted">{title}</dt>
      <dd className="mt-1 font-medium">{status}</dd>
      {extra ? <p className="text-xs text-muted">{extra}</p> : null}
      {error ? <p className="text-xs">{error}</p> : null}
    </div>
  );
}
