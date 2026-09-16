import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  applyGithubFn,
  connectCanvaFn,
  getCanvaConnectFn,
  listIntegrationsFn,
  publishProjectFn,
  testCanvaEmbedFn,
  unpublishProjectFn,
  verifyDemoFn,
  verifyReadmeFn,
} from "@/lib/cms/admin-fn";
import { integrationStatusLabel } from "@/lib/cms/status";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/integrations")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof listIntegrationsFn>> | null>(null);
  const [canva, setCanva] = useState<Awaited<ReturnType<typeof getCanvaConnectFn>> | null>(null);

  function reload() {
    void listIntegrationsFn().then(setData);
    void getCanvaConnectFn().then(setCanva);
  }

  useEffect(() => {
    reload();
  }, []);

  async function act(label: string, fn: () => Promise<unknown>) {
    try {
      await fn();
      toast.success(label);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : label);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl">整合</h1>
      <p className="mt-2 text-sm text-muted">
        狀態只反映真實探測。失敗不會顯示成成功。
      </p>
      <div className="mt-6 rounded-2xl bg-surface p-5 shadow-card">
        <h2 className="font-display text-xl">Canva Connect</h2>
        <p className="mt-2 text-sm">{canva?.message}</p>
        <p className="mt-1 text-xs text-muted">模式 {canva?.mode} · {canva?.status}</p>
        <button
          type="button"
          className="mt-3 min-h-11 rounded-full bg-surface-blue px-4 text-sm"
          onClick={() => void act("Canva 連線狀態已更新", () => connectCanvaFn())}
        >
          連接 Canva API
        </button>
      </div>
      <p className="mt-4 text-xs text-muted">
        GitHub token：{data?.githubTokenConfigured ? "伺服器已設定（不會送到前端）" : "未設定，只讀公開 repo"}
      </p>
      <ul className="mt-6 grid gap-3">
        {data?.items.map((item) => (
          <li key={item.id} className="rounded-2xl bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-lg">{item.title}</p>
              <span className="text-xs text-muted">{item.public ? "公開" : "未公開"}</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              GitHub {integrationStatusLabel[item.github.status]} · Canva {integrationStatusLabel[item.canva.status]} · Demo {integrationStatusLabel[item.demo.status]}
            </p>
            {item.github.error ? <p className="text-xs text-alert">{item.github.error}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="min-h-11 rounded-full bg-surface-blue px-3 text-sm" onClick={() => void act("已同步", () => applyGithubFn({ data: { id: item.id } }))}>同步 GitHub</button>
              <button type="button" className="min-h-11 rounded-full bg-surface-blue px-3 text-sm" onClick={() => void act("README", () => verifyReadmeFn({ data: { id: item.id } }))}>驗證 README</button>
              <button type="button" className="min-h-11 rounded-full bg-surface-blue px-3 text-sm" onClick={() => void act("Demo", () => verifyDemoFn({ data: { id: item.id } }))}>驗證 Demo</button>
              <button type="button" className="min-h-11 rounded-full bg-surface-blue px-3 text-sm" onClick={() => void act("Canva", () => testCanvaEmbedFn({ data: { id: item.id } }))}>測試嵌入</button>
              <Link className="inline-flex min-h-11 items-center rounded-full bg-surface-mint px-3 text-sm" to="/admin/projects/$id/edit" params={{ id: item.id }}>選體驗／封面</Link>
              <a className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-mint-deep" href={`/work/${item.slug}`} target="_blank" rel="noreferrer">預覽前台</a>
              {item.public ? (
                <button type="button" className="min-h-11 rounded-full px-3 text-sm" onClick={() => void act("已取消發布", () => unpublishProjectFn({ data: { id: item.id } }))}>取消發布</button>
              ) : (
                <button type="button" className="min-h-11 rounded-full bg-mint px-3 text-sm" onClick={() => void act("已發布", () => publishProjectFn({ data: { id: item.id } }))}>發布整合</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
