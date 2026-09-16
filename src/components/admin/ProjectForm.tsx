import { useCallback, useEffect, useMemo, useState } from "react";
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
import { EXPERIENCE_MODE_LABEL, EXPERIENCE_MODES, PRODUCT_STATUSES, PROJECT_CATEGORIES } from "@/lib/cms/status";
import type { ProjectInput } from "@/lib/cms/schema";
import { experienceConfigSchema } from "@/lib/cms/schema";
import { parseCanvaDesign, isCanvaShortLink } from "@/lib/canva/parse";
import { parseCanvaPageIds } from "@/lib/canva/embed";
import { mergeExperienceConfig } from "@/lib/experiences/defaults";
import { githubSyncDiff, type GithubDiffRow } from "@/lib/github/diff";
import { ExperienceEditor } from "./ExperienceEditor";
import { GithubSyncDiff } from "./GithubSyncDiff";

function toForm(project: AdminProject): ProjectInput {
  const { id: _id, created_at: _c, updated_at: _u, updated_by: _b, published_at: _p, ...rest } = project;
  return {
    ...rest,
    experience_config: mergeExperienceConfig(rest.slug, rest.experience_config),
  };
}

export function ProjectForm({ project }: { project: AdminProject }) {
  const [form, setForm] = useState<ProjectInput>(() => toForm(project));
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<Array<{ id: string; note: string | null; created_at: string }>>([]);
  const [githubDiff, setGithubDiff] = useState<GithubDiffRow[] | null>(null);
  const [githubFetch, setGithubFetch] = useState<string | null>(null);

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

  const loadRevisions = useCallback(() => {
    return listRevisionsFn({ data: { id: project.id } })
      .then(setRevisions)
      .catch((err: unknown) => {
        setStatus(err instanceof Error ? err.message : "修訂紀錄讀取失敗");
      });
  }, [project.id]);

  useEffect(() => {
    void loadRevisions();
  }, [loadRevisions]);

  function applyServerProject(result: unknown, fallback: ProjectInput) {
    if (result && typeof result === "object" && "id" in result && "slug" in result && "title" in result) {
      setForm(toForm(result as AdminProject));
      return;
    }
    setForm(fallback);
  }

  function patch<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validatedForm(): ProjectInput | null {
    const parsed = experienceConfigSchema.safeParse(form.experience_config);
    if (!parsed.success) {
      const message = "體驗內容尚未通過檢查，請補齊必填欄位。";
      setStatus(message);
      toast.error(message);
      return null;
    }
    return { ...form, experience_config: parsed.data };
  }

  async function run(label: string, fn: (payload: ProjectInput) => Promise<unknown>) {
    const payload = validatedForm();
    if (!payload) return;
    try {
      const result = await fn(payload);
      applyServerProject(result, payload);
      void loadRevisions();
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
        void run("儲存", (payload) => saveProjectFn({ data: { id: project.id, ...payload } }));
      }}
    >
      {status ? <p className="rounded-xl bg-surface-mint px-4 py-3 text-sm">{status}</p> : null}
      {dirty ? <p className="text-sm text-muted">有未儲存的修改。</p> : null}
      <p className="text-sm">
        <a href={`/admin/draft/${form.slug}`} className="text-mint-deep">
          後台預覽這件作品
        </a>
        <span className="text-muted"> · 不會發布到前台</span>
      </p>

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg">敘事</legend>
        <Field label="標題" value={form.title} onChange={(value) => patch("title", value)} />
        <Field label="副標" value={form.subtitle} onChange={(value) => patch("subtitle", value)} />
        <Field label="slug" value={form.slug} onChange={(value) => patch("slug", value)} />
        <Field label="年份" value={form.year} onChange={(value) => patch("year", value)} />
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
        <Area label="多模態" value={form.modalities.join("\n")} onChange={(value) => patch("modalities", splitLines(value))} />
        <Area label="流程" value={form.process.join("\n")} onChange={(value) => patch("process", splitLines(value))} />
        <Area label="產出" value={form.outputs.join("\n")} onChange={(value) => patch("outputs", splitLines(value))} />
        <Area label="技術" value={form.stack.join("\n")} onChange={(value) => patch("stack", splitLines(value))} />
        <Area label="限制" value={form.limitations.join("\n")} onChange={(value) => patch("limitations", splitLines(value))} />
        <Field
          label="封面圖"
          value={form.media[0]?.src ?? ""}
          onChange={(value) =>
            patch("media", value
              ? [{ src: value, alt: form.media[0]?.alt || form.title, kind: form.media[0]?.kind ?? "image" }, ...form.media.slice(1)]
              : form.media.slice(1))
          }
        />
        <Field
          label="封面 alt"
          value={form.media[0]?.alt ?? ""}
          onChange={(value) =>
            patch("media", form.media[0] ? [{ ...form.media[0], alt: value }, ...form.media.slice(1)] : [])
          }
        />
        <label className="grid gap-1 text-sm">
          封面類型
          <select
            className="min-h-11 rounded-xl border border-line px-3"
            value={form.media[0]?.kind ?? "image"}
            onChange={(event) =>
              patch(
                "media",
                form.media[0]
                  ? [{ ...form.media[0], kind: event.target.value as "image" | "video" }, ...form.media.slice(1)]
                  : [],
              )
            }
          >
            <option value="image">image</option>
            <option value="video">video</option>
          </select>
        </label>
        <Field
          label="影片 URL（選填，kind=video 時使用）"
          value={form.media.find((item) => item.kind === "video")?.src ?? ""}
          onChange={(value) => {
            const images = form.media.filter((item) => item.kind !== "video");
            patch(
              "media",
              value
                ? [
                    ...images,
                    {
                      src: value,
                      alt: form.media.find((item) => item.kind === "video")?.alt || `${form.title} 影片`,
                      kind: "video" as const,
                    },
                  ]
                : images,
            );
          }}
        />
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
                .then((result) => {
                  setGithubDiff(githubSyncDiff(result.current, result.incoming));
                  setGithubFetch(
                    result.fetch.ok
                      ? `探測成功 · HTTP ${result.fetch.status}`
                      : `探測失敗 · ${result.fetch.error ?? result.fetch.errorCode ?? result.fetch.status}`,
                  );
                })
                .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "預覽失敗"))
            }
          >
            預覽同步
          </button>
          <button
            type="button"
            className="min-h-11 rounded-full bg-ink px-4 text-sm text-bg"
            onClick={() =>
              void run("同步 GitHub", (payload) =>
                applyGithubFn({ data: { id: project.id, url: payload.github_url ?? undefined } }),
              )
            }
          >
            同步 GitHub
          </button>
        </div>
        {githubFetch ? <p className="text-xs text-muted">{githubFetch}</p> : null}
        {githubDiff ? <GithubSyncDiff rows={githubDiff} /> : null}
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg">Canva / Demo / 體驗</legend>
        <Field
          label="Canva 分享（可貼 /design/{id} 或 /d/ 短網址）"
          value={form.canva_share_url ?? ""}
          onChange={(value) => {
            const parsed = parseCanvaDesign(value);
            patch("canva_share_url", parsed?.shareUrl ?? value);
            if (parsed) {
              patch("canva_embed_url", parsed.embedUrl);
              patch("canva_design_id", parsed.designId);
            } else if (isCanvaShortLink(value)) {
              patch("canva_embed_url", "");
              patch("canva_design_id", null);
              patch("canva_status", "pending");
            }
          }}
        />
        <Field label="Canva 嵌入" value={form.canva_embed_url ?? ""} onChange={(value) => patch("canva_embed_url", value)} />
        <Field
          label="Canva 頁面 ID（逗號分隔，可貼明天的分享連結後再填）"
          value={(form.canva_page_ids ?? []).join(", ")}
          onChange={(value) => patch("canva_page_ids", parseCanvaPageIds(value))}
        />
        <Field label="封面" value={form.canva_thumbnail_url ?? ""} onChange={(value) => patch("canva_thumbnail_url", value)} />
        <Field label="Canva alt" value={form.canva_alt ?? ""} onChange={(value) => patch("canva_alt", value)} />
        <Field label="Canva 說明" value={form.canva_caption ?? ""} onChange={(value) => patch("canva_caption", value)} />
        <p className="text-xs text-muted">
          狀態 {form.canva_status}
          {form.canva_error ? ` · ${form.canva_error}` : ""}
        </p>
        <Field label="Demo URL" value={form.live_demo_url ?? ""} onChange={(value) => patch("live_demo_url", value)} />
        <Field label="Demo 標籤" value={form.live_demo_label ?? ""} onChange={(value) => patch("live_demo_label", value)} />
        <label className="grid gap-1 text-sm">
          互動展示模式
          <select
            className="min-h-11 rounded-xl border border-line px-3"
            value={form.experience_mode ?? ""}
            onChange={(event) =>
              patch("experience_mode", (event.target.value || null) as ProjectInput["experience_mode"])
            }
          >
            <option value="">（未選）</option>
            {EXPERIENCE_MODES.map((item) => (
              <option key={item} value={item}>
                {EXPERIENCE_MODE_LABEL[item]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 rounded-full bg-surface-blue px-4 text-sm"
            onClick={() => {
              const payload = validatedForm();
              if (!payload) return;
              void testCanvaEmbedFn({
                data: { id: project.id, url: payload.canva_share_url || payload.canva_embed_url || undefined },
              })
                .then((result) => {
                  if (result.status === "pending" && "shareUrl" in result && result.shareUrl) {
                    patch("canva_share_url", result.shareUrl);
                    patch("canva_embed_url", result.embedUrl);
                    patch("canva_design_id", result.designId);
                    patch("canva_status", "pending");
                    patch("canva_error", result.error);
                    toast.success("Canva 短網址或分享網址已解析，尚未標成已驗證");
                    setStatus("Canva 測試完成：可嵌入，未驗證 Connect");
                  } else {
                    if (result.shareUrl) patch("canva_share_url", result.shareUrl);
                    patch("canva_embed_url", "");
                    patch("canva_design_id", null);
                    patch("canva_status", result.status === "unavailable" ? "unavailable" : "failed");
                    patch("canva_error", result.error);
                    toast.error(result.error);
                    setStatus(result.error);
                  }
                })
                .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Canva 測試失敗"));
            }}
          >
            測試 Canva 嵌入
          </button>
          <button
            type="button"
            className="min-h-11 rounded-full bg-surface-blue px-4 text-sm"
            onClick={() =>
              void run("Demo 測試", (payload) =>
                verifyDemoFn({ data: { id: project.id, url: payload.live_demo_url ?? undefined } }),
              )
            }
          >
            測試 Demo
          </button>
        </div>
      </fieldset>

      <ExperienceEditor
        mode={form.experience_mode}
        config={form.experience_config ?? {}}
        steps={form.interaction_steps}
        onConfig={(next) => patch("experience_config", next)}
        onSteps={(next) => patch("interaction_steps", next)}
      />

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg">來源證據</legend>
        <p className="text-xs text-muted">公開頁會列出這些來源。不要貼私人 Drive、token 或未公開 Canva。</p>
        {(form.source_evidence ?? []).map((item, index) => (
          <div key={`evidence-${index}`} className="grid gap-2 rounded-xl bg-surface-blue/50 p-3">
            <Field
              label="標籤"
              value={item.label}
              onChange={(value) =>
                patch(
                  "source_evidence",
                  form.source_evidence.map((entry, i) => (i === index ? { ...entry, label: value } : entry)),
                )
              }
            />
            <Field
              label="網址"
              value={item.href ?? ""}
              onChange={(value) =>
                patch(
                  "source_evidence",
                  form.source_evidence.map((entry, i) => (i === index ? { ...entry, href: value || undefined } : entry)),
                )
              }
            />
            <Area
              label="說明"
              value={item.note}
              onChange={(value) =>
                patch(
                  "source_evidence",
                  form.source_evidence.map((entry, i) => (i === index ? { ...entry, note: value } : entry)),
                )
              }
            />
            <label className="grid gap-1 text-sm">
              類型
              <select
                className="min-h-11 rounded-xl border border-line px-3"
                value={item.kind ?? "other"}
                onChange={(event) =>
                  patch(
                    "source_evidence",
                    form.source_evidence.map((entry, i) =>
                      i === index
                        ? { ...entry, kind: event.target.value as NonNullable<typeof item.kind> }
                        : entry,
                    ),
                  )
                }
              >
                <option value="github">github</option>
                <option value="canva">canva</option>
                <option value="demo">demo</option>
                <option value="narrative">narrative</option>
                <option value="other">other</option>
              </select>
            </label>
            <button
              type="button"
              className="min-h-11 justify-self-start rounded-full px-3 text-sm text-alert"
              onClick={() =>
                patch(
                  "source_evidence",
                  form.source_evidence.filter((_, i) => i !== index),
                )
              }
            >
              移除
            </button>
          </div>
        ))}
        <button
          type="button"
          className="min-h-11 justify-self-start rounded-full bg-surface-mint px-4 text-sm"
          onClick={() =>
            patch("source_evidence", [
              ...form.source_evidence,
              { label: "來源", note: "待補說明", kind: "other" as const },
            ])
          }
        >
          新增來源證據
        </button>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg">SEO / 語系</legend>
        <Field label="SEO 標題" value={form.seo_title ?? ""} onChange={(value) => patch("seo_title", value)} />
        <Area label="SEO 描述" value={form.seo_description ?? ""} onChange={(value) => patch("seo_description", value)} />
        <Area
          label="中文標題"
          value={String(form.locale_json?.zh?.title ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              zh: { ...form.locale_json?.zh, title: value },
            })
          }
        />
        <Area
          label="中文副標"
          value={String(form.locale_json?.zh?.subtitle ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              zh: { ...form.locale_json?.zh, subtitle: value },
            })
          }
        />
        <Area
          label="中文摘要"
          value={String(form.locale_json?.zh?.summary ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              zh: { ...form.locale_json?.zh, summary: value },
            })
          }
        />
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
        <Area
          label="英文副標"
          value={String(form.locale_json?.en?.subtitle ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              en: { ...form.locale_json?.en, subtitle: value },
            })
          }
        />
        <Area
          label="英文摘要"
          value={String(form.locale_json?.en?.summary ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              en: { ...form.locale_json?.en, summary: value },
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
          onClick={() => void run("存成草稿", (payload) => saveDraftFn({ data: { id: project.id, ...payload } }))}
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
        {revisions.length === 0 ? (
          <p className="mt-2 text-sm text-muted">尚無修訂。儲存後會出現可還原的版本。</p>
        ) : null}
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
