import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { PublicProject } from "@/lib/portfolio/public";
import { MULTIMODAL_NODES } from "@/lib/portfolio/constants";
import { cn } from "@/lib/cn";

export type ExploreId = (typeof MULTIMODAL_NODES)[number]["id"] | "all";

export function ExplorationMap({
  projects,
  active,
  onActiveChange,
}: {
  projects: PublicProject[];
  active: ExploreId;
  onActiveChange: (id: ExploreId) => void;
}) {
  const visible = useMemo(() => {
    if (active === "all") return projects;
    const slugs = MULTIMODAL_NODES.find((node) => node.id === active)?.slugs ?? [];
    return projects.filter((project) => (slugs as readonly string[]).includes(project.slug));
  }, [active, projects]);

  return (
    <section id="explore" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-3xl font-semibold">視覺探索</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        點圖像、影片、空間、文宣或互動，看到真實已發布作品。手機以卡片為主；桌面用節點看關係，不必拖 3D。
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
          onClick={() => onActiveChange("all")}
        >
          全部
        </button>
        {MULTIMODAL_NODES.map((node) => (
          <button
            key={node.id}
            type="button"
            role="tab"
            aria-selected={active === node.id}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
              active === node.id ? "bg-mint text-primary-foreground" : "bg-surface shadow-card",
            )}
            onClick={() => onActiveChange(node.id)}
          >
            {node.labelZh}
          </button>
        ))}
      </div>

      <div className="relative mt-10 hidden lg:block">
        <svg viewBox="0 0 1000 180" className="h-40 w-full" role="img" aria-label="能力與作品關係">
          <path
            d="M80 90 C 200 20, 350 160, 500 90 S 800 20, 920 90"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="3"
          />
          {MULTIMODAL_NODES.map((node, index) => {
            const x = 80 + index * 210;
            const selected = active === node.id;
            const count = projects.filter((project) =>
              (node.slugs as readonly string[]).includes(project.slug),
            ).length;
            return (
              <g key={node.id} className="cursor-pointer" onClick={() => onActiveChange(node.id)}>
                <circle
                  cx={x}
                  cy={90}
                  r={selected ? 34 : 28}
                  fill={selected ? "var(--color-mint)" : "var(--color-surface)"}
                  stroke="var(--color-sky)"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={86}
                  textAnchor="middle"
                  fontSize="14"
                  fill="var(--color-ink)"
                >
                  {node.labelZh}
                </text>
                <text
                  x={x}
                  y={108}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--color-muted)"
                >
                  {count}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-8 flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {visible.map((project) => (
          <Link
            key={project.slug}
            to="/work/$slug"
            params={{ slug: project.slug }}
            hash="experience"
            className="min-w-[78%] rounded-2xl bg-surface p-5 shadow-card sm:min-w-[46%] lg:min-w-0"
          >
            <p className="text-xs text-muted">{project.category}</p>
            <h3 className="mt-1 font-display text-xl font-semibold">{project.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted">{project.summary}</p>
            <p className="mt-3 text-xs text-mint-deep">打開體驗面板</p>
          </Link>
        ))}
        {visible.length === 0 ? (
          <p className="text-sm text-muted">這個節點目前沒有已發布作品。</p>
        ) : null}
      </div>
    </section>
  );
}
