import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { AdminProject, ExperienceMode, ProductStatus, ProjectCategory } from "@/lib/portfolio/types";
import type { ProjectCreate } from "@/lib/portfolio/schema";
import { parseGithubUrl } from "@/lib/portfolio/github-url";
import { parseCanvaInput } from "@/lib/portfolio/canva-url";

const CATEGORIES: ProjectCategory[] = [
  "AI Product",
  "Multimodal",
  "Interaction",
  "Visual AI",
  "Spatial Design",
  "Creative Tool",
  "Real-world Experience",
];

const STATUSES: ProductStatus[] = ["completed", "in-progress", "prototype", "concept", "planned"];
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

export type ProjectFormValue = ProjectCreate;

const empty: ProjectFormValue = {
  slug: "",
  title: "",
  subtitle: "",
  category: "AI Product",
  year: String(new Date().getFullYear()),
  productStatus: "prototype",
  featured: false,
  sortOrder: 0,
  summary: "",
  problem: "",
  role: "",
  decisions: [],
  modalities: [],
  process: [],
  outputs: [],
  stack: [],
  limitations: [],
  media: [],
  sourceEvidence: [],
  localeZh: {},
  localeEn: {},
  githubSyncEnabled: true,
  liveDemoEmbedEnabled: false,
  canvaPageIds: [],
  experienceConfig: {},
  interactionSteps: [],
  publicationStatus: "draft",
};

