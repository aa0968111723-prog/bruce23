import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProjectForm } from "@/components/admin/ProjectForm";
import {
  applyGithubSyncFn,
  archiveProjectFn,
  getAdminProjectFn,
  listRevisionsFn,
  previewGithubSyncFn,
  publishProjectFn,
  restoreRevisionFn,
  saveDraftProjectFn,
  unpublishProjectFn,
  verifyCanvaFn,
  verifyDemoFn,
} from "@/lib/portfolio/cms-fns";
import type { AdminProject } from "@/lib/portfolio/types";

export const Route = createFileRoute("/admin/projects/$id/edit")({
  component: EditProject,
});

function EditProject() {
  const { id } = Route.useParams();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [revisions, setRevisions] = useState<Array<{ id: string; created_at: string; note: string | null }>>([]);
  const [preview, setPreview] = useState<string>("");

  async function refresh() {
    const next = await getAdminProjectFn({ data: { id } });
    setProject(next);
    const revs = await listRevisionsFn({ data: { projectId: id } });
    setRevisions(revs);
  }

  useEffect(() => {
    void refresh();
  }, [id]);

  if (!project) return <p className="text-sm text-muted">載入中…</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold">編輯 {project.title}</h1>
        <ProjectForm
          initial={project}
          onSave={async (value) => {
            await saveDraftProjectFn({ data: { id, ...value } });
            await refresh();
          }}
          onPublish={async () => {
            await publishProjectFn({ data: { id } });
            await refresh();
          }}
          onUnpublish={async () => {
            await unpublishProjectFn({ data: { id } });
            await refresh();
          }}
          onArchive={async () => {
            await archiveProjectFn({ data: { id } });
            await refresh();
          }}
        />
      </div>
      <aside className="grid gap-4">
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <h2 className="font-display text-lg font-semibold">GitHub 同步</h2>
          <p className="mt-2 text-xs text-muted">上次同步：{project.github?.lastSyncedAt ?? "尚未"}</p>
          {project.githubSyncError ? <p className="mt-2 text-sm text-ink">錯誤：{project.githubSyncError}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-11 rounded-full bg-surface-blue px-4 text-sm"
              onClick={async () => {
                const data = await previewGithubSyncFn({ data: { projectId: id } });
                setPreview(JSON.stringify(data, null, 2));
              }}
            >
              預覽差異
            </button>
            <button
              type="button"
              className="min-h-11 rounded-full bg-ink px-4 text-sm text-bg"
              onClick={async () => {
                const data = await applyGithubSyncFn({ data: { projectId: id } });
                if (!data.ok) toast.error(data.error);
                else toast.success("已同步技術資料，敘事未覆蓋");
                await refresh();
              }}
            >
              同步 GitHub
            </button>
          </div>
          {preview ? (
            <div className="mt-3 rounded-xl bg-surface-blue/70 p-3 text-xs">
              {(() => {
                try {
                  const data = JSON.parse(preview) as {
                    ok?: boolean;
                    error?: string;
                    lastSyncedAt?: string | null;
                    changingFields?: Array<{ field: string; from: string; to: string }>;
                    incoming?: { name?: string; description?: string | null; branch?: string };
                  };
                  if (!data.ok) return <p>無法預覽：{data.error}</p>;
                  return (
                    <div>
                      <p>上次同步：{data.lastSyncedAt ?? "尚未"}</p>
                      <p className="mt-1">
                        最新：{data.incoming?.name} / {data.incoming?.branch}
                      </p>
                      <ul className="mt-2 grid gap-1">
                        {(data.changingFields ?? []).map((field) => (
                          <li key={field.field}>
                            {field.field}：{field.from} → {field.to}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                } catch {
                  return <pre className="max-h-64 overflow-auto">{preview}</pre>;
                }
              })()}
            </div>
          ) : null}
        </div>
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <h2 className="font-display text-lg font-semibold">連線測試</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-11 rounded-full bg-surface-mint px-4 text-sm"
              onClick={async () => {
                const result = await verifyDemoFn({ data: { projectId: id } });
                toast.message(`Demo：${result.status}`);
                await refresh();
              }}
            >
              測試 Demo
            </button>
            <button
              type="button"
              className="min-h-11 rounded-full bg-surface-mint px-4 text-sm"
              onClick={async () => {
                const result = await verifyCanvaFn({ data: { projectId: id } });
                toast.message(`Canva：${result.status}`);
                await refresh();
              }}
            >
              測試 Canva 嵌入
            </button>
            <Link to="/work/$slug" params={{ slug: project.slug }} className="inline-flex min-h-11 items-center text-sm text-mint-deep">
              看公開頁
            </Link>
          </div>
        </div>
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <h2 className="font-display text-lg font-semibold">修訂紀錄</h2>
          <ul className="mt-3 grid gap-2">
            {revisions.map((rev) => (
              <li key={rev.id} className="flex items-center justify-between gap-2 text-xs">
                <span>
                  {new Date(rev.created_at).toLocaleString()} · {rev.note ?? "save"}
                </span>
                <button
                  type="button"
                  className="min-h-11 text-mint-deep"
                  onClick={async () => {
                    await restoreRevisionFn({ data: { projectId: id, revisionId: rev.id } });
                    toast.success("已還原修訂");
                    await refresh();
                  }}
                >
                  還原
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
