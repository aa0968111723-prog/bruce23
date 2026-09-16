import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  applyGithubSyncFn,
  disconnectCanvaFn,
  getCanvaConnectStatusFn,
  getIntegrationsOverviewFn,
  setPublicationFn,
  startCanvaConnectFn,
  testCanvaEmbedFn,
  verifyLiveDemoFn,
  verifyReadmeFn,
} from "@/lib/cms/admin-fns";
import { statusLabelZh } from "@/lib/integrations/status";

export const Route = createFileRoute("/admin/integrations")({
  component: Integrations,
});

function Integrations() {
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof getIntegrationsOverviewFn>> | null>(null);
  const [canva, setCanva] = useState<Awaited<ReturnType<typeof getCanvaConnectStatusFn>> | null>(null);
  useEffect(() => {
    void getIntegrationsOverviewFn().then(setOverview).catch(() => undefined);
    void getCanvaConnectStatusFn().then(setCanva).catch(() => undefined);
  }, []);
  if (!overview || !canva) return <p className="text-sm text-muted">載入中…</p>;
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">整合</h1>
      <section className="mt-6 rounded-2xl bg-surface p-5 shadow-card">
        <h2 className="font-display text-xl">Canva</h2>
        {canva.mode === "public_embed" ? (
          <p className="mt-2 text-sm text-muted">
            目前是公開嵌入模式。沒有 Connect 憑證，不會假裝已 OAuth，也不提供站內編輯。請到 Canva 官方編輯器修改，再貼回分享連結。
          </p>
        ) : (
          <div className="mt-2 space-y-2 text-sm">
            <p>Connect {canva.connected ? "已連線" : "尚未連線"}。</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full bg-ink px-4 text-bg"
                onClick={async () => {
                  const result = await startCanvaConnectFn();
                  if (!result.ok) toast.error(result.error);
                  else window.location.assign(result.authorizeUrl);
                }}
              >
                連接 Canva API
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-surface px-4 shadow-card"
                onClick={async () => {
                  await disconnectCanvaFn();
                  toast.success("已中斷 Connect");
                }}
              >
                中斷
              </button>
            </div>
          </div>
        )}
        <p className="mt-2 text-xs text-muted">
          GitHub 讀取權杖：{overview.githubTokenConfigured ? "伺服器已設定（不會送到瀏覽器）" : "未設定，只讀公開庫"}
        </p>
      </section>

      <ul className="mt-6 grid gap-3">
        {overview.projects.map((p) => (
          <li key={p.id} className="rounded-2xl bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted">
                  GitHub {statusLabelZh[p.github.status]} · Canva {statusLabelZh[p.canva.status]} · Demo{" "}
                  {statusLabelZh[p.demo.status]} · {p.publicationStatus}
                  {p.showExperience ? " · 公開體驗開啟" : " · 公開體驗關閉"}
                </p>
              </div>
              <Link
                to="/admin/projects/$id/edit"
                params={{ id: p.id }}
                className="min-h-11 text-sm text-mint-deep"
              >
                編輯
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Action label="同步 GitHub" onClick={() => applyGithubSyncFn({ data: { id: p.id } })} />
              <Action label="驗證 README" onClick={() => verifyReadmeFn({ data: { id: p.id } })} />
              <Action label="測試 Demo" onClick={() => verifyLiveDemoFn({ data: { id: p.id } })} />
              <Action label="測試 Canva" onClick={() => testCanvaEmbedFn({ data: { id: p.id } })} />
              <Action
                label={p.publicationStatus === "published" ? "取消發布整合內容" : "發布"}
                onClick={() =>
                  setPublicationFn({
                    data: {
                      id: p.id,
                      status: p.publicationStatus === "published" ? "unpublished" : "published",
                    },
                  })
                }
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Action({
  label,
  onClick,
}: {
  label: string;
  onClick: () => Promise<object | null | undefined | void>;
}) {
  return (
    <button
      type="button"
      className="min-h-11 rounded-full bg-surface-blue px-3 text-sm"
      onClick={async () => {
        try {
          const result = await onClick();
          if (result && typeof result === "object" && "ok" in result && result.ok === false) {
            toast.error("error" in result && typeof result.error === "string" ? result.error : "失敗");
            return;
          }
          toast.success(`${label}完成`);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "失敗");
        }
      }}
    >
      {label}
    </button>
  );
}
