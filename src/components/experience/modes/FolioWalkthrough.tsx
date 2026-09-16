import { useState, type KeyboardEvent } from "react";
import type { WalkthroughStep } from "@/lib/cms/schema";
import type { PublicProject } from "@/lib/cms/privacy";
import { walkthroughStageKind, type WalkthroughStageKind } from "@/lib/experiences/walkthrough";
import { githubBlobUrl } from "@/lib/github/parse";
import { joinSentences, type ExperienceChrome } from "@/lib/locale/experience";
import { useExperienceView } from "../useExperienceView";

export function FolioWalkthrough({ project }: { project: PublicProject }) {
  const { ex, config } = useExperienceView(project);
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

  if (!step) return <p className="text-sm text-muted">{ex.emptyWalkthrough}</p>;

  return (
    <div tabIndex={0} onKeyDown={onKey} className="outline-none" aria-label={ex.walkAria}>
      <p className="text-sm text-muted">
        {joinSentences(config.intro ?? ex.folioDefaultIntro, ex.folioNotCounter)}
      </p>
      <div className="mt-3 flex flex-wrap gap-1" role="tablist" aria-label={ex.walkStepsAria}>
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
        <FolioStage step={step} kind={kind} index={index} total={steps.length} ex={ex} />
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
            {ex.openSource}
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
          {ex.prevStep}
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          onClick={() => go(index + 1)}
          disabled={index === steps.length - 1}
        >
          {ex.nextStep}
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
  ex,
}: {
  step: WalkthroughStep;
  kind: WalkthroughStageKind;
  index: number;
  total: number;
  ex: ExperienceChrome;
}) {
  const file = step.path?.split("/").pop() ?? step.path ?? "document";
  return (
    <div className="bg-surface-blue/70 p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-muted">
        <span>{ex.folioDemoCanvas}</span>
        <span>
          {index + 1}/{total}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface shadow-card">
        {kind === "canvas" ? <CanvasStage file={file} ex={ex} /> : null}
        {kind === "command" ? <CommandStage file={file} ex={ex} /> : null}
        {kind === "audit" ? <AuditStage file={file} ex={ex} /> : null}
        {kind === "mcp" ? <McpStage file={file} ex={ex} /> : null}
        {kind === "document" ? <DocumentStage title={step.title} file={file} ex={ex} /> : null}
      </div>
    </div>
  );
}

function CanvasStage({ file, ex }: { file: string; ex: ExperienceChrome }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label={ex.folioSameModel} data-folio-shell="true">
      <rect width="320" height="200" className="fill-surface-blue" />
      <rect x="0" y="0" width="320" height="22" className="fill-surface stroke-line" />
      <text x="8" y="15" className="fill-muted" fontSize="7">
        {ex.folioBack}
      </text>
      <text x="92" y="15" className="fill-ink" fontSize="7">
        {ex.folioSaved}
      </text>
      <rect x="248" y="4" width="28" height="14" rx="4" className="fill-surface-blue" />
      <text x="252" y="14" className="fill-ink" fontSize="6">
        {ex.folioPreview}
      </text>
      <rect x="280" y="4" width="34" height="14" rx="4" className="fill-mint" />
      <text x="286" y="14" className="fill-primary-foreground" fontSize="6">
        {ex.folioPublish}
      </text>
      <rect x="0" y="22" width="22" height="166" className="fill-surface stroke-line" />
      <rect x="5" y="30" width="12" height="12" rx="2" className="fill-surface-mint" />
      <rect x="5" y="46" width="12" height="12" rx="2" className="fill-mint" />
      <circle cx="11" cy="70" r="6" className="fill-sky" />
      <rect x="22" y="22" width="214" height="166" className="fill-surface-blue" />
      <rect x="36" y="34" width="186" height="140" rx="8" className="fill-surface stroke-line" strokeWidth="1" />
      <rect x="46" y="46" width="88" height="16" rx="3" className="fill-surface-mint" />
      <text x="50" y="57" className="fill-ink" fontSize="8">
        {ex.folioText}
      </text>
      <rect x="46" y="70" width="56" height="56" rx="8" className="fill-mint" />
      <rect x="110" y="70" width="64" height="36" rx="6" className="fill-surface-blue" />
      <circle cx="198" cy="92" r="18" className="fill-sky" />
      <text x="46" y="154" className="fill-muted" fontSize="7">
        {file}
      </text>
      <rect x="236" y="22" width="84" height="166" className="fill-surface stroke-line" />
      <text x="244" y="40" className="fill-ink" fontSize="7">
        {ex.folioAudit}
      </text>
      <text x="244" y="56" className="fill-alert" fontSize="7">
        {ex.folioContrast}
      </text>
      <text x="244" y="70" className="fill-alert" fontSize="7">
        {ex.folioOverflow}
      </text>
      <text x="244" y="84" className="fill-mint-deep" fontSize="7">
        {ex.folioSafe}
      </text>
      <text x="8" y="196" className="fill-muted" fontSize="7">
        {ex.folioSameModel}
      </text>
    </svg>
  );
}

