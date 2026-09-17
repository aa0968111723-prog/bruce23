import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import type { ProjectInput, ProjectMedia } from "@/lib/cms/schema";
import { experienceConfigSchema } from "@/lib/cms/schema";
import { normalizeCanvaPaste } from "@/lib/canva/parse";
import { parseCanvaPageIds } from "@/lib/canva/embed";
import { mergeExperienceConfig } from "@/lib/experiences/defaults";
import { githubSyncDiff, type GithubDiffRow } from "@/lib/github/diff";
import { parseGithubUrl } from "@/lib/github/parse";
import { ExperienceEditor } from "./ExperienceEditor";
import { GithubSyncDiff } from "./GithubSyncDiff";

function toForm(project: AdminProject): ProjectInput {
  const { id: _id, created_at: _c, updated_at: _u, updated_by: _b, published_at: _p, ...rest } = project;
  return {
    ...rest,
    experience_config: mergeExperienceConfig(rest.slug, rest.experience_config),
  };
}

function patchMediaItem(
  media: ProjectMedia[],
  index: number,
  patch: Partial<ProjectMedia> | null,
): ProjectMedia[] {
  if (patch === null) return media.filter((_, i) => i !== index);
  const current = media[index];
  const next: ProjectMedia = {
    src: patch.src ?? current?.src ?? "",
    alt: patch.alt ?? current?.alt ?? "",
    kind: patch.kind ?? current?.kind ?? "image",
    caption: "caption" in patch ? patch.caption : current?.caption,
    poster: "poster" in patch ? patch.poster : current?.poster,
  };
  if (!next.src) return media.filter((_, i) => i !== index);
  if (index >= media.length) return [...media, next];
  return media.map((item, i) => (i === index ? next : item));
}

function patchVideoMedia(media: ProjectMedia[], patch: Partial<ProjectMedia> | null): ProjectMedia[] {
  const index = media.findIndex((item) => item.kind === "video");
  if (patch === null) return media.filter((item) => item.kind !== "video");
  if (index < 0) {
    if (!patch.src) return media;
    return [
      ...media,
      {
        src: patch.src,
        alt: patch.alt || "影片",
        kind: "video",
        caption: patch.caption,
        poster: patch.poster,
      },
    ];
  }
  return patchMediaItem(media, index, { ...patch, kind: "video" });
}