function fromProject(project: AdminProject): ProjectFormValue {
  return {
    slug: project.slug,
    title: project.title,
    subtitle: project.subtitle,
    category: project.category,
    year: project.year,
    productStatus: project.productStatus,
    featured: project.featured,
    sortOrder: project.sortOrder,
    summary: project.summary,
    problem: project.problem,
    role: project.role,
    decisions: project.decisions,
    modalities: project.modalities,
    process: project.process,
    outputs: project.outputs,
    stack: project.stack,
    limitations: project.limitations,
    media: project.media,
    sourceEvidence: project.sourceEvidence,
    localeZh: project.localeZh,
    localeEn: project.localeEn,
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
    githubUrl: project.github?.url,
    githubOwner: project.github?.owner,
    githubRepo: project.github?.repo,
    githubBranch: project.github?.branch ?? undefined,
    githubSyncEnabled: project.githubSyncEnabled,
    liveDemoUrl: project.liveDemo?.url,
    liveDemoLabel: project.liveDemo?.label ?? undefined,
    liveDemoType: project.liveDemo?.type ?? undefined,
    liveDemoEmbedEnabled: project.liveDemo?.embedEnabled ?? false,
    canvaShareUrl: project.canva?.shareUrl ?? undefined,
    canvaEmbedUrl: project.canva?.embedUrl ?? undefined,
    canvaDesignId: project.canva?.designId ?? undefined,
    canvaPageIds: project.canva?.pageIds ?? [],
    canvaThumbnailUrl: project.canva?.thumbnailUrl ?? undefined,
    canvaAlt: project.canva?.alt ?? undefined,
    canvaDescription: project.canva?.description ?? undefined,
    experienceMode: project.experienceMode,
    experienceConfig: project.experienceConfig,
    interactionSteps: project.interactionSteps,
    publicationStatus: project.publicationStatus,
  };
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProjectForm({
  initial,
  onSave,
  onPublish,
  onUnpublish,
  onArchive,
}: {
  initial?: AdminProject | null;
  onSave: (value: ProjectFormValue) => Promise<void>;
  onPublish?: () => Promise<void>;
  onUnpublish?: () => Promise<void>;
  onArchive?: () => Promise<void>;
}) {
  const [value, setValue] = useState<ProjectFormValue>(initial ? fromProject(initial) : empty);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const snapshot = useMemo(() => JSON.stringify(initial ? fromProject(initial) : empty), [initial]);

  useEffect(() => {
    setValue(initial ? fromProject(initial) : empty);
    setDirty(false);
  }, [initial, snapshot]);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  function patch(partial: Partial<ProjectFormValue>) {
    setValue((current) => ({ ...current, ...partial }));
    setDirty(true);
  }

  async function save(): Promise<boolean> {
    const gh = value.githubUrl ? parseGithubUrl(value.githubUrl) : null;
    if (value.githubUrl && !gh) {
      toast.error("GitHub 網址需為 https://github.com/owner/repo");
      return false;
    }
    if (value.canvaShareUrl || value.canvaEmbedUrl) {
      const parsed = parseCanvaInput(value.canvaEmbedUrl || value.canvaShareUrl || "");
      if (!parsed.ok) {
        toast.error(parsed.error);
        return false;
      }
    }
    setSaving(true);
    try {
      await onSave(value);
      setDirty(false);
      toast.success("已儲存");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "儲存失敗");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      {dirty ? <p className="rounded-xl bg-sun/40 px-4 py-2 text-sm">有未儲存的修改。</p> : null}
      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg font-semibold">基本</legend>
        <Field label="標題">
          <input className="input" value={value.title} onChange={(e) => patch({ title: e.target.value })} required />
        </Field>
        <Field label="slug">
          <input className="input" value={value.slug} onChange={(e) => patch({ slug: e.target.value })} required />
        </Field>
        <Field label="副標">
          <input className="input" value={value.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="分類">
            <select className="input" value={value.category} onChange={(e) => patch({ category: e.target.value as ProjectCategory })}>
              {CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="產品狀態">
            <select className="input" value={value.productStatus} onChange={(e) => patch({ productStatus: e.target.value as ProductStatus })}>
              {STATUSES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="年份">
            <input className="input" value={value.year} onChange={(e) => patch({ year: e.target.value })} />
          </Field>
          <Field label="排序">
            <input
              className="input"
              type="number"
              value={value.sortOrder}
              onChange={(e) => patch({ sortOrder: Number(e.target.value) })}
            />
          </Field>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={value.featured} onChange={(e) => patch({ featured: e.target.checked })} />
            精選
          </label>
        </div>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg font-semibold">敘事（不會被 GitHub 同步覆蓋）</legend>
        <Field label="一句話">
          <textarea className="input min-h-24" value={value.summary} onChange={(e) => patch({ summary: e.target.value })} />
        </Field>
        <Field label="問題">
          <textarea className="input min-h-24" value={value.problem} onChange={(e) => patch({ problem: e.target.value })} />
        </Field>
        <Field label="角色">
          <textarea className="input min-h-20" value={value.role} onChange={(e) => patch({ role: e.target.value })} />
        </Field>
        <Field label="決策（一行一項）">
          <textarea className="input min-h-24" value={value.decisions.join("\n")} onChange={(e) => patch({ decisions: lines(e.target.value) })} />
        </Field>
        <Field label="模態">
          <textarea className="input min-h-20" value={value.modalities.join("\n")} onChange={(e) => patch({ modalities: lines(e.target.value) })} />
        </Field>
        <Field label="流程">
          <textarea className="input min-h-20" value={value.process.join("\n")} onChange={(e) => patch({ process: lines(e.target.value) })} />
        </Field>
        <Field label="產出">
          <textarea className="input min-h-20" value={value.outputs.join("\n")} onChange={(e) => patch({ outputs: lines(e.target.value) })} />
        </Field>
        <Field label="技術">
          <textarea className="input min-h-20" value={value.stack.join("\n")} onChange={(e) => patch({ stack: lines(e.target.value) })} />
        </Field>
        <Field label="限制">
          <textarea className="input min-h-20" value={value.limitations.join("\n")} onChange={(e) => patch({ limitations: lines(e.target.value) })} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg font-semibold">GitHub / Canva / Demo</legend>
        <Field label="GitHub URL">
          <input className="input" value={value.githubUrl ?? ""} onChange={(e) => patch({ githubUrl: e.target.value || null })} />
        </Field>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={value.githubSyncEnabled} onChange={(e) => patch({ githubSyncEnabled: e.target.checked })} />
          允許同步技術 metadata
        </label>
        <Field label="Live Demo URL">
          <input className="input" value={value.liveDemoUrl ?? ""} onChange={(e) => patch({ liveDemoUrl: e.target.value || null })} />
        </Field>
        <Field label="Demo 標籤">
          <input className="input" value={value.liveDemoLabel ?? ""} onChange={(e) => patch({ liveDemoLabel: e.target.value })} />
        </Field>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={value.liveDemoEmbedEnabled} onChange={(e) => patch({ liveDemoEmbedEnabled: e.target.checked })} />
          允許 iframe 嵌入
        </label>
        <Field label="Canva 分享／嵌入 URL">
          <input
            className="input"
            value={value.canvaShareUrl ?? ""}
            onChange={(e) => {
              const next = e.target.value;
              patch({
                canvaShareUrl: next || null,
                canvaEmbedUrl: next ? value.canvaEmbedUrl : null,
                canvaDesignId: next ? value.canvaDesignId : undefined,
              });
            }}
          />
        </Field>
        <Field label="Canva 嵌入 URL（可選）">
          <input className="input" value={value.canvaEmbedUrl ?? ""} onChange={(e) => patch({ canvaEmbedUrl: e.target.value || null })} />
        </Field>
        <Field label="封面圖 URL">
          <input
            className="input"
            value={value.media.find((item) => item.kind === "image")?.src ?? ""}
            onChange={(e) => {
              const video = value.media.find((item) => item.kind === "video");
              const image = e.target.value
                ? [{ src: e.target.value, alt: value.title || "封面", kind: "image" as const }]
                : [];
              patch({ media: [...image, ...(video ? [video] : [])] });
            }}
          />
        </Field>
        <Field label="影片 URL">
          <input
            className="input"
            value={value.media.find((item) => item.kind === "video")?.src ?? ""}
            onChange={(e) => {
              const image = value.media.find((item) => item.kind === "image");
              const video = e.target.value
                ? [{ src: e.target.value, alt: value.title || "影片", kind: "video" as const }]
                : [];
              patch({ media: [...(image ? [image] : []), ...video] });
            }}
          />
        </Field>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card">
        <legend className="font-display text-lg font-semibold">體驗與 SEO</legend>
        <Field label="體驗模式">
          <select
            className="input"
            value={value.experienceMode ?? ""}
            onChange={(e) => patch({ experienceMode: (e.target.value || null) as ExperienceMode | null })}
          >
            {MODES.map((item) => (
              <option key={item || "none"} value={item}>
                {item || "（未選）"}
              </option>
            ))}
          </select>
        </Field>
        <Field label="SEO 標題">
          <input className="input" value={value.seoTitle ?? ""} onChange={(e) => patch({ seoTitle: e.target.value })} />
        </Field>
        <Field label="SEO 描述">
          <textarea className="input min-h-20" value={value.seoDescription ?? ""} onChange={(e) => patch({ seoDescription: e.target.value })} />
        </Field>
        <Field label="英文一句話">
          <textarea
            className="input min-h-16"
            value={typeof value.localeEn.summary === "string" ? value.localeEn.summary : ""}
            onChange={(e) => patch({ localeEn: { ...value.localeEn, summary: e.target.value } })}
          />
        </Field>
        <Field label="中文補充">
          <textarea
            className="input min-h-16"
            value={typeof value.localeZh.note === "string" ? value.localeZh.note : ""}
            onChange={(e) => patch({ localeZh: { ...value.localeZh, note: e.target.value } })}
          />
        </Field>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className="min-h-11 rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground">
          {saving ? "儲存中…" : "儲存草稿"}
        </button>
        {onPublish ? (
          <button
            type="button"
            className="min-h-11 rounded-full bg-ink px-5 text-sm text-bg"
            onClick={() =>
              void (async () => {
                const ok = await save();
                if (!ok || !onPublish) return;
                await onPublish();
                toast.success("已發布");
              })().catch((e) => toast.error(String(e)))
            }
          >
            發布
          </button>
        ) : null}
        {onUnpublish ? (
          <button
            type="button"
            className="min-h-11 rounded-full bg-surface px-5 text-sm shadow-card"
            onClick={() => void onUnpublish().then(() => toast.success("已下架")).catch((e) => toast.error(String(e)))}
          >
            下架
          </button>
        ) : null}
        {onArchive ? (
          <button
            type="button"
            className="min-h-11 rounded-full bg-surface-blue px-5 text-sm"
            onClick={() => void onArchive().then(() => toast.success("已封存")).catch((e) => toast.error(String(e)))}
          >
            封存
          </button>
        ) : null}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
