import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  applyGithubFn,
  archiveProjectFn,
  listRevisionsFn,
  previewGithubFn,
  publishProjectFn,
  restoreProjectFn,
  restoreRevisionFn,
  saveDraftFn,
  saveProjectFn,
  testCanvaEmbedFn,
  unpublishProjectFn,
  verifyDemoFn,
} from "@/lib/cms/admin-fn";
import type { AdminProject } from "@/lib/cms/store";
import { EXPERIENCE_MODES, PRODUCT_STATUSES, PROJECT_CATEGORIES } from "@/lib/cms/status";
import type { ProjectInput } from "@/lib/cms/schema";

function toForm(project: AdminProject): ProjectInput {
  const { id: _id, created_at: _c, updated_at: _u, updated_by: _b, published_at: _p, ...rest } = project;
  return rest;
}

export function ProjectForm({ project }: { project: AdminProject }) {
  const [form, setForm] = useState<ProjectInput>(() => toForm(project));
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<Array<{ id: string; note: string | null; created_at: string }>>([]);
  const [githubPreview, setGithubPreview] = useState<string | null>(null);

  const initial = useMemo(() => JSON.stringify(toForm(project)), [project]);

  useEffect(() => {
    setForm(toForm(project));
    setDirty(false);
  }, [project]);

  useEffect(() => {
    setDirty(JSON.stringify(form) !== initial);
  }, [form, initial]);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  useEffect(() => {
    void listRevisionsFn({ data: { id: project.id } }).then(setRevisions).catch(() => undefined);
  }, [project.id]);

  function patch<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function run(label: string, fn: () => Promise<unknown>) {
    try {
      await fn();
      setStatus(`${label}成功`);
      toast.success(`${label}成功`);
      setDirty(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : `${label}失敗`;
      setStatus(message);
      toast.error(message);
    }
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void run("儲存", () => saveProjectFn({ data: { id: project.id, ...form } }));
      }}
    >
      {status ? <p className="rounded-xl bg-surface-mint px-4 py-3 text-sm">{status}</p> : null}
      {dirty ? <p className="text-sm text-muted">有未儲存的修改。</p> : null}

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg">敘事</legend>
        <Field label="標題" value={form.title} onChange={(value) => patch("title", value)} />
        <Field label="副標" value={form.subtitle} onChange={(value) => patch("subtitle", value)} />
        <Field label="slug" value={form.slug} onChange={(value) => patch("slug", value)} />
        <label className="grid gap-1 text-sm">
          分類
          <select
            className="min-h-11 rounded-xl border border-line px-3"
            value={form.category}
            onChange={(event) => patch("category", event.target.value as ProjectInput["category"])}
          >
            {PROJECT_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          產品狀態
          <select
            className="min-h-11 rounded-xl border border-line px-3"
            value={form.product_status}
            onChange={(event) => patch("product_status", event.target.value as ProjectInput["product_status"])}
          >
            {PRODUCT_STATUSES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => patch("featured", event.target.checked)}
          />
          精選
        </label>
        <Field
          label="排序"
          value={String(form.sort_order)}
          onChange={(value) => patch("sort_order", Number(value) || 0)}
        />
        <Area label="摘要" value={form.summary} onChange={(value) => patch("summary", value)} />
        <Area label="問題" value={form.problem} onChange={(value) => patch("problem", value)} />
        <Area label="角色" value={form.role} onChange={(value) => patch("role", value)} />
        <Area label="決策（一行一項）" value={form.decisions.join("\n")} onChange={(value) => patch("decisions", splitLines(value))} />
        <Area label="限制" value={form.limitations.join("\n")} onChange={(value) => patch("limitations", splitLines(value))} />
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg">GitHub</legend>
        <Field label="GitHub URL" value={form.github_url ?? ""} onChange={(value) => patch("github_url", value)} />
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.github_sync_enabled}
            onChange={(event) => patch("github_sync_enabled", event.target.checked)}
          />
          允許同步（不會覆蓋中文敘事）
        </label>
        <p className="text-xs text-muted">狀態 {form.github_sync_status} · 上次 {form.github_last_synced_at ?? "尚未"}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 rounded-full bg-surface-blue px-4 text-sm"
            onClick={() =>
              void previewGithubFn({ data: { id: project.id, url: form.github_url ?? undefined } })
                .then((result) =>
                  setGithubPreview(
                    JSON.stringify(
                      { current: result.current, incoming: result.incoming, fetch: result.fetch },
                      null,
                      2,
                    ),
                  ),
                )
                .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "預覽失敗"))
            }
          >
            預覽同步
          </button>
          <button
            type="button"
            className="min-h-11 rounded-full bg-ink px-4 text-sm text-bg"
            onClick={() =>
              void run("同步 GitHub", () =>
                applyGithubFn({ data: { id: project.id, url: form.github_url ?? undefined } }),
              )
            }
          >
            同步 GitHub
          </button>
        </div>
        {githubPreview ? (
          <pre className="max-h-64 overflow-auto rounded-xl bg-surface-blue p-3 text-xs">{githubPreview}</pre>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg">Canva / Demo / 體驗</legend>
        <Field label="Canva 分享" value={form.canva_share_url ?? ""} onChange={(value) => patch("canva_share_url", value)} />
        <Field label="Canva 嵌入" value={form.canva_embed_url ?? ""} onChange={(value) => patch("canva_embed_url", value)} />
        <Field label="封面" value={form.canva_thumbnail_url ?? ""} onChange={(value) => patch("canva_thumbnail_url", value)} />
        <Field label="Demo URL" value={form.live_demo_url ?? ""} onChange={(value) => patch("live_demo_url", value)} />
        <Field label="Demo 標籤" value={form.live_demo_label ?? ""} onChange={(value) => patch("live_demo_label", value)} />
        <label className="grid gap-1 text-sm">
          體驗模式
          <select
            className="min-h-11 rounded-xl border border-line px-3"
            value={form.experience_mode ?? ""}
            onChange={(event) =>
              patch("experience_mode", (event.target.value || null) as ProjectInput["experience_mode"])
            }
          >
            <option value="">（未選）</option>
            {EXPERIENCE_MODES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 rounded-full bg-surface-blue px-4 text-sm"
            onClick={() =>
              void run("Canva 測試", () =>
                testCanvaEmbedFn({ data: { id: project.id, url: form.canva_share_url || form.canva_embed_url || undefined } }),
              )
            }
          >
            測試 Canva 嵌入
          </button>
          <button
            type="button"
            className="min-h-11 rounded-full bg-surface-blue px-4 text-sm"
            onClick={() =>
              void run("Demo 測試", () => verifyDemoFn({ data: { id: project.id, url: form.live_demo_url ?? undefined } }))
            }
          >
            測試 Demo
          </button>
        </div>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg">SEO / 語系</legend>
        <Field label="SEO 標題" value={form.seo_title ?? ""} onChange={(value) => patch("seo_title", value)} />
        <Area label="SEO 描述" value={form.seo_description ?? ""} onChange={(value) => patch("seo_description", value)} />
        <Area
          label="英文標題"
          value={String(form.locale_json?.en?.title ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              en: { ...form.locale_json?.en, title: value },
            })
          }
        />
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="min-h-11 rounded-full bg-ink px-5 text-sm text-bg">
          儲存
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={() => void run("存成草稿", () => saveDraftFn({ data: { id: project.id, ...form } }))}
        >
          存成草稿
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
          onClick={() => void run("發布", () => publishProjectFn({ data: { id: project.id } }))}
        >
          發布
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={() => void run("取消發布", () => unpublishProjectFn({ data: { id: project.id } }))}
        >
          取消發布
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={() => void run("封存", () => archiveProjectFn({ data: { id: project.id } }))}
        >
          封存
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={() => void run("還原", () => restoreProjectFn({ data: { id: project.id } }))}
        >
          還原草稿
        </button>
      </div>

      <section>
        <h2 className="font-display text-lg">修訂紀錄</h2>
        <ul className="mt-2 grid gap-2">
          {revisions.map((item) => (
            <li key={item.id} className="flex min-h-11 items-center justify-between rounded-xl bg-surface px-3 text-sm shadow-card">
              <span>
                {item.note} · {item.created_at}
              </span>
              <button
                type="button"
                className="text-mint-deep"
                onClick={() =>
                  void run("還原修訂", () => restoreRevisionFn({ data: { id: project.id, revisionId: item.id } }))
                }
              >
                還原此版
              </button>
            </li>
          ))}
        </ul>
      </section>
    </form>
  );
}

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <input
        className="min-h-11 rounded-xl border border-line px-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <textarea
        className="min-h-28 rounded-xl border border-line px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
