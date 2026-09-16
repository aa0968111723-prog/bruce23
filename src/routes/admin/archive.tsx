import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminArchiveFn, saveArchiveFn } from "@/lib/cms/admin-fn";
import type { AdminArchiveItem } from "@/lib/cms/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/archive")({
  component: AdminArchive,
});

function AdminArchive() {
  const [items, setItems] = useState<AdminArchiveItem[]>([]);
  useEffect(() => {
    void listAdminArchiveFn().then(setItems);
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl">Archive</h1>
      <ul className="mt-6 grid gap-3">
        {items.map((item) => (
          <li key={String(item.id)} className="rounded-2xl bg-surface p-4 shadow-card">
            <p className="font-medium">{String(item.title)}</p>
            <p className="text-xs text-muted">{String(item.publication_status)}</p>
            <label className="mt-2 grid gap-1 text-sm">
              Canva 分享
              <input
                className="min-h-11 rounded-xl border border-line px-3"
                defaultValue={String(item.canva_share_url ?? "")}
                onBlur={(event) => {
                  void saveArchiveFn({
                    data: {
                      id: String(item.id),
                      slug: String(item.slug),
                      title: String(item.title),
                      kind: String(item.kind),
                      year: String(item.year),
                      summary: String(item.summary ?? ""),
                      origin_note: String(item.origin_note ?? ""),
                      publication_status:
                        item.publication_status === "draft" || item.publication_status === "archived"
                          ? item.publication_status
                          : "published",
                      sort_order: Number(item.sort_order ?? 0),
                      canva_share_url: event.target.value,
                      canva_status: event.target.value ? "pending" : "not_configured",
                    },
                  })
                    .then(() => toast.success("Archive 已更新"))
                    .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "失敗"));
                }}
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
