import { useState, type KeyboardEvent } from "react";
import type { WalkthroughStep } from "@/lib/cms/schema";
import type { PublicProject } from "@/lib/cms/privacy";
import { resolveExperienceConfig } from "@/lib/experiences/resolve";
import { walkthroughStageKind, type WalkthroughStageKind } from "@/lib/experiences/walkthrough";
import { githubBlobUrl } from "@/lib/github/parse";

export function FolioWalkthrough({ project }: { project: PublicProject }) {
  const config = resolveExperienceConfig(project);
  const steps = config.walkthrough ?? [];
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const owner = project.github.owner;
  const repo = project.github.repo;
  const branch = project.github.branch ?? "main";
  const kind = step ? walkthroughStageKind(step) : "document";

  function go(next: number) {
    if (!steps.length) return;
    setIndex(Math.min(steps.length - 1, Math.max(0, next)));
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    }
  }

  if (!step) return <p className="text-sm text-muted">尚未設定走查步驟。</p>;

  return (
    <div tabIndex={0} onKeyDown={onKey} className="outline-none" aria-label="Folio 走查">
      <p className="text-sm text-muted">
        {config.intro ?? "依公開 canva2／Folio 指令層走一遍。不是站內 Canva 編輯器。"}左右鍵換步驟。畫面依儲存的走查步驟繪製，不是空白計數器。
      </p>
      <div className="mt-3 flex flex-wrap gap-1" role="tablist" aria-label="走查步驟">
        {steps.map((item, stepIndex) => (
          <button
            key={`${item.title}-${item.path ?? stepIndex}`}
            type="button"
            role="tab"
            aria-selected={stepIndex === index}
            className={`inline-flex min-h-11 items-center rounded-full px-3 text-xs sm:text-sm ${
              stepIndex === index ? "bg-ink text-bg" : "bg-surface shadow-card"
            }`}
            onClick={() => go(stepIndex)}
          >
            {stepIndex + 1}. {item.title}
          </button>
        ))}
      </div>
      <div
        className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-card"
        data-walkthrough-stage={kind}
        data-walkthrough-path={step.path ?? ""}
      >
        <FolioStage step={step} kind={kind} index={index} total={steps.length} />
      </div>
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
          onClick={() => go(index - 1)}
          disabled={index === 0}
        >
          上一步
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          onClick={() => go(index + 1)}
          disabled={index === steps.length - 1}
        >
          下一步
        </button>
      </div>
    </div>
  );
}

function FolioStage({
  step,
  kind,
  index,
  total,
}: {
  step: WalkthroughStep;
  kind: WalkthroughStageKind;
  index: number;
  total: number;
}) {
  const file = step.path?.split("/").pop() ?? step.path ?? "document";
  return (
    <div className="bg-surface-blue/70 p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-muted">
        <span>Folio 示範畫布 · 不是線上編輯器</span>
        <span>
          {index + 1}/{total}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface shadow-card">
        {kind === "canvas" ? <CanvasStage file={file} /> : null}
        {kind === "command" ? <CommandStage file={file} /> : null}
        {kind === "audit" ? <AuditStage file={file} /> : null}
        {kind === "mcp" ? <McpStage file={file} /> : null}
        {kind === "document" ? <DocumentStage title={step.title} file={file} /> : null}
      </div>
    </div>
  );
}

function CanvasStage({ file }: { file: string }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label="畫布：文字、形狀與元件同一文件模型">
      <rect width="320" height="200" className="fill-surface-blue" />
      <rect x="18" y="16" width="284" height="168" rx="10" className="fill-surface stroke-line" strokeWidth="1" />
      <rect x="28" y="26" width="88" height="22" rx="4" className="fill-surface-mint" />
      <text x="34" y="41" className="fill-ink" fontSize="9">
        文字
      </text>
      <rect x="28" y="56" width="72" height="72" rx="8" className="fill-mint" />
      <rect x="112" y="56" width="86" height="48" rx="8" className="fill-surface-blue" />
      <circle cx="248" cy="92" r="28" className="fill-sky" />
      <text x="34" y="148" className="fill-muted" fontSize="8">
        {file}
      </text>
      <text x="34" y="166" className="fill-muted" fontSize="8">
        同一文件模型 · 文字／形狀／元件
      </text>
    </svg>
  );
}

