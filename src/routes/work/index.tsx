import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProjectCard } from "@/components/site/ProjectCard";
import { workCategories } from "@/content/projects";
import type { Project, ProjectCategory } from "@/content/types";
import { cn } from "@/lib/cn";
import { listPublicProjects } from "@/lib/portfolio/server-public";
import type { PublicProject } from "@/lib/portfolio/public";

export const Route = createFileRoute("/work/")({
  loader: () => listPublicProjects(),
  component: WorkIndex,
});

function toCard(project: PublicProject): Project {
  return {
    slug: project.slug,
    title: project.title,
    subtitle: project.subtitle,
    category: project.category as Project["category"],
    year: project.year,
    status: project.product_status as Project["status"],
    featured: project.featured,
    summary: project.summary,
    problem: project.problem,
    role: project.role,
    decisions: project.decisions,
    modalities: project.modalities,
    process: project.process,
    outputs: project.outputs,
    stack: project.stack,
    limitations: project.limitations,
    links: { github: project.github?.url, live: project.live_demo?.url },
    media: project.media,
    sourceReferences: project.source_evidence,
    visibility: "public",
  };
}

function WorkIndex() {
  const projects = Route.useLoaderData();
  const [category, setCategory] = useState<"All" | ProjectCategory>("All");
  const visible = useMemo(
    () =>
      category === "All"
        ? projects
        : projects.filter((project) => project.category === category),
    [category, projects],
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">作品總覽</h1>
      <p className="mt-3 max-w-2xl text-muted">
        依 GitHub 真實儲存庫挑選。分類可篩選，狀態沒有寫成已完成的，就還不是已完成。
      </p>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="作品分類">
        {workCategories.map((item) => {
          const active = item === category;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
                active ? "bg-ink text-bg" : "bg-surface text-muted shadow-card",
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
            <ProjectCard key={project.slug} project={toCard(project)} />
          ))}
        </div>
      )}
    </div>
  );
}
