import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExperiencePanel } from "@/components/experience/ExperiencePanel";
import { previewDraftFn } from "@/lib/cms/admin-fn";
import { publicationStatusLabel } from "@/lib/cms/status";
import type { PublicProject } from "@/lib/cms/privacy";

export const Route = createFileRoute("/admin/draft/$slug")({
  component: DraftPreview,
});

function DraftPreview() {
  const { slug } = Route.useParams();
  const [data, setData] = useState<{
    publicationStatus: string;
    project: PublicProject;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void previewDraftFn({ data: { slug } })
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "讀取失敗"));
  }, [slug]);

  if (error) return <p className="text-sm text-alert">{error}</p>;
  if (!data) return <p className="text-sm text-muted">載入草稿預覽…</p>;

  return (
    <div>
      <p className="rounded-2xl bg-surface-mint px-4 py-3 text-sm">
        這是後台預覽，不是前台。狀態{" "}
        {publicationStatusLabel[data.publicationStatus as keyof typeof publicationStatusLabel] ??
          data.publicationStatus}
        。草稿不會出現在作品列表、個案、sitemap 或 JSON-LD。
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to="/admin/preview" className="text-mint-deep">
          回預覽列表
        </Link>
        <a href={`/work/${data.project.slug}`} className="text-muted">
          前台（未發布會 404）
        </a>
      </div>
      <h1 className="mt-6 font-display text-3xl">{data.project.title}</h1>
      <p className="mt-2 text-muted">{data.project.subtitle}</p>
      <div className="mt-6">
        <ExperiencePanel project={data.project} variant="page" />
      </div>
    </div>
  );
}
