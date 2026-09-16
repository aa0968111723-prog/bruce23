import { useMemo, useState } from "react";
import type { PublicProject } from "@/lib/portfolio/types";
import { cn } from "@/lib/cn";

export function AiDirectorExhibit({ project }: { project: PublicProject }) {
  const nodes = project.interactionSteps.length
    ? project.interactionSteps
    : [
        { id: "project", title: "專案", body: "上下文起點", githubPath: "client", workflowStage: "project" },
      ];
  const [active, setActive] = useState(nodes[0]?.id ?? "project");
  const current = nodes.find((n) => n.id === active) ?? nodes[0];
  const treeHit = useMemo(() => {
    if (!current?.githubPath) return null;
    return project.github?.fileTree.find((n) => n.path === current.githubPath || n.path.startsWith(`${current.githubPath}/`)) ?? null;
  }, [current, project.github]);

  return (
    <div>
      <p className="text-xs text-muted">
        點節點看流程與對應 GitHub 路徑。沒有穩定 Demo 時，這是作品集互動展示，不是線上產品。
      </p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-7">
        {nodes.map((node, index) => (
          <li key={node.id}>
            <button
              type="button"
              className={cn(
                "flex min-h-11 w-full flex-col items-start rounded-xl px-3 py-2 text-left shadow-card",
                node.id === active ? "bg-mint text-primary-foreground" : "bg-surface-blue",
              )}
              onClick={() => setActive(node.id)}
            >
              <span className="text-[10px] opacity-70">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-sm font-semibold">{node.title}</span>
            </button>
          </li>
        ))}
      </ol>
      {current ? (
        <div className="mt-4 rounded-xl bg-surface-mint/80 p-4">
          <h3 className="font-display text-lg font-semibold">{current.title}</h3>
          <p className="mt-2 text-sm leading-relaxed">{current.body}</p>
          {current.githubPath ? (
            <p className="mt-3 text-xs text-muted">
              來源路徑：<code>{current.githubPath}</code>
              {treeHit ? " · 檔案樹有對應" : " · 同步後的檔案樹尚未找到此路徑，不假裝存在"}
            </p>
          ) : null}
          {treeHit?.githubUrl ? (
            <a
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-mint-deep"
              href={treeHit.githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              在 GitHub 開啟
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
