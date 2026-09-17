import { useMemo, useState } from "react";
import type { PublicProject } from "@/lib/portfolio/types";
import { nestFileTree, type NestedTreeNode } from "@/lib/portfolio/github-url";

export function GithubExplorer({ project }: { project: PublicProject }) {
  const github = project.github;
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [openDirs, setOpenDirs] = useState<Set<string>>(new Set());
  const tree = useMemo(() => (github ? nestFileTree(github.fileTree) : []), [github]);
  const selected = github?.fileTree.find((n) => n.path === selectedPath);

  if (!github) {
    return <p className="text-sm text-muted">尚未綁定公開 GitHub 專案，或不對外展示私人來源。</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <h3 className="font-display text-xl font-semibold">{github.metadata?.name ?? github.repo}</h3>
        <p className="mt-2 text-sm text-muted">{github.metadata?.description ?? "尚無公開描述。"}</p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-surface-blue p-3">
            <dt className="text-muted">預設分支</dt>
            <dd className="mt-1 font-medium">{github.branch ?? github.metadata?.defaultBranch ?? "—"}</dd>
          </div>
          <div className="rounded-xl bg-surface-blue p-3">
            <dt className="text-muted">最後更新</dt>
            <dd className="mt-1 font-medium">{github.metadata?.updatedAt?.slice(0, 10) ?? "尚未同步"}</dd>
          </div>
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
        ) : (
          <p className="mt-3 text-xs text-muted">語言資料會在後台同步 GitHub 後出現。</p>
        )}
        {github.topics.length ? (
          <p className="mt-2 text-xs text-muted">Topics：{github.topics.join("、")}</p>
        ) : null}
        {github.latestCommit ? (
          <p className="mt-3 text-xs text-muted">
            最新 commit：{github.latestCommit.message} ({github.latestCommit.sha.slice(0, 7)})
          </p>
        ) : null}
        {github.readmeSummary ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{github.readmeSummary}</p>
        ) : (
          <p className="mt-4 text-sm text-muted">README 摘要尚未同步，或抓取失敗。</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <a className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-bg" href={github.url} rel="noreferrer" target="_blank">
            完整 GitHub
          </a>
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
            href={`${github.url}#readme`}
            rel="noreferrer"
            target="_blank"
          >
            README
          </a>
          {project.liveDemo?.url ? (
            <a
              className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
              href={project.liveDemo.url}
              rel="noreferrer"
              target="_blank"
            >
              {project.liveDemo.label ?? "Live Demo"}
            </a>
          ) : null}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">有限檔案樹</p>
        <p className="mt-1 text-xs text-muted">展開資料夾、點檔案。只顯示同步時截取的上層路徑。</p>
        <ul className="mt-3 max-h-80 overflow-auto rounded-xl bg-surface-blue/70 p-2" role="tree">
          {tree.length === 0 ? (
            <li className="px-2 py-3 text-sm text-muted">尚未同步檔案樹。</li>
          ) : (
            tree.map((node) => (
              <TreeRow
                key={node.path}
                node={node}
                depth={0}
                openDirs={openDirs}
                selectedPath={selectedPath}
                onToggle={(path) => {
                  setOpenDirs((current) => {
                    const next = new Set(current);
                    if (next.has(path)) next.delete(path);
                    else next.add(path);
                    return next;
                  });
                }}
                onSelect={setSelectedPath}
              />
            ))
          )}
        </ul>
        {selected ? (
          <div className="mt-3 rounded-xl bg-surface p-3 text-sm shadow-card">
            <p className="font-medium">{selected.path}</p>
            <p className="mt-1 text-xs text-muted">
              {selected.purpose ?? "用途由作品敘事或路徑名稱對應，沒有來源就不畫假架構圖。"}
            </p>
            {selected.workflowStage ? <p className="mt-1 text-xs">流程階段：{selected.workflowStage}</p> : null}
            {selected.githubUrl ? (
              <a className="mt-2 inline-flex min-h-11 items-center text-sm text-mint-deep" href={selected.githubUrl} rel="noreferrer" target="_blank">
                開啟 GitHub 檔案
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TreeRow({
  node,
  depth,
  openDirs,
  selectedPath,
  onToggle,
  onSelect,
}: {
  node: NestedTreeNode;
  depth: number;
  openDirs: Set<string>;
  selectedPath: string | null;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
}) {
  const expanded = openDirs.has(node.path);
  return (
    <li role="treeitem" aria-expanded={node.type === "dir" ? expanded : undefined}>
      <button
        type="button"
        className={`flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm hover:bg-surface ${selectedPath === node.path ? "bg-surface" : ""}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => {
          if (node.type === "dir") onToggle(node.path);
          onSelect(node.path);
        }}
        onKeyDown={(event) => {
          if (node.type !== "dir") return;
          if (event.key === "ArrowRight" && !expanded) {
            event.preventDefault();
            onToggle(node.path);
          }
          if (event.key === "ArrowLeft" && expanded) {
            event.preventDefault();
            onToggle(node.path);
          }
        }}
      >
        <span className="mr-2 w-3 text-xs text-muted">{node.type === "dir" ? (expanded ? "▾" : "▸") : "·"}</span>
        {node.name}
      </button>
      {node.type === "dir" && expanded ? (
        <ul role="group">
          {node.children.map((child) => (
            <TreeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              openDirs={openDirs}
              selectedPath={selectedPath}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
