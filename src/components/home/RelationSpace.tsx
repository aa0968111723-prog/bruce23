import { Link } from "@tanstack/react-router";
import type { PublicProject } from "@/lib/cms/public-types";
import { cn } from "@/lib/cn";
import { RELATION_NODES, relatedProjects } from "@/lib/home/relations";

export function RelationSpace({
  projects,
  onSelect,
}: {
  projects: PublicProject[];
  onSelect?: (slug: string) => void;
}) {
  return (
    <div>
      <div className="hidden md:block">
        <div className="relative mx-auto h-[28rem] max-w-5xl [perspective:1400px]">
          <div className="absolute inset-0 origin-center relation-space">
            {RELATION_NODES.filter((n) => !["GitHub", "Canva", "Live Demo"].includes(n.id)).map((node, idx, list) => {
              const angle = (idx / list.length) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + Math.cos(angle) * 34;
              const y = 46 + Math.sin(angle) * 28;
              const hits = relatedProjects(projects, node.id);
              return (
                <div
                  key={node.id}
                  className="absolute w-44 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <p className="mb-2 text-center font-display text-lg font-semibold">{node.id}</p>
                  <ul className="grid gap-1">
                    {hits.slice(0, 3).map((p) => (
                      <li key={p.slug}>
                        <ProjectChip project={p} onSelect={onSelect} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <div className="absolute left-1/2 top-1/2 w-40 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-4 text-center shadow-float">
              <p className="font-display text-sm">多模態</p>
              <p className="mt-1 text-xs text-muted">點節點看真實作品</p>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {(["GitHub", "Canva", "Live Demo"] as const).map((id) => {
            const hits = relatedProjects(projects, id);
            return (
              <div key={id} className="rounded-2xl bg-surface p-4 shadow-card">
                <h3 className="font-display text-lg font-semibold">{id}</h3>
                <ul className="mt-3 grid gap-2">
                  {hits.slice(0, 4).map((p) => (
                    <li key={p.slug}>
                      <ProjectChip project={p} onSelect={onSelect} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex snap-x gap-3 overflow-x-auto pb-3">
          {RELATION_NODES.map((node) => {
            const hits = relatedProjects(projects, node.id);
            return (
              <div key={node.id} className="w-[78%] shrink-0 snap-start rounded-2xl bg-surface p-4 shadow-card">
                <h3 className="font-display text-xl font-semibold">{node.id}</h3>
                <ul className="mt-3 grid gap-2">
                  {hits.map((p) => (
                    <li key={p.slug}>
                      <ProjectChip project={p} onSelect={onSelect} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProjectChip({
  project,
  onSelect,
}: {
  project: PublicProject;
  onSelect?: (slug: string) => void;
}) {
  const className = cn(
    "flex min-h-11 w-full items-center justify-between rounded-xl bg-surface-blue px-3 text-left text-sm",
  );
  if (onSelect) {
    return (
      <button type="button" className={className} onClick={() => onSelect(project.slug)}>
        <span>{project.title}</span>
      </button>
    );
  }
  return (
    <Link to="/work/$slug" params={{ slug: project.slug }} className={className}>
      {project.title}
    </Link>
  );
}

