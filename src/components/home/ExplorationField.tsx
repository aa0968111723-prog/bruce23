import { useMemo, useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { modalityFilters } from "@/lib/experiences/catalog";
import { cn } from "@/lib/cn";

export function ExplorationField({
  projects,
  onOpen,
}: {
  projects: PublicProject[];
  onOpen: (project: PublicProject) => void;
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const visible = useMemo(() => {
    if (!filter) return projects;
    const spec = modalityFilters.find((item) => item.id === filter);
    if (!spec) return projects;
    return projects.filter((project) => spec.slugs.includes(project.slug));
  }, [filter, projects]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="font-display text-3xl font-semibold">可操作的能力地圖</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        點圖像／影片／空間／文宣／互動，看真正接上的作品。再點作品進入體驗，不是只讀卡片。
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2" role="list">
        {modalityFilters.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "node-chip inline-flex min-h-11 shrink-0 items-center rounded-2xl px-4 text-sm font-medium shadow-card",
              filter === item.id ? "bg-mint text-primary-foreground" : "bg-surface",
            )}
            style={{ transform: `translateY(${index % 2 === 0 ? 0 : 6}px)` }}
            onClick={() => setFilter((value) => (value === item.id ? null : item.id))}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8 hidden grid-cols-4 gap-4 lg:grid">
        {visible.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            onClick={() => onOpen(project)}
            className="float-card-lite rounded-2xl bg-surface p-4 text-left shadow-card"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <p className="text-xs text-muted">{project.category}</p>
            <p className="mt-1 font-display text-lg font-semibold">{project.title}</p>
            <p className="mt-2 line-clamp-3 text-sm text-muted">{project.summary}</p>
            <p className="mt-3 text-xs text-mint-deep">
              {project.github.syncStatus === "verified" ? "GitHub 已同步" : "GitHub 待同步"}
              {project.canva.embedUrl ? " · Canva" : ""}
              {project.demo.url ? " · Demo" : ""}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 lg:hidden">
        {visible.map((project) => (
          <button
            key={project.slug}
            type="button"
            onClick={() => onOpen(project)}
            className="flex min-h-11 items-center justify-between rounded-2xl bg-surface px-4 py-4 text-left shadow-card"
          >
            <span>
              <span className="block font-display text-lg font-semibold">{project.title}</span>
              <span className="text-sm text-muted">{project.subtitle}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
