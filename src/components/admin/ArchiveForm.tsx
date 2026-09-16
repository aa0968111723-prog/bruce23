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
      <Field
        label="Canva 分享網址"
        value={form.canva_share_url ?? ""}
        onChange={(value) => patch("canva_share_url", value || null)}
      />
      <p className="text-xs text-muted">
        只接受 canva.com/design 或 /d/ 短網址。沒有公開 /design/{"{id}"} 時不會嵌入 iframe，也不會虛構設計編號。
      </p>
      <Field label="Canva 替代文字" value={form.canva_alt ?? ""} onChange={(value) => patch("canva_alt", value || null)} />
      <Field
        label="Canva 說明"
        value={form.canva_caption ?? ""}
        onChange={(value) => patch("canva_caption", value || null)}
      />
      <button type="submit" className="min-h-11 justify-self-start rounded-full bg-ink px-5 text-sm text-bg">
        儲存 Archive
      </button>
    </form>
  );
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
