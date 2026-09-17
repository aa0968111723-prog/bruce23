import { useMemo, useState, type KeyboardEvent } from "react";
import type { WalkthroughStep } from "@/lib/cms/schema";
import type { PublicProject } from "@/lib/cms/privacy";
import { walkthroughStageKind, type WalkthroughStageKind } from "@/lib/experiences/walkthrough";
import {
  applyFolioCommand,
  folioAudit,
  initialFolioDoc,
  type FolioBoard,
} from "@/lib/experiences/operate";
import { githubBlobUrl } from "@/lib/github/parse";
import { joinSentences, type ExperienceChrome } from "@/lib/locale/experience";
import { useExperienceView } from "../useExperienceView";

export function FolioWalkthrough({ project }: { project: PublicProject }) {
  const { ex, config } = useExperienceView(project);
  const steps = config.walkthrough ?? [];
  const [index, setIndex] = useState(0);
  const [boards, setBoards] = useState<FolioBoard[]>(initialFolioDoc);
  const [boardId, setBoardId] = useState(boards[0]?.id ?? "board-a");
  const [query, setQuery] = useState("");
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const step = steps[index];
  const owner = project.github.owner;
  const repo = project.github.repo;
  const branch = project.github.branch ?? "main";
  const kind = step ? walkthroughStageKind(step) : "document";
  const board = boards.find((item) => item.id === boardId) ?? boards[0];
  const audit = folioAudit(board);
  const dryRun = kind === "mcp";

  function go(next: number) {
    if (!steps.length) return;
    setIndex(Math.min(steps.length - 1, Math.max(0, next)));
  }

  function run(command: "insert-text" | "add-shape") {
    const label = command === "insert-text" ? ex.folioText : "";
    setLastCommand(command);
    if (dryRun) return;
    setBoards((list) => applyFolioCommand(list, boardId, command, label));
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

  const commands = useMemo(
    () =>
      [
        { id: "insert-text" as const, label: ex.folioInsertText },
        { id: "add-shape" as const, label: ex.folioAddShape },
      ].filter((item) => !query.trim() || item.label.toLowerCase().includes(query.trim().toLowerCase())),
    [ex.folioAddShape, ex.folioInsertText, query],
  );

  if (!step) return <p className="text-sm text-muted">{ex.emptyWalkthrough}</p>;

  return (
    <div tabIndex={0} onKeyDown={onKey} className="outline-none" aria-label={ex.walkAria}>
      <p className="text-sm text-muted">
        {joinSentences(config.intro ?? ex.folioDefaultIntro, ex.folioNotCounter, ex.folioLiveHint)}
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
        data-folio-live="true"
      >
        <FolioStage
          step={step}
          kind={kind}
          index={index}
          total={steps.length}
          ex={ex}
          boards={boards}
          boardId={boardId}
          onBoard={setBoardId}
          onPlace={(x, y) => {
            if (kind !== "canvas") return;
            setBoards((list) =>
              applyFolioCommand(list, boardId, "insert-text", ex.folioText, `n-${Math.round(x)}-${Math.round(y)}`, {
                x,
                y,
              }),
            );
            setLastCommand("insert-text");
          }}
        />
      </div>
      {(kind === "command" || kind === "mcp") && (
        <div className="mt-3 rounded-2xl bg-surface p-4 shadow-card" data-folio-commands="">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-11 w-full rounded-full border border-line bg-bg px-4 text-sm"
            placeholder={ex.folioCommand}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {commands.map((item) => (
              <button
                key={item.id}
                type="button"
                className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
                onClick={() => run(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {lastCommand ? (
            <p className="mt-2 text-xs text-mint-deep" data-folio-write={dryRun ? "dry-run" : "applied"}>
              {dryRun ? ex.folioDryRun : ex.folioApplied} · {lastCommand}
            </p>
          ) : null}
        </div>
      )}
      {kind === "audit" ? (
        <ul className="mt-3 grid gap-2 text-sm">
          <li className="rounded-xl bg-surface px-4 py-3 shadow-card" data-folio-contrast={audit.contrast ? "ok" : "low"}>
            {ex.folioContrast}: {audit.contrast ? ex.folioSafe : ex.folioContrast}
          </li>
          <li className="rounded-xl bg-surface px-4 py-3 shadow-card" data-folio-overflow={audit.overflow ? "true" : "false"}>
            {ex.folioOverflow}: {audit.overflow ? ex.folioOverflow : ex.folioSafe}
          </li>
        </ul>
      ) : null}
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
  boards,
  boardId,
  onBoard,
  onPlace,
}: {
  step: WalkthroughStep;
  kind: WalkthroughStageKind;
  index: number;
  total: number;
  ex: ExperienceChrome;
  boards: FolioBoard[];
  boardId: string;
  onBoard: (id: string) => void;
  onPlace: (x: number, y: number) => void;
}) {
  const file = step.path?.split("/").pop() ?? step.path ?? "document";
  const board = boards.find((item) => item.id === boardId) ?? boards[0];
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
        {kind === "artboard" ? <ArtboardStage file={file} ex={ex} /> : null}
        {kind === "command" ? <CommandStage file={file} ex={ex} /> : null}
        {kind === "audit" ? <AuditStage file={file} ex={ex} /> : null}
        {kind === "mcp" ? <McpStage file={file} ex={ex} /> : null}
        {kind === "document" ? <DocumentStage title={step.title} file={file} ex={ex} /> : null}
        {board && (kind === "canvas" || kind === "artboard" || kind === "audit") ? (
          <LiveBoard
            board={board}
            boards={boards}
            boardId={boardId}
            kind={kind}
            onBoard={onBoard}
            onPlace={onPlace}
          />
        ) : null}
      </div>
    </div>
  );
}

function LiveBoard({
  board,
  boards,
  boardId,
  kind,
  onBoard,
  onPlace,
}: {
  board: FolioBoard;
  boards: FolioBoard[];
  boardId: string;
  kind: WalkthroughStageKind;
  onBoard: (id: string) => void;
  onPlace: (x: number, y: number) => void;
}) {
  return (
    <div className="absolute inset-0">
      {kind === "canvas" ? (
        <button
          type="button"
          className="absolute inset-[11%] left-[11%] right-[27%] top-[17%] bottom-[12%]"
          data-folio-place=""
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            onPlace(x, y);
          }}
        >
          <span className="sr-only">place</span>
        </button>
      ) : null}
      {board.nodes.map((node) => (
        <span
          key={node.id}
          className={`pointer-events-none absolute rounded-md ${node.kind === "text" ? "bg-mint/80 px-1 text-[10px] text-primary-foreground" : "bg-sky"}`}
          style={{ left: `${node.x}%`, top: `${node.y}%`, width: `${node.w}%`, height: `${node.h}%` }}
          data-folio-node={node.kind}
        >
          {node.label}
        </span>
      ))}
      {kind === "artboard" ? (
        <div className="absolute inset-x-3 bottom-2 flex gap-1" data-folio-artboards="">
          {boards.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-lg text-xs ${
                item.id === boardId ? "bg-mint text-primary-foreground" : "bg-surface-blue"
              }`}
              onClick={() => onBoard(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
      ) : null}
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

function ArtboardStage({ file, ex }: { file: string; ex: ExperienceChrome }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label={ex.folioArtboards} data-folio-artboard="true">
      <rect width="320" height="200" className="fill-surface-blue" />
      <rect x="0" y="0" width="320" height="22" className="fill-surface stroke-line" />
      <text x="8" y="15" className="fill-muted" fontSize="7">
        {ex.folioBack}
      </text>
      <text x="92" y="15" className="fill-ink" fontSize="7">
        {ex.folioArtboards}
      </text>
      <rect x="18" y="32" width="284" height="118" rx="8" className="fill-surface stroke-line" strokeWidth="1" />
      <rect x="36" y="44" width="168" height="94" rx="6" className="fill-surface-mint stroke-mint" strokeWidth="2" />
      <rect x="48" y="56" width="88" height="12" rx="2" className="fill-mint" />
      <rect x="48" y="76" width="56" height="40" rx="6" className="fill-sky" />
      <text x="48" y="130" className="fill-muted" fontSize="7">
        {file}
      </text>
      <rect x="22" y="158" width="276" height="32" rx="6" className="fill-surface stroke-line" />
      <rect x="32" y="164" width="48" height="20" rx="3" className="fill-surface-blue" />
      <rect x="88" y="164" width="48" height="20" rx="3" className="fill-surface-mint stroke-mint" strokeWidth="1.5" />
      <rect x="144" y="164" width="48" height="20" rx="3" className="fill-surface-blue" />
      <text x="220" y="178" className="fill-muted" fontSize="7">
        {ex.folioArtboards}
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
