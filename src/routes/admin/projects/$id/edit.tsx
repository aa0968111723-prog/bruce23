import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  applyGithubSyncFn,
  getAdminProjectFn,
  listRevisionsFn,
  previewGithubSyncFn,
  restoreRevisionFn,
  saveProjectFn,
  setPublicationFn,
  testCanvaEmbedFn,
  verifyLiveDemoFn,
} from "@/lib/cms/admin-fns";
import { experienceModeSchema, projectCategorySchema, productStatusSchema } from "@/lib/cms/schema";
import type { AdminProject, PublicProject } from "@/lib/cms/public-types";
import { ExperiencePanel } from "@/components/experience/ExperiencePanel";

export const Route = createFileRoute("/admin/projects/$id/edit")({
  component: EditProject,
});

function EditProject() {
  const { id } = Route.useParams();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [revisions, setRevisions] = useState<
    Array<{ id: string; note: string | null; created_at: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void getAdminProjectFn({ data: id })
      .then((row) => {
        if (!row) setError("找不到專案");
        else setProject(row);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "載入失敗"));
    void listRevisionsFn({ data: id })
      .then(setRevisions)
      .catch(() => undefined);
  }, [id]);
  if (error) return <p className="text-sm text-muted">{error}</p>;
  if (!project) return <p className="text-sm text-muted">載入中…</p>;
  return <ProjectEditor key={project.id} project={project} revisions={revisions} />;
}

function listField(items: string[]) {
  return items.join("\n");
}

