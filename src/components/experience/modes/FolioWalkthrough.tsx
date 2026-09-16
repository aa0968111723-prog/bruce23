import { useState, type KeyboardEvent } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { resolveExperienceConfig } from "@/lib/experiences/resolve";
import { githubBlobUrl } from "@/lib/github/parse";

export function FolioWalkthrough({ project }: { project: PublicProject }) {
  const config = resolveExperienceConfig(project);
  const steps = config.walkthrough ?? [];
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const owner = project.github.owner;
  const repo = project.github.repo;
  const branch = project.github.branch ?? "main";

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setIndex((value) => Math.min(steps.length - 1, value + 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setIndex((value) => Math.max(0, value - 1));
    }
  }

  if (!step) return <p className="text-sm text-muted">尚未設定走查步驟。</p>;

  return (
    <div tabIndex={0} onKeyDown={onKey} className="outline-none" aria-label="Folio 走查">
      <p className="text-sm text-muted">
        {config.intro ?? "依公開 canva2／Folio 指令層走一遍。不是站內 Canva 編輯器。"}左右鍵換步驟。
      </p>
      <div className="mt-4 rounded-2xl bg-surface p-5 shadow-card">
        <p className="text-xs text-mint-deep">
          {index + 1} / {steps.length}
        </p>
        <h3 className="mt-1 font-display text-2xl">{step.title}</h3>
        <p className="mt-2 text-sm leading-relaxed">{step.body}</p>
        {step.path ? <p className="mt-3 text-xs text-muted">{step.path}</p> : null}
        {step.path && owner && repo ? (
          <a
            className="mt-3 inline-flex min-h-11 items-center text-sm text-mint-deep"
            href={githubBlobUrl(owner, repo, branch, step.path)}
            rel="noreferrer"
            target="_blank"
          >
            開原始檔
          </a>
        ) : null}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
        >
          上一步
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          onClick={() => setIndex((value) => Math.min(steps.length - 1, value + 1))}
          disabled={index === steps.length - 1}
        >
          下一步
        </button>
      </div>
    </div>
  );
}
