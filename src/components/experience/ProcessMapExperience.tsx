import { useState } from "react";
import { cn } from "@/lib/cn";

type Node = { id: string; label: string; path?: string; stage?: string };

export function ProcessMapExperience({
  nodes,
  label,
  note,
  githubUrl,
}: {
  nodes: Node[];
  label?: string;
  note?: string;
  githubUrl?: string | null;
}) {
  const [active, setActive] = useState(nodes[0]?.id ?? "");
  const current = nodes.find((n) => n.id === active) ?? nodes[0];
  return (
    <div>
      {label ? <p className="text-sm font-medium text-mint-deep">{label}</p> : null}
      {note ? <p className="mt-1 text-sm text-muted">{note}</p> : null}
      <ol className="mt-6 flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-7 md:overflow-visible">
        {nodes.map((node, idx) => {
          const on = node.id === current?.id;
          return (
            <li key={node.id} className="min-w-28 shrink-0 md:min-w-0">
              <button
                type="button"
                onClick={() => setActive(node.id)}
                className={cn(
                  "flex min-h-24 w-full flex-col items-start rounded-2xl px-3 py-3 text-left shadow-card transition-transform duration-150",
                  on ? "bg-surface-mint" : "bg-surface hover:-translate-y-0.5",
                )}
              >
                <span className="text-xs text-muted">{String(idx + 1).padStart(2, "0")}</span>
                <span className="mt-1 font-display text-base font-semibold">{node.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {current ? (
        <div className="mt-5 rounded-2xl bg-surface p-5 shadow-card">
          <h3 className="font-display text-xl font-semibold">{current.label}</h3>
          <p className="mt-2 text-sm text-muted">{current.stage ?? "流程節點"}</p>
          <p className="mt-3 font-mono text-xs text-ink">GitHub：{current.path ?? "—"}</p>
          {githubUrl && current.path ? (
            <a
              href={`${githubUrl}/tree/main/${current.path.replace(/\/$/, "")}`}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-mint-deep"
              rel="noreferrer"
              target="_blank"
            >
              開啟來源路徑
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
