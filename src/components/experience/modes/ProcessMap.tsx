import { useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/prefers-reduced";
import type { PublicProject } from "@/lib/cms/privacy";
import { githubBlobUrl } from "@/lib/github/parse";
import { useRovingTabs } from "@/components/site/useRovingTabs";
import { useExperienceView } from "../useExperienceView";

export function ProcessMap({ project }: { project: PublicProject }) {
  const { ex, config } = useExperienceView(project);
  const nodes = config.processNodes ?? [];
  const ids = nodes.map((node) => node.id);
  const [active, setActive] = useState(nodes[0]?.id ?? "");
  const current = nodes.find((node) => node.id === active) ?? nodes[0];
  const owner = project.github.owner;
  const repo = project.github.repo;
  const branch = project.github.branch ?? "main";
  const reduced = usePrefersReducedMotion();
  const tabs = useRovingTabs(ids, (active || ids[0] || "") as string, setActive);

  if (!nodes.length) {
    return <p className="text-sm text-muted">{ex.emptyNodes}</p>;
  }

  return (
    <div>
      <p className="text-sm text-muted">
        {config.intro ?? ex.processDefaultIntro}
        {ex.processKeyboard}
      </p>
      <div
        className="mt-4 flex gap-2 overflow-x-auto md:flex"
        role="tablist"
        aria-label={ex.nodesAria}
        onKeyDown={tabs.onKeyDown}
      >
        {nodes.map((node, index) => (
          <div key={node.id} className="flex shrink-0 items-center md:flex-1">
            <button
              type="button"
              role="tab"
              ref={tabs.setRef(node.id)}
              aria-selected={current?.id === node.id}
              tabIndex={tabs.tabIndex(node.id)}
              onClick={() => setActive(node.id)}
              className={`inline-flex min-h-11 flex-col items-start justify-center rounded-2xl px-3 py-2 text-left text-sm md:flex-1 ${
                current?.id === node.id ? "bg-mint text-primary-foreground" : "bg-surface shadow-card"
              }`}
            >
              <span className="font-medium">{node.label}</span>
              <span className={`mt-0.5 max-w-[11rem] truncate text-[11px] ${current?.id === node.id ? "text-primary-foreground/80" : "text-muted"}`}>
                {node.githubPath}
              </span>
            </button>
            {index < nodes.length - 1 ? (
              <span className="hidden px-1 text-muted md:inline" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
      {current ? (
        <div className="mt-5 rounded-2xl bg-surface p-5 shadow-card" role="tabpanel">
          <p className="text-xs text-mint-deep">{current.stage}</p>
          <h3 className="mt-1 font-display text-xl font-semibold">{current.label}</h3>
          <p className="mt-2 text-sm leading-relaxed">{current.summary}</p>
          <p className="mt-3 text-sm text-muted">{ex.githubSource}：{current.githubPath}</p>
          <p className="text-sm text-muted">{current.purpose}</p>
          {owner && repo ? (
            <a
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-mint-deep"
              href={githubBlobUrl(owner, repo, branch, current.githubPath)}
              rel="noreferrer"
              target="_blank"
            >
              {ex.openSourceFile}
            </a>
          ) : null}
          {reduced ? <p className="mt-3 text-xs text-muted">{ex.reducedMotion}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