function CommandStage({ file }: { file: string }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label="指令層：命令面板寫入同一 command layer">
      <rect width="320" height="200" className="fill-surface-blue" />
      <rect x="18" y="16" width="284" height="168" rx="10" className="fill-surface" opacity="0.55" />
      <rect x="48" y="36" width="224" height="128" rx="12" className="fill-surface stroke-line" strokeWidth="1" />
      <rect x="60" y="48" width="200" height="22" rx="6" className="fill-surface-mint" />
      <text x="68" y="63" className="fill-ink" fontSize="9">
        ⌘K 指令
      </text>
      <rect x="60" y="78" width="200" height="18" rx="4" className="fill-mint" />
      <text x="68" y="91" className="fill-primary-foreground" fontSize="8">
        Insert text block
      </text>
      <rect x="60" y="100" width="200" height="18" rx="4" className="fill-surface-blue" />
      <text x="68" y="113" className="fill-ink" fontSize="8">
        Add shape
      </text>
      <rect x="60" y="122" width="200" height="18" rx="4" className="fill-surface-blue" />
      <text x="68" y="135" className="fill-ink" fontSize="8">
        {file}
      </text>
    </svg>
  );
}

function AuditStage({ file }: { file: string }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label="設計檢查：對比、溢出與安全區">
      <rect width="320" height="200" className="fill-surface-blue" />
      <rect x="18" y="16" width="176" height="168" rx="10" className="fill-surface stroke-line" strokeWidth="1" />
      <rect x="32" y="32" width="148" height="18" rx="3" className="fill-ink" opacity="0.12" />
      <rect x="32" y="58" width="120" height="72" rx="6" className="fill-sky" opacity="0.35" />
      <rect x="28" y="28" width="156" height="144" fill="none" className="stroke-alert" strokeDasharray="4 3" />
      <rect x="204" y="16" width="98" height="168" rx="10" className="fill-surface stroke-line" strokeWidth="1" />
      <text x="214" y="36" className="fill-ink" fontSize="8">
        檢查
      </text>
      <text x="214" y="56" className="fill-alert" fontSize="8">
        對比不足
      </text>
      <text x="214" y="74" className="fill-alert" fontSize="8">
        文字溢出
      </text>
      <text x="214" y="92" className="fill-mint-deep" fontSize="8">
        安全區
      </text>
      <text x="214" y="168" className="fill-muted" fontSize="7">
        {file}
      </text>
    </svg>
  );
}

function McpStage({ file }: { file: string }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label="MCP 邊界：寫入預設 dry-run">
      <rect width="320" height="200" className="fill-surface-blue" />
      <rect x="18" y="16" width="176" height="168" rx="10" className="fill-surface stroke-line" strokeWidth="1" />
      <rect x="32" y="32" width="148" height="88" rx="8" className="fill-surface-mint" />
      <text x="40" y="54" className="fill-ink" fontSize="9">
        未發布文件
      </text>
      <text x="40" y="72" className="fill-muted" fontSize="8">
        不出現在公開 MCP
      </text>
      <rect x="204" y="16" width="98" height="168" rx="10" className="fill-ink" />
      <text x="214" y="40" className="fill-bg" fontSize="8">
        MCP
      </text>
      <text x="214" y="60" className="fill-mint" fontSize="8">
        dry-run
      </text>
      <text x="214" y="78" className="fill-bg" fontSize="7">
        未寫入
      </text>
      <text x="214" y="168" className="fill-muted" fontSize="7">
        {file}
      </text>
    </svg>
  );
}

function DocumentStage({ title, file }: { title: string; file: string }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label={`${title} 文件層`}>
      <rect width="320" height="200" className="fill-surface-blue" />
      <rect x="54" y="28" width="212" height="144" rx="10" className="fill-surface stroke-line" strokeWidth="1" />
      <rect x="70" y="44" width="180" height="16" rx="3" className="fill-mint" />
      <text x="76" y="56" className="fill-primary-foreground" fontSize="9">
        {title}
      </text>
      <rect x="70" y="70" width="160" height="8" rx="2" className="fill-line" />
      <rect x="70" y="86" width="140" height="8" rx="2" className="fill-line" />
      <text x="70" y="150" className="fill-muted" fontSize="8">
        {file}
      </text>
    </svg>
  );
}
