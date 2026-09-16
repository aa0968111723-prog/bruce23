import { Link } from "@tanstack/react-router";
import type { PublicProject } from "@/lib/cms/public-types";
import { cn } from "@/lib/cn";

const NODES = [
  { id: "圖像", match: ["圖像", "海報", "熱圖", "畫布"] },
  { id: "影片", match: ["影片", "影像序列", "時間軸", "分鏡"] },
  { id: "空間", match: ["3D", "空間", "動線", "平面圖"] },
  { id: "文宣", match: ["圖像", "註記", "OCR"] },
  { id: "互動", match: ["互動", "對話", "MCP", "註記"] },
] as const;

function related(projects: PublicProject[], nodeId: string) {
  const node = NODES.find((n) => n.id === nodeId);
  if (!node) return [];
  return projects.filter((p) =>
    p.modalities.some((m) => node.match.some((k) => m.includes(k))) ||
    (nodeId === "空間" && p.category === "Spatial Design") ||
    (nodeId === "文宣" && (p.slug === "duigao" || p.slug === "poster-vision-ai" || p.slug === "folio")) ||
    (nodeId === "互動" && (p.category === "Interaction" || p.slug === "tku-zen-ai")),
  );
}

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
            {NODES.map((node, idx) => {
              const angle = (idx / NODES.length) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + Math.cos(angle) * 34;
              const y = 46 + Math.sin(angle) * 28;
              const hits = related(projects, node.id);
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
      </div>

      <div className="md:hidden">
        <div className="flex snap-x gap-3 overflow-x-auto pb-3">
          {NODES.map((node) => {
            const hits = related(projects, node.id);
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

export const modalityNodes = NODES;
export { related as relatedProjects };
