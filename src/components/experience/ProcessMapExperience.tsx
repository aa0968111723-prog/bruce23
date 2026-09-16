import { useState } from "react";
import type { PublicProject } from "@/lib/portfolio/public";
import { cn } from "@/lib/cn";

export function ProcessMapExperience({ project }: { project: PublicProject }) {
  const nodes =
    (project.experience_config.nodes as Array<{
      id: string;
      label: string;
      githubPath?: string;
      note?: string;
    }>) ?? [];
  const [active, setActive] = useState(nodes[0]?.id ?? "");
  const current = nodes.find((node) => node.id === active) ?? nodes[0];
  const href =
    current?.githubPath && project.github
      ? `https://github.com/${project.github.owner}/${project.github.repo}/tree/${project.github.branch ?? "main"}/${current.githubPath}`
      : project.github?.url;

  return (
    <div>
      <p className="text-xs font-medium text-mint-deep">
        {project.experience_label ?? "作品集互動展示"} · 不是線上產品後台
      </p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {nodes.map((node, index) => (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => setActive(node.id)}
              className={cn(
                "flex min-h-11 w-full flex-col rounded-2xl px-3 py-3 text-left shadow-card",
                active === node.id ? "bg-mint text-primary-foreground" : "bg-surface",
              )}
            >
              <span className="text-xs opacity-70">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-display text-sm font-semibold">{node.label}</span>
            </button>
          </li>
        ))}
      </ol>
      {current ? (
        <div className="mt-5 rounded-2xl bg-surface-blue p-5">
          <h3 className="font-display text-xl font-semibold">{current.label}</h3>
          <p className="mt-2 text-sm leading-relaxed">{current.note}</p>
          {current.githubPath ? (
            <p className="mt-2 text-xs text-muted">GitHub path: {current.githubPath}</p>
          ) : null}
          {href ? (
            <a
              href={href}
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-mint-deep"
              rel="noreferrer"
              target="_blank"
            >
              打開對應來源
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
