import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { saveArchiveFn } from "@/lib/cms/admin-fn";
import type { AdminArchiveItem } from "@/lib/cms/store";
import type { ArchiveInput } from "@/lib/cms/schema";
import { PUBLICATION_STATUSES, publicationStatusLabel } from "@/lib/cms/status";
import { archiveKinds } from "@/content/archive";
import { parseCanvaDesign, isCanvaShortLink } from "@/lib/canva/parse";

const KIND_OPTIONS = archiveKinds.filter((item) => item.id !== "all");

function toForm(item: AdminArchiveItem): ArchiveInput & { id: string } {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    kind: item.kind,
    year: item.year,
    summary: item.summary,
    media: item.media,
    href: item.href,
    origin_note: item.origin_note,
    publication_status: item.publication_status,
    sort_order: item.sort_order,
    canva_share_url: item.canva_share_url,
    canva_embed_url: item.canva_embed_url,
    canva_design_id: item.canva_design_id,
    canva_page_ids: item.canva_page_ids,
    canva_thumbnail_url: item.canva_thumbnail_url,
    canva_status: item.canva_status,
    canva_alt: item.canva_alt,
    canva_caption: item.canva_caption,
    locale_json: item.locale_json ?? {},
  };
}

export function ArchiveForm({
  item,
  onSaved,
}: {
  item: AdminArchiveItem;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ArchiveInput & { id: string }>(() => toForm(item));
  const [dirty, setDirty] = useState(false);
  const initial = useMemo(() => JSON.stringify(toForm(item)), [item]);

  useEffect(() => {
    setForm(toForm(item));
    setDirty(false);
  }, [item]);

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

  function patch<K extends keyof ArchiveInput>(key: K, value: ArchiveInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="grid gap-3 rounded-2xl bg-surface p-5 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = parseCanvaDesign(form.canva_share_url);
        const share = form.canva_share_url?.trim() || "";
        void saveArchiveFn({
          data: {
            ...form,
            canva_share_url: share || null,
            canva_embed_url: parsed?.embedUrl ?? (share && isCanvaShortLink(share) ? null : form.canva_embed_url),
            canva_design_id: parsed?.designId ?? form.canva_design_id,
            canva_status: share
              ? parsed
                ? "pending"
                : isCanvaShortLink(share)
                  ? "pending"
                  : "unavailable"
              : "not_configured",
          },
        })
          .then(() => {
            toast.success("Archive 已儲存");
            setDirty(false);
            onSaved();
          })
          .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "儲存失敗"));
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-lg">{form.title || "未命名"}</p>
        <span className="text-xs text-muted">{publicationStatusLabel[form.publication_status]}</span>
      </div>
      {dirty ? <p className="text-sm text-muted">有未儲存的修改。</p> : null}
      <Field label="標題" value={form.title} onChange={(value) => patch("title", value)} />
      <Field label="slug" value={form.slug} onChange={(value) => patch("slug", value)} />
      <label className="grid gap-1 text-sm">
        類型
        <select
          className="min-h-11 rounded-xl border border-line px-3"
          value={form.kind}
          onChange={(event) => patch("kind", event.target.value)}
        >
          {KIND_OPTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
          {KIND_OPTIONS.some((item) => item.id === form.kind) ? null : <option value={form.kind}>{form.kind}</option>}
        </select>
      </label>
      <Field label="年份" value={form.year} onChange={(value) => patch("year", value)} />
      <Area label="摘要" value={form.summary} onChange={(value) => patch("summary", value)} />
      <Area label="來源說明" value={form.origin_note} onChange={(value) => patch("origin_note", value)} />
      <fieldset className="grid gap-3 rounded-xl border border-line p-4">
        <legend className="font-display text-base">語系</legend>
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
          label="中文來源說明"
          value={String(form.locale_json?.zh?.originNote ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              zh: { ...form.locale_json?.zh, originNote: value },
            })
          }
        />
        <Area
          label="中文媒體說明"
          value={String(form.locale_json?.zh?.caption ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              zh: { ...form.locale_json?.zh, caption: value },
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
          label="英文來源說明"
          value={String(form.locale_json?.en?.originNote ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              en: { ...form.locale_json?.en, originNote: value },
            })
          }
        />
        <Area
          label="英文媒體說明"
          value={String(form.locale_json?.en?.caption ?? "")}
          onChange={(value) =>
            patch("locale_json", {
              ...form.locale_json,
              en: { ...form.locale_json?.en, caption: value },
            })
          }
        />
      </fieldset>
      <Field
        label="媒體路徑"
        value={form.media?.src ?? ""}
        onChange={(value) => {
          const src = value.trim();
          patch(
            "media",
            src
              ? {
                  src,
                  alt: form.media?.alt || form.title,
                  kind: form.media?.kind ?? "image",
                  caption: form.media?.caption,
                  poster: form.media?.poster,
                }
              : null,
          );
        }}
      />
      <Field
        label="媒體替代文字"
        value={form.media?.alt ?? ""}
        onChange={(value) =>
          patch("media", form.media ? { ...form.media, alt: value || form.title } : null)
        }
      />
      <Field
        label="媒體說明"
        value={form.media?.caption ?? ""}
        onChange={(value) =>
          patch("media", form.media ? { ...form.media, caption: value || undefined } : null)
        }
      />
      <label className="grid gap-1 text-sm">
        媒體類型
        <select
          className="min-h-11 rounded-xl border border-line px-3"
          value={form.media?.kind ?? "image"}
          onChange={(event) =>
            patch(
              "media",
              form.media
                ? { ...form.media, kind: event.target.value as "image" | "video" }
                : null,
            )
          }
        >
          <option value="image">image</option>
          <option value="video">video</option>
        </select>
      </label>
      <Field
        label="影片封面（poster）"
        value={form.media?.poster ?? ""}
        onChange={(value) =>
          patch("media", form.media ? { ...form.media, poster: value || undefined } : null)
        }
      />
      <Field label="公開連結" value={form.href ?? ""} onChange={(value) => patch("href", value || null)} />
      <label className="grid gap-1 text-sm">
        發布狀態
        <select
          className="min-h-11 rounded-xl border border-line px-3"
          value={form.publication_status}
          onChange={(event) =>
            patch("publication_status", event.target.value as ArchiveInput["publication_status"])
          }
        >
          {PUBLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {publicationStatusLabel[status]}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="排序"
        value={String(form.sort_order)}
        onChange={(value) => patch("sort_order", Number(value) || 0)}
      />
      {!(form.canva_share_url ?? "").trim() ? (
        <p className="rounded-xl bg-surface-blue/70 px-3 py-2 text-xs text-muted">
          目前沒有 Canva 分享連結。請貼上 canva.com/design/{"{id}"} 公開分享網址（例如
          https://www.canva.com/design/{"{id}"}/view）。短網址 /d/ 也可以貼，但要等轉到
          /design/{"{id}"} 才會嵌入。沒有真實分享連結時不要虛構設計編號。
        </p>
      ) : null}
      <Field
        label="Canva 分享網址"
        value={form.canva_share_url ?? ""}
        placeholder="https://www.canva.com/design/{id}/view"
        emptyHint="空著就不會嵌入、也不能翻頁。請貼公開分享連結，不要發明設計編號。"
        onChange={(value) => patch("canva_share_url", value || null)}
      />
      <p className="text-xs text-muted">
        只接受 canva.com/design/{"{id}"} 或 /d/ 短網址。沒有公開 /design/{"{id}"} 時不會嵌入 iframe，也不會虛構設計編號。
      </p>
      <Field label="Canva 替代文字" value={form.canva_alt ?? ""} onChange={(value) => patch("canva_alt", value || null)} />
      <Field
        label="Canva 說明"
        value={form.canva_caption ?? ""}
        onChange={(value) => patch("canva_caption", value || null)}
      />
      <Field
        label="Canva 封面（只接受站內 /media/ 路徑）"
        value={form.canva_thumbnail_url ?? ""}
        onChange={(value) => patch("canva_thumbnail_url", value || null)}
      />
      <Field
        label="Canva 頁面 id（逗號分隔，需真實 /design/{id} 後才填）"
        value={(form.canva_page_ids ?? []).join(", ")}
        onChange={(value) =>
          patch(
            "canva_page_ids",
            value
              .split(/[,\s]+/)
              .map((item) => item.trim())
              .filter(Boolean),
          )
        }
      />
      <button type="submit" className="min-h-11 justify-self-start rounded-full bg-ink px-5 text-sm text-bg">
        儲存 Archive
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  emptyHint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyHint?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <input
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
