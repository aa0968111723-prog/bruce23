import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  applyCanvaDesignFn,
  applyGithubFn,
  connectCanvaFn,
  disconnectCanvaFn,
  exportCanvaDesignFn,
  getCanvaConnectFn,
  getCanvaDesignFn,
  hydrateGithubFn,
  listIntegrationsFn,
  publishProjectFn,
  searchCanvaDesignsFn,
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

type CanvaStatus = Awaited<ReturnType<typeof getCanvaConnectFn>>;
type DesignCard = Awaited<ReturnType<typeof searchCanvaDesignsFn>>["items"][number];

function IntegrationsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof listIntegrationsFn>> | null>(null);
  const [canva, setCanva] = useState<CanvaStatus | null>(null);
  const [query, setQuery] = useState("");
  const [designs, setDesigns] = useState<DesignCard[]>([]);
  const [continuation, setContinuation] = useState<string | null>(null);
  const [searchNote, setSearchNote] = useState<string | null>(null);
  const [selected, setSelected] = useState<DesignCard | null>(null);
  const [projectId, setProjectId] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [busy, setBusy] = useState(false);

  function reload() {
    void listIntegrationsFn().then(setData);
    void getCanvaConnectFn().then(setCanva);
  }

  useEffect(() => {
    reload();
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("canva");
    if (flag === "connected") toast.success("Canva 授權已寫入伺服器");
    if (flag === "error") toast.error("Canva 授權被拒絕或失敗，未標記為已連線");
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

  async function startConnect() {
    setBusy(true);
    try {
      const result = await connectCanvaFn();
      setCanva({ ...result, canEditInApp: false });
      if (result.ok && result.authorizeUrl) {
        window.location.assign(result.authorizeUrl);
        return;
      }
      toast.error(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "無法開始 Canva 授權");
    } finally {
      setBusy(false);
    }
  }

  async function search(next = false) {
    setBusy(true);
    setSearchNote(null);
    try {
      const result = await searchCanvaDesignsFn({
        data: { query, continuation: next ? continuation ?? undefined : undefined },
      });
      setDesigns(next ? [...designs, ...result.items] : result.items);
      setContinuation(result.continuation ?? null);
      setSearchNote(result.items.length ? `找到 ${result.items.length} 件` : "沒有符合的設計");
    } catch (err) {
      if (!next) setDesigns([]);
      setSearchNote(err instanceof Error ? err.message : "搜尋失敗");
    } finally {
      setBusy(false);
    }
  }

  async function selectDesign(item: DesignCard) {
    setSelected(item);
    setBusy(true);
    try {
      const detail = await getCanvaDesignFn({ data: { designId: item.id } });
      setSelected(detail);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "讀取設計失敗");
    } finally {
      setBusy(false);
    }
  }

  const connected = Boolean(canva?.connected);
  const notConfigured = canva?.status === "not_configured";

  return (
    <div>
      <h1 className="font-display text-3xl">整合</h1>
      <p className="mt-2 text-sm text-muted">狀態只反映真實探測。失敗不會顯示成成功。</p>

      <div className="mt-6 rounded-2xl bg-surface p-5 shadow-card">
        <h2 className="font-display text-xl">Canva Connect</h2>
        <p className="mt-2 text-sm">{canva?.message}</p>
        <p className="mt-1 text-xs text-muted">
          模式 {canva?.mode}
          {notConfigured ? " · 公開嵌入模式" : ""} · {canva?.status}
          {canva?.lastSyncAt ? ` · 上次同步 ${canva.lastSyncAt.slice(0, 16)}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            className="min-h-11 rounded-full bg-surface-blue px-4 text-sm disabled:opacity-50"
            onClick={() => void startConnect()}
          >
            {connected ? "重新授權 Canva" : "連接 Canva API"}
          </button>
          <button
            type="button"
            disabled={busy || !canva?.canDisconnect}
            className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card disabled:opacity-50"
            onClick={() => void act("已中斷 Canva", () => disconnectCanvaFn())}
          >
            中斷連線
          </button>
        </div>
        {notConfigured ? (
          <p className="mt-3 text-xs text-muted">
            Connect 按鈕不會假裝成功。公開作品仍可用分享網址嵌入。授權開始／回呼在憑證缺失時會回傳設定錯誤。
          </p>
        ) : null}

        {connected ? (
          <div className="mt-5 grid gap-3">
            <div className="flex flex-wrap gap-2">
              <input
                className="min-h-11 min-w-56 flex-1 rounded-xl border border-line px-3 text-sm"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜尋設計標題"
                onKeyDown={(event) => {
                  if (event.key === "Enter") void search();
                }}
              />
              <button
                type="button"
                disabled={busy}
                className="min-h-11 rounded-full bg-ink px-4 text-sm text-bg"
                onClick={() => void search()}
              >
                搜尋設計
              </button>
            </div>
            {searchNote ? <p className="text-xs text-muted">{searchNote}</p> : null}
            {continuation ? (
              <button
                type="button"
                disabled={busy}
                className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card"
                onClick={() => void search(true)}
              >
                載入更多
              </button>
            ) : null}
            <ul className="grid gap-2">
              {designs.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`flex w-full min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-left ${
                      selected?.id === item.id ? "bg-surface-mint" : "bg-surface-blue/60"
                    }`}
                    onClick={() => void selectDesign(item)}
                  >
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt="" className="size-12 rounded-lg object-cover" />
                    ) : (
                      <span className="grid size-12 place-items-center rounded-lg bg-surface text-xs text-muted">
                        {item.pageCount ?? "—"}
                      </span>
                    )}
                    <span>
                      <span className="block font-medium">{item.title}</span>
                      <span className="text-xs text-muted">
                        {item.id}
                        {item.pageCount ? ` · ${item.pageCount} 頁` : ""}
                        {item.temporaryUrls ? " · 暫時檢視網址" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {selected ? (
              <div className="rounded-2xl bg-surface-mint p-4">
                <p className="font-medium">{selected.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {selected.pageCount ? `${selected.pageCount} 頁` : "頁數未知"}
                  {selected.pages?.length ? ` · ${selected.pages.join(" / ")}` : ""}
                  {selected.updatedAt ? ` · 更新 ${selected.updatedAt.slice(0, 10)}` : ""}
                  {selected.thumbnailUrl ? " · 暫時縮圖" : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.editUrl ? (
                    <a
                      className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-bg"
                      href={selected.editUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      在 Canva 編輯
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card"
                    onClick={() =>
                      void exportCanvaDesignFn({ data: { designId: selected.id, format: "png" } })
                        .then((job) => {
                          if (job.urls[0]) window.open(job.urls[0], "_blank", "noopener,noreferrer");
                          else toast.error(job.error ?? "PNG 匯出尚未完成");
                        })
                        .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "匯出失敗"))
                    }
                  >
                    匯出 PNG
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card"
                    onClick={() =>
                      void exportCanvaDesignFn({ data: { designId: selected.id, format: "pdf" } })
                        .then((job) => {
                          if (job.urls[0]) window.open(job.urls[0], "_blank", "noopener,noreferrer");
                          else toast.error(job.error ?? "PDF 匯出尚未完成");
                        })
                        .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "匯出失敗"))
                    }
                  >
                    匯出 PDF
                  </button>
                </div>
                <label className="mt-3 grid gap-1 text-sm">
                  套用到作品
                  <select
                    className="min-h-11 rounded-xl border border-line px-3"
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                  >
                    <option value="">選擇作品</option>
                    {data?.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-2 grid gap-1 text-sm">
                  公開分享網址（可選，用於訪客嵌入）
                  <input
                    className="min-h-11 rounded-xl border border-line px-3"
                    value={shareUrl}
                    onChange={(event) => setShareUrl(event.target.value)}
                    placeholder="https://www.canva.com/design/…/view 或 /d/ 短網址"
                  />
                </label>
                <button
                  type="button"
                  disabled={!projectId}
                  className="mt-3 min-h-11 rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  onClick={() =>
                    void applyCanvaDesignFn({
                      data: {
                        projectId,
                        designId: selected.id,
                        publicShareUrl: shareUrl || undefined,
                      },
                    })
                      .then((result) => {
                        toast.success(result.message);
                        reload();
                      })
                      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "套用失敗"))
                  }
                >
                  更新作品 Canva 來源
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl bg-surface p-5 shadow-card">
        <h2 className="font-display text-xl">Notion</h2>
        <p className="mt-2 text-sm">{data?.notion.message ?? "Notion 未連接。不會假裝已同步任何頁面。"}</p>
        <p className="mt-1 text-xs text-muted">
          狀態 {data?.notion.status ?? "not_configured"}
          {data?.notion.connected ? "" : " · 未連接"}
        </p>
        <p className="mt-3 text-xs text-muted">沒有 OAuth 憑證，不會列出頁面，也不提供同步按鈕。</p>
      </div>

      <p className="mt-4 text-xs text-muted">
        GitHub token：{data?.githubTokenConfigured ? "伺服器已設定（不會送到前端）" : "未設定，只讀公開 repo"}
      </p>
      <button
        type="button"
        className="mt-3 min-h-11 rounded-full bg-ink px-4 text-sm text-bg"
        onClick={() =>
          void (async () => {
            try {
              const result = await hydrateGithubFn();
              if (result.rateLimited) {
                toast.error("GitHub API 速率限制。稍後再同步，不會標記為成功。");
              } else {
                toast.success("已嘗試同步待處理 GitHub");
              }
              reload();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "同步失敗");
            }
          })()
        }
      >
        同步所有待處理 GitHub
      </button>
      <ul className="mt-6 grid gap-3">
        {data?.items.map((item) => (
          <li key={item.id} className="rounded-2xl bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-lg">{item.title}</p>
              <span className="text-xs text-muted">{item.public ? "公開" : "未公開"}</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              GitHub {integrationStatusLabel[item.github.status]}
              {item.github.lastSyncedAt ? ` · 上次探測 ${item.github.lastSyncedAt.slice(0, 16)}` : " · 尚未探測"}
              {" · "}
              Canva {integrationStatusLabel[item.canva.status]}
              {item.canva.lastSyncedAt ? ` · 上次探測 ${item.canva.lastSyncedAt.slice(0, 16)}` : " · 尚未探測"}
              {" · "}
              Demo {integrationStatusLabel[item.demo.status]}
              {item.demo.lastVerifiedAt ? ` · 上次探測 ${item.demo.lastVerifiedAt.slice(0, 16)}` : " · 尚未探測"}
            </p>
            {item.github.error ? <p className="text-xs text-alert">{item.github.error}</p> : null}
            {item.github.errorCode === "rate_limited" ? (
              <p className="text-xs text-alert">GitHub API 速率限制。稍後再同步，不會標記為成功。</p>
            ) : null}
            {item.canva.error ? <p className="text-xs text-alert">{item.canva.error}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full bg-surface-blue px-3 text-sm"
                onClick={() => void act("已同步", () => applyGithubFn({ data: { id: item.id } }))}
              >
                同步 GitHub
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-surface-blue px-3 text-sm"
                onClick={() => void act("README", () => verifyReadmeFn({ data: { id: item.id } }))}
              >
                驗證 README
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-surface-blue px-3 text-sm"
                onClick={() => void act("Demo", () => verifyDemoFn({ data: { id: item.id } }))}
              >
                驗證 Demo
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-surface-blue px-3 text-sm"
                onClick={() => void act("Canva", () => testCanvaEmbedFn({ data: { id: item.id } }))}
              >
                測試嵌入
              </button>
              <Link
                className="inline-flex min-h-11 items-center rounded-full bg-surface-mint px-3 text-sm"
                to="/admin/projects/$id/edit"
                params={{ id: item.id }}
              >
                選體驗／封面
              </Link>
              <a
                className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-mint-deep"
                href={`/work/${item.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                預覽前台
              </a>
              {item.public ? (
                <button
                  type="button"
                  className="min-h-11 rounded-full px-3 text-sm"
                  onClick={() => void act("已取消發布", () => unpublishProjectFn({ data: { id: item.id } }))}
                >
                  取消發布
                </button>
              ) : (
                <button
                  type="button"
                  className="min-h-11 rounded-full bg-mint px-3 text-sm"
                  onClick={() => void act("已發布", () => publishProjectFn({ data: { id: item.id } }))}
                >
                  發布整合
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
