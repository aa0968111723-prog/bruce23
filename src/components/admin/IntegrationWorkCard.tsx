import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  applyGithubFn,
  previewGithubFn,
  saveProjectFn,
  testCanvaEmbedFn,
  verifyDemoFn,
  verifyReadmeFn,
  type IntegrationWorkItem,
} from "@/lib/cms/admin-fn";
import { canvaOpenOriginalUrl } from "@/lib/canva/embed";
import { isCanvaShortLink, parseCanvaDesign } from "@/lib/canva/parse";
import {
  EXPERIENCE_MODE_LABEL,
  EXPERIENCE_MODES,
  integrationStatusLabel,
  type ExperienceMode,
  type IntegrationStatus,
} from "@/lib/cms/status";
import { githubSyncDiff, type GithubDiffRow } from "@/lib/github/diff";
import { GithubSyncDiff } from "./GithubSyncDiff";
import { toast } from "sonner";

export type { IntegrationWorkItem };

function stamp(value: string | null | undefined): string {
  return value ? value.slice(0, 16).replace("T", " ") : "尚未探測";
}

function StatusChip({ status }: { status: IntegrationStatus }) {
  return (
    <span className="inline-flex min-h-8 items-center rounded-full bg-surface-blue px-3 text-xs">
      {integrationStatusLabel[status]}
      <span className="ml-1 text-muted">{status}</span>
    </span>
  );
}

function canvaSaveFields(raw: string) {
  const value = raw.trim();
  const parsed = parseCanvaDesign(value);
  if (parsed) {
    return {
      canva_share_url: parsed.shareUrl,
      canva_embed_url: parsed.embedUrl,
      canva_design_id: parsed.designId,
    };
  }
  if (!value) {
    return { canva_share_url: null, canva_embed_url: null, canva_design_id: null };
  }
  if (isCanvaShortLink(value)) {
    return { canva_share_url: value.split("?")[0], canva_embed_url: null, canva_design_id: null };
  }
  return { canva_share_url: value, canva_embed_url: null, canva_design_id: null };
}