function CommandStage({ file, ex }: { file: string; ex: ExperienceChrome }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label={ex.folioCommand}>
      <rect width="320" height="200" className="fill-surface-blue" />
      <rect x="18" y="16" width="284" height="168" rx="10" className="fill-surface" opacity="0.55" />
      <rect x="48" y="36" width="224" height="128" rx="12" className="fill-surface stroke-line" strokeWidth="1" />
      <rect x="60" y="48" width="200" height="22" rx="6" className="fill-surface-mint" />
      <text x="68" y="63" className="fill-ink" fontSize="9">
        {ex.folioCommand}
      </text>
      <rect x="60" y="78" width="200" height="18" rx="4" className="fill-mint" />
      <text x="68" y="91" className="fill-primary-foreground" fontSize="8">
        {ex.folioInsertText}
      </text>
      <rect x="60" y="100" width="200" height="18" rx="4" className="fill-surface-blue" />
      <text x="68" y="113" className="fill-ink" fontSize="8">
        {ex.folioAddShape}
      </text>
      <rect x="60" y="122" width="200" height="18" rx="4" className="fill-surface-blue" />
      <text x="68" y="135" className="fill-ink" fontSize="8">
        {file}
      </text>
    </svg>
  );
}

function AuditStage({ file, ex }: { file: string; ex: ExperienceChrome }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label={ex.folioAudit}>
      <rect width="320" height="200" className="fill-surface-blue" />
      <rect x="18" y="16" width="176" height="168" rx="10" className="fill-surface stroke-line" strokeWidth="1" />
      <rect x="32" y="32" width="148" height="18" rx="3" className="fill-ink" opacity="0.12" />
      <rect x="32" y="58" width="120" height="72" rx="6" className="fill-sky" opacity="0.35" />
      <rect x="28" y="28" width="156" height="144" fill="none" className="stroke-alert" strokeDasharray="4 3" />
      <rect x="204" y="16" width="98" height="168" rx="10" className="fill-surface stroke-line" strokeWidth="1" />
      <text x="214" y="36" className="fill-ink" fontSize="8">
        {ex.folioAudit}
      </text>
      <text x="214" y="56" className="fill-alert" fontSize="8">
        {ex.folioContrast}
      </text>
      <text x="214" y="74" className="fill-alert" fontSize="8">
        {ex.folioOverflow}
      </text>
      <text x="214" y="92" className="fill-mint-deep" fontSize="8">
        {ex.folioSafe}
      </text>
      <text x="214" y="168" className="fill-muted" fontSize="7">
        {file}
      </text>
    </svg>
  );
}

function McpStage({ file, ex }: { file: string; ex: ExperienceChrome }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label={ex.folioNotPublicMcp}>
      <rect width="320" height="200" className="fill-surface-blue" />
      <rect x="18" y="16" width="176" height="168" rx="10" className="fill-surface stroke-line" strokeWidth="1" />
      <rect x="32" y="32" width="148" height="88" rx="8" className="fill-surface-mint" />
      <text x="40" y="54" className="fill-ink" fontSize="9">
        {ex.folioUnpublished}
      </text>
      <text x="40" y="72" className="fill-muted" fontSize="8">
        {ex.folioNotPublicMcp}
      </text>
      <rect x="204" y="16" width="98" height="168" rx="10" className="fill-surface-mint stroke-line" strokeWidth="1" />
      <text x="214" y="40" className="fill-ink" fontSize="8">
        MCP
      </text>
      <text x="214" y="60" className="fill-mint-deep" fontSize="8">
        dry-run
      </text>
      <text x="214" y="78" className="fill-muted" fontSize="7">
        {ex.folioNotWritten}
      </text>
      <text x="214" y="168" className="fill-muted" fontSize="7">
        {file}
      </text>
    </svg>
  );
}

function DocumentStage({ title, file, ex }: { title: string; file: string; ex: ExperienceChrome }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label={`${title} ${ex.folioDocumentLayer}`}>
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
