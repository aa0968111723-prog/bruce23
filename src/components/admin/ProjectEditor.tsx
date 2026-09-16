import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { ProjectWrite } from "@/lib/portfolio/schema";
import { projectWriteSchema } from "@/lib/portfolio/schema";
import { EXPERIENCE_MODES, PRODUCT_STATUSES, PROJECT_CATEGORIES } from "@/lib/portfolio/constants";
import {
  saveAdminProject,
  setAdminPublication,
  syncGithubProject,
  testCanvaEmbed,
  verifyLiveDemoProject,
} from "@/lib/portfolio/server-admin";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "min-h-11 rounded-xl border border-line bg-surface px-3 text-sm";

export function ProjectEditor({
  id,
  initial,
}: {
  id?: string;
  initial: ProjectWrite;
}) {
  const [value, setValue] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const json = useMemo(() => JSON.stringify(value), [value]);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const patch = (partial: Partial<ProjectWrite>) => {
    setValue((current) => ({ ...current, ...partial }));
    setDirty(true);
  };

  const save = async (status?: ProjectWrite["publication_status"]) => {
    if (!id) return;
    setSaving(true);
    try {
      const parsed = projectWriteSchema.parse(value);
      await saveAdminProject({ data: { id, project: parsed } });
      if (status) await setAdminPublication({ data: { id, status } });
      setDirty(false);
      toast.success(status === "published" ? "已發布" : "草稿已儲存");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void save(value.publication_status ?? "draft");
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Slug">
          <input className={inputClass} value={value.slug} onChange={(e) => patch({ slug: e.target.value })} />
        </Field>
        <Field label="標題">
          <input className={inputClass} value={value.title} onChange={(e) => patch({ title: e.target.value })} />
        </Field>
        <Field label="Title (EN)">
          <input className={inputClass} value={value.title_en ?? ""} onChange={(e) => patch({ title_en: e.target.value })} />
        </Field>
        <Field label="副標">
          <input className={inputClass} value={value.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
        </Field>
        <Field label="分類">
          <select className={inputClass} value={value.category} onChange={(e) => patch({ category: e.target.value as ProjectWrite["category"] })}>
            {PROJECT_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="產品狀態">
          <select className={inputClass} value={value.product_status} onChange={(e) => patch({ product_status: e.target.value as ProjectWrite["product_status"] })}>
            {PRODUCT_STATUSES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="年份">
          <input className={inputClass} value={value.year} onChange={(e) => patch({ year: e.target.value })} />
        </Field>
        <Field label="排序">
          <input
            type="number"
            className={inputClass}
            value={value.sort_order}
            onChange={(e) => patch({ sort_order: Number(e.target.value) })}
          />
        </Field>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.featured}
          onChange={(e) => patch({ featured: e.target.checked })}
        />
        精選
      </label>
      <Field label="一句話">
        <textarea className={`${inputClass} min-h-24 py-2`} value={value.summary} onChange={(e) => patch({ summary: e.target.value })} />
      </Field>
      <Field label="問題">
        <textarea className={`${inputClass} min-h-24 py-2`} value={value.problem} onChange={(e) => patch({ problem: e.target.value })} />
      </Field>
      <Field label="角色">
        <textarea className={`${inputClass} min-h-20 py-2`} value={value.role} onChange={(e) => patch({ role: e.target.value })} />
      </Field>
      <Field label="決策（每行一則）">
        <textarea
          className={`${inputClass} min-h-32 py-2`}
          value={value.decisions.join("\n")}
          onChange={(e) => patch({ decisions: e.target.value.split("\n").filter(Boolean) })}
        />
      </Field>
      <Field label="限制">
        <textarea
          className={`${inputClass} min-h-24 py-2`}
          value={value.limitations.join("\n")}
          onChange={(e) => patch({ limitations: e.target.value.split("\n").filter(Boolean) })}
        />
      </Field>
      <Field label="封面圖 src">
        <input
          className={inputClass}
          value={value.media[0]?.src ?? ""}
          onChange={(e) =>
            patch({
              media: [
                {
                  src: e.target.value,
                  alt: value.media[0]?.alt || value.title,
                  kind: "image",
                  caption: value.media[0]?.caption,
                },
              ],
            })
          }
        />
      </Field>
      <Field label="GitHub URL">
        <input className={inputClass} value={value.github_url ?? ""} onChange={(e) => patch({ github_url: e.target.value || undefined })} />
      </Field>
      <Field label="Live demo URL">
        <input className={inputClass} value={value.live_demo_url ?? ""} onChange={(e) => patch({ live_demo_url: e.target.value || undefined })} />
      </Field>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.live_demo_embed_enabled}
          onChange={(e) => patch({ live_demo_embed_enabled: e.target.checked })}
        />
        允許嵌入 demo
      </label>
      <Field label="Canva 分享 URL">
        <input className={inputClass} value={value.canva_share_url ?? ""} onChange={(e) => patch({ canva_share_url: e.target.value || undefined })} />
      </Field>
      <Field label="Canva embed URL">
        <input className={inputClass} value={value.canva_embed_url ?? ""} onChange={(e) => patch({ canva_embed_url: e.target.value || undefined })} />
      </Field>
      <Field label="體驗模式">
        <select
          className={inputClass}
          value={value.experience_mode}
          onChange={(e) => patch({ experience_mode: e.target.value as ProjectWrite["experience_mode"] })}
        >
          {EXPERIENCE_MODES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Field label="SEO title">
        <input className={inputClass} value={value.seo?.title ?? ""} onChange={(e) => patch({ seo: { ...value.seo, title: e.target.value } })} />
      </Field>
      <p className="text-xs text-muted">表單指紋 {json.length} · {dirty ? "有未儲存變更" : "已同步"}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={() => void save("draft")}
        >
          存成草稿
        </button>
        <button
          type="button"
          disabled={saving}
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
          onClick={() => void save("published")}
        >
          發布
        </button>
        <button
          type="button"
          disabled={saving || !id}
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={() => id && void save("unpublished")}
        >
          取消發布
        </button>
        <button
          type="button"
          disabled={!id}
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={async () => {
            if (!id) return;
            const result = await syncGithubProject({ data: { id, apply: true } });
            if (result.ok) toast.success("GitHub 已同步（未覆寫敘事）");
            else toast.error(result.error);
          }}
        >
          同步 GitHub
        </button>
        <button
          type="button"
          disabled={!id}
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={async () => {
            if (!id) return;
            const result = await verifyLiveDemoProject({ data: { id } });
            toast.message(result.ok ? "Demo 可達" : "Demo 不可用");
          }}
        >
          測試 Demo
        </button>
        <button
          type="button"
          disabled={!id}
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={async () => {
            if (!id) return;
            const result = await testCanvaEmbed({
              data: { id, url: value.canva_share_url ?? value.canva_embed_url },
            });
            if (result.ok) toast.success("Canva 連結可用");
            else toast.error(result.error);
          }}
        >
          測試 Canva
        </button>
      </div>
    </form>
  );
}
