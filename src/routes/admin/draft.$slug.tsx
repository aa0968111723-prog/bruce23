import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CaseStudyView } from "@/components/work/CaseStudyView";
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
    <div className="-mx-4">
      <div className="sticky top-0 z-20 border-b border-line bg-surface-mint/95 px-4 py-3 backdrop-blur">
        <p className="text-sm">
          後台預覽瀏覽器框 · 不是前台 · 狀態{" "}
          {publicationStatusLabel[data.publicationStatus as keyof typeof publicationStatusLabel] ??
            data.publicationStatus}
          。草稿不會出現在作品列表、個案、sitemap 或 JSON-LD。
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <Link to="/admin/preview" className="inline-flex min-h-11 items-center text-mint-deep">
            回預覽列表
          </Link>
          <a href={`/work/${data.project.slug}`} className="inline-flex min-h-11 items-center text-muted">
            前台（未發布會 404）
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-5xl rounded-b-[2rem] border-x border-b border-line bg-bg shadow-float">
        <CaseStudyView project={data.project} backTo="none" includeJsonLd={false} />
      </div>
    </div>
  );
}
