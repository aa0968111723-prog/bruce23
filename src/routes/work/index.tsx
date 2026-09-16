import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProjectCard } from "@/components/site/ProjectCard";
import { useLocaleDocumentTitle, useViewerLocale } from "@/components/site/LocaleProvider";
import { listPublishedProjectsFn } from "@/lib/cms/public-fn";
import { workCategories } from "@/content/projects";
import type { ProjectCategory } from "@/content/types";
import { fetchPublishedProjects } from "@/lib/cms/public-fns";
import { cn } from "@/lib/cn";
import type { PublicProject } from "@/lib/cms/privacy";
import { overlayProject } from "@/lib/locale/view";
import { useRovingTabs } from "@/components/site/useRovingTabs";

export const Route = createFileRoute("/work/")({
  loader: async (): Promise<PublicProject[]> => listPublishedProjectsFn(),
  head: () => ({
    meta: [
      { title: "作品總覽 · 柏能" },
      {
        name: "description",
        content: "只列出已發布作品。分類可篩選，狀態沒有寫成已完成的，就還不是已完成。",
      },
    ],
  }),
  component: WorkIndex,
});

function WorkIndex() {
  const projects = Route.useLoaderData() as PublicProject[];
  const { lang, ui } = useViewerLocale();
  const [category, setCategory] = useState<"All" | ProjectCategory>("All");
  const tabs = useRovingTabs(workCategories, category, (next) => setCategory(next));
  const localized = useMemo(
    () => projects.map((item) => overlayProject(item, lang)),
    [lang, projects],
  );
  const visible = useMemo(
    () =>
      category === "All" ? localized : localized.filter((item) => item.category === category),
    [category, localized],
  );
  useLocaleDocumentTitle(ui.workSeoTitle, ui.workLead);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">{ui.workTitle}</h1>
      <p className="mt-3 max-w-2xl text-muted">{ui.workLead}</p>
      <div
        className="mt-8 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label={ui.workCats}
        onKeyDown={tabs.onKeyDown}
      >
        {workCategories.map((item) => {
          const active = item === category;
          return (
            <button
              key={item}
              ref={tabs.setRef(item)}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={tabs.tabIndex(item)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
                active ? "bg-ink text-bg" : "bg-surface text-muted shadow-card hover:text-ink",
              )}
              onClick={() => setCategory(item)}
            >
              {item === "All" ? ui.all : item}
            </button>
          );
        })}
      </div>
      {visible.length === 0 ? (
        <p className="mt-12 text-sm text-muted">{ui.workEmpty}</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
