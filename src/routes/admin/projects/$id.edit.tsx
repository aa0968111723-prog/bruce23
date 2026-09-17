import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { getAdminProjectRow, restoreAdminRevision } from "@/lib/portfolio/server-admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/projects/$id/edit")({
  component: EditProject,
});

function EditProject() {
  const { id } = Route.useParams();
  const [bundle, setBundle] = useState<Awaited<ReturnType<typeof getAdminProjectRow>>>(null);

  useEffect(() => {
    getAdminProjectRow({ data: { id } }).then(setBundle).catch(() => setBundle(null));
  }, [id]);

  if (!bundle) return <p className="text-sm text-muted">載入中或找不到作品。</p>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">編輯 {bundle.project.title}</h1>
        <Link
          to="/admin/preview"
          search={{ slug: bundle.project.slug }}
          className="inline-flex min-h-11 items-center text-sm text-mint-deep"
        >
          草稿預覽
        </Link>
      </div>
      <ProjectEditor id={id} initial={bundle.project} />
      <section className="mt-10">
        <h2 className="font-display text-xl">修訂紀錄</h2>
        <ul className="mt-3 grid gap-2">
          {bundle.revisions.map((item) => (
            <li
              key={item.id}
              className="flex min-h-11 items-center justify-between rounded-xl bg-surface px-3 text-sm shadow-card"
            >
              <span>
                {item.note} · {String(item.created_at)}
              </span>
              <button
                type="button"
                className="text-mint-deep"
                onClick={async () => {
                  await restoreAdminRevision({ data: { id, revisionId: item.id } });
                  toast.success("已還原修訂");
                  setBundle(await getAdminProjectRow({ data: { id } }));
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
