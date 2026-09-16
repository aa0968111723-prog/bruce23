import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { listAdminArchiveFn, saveArchiveItemFn } from "@/lib/cms/admin-fns";
import { useEffect, useState } from "react";
import type { PublicArchiveItem } from "@/lib/cms/public-types";

export const Route = createFileRoute("/admin/archive")({
  component: AdminArchive,
});

function AdminArchive() {
  const [items, setItems] = useState<PublicArchiveItem[] | null>(null);
  useEffect(() => {
    void listAdminArchiveFn()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);
  if (!items) return <p className="text-sm text-muted">載入中…</p>;
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Archive</h1>
      <p className="mt-2 text-sm text-muted">草稿不會出現在公開 Archive。</p>
      <ul className="mt-6 grid gap-4">
        {items.map((item) => (
          <ArchiveEditor key={item.id} item={item} />
        ))}
      </ul>
      <Link to="/archive" className="mt-6 inline-flex min-h-11 text-sm text-mint-deep">
        看公開 Archive
      </Link>
    </div>
  );
}

function ArchiveEditor({ item }: { item: PublicArchiveItem }) {
  const [title, setTitle] = useState(item.title);
  const [summary, setSummary] = useState(item.summary);
  const [status, setStatus] = useState<"draft" | "published" | "unpublished" | "archived">("published");
  return (
    <li className="rounded-2xl bg-surface p-4 shadow-card">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="min-h-11 w-full rounded-xl border border-line px-3 text-sm"
      />
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="mt-2 min-h-24 w-full rounded-xl border border-line px-3 py-2 text-sm"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="min-h-11 rounded-xl border border-line px-3 text-sm"
        >
          <option value="published">published</option>
          <option value="draft">draft</option>
          <option value="archived">archived</option>
        </select>
        <button
          type="button"
          className="min-h-11 rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          onClick={async () => {
            try {
              await saveArchiveItemFn({
                data: {
                  id: item.id,
                  title,
                  kind: item.kind,
                  year: item.year,
                  summary,
                  origin_note: item.originNote,
                  href: item.href,
                  publication_status: status,
                  canva_share_url: item.canvaShareUrl,
                  canva_embed_url: item.canvaEmbedUrl,
                },
              });
              toast.success("已儲存");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "失敗");
            }
          }}
        >
          儲存
        </button>
      </div>
    </li>
  );
}
