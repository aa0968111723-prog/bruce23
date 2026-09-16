import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CaseStudyView } from "@/components/work/CaseStudyView";
import { listAdminProjectsFn, previewDraftFn } from "@/lib/cms/admin-fn";
import type { AdminProject } from "@/lib/cms/store";
import { publicationStatusLabel } from "@/lib/cms/status";
import type { PublicProject } from "@/lib/cms/privacy";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/admin/preview")({
  component: PreviewPage,
});

function PreviewPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ publicationStatus: string; project: PublicProject } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listAdminProjectsFn().then((list) => {
      setProjects(list);
      setSlug((current) => current ?? list[0]?.slug ?? null);
    });
  }, []);

  useEffect(() => {
    if (!slug) return;
    setError(null);
    void previewDraftFn({ data: { slug } })
      .then(setDraft)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "讀取失敗"));
  }, [slug]);

  return (
    <div>
      <h1 className="font-display text-3xl">草稿預覽</h1>
      <p className="mt-2 text-sm text-muted">
        後台預覽瀏覽器框。草稿不會出現在前台列表、個案、sitemap 或 JSON-LD。
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)]">
        <ul className="grid gap-2">
          {projects.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full min-h-11 items-center justify-between rounded-2xl px-4 py-3 text-left shadow-card",
                  slug === project.slug ? "bg-surface-mint" : "bg-surface",
                )}
                onClick={() => setSlug(project.slug)}
              >
                <span>
                  {project.title}
                  <span className="ml-2 text-xs text-muted">
                    {publicationStatusLabel[project.publication_status]}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="overflow-hidden rounded-[1.75rem] border border-line bg-bg shadow-float">
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-mint/95 px-4 py-3 text-xs text-muted">
            <span className="size-2 rounded-full bg-alert/70" aria-hidden />
            <span className="size-2 rounded-full bg-sun" aria-hidden />
            <span className="size-2 rounded-full bg-mint" aria-hidden />
            <span>後台預覽瀏覽器框 · 不是前台 · 不含 JSON-LD</span>
            {draft ? (
              <span>
                · 狀態{" "}
                {publicationStatusLabel[draft.publicationStatus as keyof typeof publicationStatusLabel] ??
                  draft.publicationStatus}
              </span>
            ) : null}
            {slug ? (
              <Link to="/admin/draft/$slug" params={{ slug }} className="ml-auto text-mint-deep">
                開獨立預覽
              </Link>
            ) : null}
          </div>
          {error ? <p className="p-6 text-sm text-alert">{error}</p> : null}
          {!error && !draft ? <p className="p-6 text-sm text-muted">選左側作品載入預覽…</p> : null}
          {draft ? (
            <div className="max-h-[70vh] overflow-auto">
              <CaseStudyView project={draft.project} backTo="none" includeJsonLd={false} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