function ProjectEditor({
  project,
  revisions,
}: {
  project: AdminProject;
  revisions: Array<{ id: string; note: string | null; created_at: string }>;
}) {
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"copy" | "integrations" | "experience" | "history">("copy");
  const [form, setForm] = useState({
    slug: project.slug,
    title: project.title,
    title_en: project.titleEn ?? "",
    subtitle: project.subtitle,
    summary: project.summary,
    problem: project.problem,
    role: project.role,
    decisions: listField(project.decisions),
    modalities: listField(project.modalities),
    process: listField(project.process),
    outputs: listField(project.outputs),
    stack: listField(project.stack),
    limitations: listField(project.limitations),
    category: project.category,
    year: project.year,
    product_status: project.productStatus,
    featured: project.featured,
    sort_order: project.sortOrder,
    cover_image: project.media[0]?.src ?? "",
    github_url: project.githubUrl ?? "",
    github_sync_enabled: project.githubSyncEnabled,
    live_demo_url: project.demo?.url ?? "",
    live_demo_label: project.demo?.label ?? "",
    live_demo_embed_enabled: project.demo?.embedEnabled ?? false,
    canva_share_url: project.canva?.shareUrl ?? "",
    canva_embed_url: project.canva?.embedUrl ?? "",
    canva_alt: project.canva?.alt ?? "",
    canva_caption: project.canva?.caption ?? "",
    experience_mode: project.experienceMode,
    seo_title: project.seo.title ?? "",
    seo_description: project.seo.description ?? "",
  });
  const [previewDiff, setPreviewDiff] = useState<string | null>(null);

  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const patch = useMemo(
    () => ({
      slug: form.slug,
      title: form.title,
      title_en: form.title_en || null,
      subtitle: form.subtitle,
      summary: form.summary,
      problem: form.problem,
      role: form.role,
      decisions: form.decisions.split("\n").map((s) => s.trim()).filter(Boolean),
      modalities: form.modalities.split("\n").map((s) => s.trim()).filter(Boolean),
      process: form.process.split("\n").map((s) => s.trim()).filter(Boolean),
      outputs: form.outputs.split("\n").map((s) => s.trim()).filter(Boolean),
      stack: form.stack.split("\n").map((s) => s.trim()).filter(Boolean),
      limitations: form.limitations.split("\n").map((s) => s.trim()).filter(Boolean),
      category: form.category as AdminProject["category"],
      year: form.year,
      product_status: form.product_status,
      featured: form.featured,
      sort_order: Number(form.sort_order) || 0,
      media: form.cover_image
        ? [{ src: form.cover_image, alt: form.title, kind: "image" as const }]
        : project.media,
      github_url: form.github_url || null,
      github_sync_enabled: form.github_sync_enabled,
      live_demo_url: form.live_demo_url || null,
      live_demo_label: form.live_demo_label || null,
      live_demo_type: form.live_demo_url ? ("link" as const) : ("none" as const),
      live_demo_embed_enabled: form.live_demo_embed_enabled,
      canva_share_url: form.canva_share_url || null,
      canva_embed_url: form.canva_embed_url || null,
      canva_alt: form.canva_alt || null,
      canva_caption: form.canva_caption || null,
      experience_mode: form.experience_mode,
      experience_config: project.experienceConfig,
      interaction_steps: project.interactionSteps,
      source_evidence: project.sourceEvidence,
      seo: { title: form.seo_title, description: form.seo_description },
    }),
    [form, project],
  );

  async function save() {
    setBusy(true);
    try {
      await saveProjectFn({ data: { id: project.id, patch } });
      setDirty(false);
      toast.success("草稿已儲存");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setBusy(false);
    }
  }

  async function publish(status: "published" | "unpublished" | "archived" | "draft") {
    await save();
    try {
      await setPublicationFn({ data: { id: project.id, status } });
      toast.success(
        status === "published" ? "已發布" : status === "unpublished" ? "已取消發布" : status === "archived" ? "已封存" : "已回到草稿",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "狀態更新失敗");
    }
  }

  const field = (key: keyof typeof form, label: string, area = false) => (
    <label className="block text-sm">
      {label}
      {area ? (
        <textarea
          value={String(form[key] ?? "")}
          onChange={(e) => {
            setDirty(true);
            setForm((f) => ({ ...f, [key]: e.target.value }));
          }}
          className="mt-1 min-h-28 w-full rounded-xl border border-line bg-surface px-3 py-2"
        />
      ) : (
        <input
          value={String(form[key] ?? "")}
          onChange={(e) => {
            setDirty(true);
            setForm((f) => ({ ...f, [key]: e.target.value }));
          }}
          className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
        />
      )}
    </label>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">{form.title || "未命名"}</h1>
          <p className="text-sm text-muted">
            產品狀態 {form.product_status} · 發布狀態 {project.publicationStatus}
            {dirty ? " · 有未儲存變更" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} className="min-h-11 rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground" onClick={() => void save()}>
            儲存草稿
          </button>
          <button type="button" className="min-h-11 rounded-full bg-ink px-4 text-sm text-bg" onClick={() => void publish("published")}>
            發布
          </button>
          <button type="button" className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card" onClick={() => void publish("unpublished")}>
            取消發布
          </button>
          <button type="button" className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card" onClick={() => void publish("archived")}>
            封存
          </button>
          <Link to="/admin/preview" search={{ slug: project.slug }} className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card">
            預覽草稿
          </Link>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {(["copy", "integrations", "experience", "history"] as const).map((id) => (
          <button
            key={id}
            type="button"
            className={`min-h-11 rounded-full px-4 text-sm ${tab === id ? "bg-ink text-bg" : "bg-surface shadow-card"}`}
            onClick={() => setTab(id)}
          >
            {id === "copy" ? "內容" : id === "integrations" ? "整合" : id === "experience" ? "體驗" : "版本"}
          </button>
        ))}
      </div>

      {tab === "copy" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {field("title", "標題")}
          {field("title_en", "Title (EN)")}
          {field("slug", "Slug")}
          {field("subtitle", "副標")}
          {field("year", "年份")}
          <label className="block text-sm">
            分類
            <select
              value={form.category}
              onChange={(e) => {
                setDirty(true);
                setForm((f) => ({ ...f, category: e.target.value }));
              }}
              className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
            >
              {projectCategorySchema.options.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            產品狀態（與發布狀態分開）
            <select
              value={form.product_status}
              onChange={(e) => {
                setDirty(true);
                setForm((f) => ({ ...f, product_status: e.target.value as typeof form.product_status }));
              }}
              className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
            >
              {productStatusSchema.options.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          {field("sort_order", "排序")}
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => {
                setDirty(true);
                setForm((f) => ({ ...f, featured: e.target.checked }));
              }}
            />
            精選
          </label>
          {field("cover_image", "封面圖")}
          {field("summary", "摘要", true)}
          {field("problem", "問題", true)}
          {field("role", "角色", true)}
          {field("decisions", "決策（一行一項）", true)}
          {field("modalities", "模態", true)}
          {field("process", "流程", true)}
          {field("outputs", "產出", true)}
          {field("stack", "技術", true)}
          {field("limitations", "限制", true)}
          {field("seo_title", "SEO 標題")}
          {field("seo_description", "SEO 描述", true)}
        </div>
      ) : null}

      {tab === "integrations" ? (
        <div className="mt-6 grid gap-6">
          <section className="rounded-2xl bg-surface p-5 shadow-card">
            <h2 className="font-display text-xl">GitHub</h2>
            {field("github_url", "儲存庫網址")}
            <p className="mt-2 text-xs text-muted">
              上次同步：{project.githubLastSyncedAt ?? "尚未"} · 狀態 {project.githubSyncStatus}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full bg-surface-blue px-4 text-sm"
                onClick={async () => {
                  try {
                    const preview = await previewGithubSyncFn({ data: { id: project.id } });
                    if (!preview.ok) {
                      toast.error(preview.error);
                      setPreviewDiff(preview.error);
                      return;
                    }
                    setPreviewDiff(
                      preview.changes.length
                        ? preview.changes
                            .map((c) => `${c.field}: ${JSON.stringify(c.from)} → ${JSON.stringify(c.to)}`)
                            .join("\n")
                        : "沒有欄位會變更。敘事文案不會被覆蓋。",
                    );
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "預覽失敗");
                  }
                }}
              >
                預覽同步差異
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-ink px-4 text-sm text-bg"
                onClick={async () => {
                  const result = await applyGithubSyncFn({ data: { id: project.id } });
                  if (result.ok) toast.success("GitHub 技術欄位已更新");
                  else toast.error("error" in result ? result.error : "同步失敗");
                }}
              >
                同步 GitHub
              </button>
            </div>
            {previewDiff ? (
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-blue p-3 text-xs">
                {previewDiff}
              </pre>
            ) : null}
          </section>
          <section className="rounded-2xl bg-surface p-5 shadow-card">
            <h2 className="font-display text-xl">Live Demo</h2>
            {field("live_demo_url", "Demo 網址")}
            {field("live_demo_label", "按鈕文字")}
            <button
              type="button"
              className="mt-3 min-h-11 rounded-full bg-surface-blue px-4 text-sm"
              onClick={async () => {
                const result = await verifyLiveDemoFn({ data: { id: project.id } });
                if (result.ok) toast.success(result.embeddable ? "可嵌入" : "可開啟但無法嵌入");
                else toast.error(result.error || "Demo 無法使用");
              }}
            >
              測試 Demo
            </button>
          </section>
          <section className="rounded-2xl bg-surface p-5 shadow-card">
            <h2 className="font-display text-xl">Canva</h2>
            {field("canva_share_url", "分享網址或 embed 片段")}
            {field("canva_embed_url", "嵌入網址")}
            {field("canva_alt", "替代文字")}
            {field("canva_caption", "圖說")}
            <button
              type="button"
              className="mt-3 min-h-11 rounded-full bg-surface-blue px-4 text-sm"
              onClick={async () => {
                const result = await testCanvaEmbedFn({
                  data: { id: project.id, url: form.canva_share_url || form.canva_embed_url },
                });
                if (result.ok) toast.success("Canva 網域通過允許清單");
                else toast.error(result.error);
              }}
            >
              測試嵌入
            </button>
          </section>
        </div>
      ) : null}

      {tab === "experience" ? (
        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            體驗模式
            <select
              value={form.experience_mode}
              onChange={(e) => {
                setDirty(true);
                setForm((f) => ({ ...f, experience_mode: e.target.value as typeof f.experience_mode }));
              }}
              className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
            >
              {experienceModeSchema.options.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <ExperiencePanel
            project={
              {
                ...project,
                publicationStatus: "published",
                title: form.title,
                subtitle: form.subtitle,
                summary: form.summary,
                experienceMode: form.experience_mode,
                github: project.github,
                canva: {
                  shareUrl: form.canva_share_url || null,
                  embedUrl: form.canva_embed_url || null,
                  designId: project.canva?.designId ?? null,
                  pageIds: project.canva?.pageIds ?? [],
                  thumbnailUrl: project.canva?.thumbnailUrl ?? null,
                  alt: form.canva_alt || null,
                  caption: form.canva_caption || null,
                  status: project.canva?.status ?? "not_configured",
                },
                demo: form.live_demo_url
                  ? {
                      url: form.live_demo_url,
                      label: form.live_demo_label,
                      type: "link",
                      embedEnabled: form.live_demo_embed_enabled,
                      status: project.demo?.status ?? "not_configured",
                    }
                  : null,
              } as PublicProject
            }
          />
        </div>
      ) : null}

      {tab === "history" ? (
        <ul className="mt-6 grid gap-2">
          {revisions.map((rev) => (
            <li key={rev.id} className="flex min-h-14 items-center justify-between rounded-2xl bg-surface px-4 shadow-card">
              <span className="text-sm">
                {rev.note} · {rev.created_at}
              </span>
              <button
                type="button"
                className="min-h-11 text-sm text-mint-deep"
                onClick={async () => {
                  try {
                    await restoreRevisionFn({ data: { projectId: project.id, revisionId: rev.id } });
                    toast.success("已還原版本");
                    window.location.reload();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "還原失敗");
                  }
                }}
              >
                還原
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
