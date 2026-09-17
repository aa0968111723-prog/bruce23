import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listAdminArchiveItems,
  saveAdminArchiveItem,
} from "@/lib/portfolio/server-admin";

export const Route = createFileRoute("/admin/archive")({
  component: AdminArchive,
});

function AdminArchive() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAdminArchiveItems>>>([]);
  useEffect(() => {
    listAdminArchiveItems().then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Archive</h1>
      <ul className="mt-6 grid gap-4">
        {rows.map((row) => (
          <li key={String(row.id)} className="rounded-2xl bg-surface p-4 shadow-card">
            <p className="font-medium">{String(row.title)}</p>
            <p className="text-xs text-muted">
              {String(row.kind)} · {String(row.publication_status)}
            </p>
            <label className="mt-3 grid gap-1 text-sm">
              Canva 分享 URL
              <input
                className="min-h-11 rounded-xl border border-line px-3"
                defaultValue={String(row.canva_share_url ?? "")}
                onBlur={async (event) => {
                  await saveAdminArchiveItem({
                    data: {
                      id: String(row.id),
                      title: String(row.title),
                      kind: row.kind as
                        | "photography"
                        | "graphic"
                        | "social"
                        | "event"
                        | "video"
                        | "club-visual"
                        | "interactive",
                      year: String(row.year),
                      summary: String(row.summary ?? ""),
                      origin_note: String(row.origin_note ?? ""),
                      canva_share_url: event.target.value || undefined,
                      publication_status:
                        row.publication_status === "draft" ? "draft" : "published",
                      sort_order: Number(row.sort_order ?? 0),
                    },
                  });
                  toast.success("Archive 已更新");
                }}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-4 text-sm"
                onClick={async () => {
                  const next = row.publication_status === "published" ? "draft" : "published";
                  await saveAdminArchiveItem({
                    data: {
                      id: String(row.id),
                      title: String(row.title),
                      kind: row.kind as
                        | "photography"
                        | "graphic"
                        | "social"
                        | "event"
                        | "video"
                        | "club-visual"
                        | "interactive",
                      year: String(row.year),
                      summary: String(row.summary ?? ""),
                      origin_note: String(row.origin_note ?? ""),
                      canva_share_url: row.canva_share_url || undefined,
                      publication_status: next,
                      sort_order: Number(row.sort_order ?? 0),
                    },
                  });
                  toast.success(next === "published" ? "已恢復公開" : "已從公開列表移除");
                  setRows(await listAdminArchiveItems());
                }}
              >
                {row.publication_status === "published" ? "取消公開" : "恢復公開"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
