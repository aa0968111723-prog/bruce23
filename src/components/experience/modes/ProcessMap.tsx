import { useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/prefers-reduced";
import type { PublicProject } from "@/lib/cms/privacy";
import type { ProcessNode } from "@/lib/experiences/catalog";
import { githubBlobUrl } from "@/lib/github/parse";
import { useRovingTabs } from "@/components/site/useRovingTabs";

export function ProcessMap({ project }: { project: PublicProject }) {
  const nodes = (project.experienceConfig.processNodes as ProcessNode[] | undefined) ?? [];
  const ids = nodes.map((node) => node.id);
  const [active, setActive] = useState(nodes[0]?.id ?? "");
  const current = nodes.find((node) => node.id === active) ?? nodes[0];
  const owner = project.github.owner;
  const repo = project.github.repo;
  const branch = project.github.branch ?? "main";
  const reduced = usePrefersReducedMotion();
  const tabs = useRovingTabs(ids, (active || ids[0]) as string, setActive);

  return (
    <div>
      <p className="text-sm text-muted">
        這是作品集互動展示，把公開 repo 的流程串成可點的節點。不是線上產品控制台。鍵盤左右鍵可換節點。
      </p>
      <div
        className="mt-4 hidden gap-2 md:flex"
        role="tablist"
        aria-label="流程節點"
        onKeyDown={tabs.onKeyDown}
      >
        {nodes.map((node, index) => (
          <div key={node.id} className="flex flex-1 items-center">
            <button
              type="button"
              role="tab"
              ref={tabs.setRef(node.id)}
              aria-selected={current?.id === node.id}
              tabIndex={tabs.tabIndex(node.id)}
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
      <div
        className="mt-4 flex gap-2 overflow-x-auto md:hidden"
        role="tablist"
        aria-label="流程節點"
        onKeyDown={tabs.onKeyDown}
      >
        {nodes.map((node) => (
          <button
            key={`m-${node.id}`}
            type="button"
            role="tab"
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
        <div className="mt-5 rounded-2xl bg-surface p-5 shadow-card" role="tabpanel">
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
          {reduced ? <p className="mt-3 text-xs text-muted">已依系統設定關閉多餘動態。</p> : null}
        </div>
      ) : null}
    </div>
  );
}
