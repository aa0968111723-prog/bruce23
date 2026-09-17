import { useMemo, useState, type ReactNode } from "react";
import { Link, useBlocker } from "@tanstack/react-router";
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
  const [diff, setDiff] = useState<{
    auto: Array<{ field: string; from: unknown; to: unknown }>;
    skippedNarrative: string[];
  } | null>(null);
  const json = useMemo(() => JSON.stringify(value), [value]);
  const blocker = useBlocker({
    shouldBlockFn: () => dirty,
    enableBeforeUnload: true,
    withResolver: true,
  });

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
      <Field label="SEO description">
        <textarea
          className={`${inputClass} min-h-20 py-2`}
          value={value.seo?.description ?? ""}
          onChange={(e) => patch({ seo: { ...value.seo, description: e.target.value } })}
        />
      </Field>
      <Field label="副標 EN">
        <input className={inputClass} value={value.subtitle_en ?? ""} onChange={(e) => patch({ subtitle_en: e.target.value })} />
      </Field>
      <Field label="一句話 EN">
        <textarea className={`${inputClass} min-h-20 py-2`} value={value.summary_en ?? ""} onChange={(e) => patch({ summary_en: e.target.value })} />
      </Field>
      <Field label="問題 EN">
        <textarea className={`${inputClass} min-h-20 py-2`} value={value.problem_en ?? ""} onChange={(e) => patch({ problem_en: e.target.value })} />
      </Field>
      <Field label="角色 EN">
        <textarea className={`${inputClass} min-h-20 py-2`} value={value.role_en ?? ""} onChange={(e) => patch({ role_en: e.target.value })} />
      </Field>
      <Field label="模態（每行）">
        <textarea
          className={`${inputClass} min-h-20 py-2`}
          value={value.modalities.join("\n")}
          onChange={(e) => patch({ modalities: e.target.value.split("\n").filter(Boolean) })}
        />
      </Field>
      <Field label="流程（每行）">
        <textarea
          className={`${inputClass} min-h-20 py-2`}
          value={value.process.join("\n")}
          onChange={(e) => patch({ process: e.target.value.split("\n").filter(Boolean) })}
        />
      </Field>
      <Field label="產出（每行）">
        <textarea
          className={`${inputClass} min-h-20 py-2`}
          value={value.outputs.join("\n")}
          onChange={(e) => patch({ outputs: e.target.value.split("\n").filter(Boolean) })}
        />
      </Field>
      <Field label="技術棧（每行）">
        <textarea
          className={`${inputClass} min-h-20 py-2`}
          value={value.stack.join("\n")}
          onChange={(e) => patch({ stack: e.target.value.split("\n").filter(Boolean) })}
        />
      </Field>
      <Field label="來源證據（label|https|note）">
        <textarea
          className={`${inputClass} min-h-24 py-2`}
          value={value.source_evidence
            .map((item) => `${item.label}|${item.href ?? ""}|${item.note}`)
            .join("\n")}
          onChange={(e) =>
            patch({
              source_evidence: e.target.value
                .split("\n")
                .filter(Boolean)
                .map((line) => {
                  const [label, href, ...rest] = line.split("|");
                  return {
                    label: label.trim(),
                    href: href?.trim() || undefined,
                    note: rest.join("|").trim() || label.trim(),
                  };
                }),
            })
          }
        />
      </Field>
      <Field label="封面 alt / 影片">
        <input
          className={inputClass}
          value={value.media[0]?.alt ?? ""}
          onChange={(e) =>
            patch({
              media: [
                {
                  src: value.media[0]?.src || "/media/hero/light-lab.jpg",
                  alt: e.target.value,
                  kind: value.media[0]?.kind ?? "image",
                  caption: value.media[0]?.caption,
                  poster: value.media[0]?.poster,
                },
              ],
            })
          }
        />
      </Field>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.media[0]?.kind === "video"}
          onChange={(e) =>
            patch({
              media: [
                {
                  src: value.media[0]?.src || "",
                  alt: value.media[0]?.alt || value.title,
                  kind: e.target.checked ? "video" : "image",
                  caption: value.media[0]?.caption,
                },
              ],
            })
          }
        />
        封面是影片
      </label>
      <Field label="GitHub owner">
        <input className={inputClass} value={value.github_owner ?? ""} onChange={(e) => patch({ github_owner: e.target.value })} />
      </Field>
      <Field label="GitHub repo">
        <input className={inputClass} value={value.github_repo ?? ""} onChange={(e) => patch({ github_repo: e.target.value })} />
      </Field>
      <Field label="GitHub branch">
        <input className={inputClass} value={value.github_branch ?? ""} onChange={(e) => patch({ github_branch: e.target.value })} />
      </Field>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.github_sync_enabled}
          onChange={(e) => patch({ github_sync_enabled: e.target.checked })}
        />
        允許同步 GitHub 技術欄位
      </label>
      <Field label="Demo 標籤">
        <input className={inputClass} value={value.live_demo_label ?? ""} onChange={(e) => patch({ live_demo_label: e.target.value })} />
      </Field>
      <Field label="Canva design id">
        <input className={inputClass} value={value.canva_design_id ?? ""} onChange={(e) => patch({ canva_design_id: e.target.value })} />
      </Field>
      <Field label="Canva pages（逗號）">
        <input
          className={inputClass}
          value={value.canva_page_ids.join(",")}
          onChange={(e) =>
            patch({
              canva_page_ids: e.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
      </Field>
      <Field label="Canva 封面 / alt / caption">
        <input className={inputClass} placeholder="thumbnail URL" value={value.canva_thumbnail_url ?? ""} onChange={(e) => patch({ canva_thumbnail_url: e.target.value })} />
        <input className={inputClass} placeholder="alt" value={value.canva_alt ?? ""} onChange={(e) => patch({ canva_alt: e.target.value })} />
        <input className={inputClass} placeholder="caption" value={value.canva_caption ?? ""} onChange={(e) => patch({ canva_caption: e.target.value })} />
      </Field>
      <Field label="體驗標籤">
        <input className={inputClass} value={value.experience_label ?? ""} onChange={(e) => patch({ experience_label: e.target.value })} />
      </Field>
      <Field label="互動步驟（id|title|body）">
        <textarea
          className={`${inputClass} min-h-24 py-2`}
          value={value.interaction_steps.map((item) => `${item.id}|${item.title}|${item.body}`).join("\n")}
          onChange={(e) =>
            patch({
              interaction_steps: e.target.value
                .split("\n")
                .filter(Boolean)
                .map((line, index) => {
                  const [id, title, ...rest] = line.split("|");
                  return {
                    id: id || String(index),
                    title: title || `步驟 ${index + 1}`,
                    body: rest.join("|"),
                  };
                }),
            })
          }
        />
      </Field>
      <Field label="experience_config JSON">
        <textarea
          className={`${inputClass} min-h-32 py-2 font-mono text-xs`}
          value={JSON.stringify(value.experience_config, null, 2)}
          onChange={(e) => {
            try {
              patch({ experience_config: JSON.parse(e.target.value) });
            } catch {
              /* keep typing */
            }
          }}
        />
      </Field>
      {diff ? (
        <div className="rounded-2xl bg-surface-blue p-4 text-sm">
          <p className="font-medium">即將自動寫入的技術欄位</p>
          <ul className="mt-2 grid gap-1">
            {diff.auto.map((item) => (
              <li key={item.field}>
                {item.field}: {String(item.from ?? "—")} → {typeof item.to === "object" ? "…" : String(item.to)}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            不會覆寫敘事：{diff.skippedNarrative.join(", ") || "無"}
          </p>
        </div>
      ) : null}
      <p className="text-xs text-muted">表單指紋 {json.length} · {dirty ? "有未儲存變更" : "已同步"}</p>
      {blocker.status === "blocked" ? (
        <div className="rounded-2xl bg-surface-blue p-4 text-sm">
          <p>有未儲存變更。要離開這個編輯頁嗎？</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-bg"
              onClick={() => blocker.proceed()}
            >
              離開
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
              onClick={() => blocker.reset()}
            >
              繼續編輯
            </button>
          </div>
        </div>
      ) : null}
      {id ? (
        <Link
          to="/admin/preview"
          search={{ slug: value.slug }}
          className="inline-flex min-h-11 items-center text-sm text-mint-deep"
        >
          草稿預覽（公開頁不會顯示草稿）
        </Link>
      ) : null}
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
            const preview = await syncGithubProject({ data: { id, apply: false } });
            if (preview.ok) {
              setDiff(preview.diff);
              toast.message("已比對目前與 GitHub。敘事欄位不會自動覆寫。");
            } else {
              toast.error(preview.error);
            }
          }}
        >
          比對 GitHub
        </button>
        <button
          type="button"
          disabled={!id}
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={async () => {
            if (!id) return;
            const result = await syncGithubProject({ data: { id, apply: true } });
            if (result.ok) {
              setDiff(result.diff);
              toast.success("GitHub 已同步（未覆寫敘事）");
            } else toast.error(result.error);
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
        <button
          type="button"
          disabled={!id}
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={() => id && void save("archived")}
        >
          封存
        </button>
        <button
          type="button"
          disabled={!id}
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm shadow-card"
          onClick={() => id && void save("draft")}
        >
          從封存恢復成草稿
        </button>
      </div>
    </form>
  );
}
