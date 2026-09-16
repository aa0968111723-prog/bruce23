import { ChevronDown, ChevronRight, ExternalLink, FileText, Folder } from "lucide-react";
import { useMemo, useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { githubBlobUrl } from "@/lib/github/parse";
import { experienceForSlug } from "@/lib/experiences/catalog";

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

export function GithubExplorer({ project }: { project: PublicProject }) {
  const github = project.github;
  const catalog = experienceForSlug(project.slug);
  const hints = catalog?.fileHints ?? [];
  const hintMap = new Map(hints.map((item) => [item.path, item]));
  const tree = useMemo(() => github.fileTree ?? [], [github.fileTree]);
  const nested = useMemo(() => nest(tree), [tree]);
  const [open, setOpen] = useState<Record<string, boolean>>({ "": true });
  const [selected, setSelected] = useState<Node | null>(null);

  if (!github.url) {
    return (
      <p className="rounded-2xl bg-surface-blue px-4 py-6 text-sm text-muted">
        還沒有公開 GitHub 來源。不會顯示虛構架構圖。
      </p>
    );
  }

  const branch = github.branch ?? "main";
  const owner = github.owner ?? "";
  const repo = github.repo ?? "";

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl bg-surface p-4 shadow-card">
        <p className="font-display text-lg font-semibold">{github.name ?? repo}</p>
        <p className="mt-1 text-sm text-muted">{github.description || "尚無公開 description。"}</p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted">
          <div>更新 {github.updatedAt ? github.updatedAt.slice(0, 10) : "尚未同步"}</div>
          <div>狀態 {github.syncStatus}</div>
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
          <p className="mt-2 text-xs text-muted">這個儲存庫目前沒有 GitHub topics。</p>
        )}
        {github.latestCommit ? (
          <p className="mt-3 text-xs text-muted">
            最新提交 {github.latestCommit.sha.slice(0, 7)} · {github.latestCommit.message}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-bg"
            href={github.url}
            rel="noreferrer"
            target="_blank"
          >
            開 GitHub
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
        <p className="text-sm font-semibold">有限檔案樹</p>
        {tree.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            {github.syncStatus === "pending"
              ? "還沒同步過檔案樹。後台按「同步 GitHub」後才會出現真實路徑。"
              : "沒有可公開的檔案樹。"}
          </p>
        ) : (
          <TreeDir
            dir=""
            nested={nested}
            open={open}
            setOpen={setOpen}
            onSelect={setSelected}
            selected={selected?.path}
          />
        )}
        {selected ? (
          <div className="mt-4 rounded-xl bg-surface-blue/80 p-3 text-sm">
            <p className="font-medium">{selected.path}</p>
            <p className="mt-1 text-muted">
              {hintMap.get(selected.path)?.purpose ?? "公開儲存庫路徑，用途以 README 與檔名為準。"}
            </p>
            <p className="mt-1 text-xs text-mint-deep">
              流程階段：{hintMap.get(selected.path)?.stage ?? "來源"}
            </p>
            {owner && repo ? (
              <a
                className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm text-mint-deep"
                href={githubBlobUrl(owner, repo, branch, selected.path)}
                rel="noreferrer"
                target="_blank"
              >
                在 GitHub 開啟
                <ExternalLink className="size-4" />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl bg-surface-mint/60 p-4 lg:col-span-2">
        <p className="inline-flex items-center gap-2 text-sm font-semibold">
          <FileText className="size-4" />
          README 摘要
        </p>
        {github.readme ? (
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink/85">
            {github.readme}
          </pre>
        ) : (
          <p className="mt-3 text-sm text-muted">README 尚未同步，或這個儲存庫沒有公開 README。</p>
        )}
      </div>
    </div>
  );
}

function TreeDir({
  dir,
  nested,
  open,
  setOpen,
  onSelect,
  selected,
}: {
  dir: string;
  nested: ReturnType<typeof nest>;
  open: Record<string, boolean>;
  setOpen: (value: Record<string, boolean>) => void;
  onSelect: (node: Node) => void;
  selected?: string;
}) {
  const bucket = nested[dir];
  if (!bucket) return null;
  const dirs = Object.keys(bucket.dirs).sort();
  return (
    <ul className={dir ? "ml-3 border-l border-line pl-2" : "mt-3 grid gap-1"}>
      {dirs.map((path) => {
        const name = path.split("/").pop() ?? path;
        const expanded = open[path];
        return (
          <li key={path}>
            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-sm hover:bg-surface-blue"
              onClick={() => setOpen({ ...open, [path]: !expanded })}
            >
              {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              <Folder className="size-4 text-sky" />
              {name}
            </button>
            {expanded ? (
              <TreeDir
                dir={path}
                nested={nested}
                open={open}
                setOpen={setOpen}
                onSelect={onSelect}
                selected={selected}
              />
            ) : null}
          </li>
        );
      })}
      {bucket.files.map((file) => (
        <li key={file.path}>
          <button
            type="button"
            className={`inline-flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-sm hover:bg-surface-blue ${
              selected === file.path ? "bg-surface-mint" : ""
            }`}
            onClick={() => onSelect(file)}
          >
            <FileText className="size-4 text-muted" />
            {file.path.split("/").pop()}
          </button>
        </li>
      ))}
    </ul>
  );
}
