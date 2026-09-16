import { useMemo, useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { modalityFilters } from "@/lib/experiences/catalog";
import { CONSTELLATION_HEIGHT, CONSTELLATION_WIDTH, constellationLayout } from "@/lib/home/constellation";
import { cn } from "@/lib/cn";

export function ExplorationField({
  projects,
  onOpen,
  highlightSlugs,
}: {
  projects: PublicProject[];
  onOpen: (project: PublicProject) => void;
  highlightSlugs?: string[];
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const ordered = useMemo(() => {
    if (!highlightSlugs?.length) return projects;
    const bySlug = new Map(projects.map((item) => [item.slug, item]));
    const picked = highlightSlugs
      .map((slug) => bySlug.get(slug))
      .filter((item): item is PublicProject => Boolean(item));
    const rest = projects.filter((item) => !highlightSlugs.includes(item.slug));
    return [...picked, ...rest];
  }, [highlightSlugs, projects]);
  const visible = useMemo(() => {
    if (!filter) return ordered;
    const spec = modalityFilters.find((item) => item.id === filter);
    if (!spec) return ordered;
    return ordered.filter((project) => spec.slugs.includes(project.slug));
  }, [filter, ordered]);
  const map = useMemo(() => constellationLayout(visible), [visible]);
  const bySlug = useMemo(() => new Map(visible.map((item) => [item.slug, item])), [visible]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="font-display text-3xl font-semibold">可操作的能力地圖</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        節點位置依作品真正接到的模態與年份，不是裝飾散點。點模態看連線，點作品進入體驗。
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2" role="list">
        {modalityFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "node-chip inline-flex min-h-11 shrink-0 items-center rounded-2xl px-4 text-sm font-medium shadow-card",
              filter === item.id ? "bg-mint text-primary-foreground" : "bg-surface",
            )}
            onClick={() => setFilter((value) => (value === item.id ? null : item.id))}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="constellation mt-8 hidden overflow-hidden rounded-[2rem] bg-surface-blue/70 p-3 shadow-card lg:block">
        <svg
          viewBox={`0 0 ${CONSTELLATION_WIDTH} ${CONSTELLATION_HEIGHT}`}
          role="group"
          aria-label="作品與模態的空間關係"
          className="h-auto w-full"
        >
          <title>作品與模態星圖</title>
          {map.edges.map((edge) => {
            const hub = map.hubs.find((item) => item.id === edge.from);
            const node = map.nodes.find((item) => item.slug === edge.to);
            if (!hub || !node) return null;
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={hub.x}
                y1={hub.y}
                x2={node.x}
                y2={node.y}
                className="stroke-sky/55"
                strokeWidth={1.5}
              />
            );
          })}
          {map.hubs.map((hub) => (
            <g key={hub.id}>
              <circle cx={hub.x} cy={hub.y} r={28} className="fill-surface-mint stroke-mint/70" strokeWidth={2} />
              <text x={hub.x} y={hub.y + 4} textAnchor="middle" className="fill-ink text-[13px] font-medium">
                {hub.label}
              </text>
            </g>
          ))}
          {map.nodes.map((node) => (
            <g key={node.slug}>
              <circle cx={node.x} cy={node.y} r={34} className="fill-surface stroke-line" strokeWidth={1.5} />
              <foreignObject x={node.x - 70} y={node.y - 22} width={140} height={56}>
                <button
                  type="button"
                  className="flex h-full w-full flex-col items-center justify-center rounded-2xl px-2 text-center"
                  onClick={() => {
                    const project = bySlug.get(node.slug);
                    if (project) onOpen(project);
                  }}
                >
                  <span className="font-display text-[13px] font-semibold leading-tight text-ink">{node.title}</span>
                  <span className="text-[10px] text-muted">{node.year}</span>
                </button>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-6 grid gap-3 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="作品節點">
          {visible.map((project) => (
            <button
              key={`node-${project.slug}`}
              type="button"
              onClick={() => onOpen(project)}
              className="node-chip inline-flex min-h-11 shrink-0 items-center rounded-2xl bg-surface-mint px-4 text-sm shadow-card"
            >
              {project.title}
            </button>
          ))}
        </div>
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
