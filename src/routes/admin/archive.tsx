import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listAdminArchiveFn, restoreProjectFn, upsertArchiveFn } from "@/lib/portfolio/cms-fns";
import { listAdminProjectsFn } from "@/lib/portfolio/cms-fns";
import type { AdminArchiveItem, AdminProject } from "@/lib/portfolio/types";

export const Route = createFileRoute("/admin/archive")({
  component: AdminArchive,
});

function AdminArchive() {
  const [items, setItems] = useState<AdminArchiveItem[]>([]);
  const [archived, setArchived] = useState<AdminProject[]>([]);
  useEffect(() => {
    void listAdminArchiveFn().then(setItems);
    void listAdminProjectsFn().then((projects) =>
      setArchived(projects.filter((p) => p.publicationStatus === "archived")),
    );
  }, []);
  return (
    <div className="grid gap-8">
      <h1 className="font-display text-3xl font-semibold">Archive 與封存</h1>
      <section>
        <h2 className="font-display text-xl font-semibold">視覺 Archive</h2>
        <ul className="mt-4 grid gap-3">
          {items.map((item) => (
            <li key={String(item.id)} className="rounded-2xl bg-surface p-4 shadow-card">
              <p className="font-medium">{String(item.title)}</p>
              <p className="text-xs text-muted">
                {String(item.kind)} · {String(item.publicationStatus)}
              </p>
              <button
                type="button"
                className="mt-2 min-h-11 text-sm text-mint-deep"
                onClick={async () => {
                  await upsertArchiveFn({
                    data: {
                      id: String(item.id),
                      title: String(item.title),
                      kind: item.kind,
                      year: String(item.year ?? ""),
                      summary: String(item.summary ?? ""),
                      originNote: String(item.originNote ?? ""),
                      media: item.media,
                      href: item.href,
                      canvaShareUrl: item.canva?.shareUrl ?? null,
                      canvaEmbedUrl: item.canva?.embedUrl ?? null,
                      canvaDesignId: item.canva?.designId,
                      canvaThumbnailUrl: item.canva?.thumbnailUrl,
                      publicationStatus:
                        item.publicationStatus === "published" ? "unpublished" : "published",
                      sortOrder: Number(item.sortOrder ?? 0),
                    },
                  });
                  toast.success("已更新 Archive 發布狀態");
                }}
              >
                切換發布
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">已封存作品</h2>
        <ul className="mt-4 grid gap-3">
          {archived.map((project) => (
            <li key={project.id} className="flex items-center justify-between rounded-2xl bg-surface p-4 shadow-card">
              <span>{project.title}</span>
              <button
                type="button"
                className="min-h-11 text-sm text-mint-deep"
                onClick={async () => {
                  await restoreProjectFn({ data: { id: project.id } });
                  toast.success("已還原為草稿");
                }}
              >
                還原
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
