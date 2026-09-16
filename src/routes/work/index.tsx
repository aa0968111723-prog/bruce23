import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProjectCard } from "@/components/site/ProjectCard";
import { projects, workCategories } from "@/content/projects";
import type { ProjectCategory } from "@/content/types";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/work/")({ component: WorkIndex });

function WorkIndex() {
  const [category, setCategory] = useState<"All" | ProjectCategory>("All");
  const visible = useMemo(
    () =>
      category === "All"
        ? projects
        : projects.filter((p) => p.category === category),
    [category],
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">作品總覽</h1>
      <p className="mt-3 max-w-2xl text-muted">
        依 GitHub 真實儲存庫挑選。分類可篩選，狀態沒有寫成已完成的，就還不是已完成。
      </p>

      <div
        className="mt-8 flex gap-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="作品分類"
      >
        {workCategories.map((item) => {
          const active = item === category;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-ink text-bg"
                  : "bg-surface text-muted shadow-card hover:text-ink",
              )}
              onClick={() => setCategory(item)}
            >
              {item === "All" ? "全部" : item}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-12 text-sm text-muted">這個分類目前沒有公開作品。</p>
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
