import { useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import type { ProcessNode } from "@/lib/experiences/catalog";
import { githubBlobUrl } from "@/lib/github/parse";

export function ProcessMap({ project }: { project: PublicProject }) {
  const nodes = (project.experienceConfig.processNodes as ProcessNode[] | undefined) ?? [];
  const [active, setActive] = useState(nodes[0]?.id ?? "");
  const current = nodes.find((node) => node.id === active) ?? nodes[0];
  const owner = project.github.owner;
  const repo = project.github.repo;
  const branch = project.github.branch ?? "main";

  return (
    <div>
      <p className="text-sm text-muted">
        這是作品集互動展示，把公開 repo 的流程串成可點的節點。不是線上產品控制台。
      </p>
      <div className="mt-4 hidden gap-2 md:flex" aria-hidden="false">
        {nodes.map((node, index) => (
          <div key={node.id} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setActive(node.id)}
              className={`min-h-11 flex-1 rounded-2xl px-3 py-3 text-sm shadow-card ${
                current?.id === node.id ? "bg-mint text-primary-foreground" : "bg-surface"
              }`}
            >
              {node.label}
            </button>
            {index < nodes.length - 1 ? (
              <span className="px-1 text-muted" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto md:hidden">
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => setActive(node.id)}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm ${
              current?.id === node.id ? "bg-ink text-bg" : "bg-surface shadow-card"
            }`}
          >
            {node.label}
          </button>
        ))}
      </div>
      {current ? (
        <div className="mt-5 rounded-2xl bg-surface p-5 shadow-card">
          <p className="text-xs text-mint-deep">{current.stage}</p>
          <h3 className="mt-1 font-display text-xl font-semibold">{current.label}</h3>
          <p className="mt-2 text-sm leading-relaxed">{current.summary}</p>
          <p className="mt-3 text-sm text-muted">GitHub 來源：{current.githubPath}</p>
          <p className="text-sm text-muted">{current.purpose}</p>
          {owner && repo ? (
            <a
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-mint-deep"
              href={githubBlobUrl(owner, repo, branch, current.githubPath)}
              rel="noreferrer"
              target="_blank"
            >
              開啟原始檔
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
