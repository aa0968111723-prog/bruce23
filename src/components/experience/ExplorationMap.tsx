import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { PublicProject } from "@/lib/portfolio/public";
import { cn } from "@/lib/cn";

const NODES = [
  { id: "image", label: "圖像", slugs: ["poster-vision-ai", "duigao", "folio"] },
  { id: "video", label: "影片", slugs: ["framelab", "ai-director-os"] },
  { id: "space", label: "空間", slugs: ["planform"] },
  { id: "print", label: "文宣", slugs: ["poster-vision-ai", "duigao", "folio"] },
  { id: "interact", label: "互動", slugs: ["duigao", "tku-zen-ai", "hermes-console"] },
] as const;

export function ExplorationMap({ projects }: { projects: PublicProject[] }) {
  const [active, setActive] = useState<(typeof NODES)[number]["id"] | "all">("image");
  const visible = useMemo(() => {
    if (active === "all") return projects;
    const slugs = NODES.find((node) => node.id === active)?.slugs ?? [];
    return projects.filter((project) => slugs.includes(project.slug));
  }, [active, projects]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-3xl font-semibold">視覺探索</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        點模態看相關作品。手機以卡片為主；桌面用節點看關係，不必拖 3D 才能找到案子。
      </p>

      <div
        className="mt-8 flex gap-2 overflow-x-auto pb-2 md:flex-wrap"
        role="tablist"
        aria-label="多模態節點"
      >
        <button
          type="button"
          role="tab"
          aria-selected={active === "all"}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
            active === "all" ? "bg-ink text-bg" : "bg-surface text-muted shadow-card",
          )}
          onClick={() => setActive("all")}
        >
          全部
        </button>
        {NODES.map((node, index) => (
          <button
            key={node.id}
            type="button"
            role="tab"
            aria-selected={active === node.id}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
              active === node.id ? "bg-mint text-primary-foreground" : "bg-surface shadow-card",
            )}
            style={{ transform: `translateY(${index % 2 === 0 ? 0 : 6}px)` }}
            onClick={() => setActive(node.id)}
          >
            {node.label}
          </button>
        ))}
      </div>

      <div className="mt-8 hidden gap-4 lg:grid lg:grid-cols-5">
        {NODES.map((node) => {
          const count = projects.filter((project) => node.slugs.includes(project.slug)).length;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setActive(node.id)}
              className={cn(
                "rounded-2xl bg-surface p-5 text-left shadow-float",
                active === node.id && "ring-2 ring-sky",
              )}
            >
              <p className="font-display text-xl">{node.label}</p>
              <p className="mt-2 text-sm text-muted">{count} 件公開作品</p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {visible.map((project) => (
          <Link
            key={project.slug}
            to="/work/$slug"
            params={{ slug: project.slug }}
            className="min-w-[78%] rounded-2xl bg-surface p-5 shadow-card sm:min-w-[46%] lg:min-w-0"
          >
            <p className="text-xs text-muted">{project.category}</p>
            <h3 className="mt-1 font-display text-xl font-semibold">{project.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted">{project.summary}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