export function IntegrationWorkCard({
  item,
  onReload,
}: {
  item: IntegrationWorkItem;
  onReload: () => void;
}) {
  const [canvaUrl, setCanvaUrl] = useState(item.canva.url ?? "");
  const [demoUrl, setDemoUrl] = useState(item.demo.url ?? "");
  const [experienceMode, setExperienceMode] = useState(item.experienceMode ?? "");
  const [busy, setBusy] = useState(false);
  const [githubDiff, setGithubDiff] = useState<GithubDiffRow[] | null>(null);
  const [githubNote, setGithubNote] = useState<string | null>(null);

  useEffect(() => {
    setCanvaUrl(item.canva.url ?? "");
    setDemoUrl(item.demo.url ?? "");
    setExperienceMode(item.experienceMode ?? "");
    setGithubDiff(null);
    setGithubNote(null);
  }, [item]);

  const dirty = useMemo(() => {
    return (
      canvaUrl.trim() !== (item.canva.url ?? "").trim() ||
      demoUrl.trim() !== (item.demo.url ?? "").trim() ||
      (experienceMode || "") !== (item.experienceMode ?? "")
    );
  }, [canvaUrl, demoUrl, experienceMode, item]);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      toast.success(label);
      onReload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : label);
    } finally {
      setBusy(false);
    }
  }

  const original = canvaOpenOriginalUrl(canvaUrl || item.canva.url);

  return (
    <form
      className="rounded-2xl bg-surface p-5 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        const canva = canvaSaveFields(canvaUrl);
        void run("已儲存整合", () =>
          saveProjectFn({
            data: {
              id: item.id,
              ...canva,
              live_demo_url: demoUrl.trim() || null,
              experience_mode: (experienceMode || null) as ExperienceMode | null,
            },
          }),
        );
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">{item.title}</h3>
          <p className="mt-1 text-xs text-muted">{item.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex min-h-8 items-center rounded-full bg-surface-mint px-3 text-xs">
            {item.public ? "公開" : "未公開"}
          </span>
          <span className="inline-flex min-h-8 items-center rounded-full bg-surface-blue px-3 text-xs">
            {item.showExperience ? "展示體驗" : "不展示體驗"}
          </span>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-surface-blue/60 p-3">
          <dt className="text-xs text-muted">GitHub</dt>
          <dd className="mt-2">
            <StatusChip status={item.github.status} />
          </dd>
          <dd className="mt-2 text-xs text-muted">上次同步 {stamp(item.github.lastSyncedAt)}</dd>
          {item.github.error ? <dd className="mt-1 text-xs text-alert">{item.github.error}</dd> : null}
          {item.github.errorCode === "rate_limited" ? (
            <dd className="mt-1 text-xs text-alert">GitHub API 速率限制。稍後再同步，不會標記為成功。</dd>
          ) : null}
        </div>
        <div className="rounded-xl bg-surface-blue/60 p-3">
          <dt className="text-xs text-muted">Canva</dt>
          <dd className="mt-2">
            <StatusChip status={item.canva.status} />
          </dd>
          <dd className="mt-2 text-xs text-muted">上次探測 {stamp(item.canva.lastSyncedAt)}</dd>
          {item.canva.error ? <dd className="mt-1 text-xs text-alert">{item.canva.error}</dd> : null}
        </div>
        <div className="rounded-xl bg-surface-blue/60 p-3">
          <dt className="text-xs text-muted">Demo</dt>
          <dd className="mt-2">
            <StatusChip status={item.demo.status} />
          </dd>
          <dd className="mt-2 text-xs text-muted">上次驗證 {stamp(item.demo.lastVerifiedAt)}</dd>
          {item.demo.error ? <dd className="mt-1 text-xs text-alert">{item.demo.error}</dd> : null}
        </div>
      </dl>

      {dirty ? <p className="mt-3 text-sm text-muted">有未儲存的修改。</p> : null}

      <fieldset className="mt-5 grid gap-2">
        <legend className="text-sm font-medium">Canva 分享網址</legend>
        <p className="text-xs text-muted">
          貼上 canva.com/design/{"{id}"} 公開分享網址。短網址 /d/ 可以貼，但要等轉到 /design/{"{id}"} 才會嵌入。測試嵌入只會標成
          pending，不會從語法標成 verified。不要虛構設計編號。
        </p>
        <label className="grid gap-1 text-sm">
          分享網址
          <input
            className="min-h-11 rounded-xl border border-line px-3 text-sm"
            value={canvaUrl}
            onChange={(event) => {
              const value = event.target.value;
              const parsed = parseCanvaDesign(value);
              setCanvaUrl(parsed?.shareUrl ?? value);
            }}
            placeholder="https://www.canva.com/design/{id}/view"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            className="min-h-11 rounded-full bg-surface-blue px-4 text-sm disabled:opacity-50"
            onClick={() =>
              void run("Canva 測試完成：pending，未驗證", () =>
                testCanvaEmbedFn({ data: { id: item.id, url: canvaUrl || undefined } }),
              )
            }
          >
            測試嵌入
          </button>
          {original ? (
            <a
              className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
              href={original}
              target="_blank"
              rel="noreferrer"
            >
              開啟原稿
            </a>
          ) : (
            <span className="inline-flex min-h-11 items-center text-xs text-muted">沒有可開啟的公開原稿</span>
          )}
        </div>
      </fieldset>

      <fieldset className="mt-5 grid gap-2">
        <legend className="text-sm font-medium">Live demo</legend>
        <label className="grid gap-1 text-sm">
          Demo 網址
          <input
            className="min-h-11 rounded-xl border border-line px-3 text-sm"
            value={demoUrl}
            onChange={(event) => setDemoUrl(event.target.value)}
            placeholder="https://"
          />
        </label>
        <button
          type="button"
          disabled={busy}
          className="min-h-11 w-fit rounded-full bg-surface-blue px-4 text-sm disabled:opacity-50"
          onClick={() =>
            void run("已驗證 Demo 可用性", () =>
              verifyDemoFn({ data: { id: item.id, url: demoUrl || undefined } }),
            )
          }
        >
          驗證可用性
        </button>
      </fieldset>

      <fieldset className="mt-5 grid gap-2">
        <legend className="text-sm font-medium">GitHub</legend>
        <p className="break-all text-xs text-muted">{item.github.url ?? "尚未設定公開 repo"}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !item.github.url}
            className="min-h-11 rounded-full bg-surface-blue px-4 text-sm disabled:opacity-50"
            onClick={() => {
              setBusy(true);
              void previewGithubFn({ data: { id: item.id } })
                .then((result) => {
                  setGithubDiff(githubSyncDiff(result.current, result.incoming));
                  setGithubNote(
                    result.fetch.ok
                      ? `探測成功 · ${result.fetch.status}`
                      : `探測失敗 · ${result.fetch.error ?? result.fetch.errorCode ?? result.fetch.status}`,
                  );
                })
                .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "預覽失敗"))
                .finally(() => setBusy(false));
            }}
          >
            比對目前／即將寫入
          </button>
          <button
            type="button"
            disabled={busy || !item.github.url}
            className="min-h-11 rounded-full bg-ink px-4 text-sm text-bg disabled:opacity-50"
            onClick={() => void run("已同步 GitHub 中繼資料", () => applyGithubFn({ data: { id: item.id } }))}
          >
            同步 GitHub
          </button>
          <button
            type="button"
            disabled={busy || !item.github.url}
            className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card disabled:opacity-50"
            onClick={() => void run("README 探測完成", () => verifyReadmeFn({ data: { id: item.id } }))}
          >
            驗證 README
          </button>
        </div>
        {githubNote ? <p className="text-xs text-muted">{githubNote}</p> : null}
        {githubDiff ? <GithubSyncDiff rows={githubDiff} /> : null}
      </fieldset>

      <label className="mt-5 grid gap-1 text-sm">
        體驗模式
        <select
          className="min-h-11 rounded-xl border border-line px-3"
          value={experienceMode}
          onChange={(event) => setExperienceMode(event.target.value)}
        >
          <option value="">（未選）</option>
          {EXPERIENCE_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {EXPERIENCE_MODE_LABEL[mode]}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-ink px-5 text-sm text-bg disabled:opacity-50">
          儲存這件作品
        </button>
        <Link
          className="inline-flex min-h-11 items-center rounded-full bg-surface-mint px-4 text-sm"
          to="/admin/projects/$id/edit"
          params={{ id: item.id }}
        >
          編輯作品
        </Link>
        <Link
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          to="/admin/preview"
        >
          後台預覽
        </Link>
        <a
          className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-mint-deep"
          href={`/admin/draft/${item.slug}`}
        >
          預覽檢視器
        </a>
        {item.public ? (
          <a
            className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-mint-deep"
            href={`/work/${item.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            前台個案
          </a>
        ) : null}
      </div>
    </form>
  );
}
