import { ChevronDown, ChevronRight, ExternalLink, FileText, Folder } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { githubBlobUrl } from "@/lib/github/parse";
import { useExperienceView } from "./useExperienceView";

type Node = { path: string; type: "file" | "dir"; size?: number };

function nest(nodes: Node[]) {
  const root: Record<string, { dirs: Record<string, true>; files: Node[] }> = {};
  const ensure = (dir: string) => {
    root[dir] ??= { dirs: {}, files: [] };
    return root[dir];
  };
  ensure("");
  for (const node of nodes) {
    const parts = node.path.split("/");
    if (node.type === "dir") {
      const parent = parts.slice(0, -1).join("/");
      ensure(parent).dirs[node.path] = true;
      ensure(node.path);
    } else {
      const parent = parts.slice(0, -1).join("/");
      ensure(parent).files.push(node);
      let walk = "";
      for (const part of parts.slice(0, -1)) {
        const next = walk ? `${walk}/${part}` : part;
        ensure(walk).dirs[next] = true;
        walk = next;
      }
    }
  }
  return root;
}

type VisibleItem = { path: string; type: "file" | "dir"; depth: number; size?: number };

function flattenVisible(
  nested: ReturnType<typeof nest>,
  open: Record<string, boolean>,
): VisibleItem[] {
  const out: VisibleItem[] = [];
  const walk = (dir: string, depth: number) => {
    const bucket = nested[dir];
    if (!bucket) return;
    for (const path of Object.keys(bucket.dirs).sort()) {
      out.push({ path, type: "dir", depth });
      if (open[path]) walk(path, depth + 1);
    }
    for (const file of bucket.files) {
      out.push({ path: file.path, type: "file", depth, size: file.size });
    }
  };
  walk("", 0);
  return out;
}