export function ProjectForm({ project }: { project: AdminProject }) {
  const [form, setForm] = useState<ProjectInput>(() => toForm(project));
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<
    Array<{
      id: string;
      note: string | null;
      created_at: string;
      title?: string | null;
      publication_status?: string | null;
    }>
  >([]);
  const [githubDiff, setGithubDiff] = useState<GithubDiffRow[] | null>(null);
  const [githubFetch, setGithubFetch] = useState<string | null>(null);
  const canvaShareRef = useRef<HTMLInputElement>(null);

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
    setForm((current) => {
      if (
        (key === "title" ||
          key === "subtitle" ||
          key === "summary" ||
          key === "problem" ||
          key === "role") &&
        typeof value === "string"
      ) {
        const localeKey: "title" | "subtitle" | "summary" | "problem" | "role" = key;
        const prev = String(current[key] ?? "");
        const zh = current.locale_json?.zh ?? {};
        const zhVal = zh[localeKey];
        const syncZh = !zhVal || zhVal === prev;
        return {
          ...current,
          [key]: value,
          locale_json: {
            ...current.locale_json,
            zh: syncZh ? { ...zh, [localeKey]: value } : zh,
          },
        };
      }
      if (
        (key === "decisions" ||
          key === "process" ||
          key === "outputs" ||
          key === "limitations" ||
          key === "modalities" ||
          key === "stack") &&
        Array.isArray(value)
      ) {
        const localeKey: "decisions" | "process" | "outputs" | "limitations" | "modalities" | "stack" = key;
        const prev = current[localeKey] ?? [];
        const zh = current.locale_json?.zh ?? {};
        const zhVal = zh[localeKey];
        const syncZh = !zhVal?.length || sameLines(zhVal, prev);
        return {
          ...current,
          [key]: value,
          locale_json: {
            ...current.locale_json,
            zh: syncZh ? { ...zh, [localeKey]: value } : zh,
          },
        };
      }
      return { ...current, [key]: value };
    });
  }

  function localeListValue(
    lang: "zh" | "en",
    key: "decisions" | "process" | "outputs" | "limitations" | "modalities" | "stack",
  ): string {
    const list = form.locale_json?.[lang]?.[key];
    return Array.isArray(list) ? list.join("\n") : "";
  }

  function patchLocaleList(
    lang: "zh" | "en",
    key: "decisions" | "process" | "outputs" | "limitations" | "modalities" | "stack",
    value: string,
  ) {
    patch("locale_json", {
      ...form.locale_json,
      [lang]: { ...form.locale_json?.[lang], [key]: splitLines(value) },
    });
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
        <a href={`/admin/draft/${form.slug}`} className="inline-flex min-h-11 items-center text-mint-deep">
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
          onChange={(value) => patch("media", patchMediaItem(form.media, 0, value ? { src: value } : null))}
        />
        <Field
          label="封面 alt"
          value={form.media[0]?.alt ?? ""}
          onChange={(value) => patch("media", patchMediaItem(form.media, 0, { alt: value }))}
        />
        <Field
          label="封面說明"
          value={form.media[0]?.caption ?? ""}
          onChange={(value) =>
            patch("media", patchMediaItem(form.media, 0, { caption: value || undefined }))
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
                patchMediaItem(form.media, 0, { kind: event.target.value as "image" | "video" }),
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
          onChange={(value) => patch("media", patchVideoMedia(form.media, value ? { src: value } : null))}
        />
        <Field
          label="影片 alt"
          value={form.media.find((item) => item.kind === "video")?.alt ?? ""}
          onChange={(value) => patch("media", patchVideoMedia(form.media, { alt: value }))}
        />
        <Field
          label="影片說明"
          value={form.media.find((item) => item.kind === "video")?.caption ?? ""}
          onChange={(value) =>
            patch("media", patchVideoMedia(form.media, { caption: value || undefined }))
          }
        />
        <Field
          label="影片封面（poster）"
          value={form.media.find((item) => item.kind === "video")?.poster ?? ""}
          onChange={(value) =>
            patch("media", patchVideoMedia(form.media, { poster: value || undefined }))
          }
        />
        {(form.media ?? []).map((item, index) => {
          if (index === 0 || item.kind === "video") return null;
          return (
            <div key={`extra-media-${index}`} className="grid gap-2 rounded-xl bg-surface-blue/50 p-3">
              <Field
                label="其他圖片"
                value={item.src}
                onChange={(value) =>
                  patch("media", patchMediaItem(form.media, index, value ? { src: value } : null))
                }
              />
              <Field
                label="其他圖片 alt"
                value={item.alt}
                onChange={(value) => patch("media", patchMediaItem(form.media, index, { alt: value }))}
              />
              <Field
                label="其他圖片說明"
                value={item.caption ?? ""}
                onChange={(value) =>
                  patch("media", patchMediaItem(form.media, index, { caption: value || undefined }))
                }
              />
              <button
                type="button"
                className="min-h-11 justify-self-start rounded-full px-3 text-sm text-alert"
                onClick={() => patch("media", patchMediaItem(form.media, index, null))}
              >
                移除圖片
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="min-h-11 justify-self-start rounded-full bg-surface-mint px-4 text-sm"
          onClick={() =>
            patch("media", [
              ...form.media,
              { src: "/media/", alt: "其他圖片", kind: "image" as const },
            ])
          }
        >
          新增圖片
        </button>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg">GitHub</legend>
        <Field label="GitHub URL" value={form.github_url ?? ""} onChange={(value) => patch("github_url", value)} />
        <Field
          label="GitHub branch"
          value={form.github_branch ?? ""}
          onChange={(value) => patch("github_branch", value || null)}
        />
        <p className="text-xs text-muted">
          owner/repo{" "}
          {parseGithubUrl(form.github_url)?.owner ?? form.github_owner ?? "—"}/
          {parseGithubUrl(form.github_url)?.repo ?? form.github_repo ?? "—"}
          （存檔時由網址寫入，不同步覆蓋敘事）
        </p>
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
              void run("已同步 GitHub 中繼資料（未改中文敘事）", (payload) =>
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
        {!(form.canva_share_url ?? "").trim() ? (
          <p className="rounded-xl bg-surface-blue/70 px-3 py-2 text-xs text-muted">
            目前沒有 Canva 分享連結。請貼上 canva.com/design/{"{id}"} 公開分享網址（例如
            https://www.canva.com/design/{"{id}"}/view）。短網址 /d/ 也可以貼，但要等伺服器轉到
            /design/{"{id}"} 才會嵌入。沒有真實分享連結時不要虛構設計編號，也不要填頁面 ID。
          </p>
        ) : null}
        <Field
          label="Canva 分享（可貼 canva.com/design/{id} 或 /d/ 短網址）"
          value={form.canva_share_url ?? ""}
          placeholder="https://www.canva.com/design/{id}/view"
          emptyHint="空著就不會嵌入。請貼公開分享連結，不要發明設計編號。"
          inputRef={canvaShareRef}
          onChange={(value) => {
            const pasted = normalizeCanvaPaste(value);
            patch("canva_share_url", pasted.shareUrl);
            patch("canva_embed_url", pasted.embedUrl ?? "");
            patch("canva_design_id", pasted.designId);
            if (pasted.kind === "design" || pasted.kind === "short") {
              patch("canva_status", "pending");
            } else if (pasted.kind === "empty") {
              patch("canva_status", "not_configured");
            } else if (pasted.kind === "invalid" && pasted.shareUrl) {
              patch("canva_status", "failed");
            }
          }}
        />
        <Field
          label="Canva 嵌入"
          value={form.canva_embed_url ?? ""}
          placeholder="https://www.canva.com/design/{id}/view?embed"
          emptyHint="通常由分享連結自動填入。沒有 /design/{id} 時保持空白，不要放空 iframe。"
          onChange={(value) => patch("canva_embed_url", value)}
        />
        <Field
          label="Canva 頁面 ID（逗號分隔；僅在已有 /design/{id} 之後填真實頁面）"
          value={(form.canva_page_ids ?? []).join(", ")}
          placeholder="有真實分享連結後再填，例如 cover, page-2"
          emptyHint="沒有公開 canva.com/design/{id} 時保持空白。頁面 ID 不能虛構，也不代表可以翻頁。"
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
        <p className="text-xs text-muted">
          Demo 類型 {form.live_demo_type ?? "尚未"} · 嵌入 {form.live_demo_embed_enabled ? "可" : "否"} · 狀態{" "}
          {form.live_demo_status}
          {form.live_demo_error ? ` · ${form.live_demo_error}` : ""}
        </p>
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
              const typed = canvaShareRef.current?.value?.trim() ?? "";
              if (typed) {
                const pasted = normalizeCanvaPaste(typed);
                patch("canva_share_url", pasted.shareUrl);
                patch("canva_embed_url", pasted.embedUrl ?? "");
                patch("canva_design_id", pasted.designId);
              }
              const url = typed || form.canva_share_url || form.canva_embed_url || undefined;
              void testCanvaEmbedFn({
                data: { id: project.id, url },
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
          label="中文問題"
          value={String(form.locale_json?.zh?.problem ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              zh: { ...form.locale_json?.zh, problem: value },
            })
          }
        />
        <Area
          label="中文角色"
          value={String(form.locale_json?.zh?.role ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              zh: { ...form.locale_json?.zh, role: value },
            })
          }
        />
        <Area
          label="中文決策（一行一項）"
          value={localeListValue("zh", "decisions")}
          onChange={(value) => patchLocaleList("zh", "decisions", value)}
        />
        <Area
          label="中文流程（一行一項）"
          value={localeListValue("zh", "process")}
          onChange={(value) => patchLocaleList("zh", "process", value)}
        />
        <Area
          label="中文產出（一行一項）"
          value={localeListValue("zh", "outputs")}
          onChange={(value) => patchLocaleList("zh", "outputs", value)}
        />
        <Area
          label="中文限制（一行一項）"
          value={localeListValue("zh", "limitations")}
          onChange={(value) => patchLocaleList("zh", "limitations", value)}
        />
        <Area
          label="中文多模態（一行一項）"
          value={localeListValue("zh", "modalities")}
          onChange={(value) => patchLocaleList("zh", "modalities", value)}
        />
        <Area
          label="中文技術（一行一項）"
          value={localeListValue("zh", "stack")}
          onChange={(value) => patchLocaleList("zh", "stack", value)}
        />
        <Field
          label="中文 SEO 標題"
          value={String(form.locale_json?.zh?.seoTitle ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              zh: { ...form.locale_json?.zh, seoTitle: value },
            })
          }
        />
        <Area
          label="中文 SEO 描述"
          value={String(form.locale_json?.zh?.seoDescription ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              zh: { ...form.locale_json?.zh, seoDescription: value },
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
        <Area
          label="英文問題"
          value={String(form.locale_json?.en?.problem ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              en: { ...form.locale_json?.en, problem: value },
            })
          }
        />
        <Area
          label="英文角色"
          value={String(form.locale_json?.en?.role ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              en: { ...form.locale_json?.en, role: value },
            })
          }
        />
        <Area
          label="英文決策（一行一項）"
          value={localeListValue("en", "decisions")}
          onChange={(value) => patchLocaleList("en", "decisions", value)}
        />
        <Area
          label="英文流程（一行一項）"
          value={localeListValue("en", "process")}
          onChange={(value) => patchLocaleList("en", "process", value)}
        />
        <Area
          label="英文產出（一行一項）"
          value={localeListValue("en", "outputs")}
          onChange={(value) => patchLocaleList("en", "outputs", value)}
        />
        <Area
          label="英文限制（一行一項）"
          value={localeListValue("en", "limitations")}
          onChange={(value) => patchLocaleList("en", "limitations", value)}
        />
        <Area
          label="英文多模態（一行一項）"
          value={localeListValue("en", "modalities")}
          onChange={(value) => patchLocaleList("en", "modalities", value)}
        />
        <Area
          label="英文技術（一行一項）"
          value={localeListValue("en", "stack")}
          onChange={(value) => patchLocaleList("en", "stack", value)}
        />
        <Field
          label="英文 SEO 標題"
          value={String(form.locale_json?.en?.seoTitle ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              en: { ...form.locale_json?.en, seoTitle: value },
            })
          }
        />
        <Area
          label="英文 SEO 描述"
          value={String(form.locale_json?.en?.seoDescription ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              en: { ...form.locale_json?.en, seoDescription: value },
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
        <p className="mt-1 text-xs text-muted">還原會寫回該版快照（標題、敘事、媒體、整合欄位），並再存一筆還原紀錄。</p>
        {revisions.length === 0 ? (
          <p className="mt-2 text-sm text-muted">尚無修訂。儲存後會出現可還原的版本。</p>
        ) : null}
        <ul className="mt-2 grid gap-2">
          {revisions.map((item) => (
            <li key={item.id} className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2 text-sm shadow-card">
              <span>
                <span className="font-medium">{item.title || "未命名"}</span>
                <span className="text-muted">
                  {" "}
                  · {revisionNoteLabel(item.note)}
                  {item.publication_status ? ` · ${item.publication_status}` : ""} · {formatRevisionTime(item.created_at)}
                </span>
              </span>
              <button
                type="button"
                className="inline-flex min-h-11 shrink-0 items-center text-mint-deep"
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

function revisionNoteLabel(note: string | null | undefined) {
  if (!note) return "儲存";
  if (note.startsWith("restore:")) return "還原";
  if (note === "create") return "建立";
  if (note === "draft") return "草稿";
  if (note === "save") return "儲存";
  if (note === "published") return "發布";
  if (note === "archived") return "封存";
  return note;
}

function formatRevisionTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function sameLines(a: string[] | undefined, b: string[] | undefined) {
  const left = a ?? [];
  const right = b ?? [];
  return left.length === right.length && left.every((item, i) => item === right[i]);
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  emptyHint,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyHint?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <input
        ref={inputRef}
        className="min-h-11 rounded-xl border border-line px-3"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {!value.trim() && emptyHint ? <p className="text-xs text-muted">{emptyHint}</p> : null}
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