export function GithubExplorer({ project }: { project: PublicProject }) {
  const { ex, config } = useExperienceView(project);
  const github = project.github;
  const hints = config.fileHints ?? [];
  const hintMap = new Map(hints.map((item) => [item.path, item]));
  const tree = useMemo(() => github.fileTree ?? [], [github.fileTree]);
  const nested = useMemo(() => nest(tree), [tree]);
  const [open, setOpen] = useState<Record<string, boolean>>({ "": true });
  const [selected, setSelected] = useState<Node | null>(null);

  if (!github.url) {
    return (
      <p className="rounded-2xl bg-surface-blue px-4 py-6 text-sm text-muted">
        {ex.noGithub}
      </p>
    );
  }

  const branch = github.branch ?? "main";
  const owner = github.owner ?? "";
  const repo = github.repo ?? "";

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      {config.githubIntro ? <p className="text-sm text-muted lg:col-span-2">{config.githubIntro}</p> : null}
      <div className="rounded-2xl bg-surface p-4 shadow-card">
        <p className="font-display text-lg font-semibold">{github.name ?? repo}</p>
        <p className="mt-1 text-sm text-muted">{github.description || ex.noDescription}</p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted">
          <div>{ex.updated} {github.updatedAt ? github.updatedAt.slice(0, 10) : ex.notSynced}</div>
          <div>{ex.status} {github.syncStatus}</div>
        </dl>
        {github.languages ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {Object.entries(github.languages)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([lang]) => (
                <li key={lang} className="rounded-full bg-surface-mint px-3 py-1 text-xs">
                  {lang}
                </li>
              ))}
          </ul>
        ) : null}
        {github.topics && github.topics.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {github.topics.map((topic) => (
              <li key={topic} className="rounded-full bg-surface-blue px-3 py-1 text-xs">
                {topic}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-muted">{ex.noTopics}</p>
        )}
        {github.latestCommit ? (
          <p className="mt-3 text-xs text-muted">
            {ex.latestCommit} {github.latestCommit.sha.slice(0, 7)} · {github.latestCommit.message}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-bg"
            href={github.url}
            rel="noreferrer"
            target="_blank"
          >
            {ex.openGithub}
          </a>
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-4 text-sm"
            href={`${github.url}/blob/${branch}/README.md`}
            rel="noreferrer"
            target="_blank"
          >
            README
          </a>
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-4 shadow-card">
        <p className="text-sm font-semibold">{ex.treeTitle}</p>
        {tree.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            {github.syncStatus === "pending" || github.syncStatus === "stale"
              ? ex.treePending
              : github.syncStatus === "failed"
                ? ex.treeFailed
                : ex.treeEmpty}
          </p>
        ) : (
          <KeyboardTree
            nested={nested}
            open={open}
            setOpen={setOpen}
            onSelect={setSelected}
            selected={selected?.path}
            ariaLabel={ex.treeAria}
          />
        )}
        {tree.length === 0 && hints.length > 0 ? (
          <HintTree
            hints={hints}
            selected={selected?.path}
            onSelect={(path) => setSelected({ path, type: "file" })}
            hintNote={ex.hintNote}
            ariaLabel={ex.hintTreeAria}
          />
        ) : null}
        {selected ? (
          <div className="mt-4 rounded-xl bg-surface-blue/80 p-3 text-sm">
            <p className="font-medium">{selected.path}</p>
            <p className="mt-1 text-muted">
              {hintMap.get(selected.path)?.purpose ?? ex.defaultPurpose}
            </p>
            <p className="mt-1 text-xs text-mint-deep">
              {ex.stageLabel}：{hintMap.get(selected.path)?.stage ?? ex.defaultStage}
            </p>
            {owner && repo ? (
              <a
                className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm text-mint-deep"
                href={githubBlobUrl(owner, repo, branch, selected.path)}
                rel="noreferrer"
                target="_blank"
              >
                {ex.openOnGithub}
                <ExternalLink className="size-4" />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl bg-surface-mint/60 p-4 lg:col-span-2">
        <p className="inline-flex items-center gap-2 text-sm font-semibold">
          <FileText className="size-4" />
          {ex.readmeSummary}
        </p>
        {github.readme ? (
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink/85">
            {github.readme}
          </pre>
        ) : (
          <p className="mt-3 text-sm text-muted">{ex.readmeMissing}</p>
        )}
      </div>
    </div>
  );
}

function KeyboardTree({
  nested,
  open,
  setOpen,
  onSelect,
  selected,
  ariaLabel,
}: {
  nested: ReturnType<typeof nest>;
  open: Record<string, boolean>;
  setOpen: (value: Record<string, boolean>) => void;
  onSelect: (node: Node) => void;
  selected?: string;
  ariaLabel: string;
}) {
  const visible = useMemo(() => flattenVisible(nested, open), [nested, open]);
  const [focusPath, setFocusPath] = useState(visible[0]?.path ?? "");
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const keyboardNav = useRef(false);

  useEffect(() => {
    if (!visible.length) return;
    if (!visible.some((item) => item.path === focusPath)) {
      setFocusPath(visible[0].path);
    }
  }, [focusPath, visible]);

  useEffect(() => {
    if (!keyboardNav.current) return;
    itemRefs.current.get(focusPath)?.focus();
  }, [focusPath]);

  function onKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (!visible.length) return;
    keyboardNav.current = true;
    const idx = Math.max(0, visible.findIndex((item) => item.path === focusPath));
    const current = visible[idx];
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusPath(visible[(idx + 1) % visible.length].path);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusPath(visible[(idx - 1 + visible.length) % visible.length].path);
    } else if (event.key === "Home") {
      event.preventDefault();
      setFocusPath(visible[0].path);
    } else if (event.key === "End") {
      event.preventDefault();
      setFocusPath(visible[visible.length - 1].path);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (current.type === "dir") setOpen({ ...open, [current.path]: true });
      else onSelect({ path: current.path, type: "file", size: current.size });
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (current.type === "dir" && open[current.path]) {
        setOpen({ ...open, [current.path]: false });
        return;
      }
      const parent = current.path.split("/").slice(0, -1).join("/");
      if (parent) setFocusPath(parent);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (current.type === "dir") {
        setOpen({ ...open, [current.path]: !open[current.path] });
      } else {
        onSelect({ path: current.path, type: "file", size: current.size });
      }
    }
  }

  return (
    <ul className="mt-3 grid gap-1" role="tree" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {visible.map((item) => {
        const name = item.path.split("/").pop() ?? item.path;
        const expanded = item.type === "dir" ? Boolean(open[item.path]) : undefined;
        const isSelected = selected === item.path;
        return (
          <li key={item.path} role="none" className={["", "pl-3", "pl-6", "pl-9", "pl-12"][Math.min(item.depth, 4)]}>
            <button
              type="button"
              role="treeitem"
              aria-expanded={expanded}
              aria-selected={isSelected}
              tabIndex={focusPath === item.path ? 0 : -1}
              ref={(el) => {
                if (el) itemRefs.current.set(item.path, el);
                else itemRefs.current.delete(item.path);
              }}
              className={`inline-flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-sm hover:bg-surface-blue ${
                isSelected ? "bg-surface-mint" : ""
              }`}
              onClick={() => {
                setFocusPath(item.path);
                if (item.type === "dir") setOpen({ ...open, [item.path]: !open[item.path] });
                else onSelect({ path: item.path, type: "file", size: item.size });
              }}
            >
              {item.type === "dir" ? (
                expanded ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )
              ) : (
                <FileText className="size-4 text-muted" />
              )}
              {item.type === "dir" ? <Folder className="size-4 text-sky" /> : null}
              {name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function HintTree({
  hints,
  selected,
  onSelect,
  hintNote,
  ariaLabel,
}: {
  hints: Array<{ path: string; purpose: string; stage: string }>;
  selected?: string;
  onSelect: (path: string) => void;
  hintNote: string;
  ariaLabel: string;
}) {
  const [focusPath, setFocusPath] = useState(hints[0]?.path ?? "");
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const keyboardNav = useRef(false);

  useEffect(() => {
    if (!keyboardNav.current) return;
    itemRefs.current.get(focusPath)?.focus();
  }, [focusPath]);

  return (
    <div className="mt-3">
      <p className="text-xs text-muted">{hintNote}</p>
      <ul
        className="mt-2 grid gap-1"
        role="tree"
        aria-label={ariaLabel}
        onKeyDown={(event) => {
          if (!hints.length) return;
          keyboardNav.current = true;
          const idx = Math.max(0, hints.findIndex((item) => item.path === focusPath));
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setFocusPath(hints[(idx + 1) % hints.length].path);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setFocusPath(hints[(idx - 1 + hints.length) % hints.length].path);
          } else if (event.key === "Home") {
            event.preventDefault();
            setFocusPath(hints[0].path);
          } else if (event.key === "End") {
            event.preventDefault();
            setFocusPath(hints[hints.length - 1].path);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(hints[idx].path);
          }
        }}
      >
        {hints.map((item) => (
          <li key={item.path} role="none">
            <button
              type="button"
              role="treeitem"
              aria-selected={selected === item.path}
              tabIndex={focusPath === item.path ? 0 : -1}
              ref={(el) => {
                if (el) itemRefs.current.set(item.path, el);
                else itemRefs.current.delete(item.path);
              }}
              className={`inline-flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-sm hover:bg-surface-blue ${
                selected === item.path ? "bg-surface-mint" : ""
              }`}
              onClick={() => {
                setFocusPath(item.path);
                onSelect(item.path);
              }}
            >
              <FileText className="size-4 text-muted" />
              {item.path}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
