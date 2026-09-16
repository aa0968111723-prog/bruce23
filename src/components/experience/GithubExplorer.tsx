import { useState } from "react";
import { ChevronRight, ExternalLink, FileText, Folder } from "lucide-react";
import type { FileTreeNode } from "@/lib/cms/schema";
import type { PublicGithub } from "@/lib/cms/public-types";
import { cn } from "@/lib/cn";

function Node({ node, depth = 0 }: { node: FileTreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const isDir = node.type === "dir";
  return (
    <li>
      <div
        className="flex min-h-11 items-start gap-2 rounded-xl px-2 py-1.5 hover:bg-surface-blue"
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {isDir ? (
          <button
            type="button"
            className="mt-0.5 inline-flex size-8 items-center justify-center rounded-lg"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
          </button>
        ) : (
          <span className="mt-0.5 grid size-8 place-items-center">
            <FileText className="size-4 text-muted" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{node.path}</p>
          {node.purpose ? (
            <p className="text-xs text-muted">
              {node.purpose}
              {node.stage ? ` · ${node.stage}` : ""}
            </p>
          ) : null}
        </div>
        {node.githubUrl ? (
          <a
            href={node.githubUrl}
            className="inline-flex size-11 items-center justify-center text-mint-deep"
            rel="noreferrer"
            target="_blank"
            aria-label={`在 GitHub 開啟 ${node.path}`}
          >
            <ExternalLink className="size-4" />
          </a>
        ) : null}
      </div>
      {isDir && open && node.children?.length ? (
        <ul>
          {node.children.map((child) => (
            <Node key={child.path} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function GithubExplorer({ github, demoUrl }: { github: PublicGithub; demoUrl?: string | null }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-sm font-medium text-mint-deep">
          {github.owner}/{github.repo}
        </p>
        <h3 className="mt-1 font-display text-2xl font-semibold">{github.repo}</h3>
        {github.description ? <p className="mt-2 text-sm text-muted">{github.description}</p> : null}
        <dl className="mt-4 grid gap-2 text-sm">
          {github.updatedAt ? (
            <div>
              <dt className="text-muted">更新</dt>
              <dd>{new Date(github.updatedAt).toLocaleDateString("zh-Hant")}</dd>
            </div>
          ) : null}
          {github.latestCommit ? (
            <div>
              <dt className="text-muted">最新提交</dt>
              <dd>
                <code className="text-xs">{github.latestCommit.sha}</code> {github.latestCommit.message}
              </dd>
            </div>
          ) : null}
        </dl>
        {github.topics.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {github.topics.map((t) => (
              <li key={t} className="rounded-full bg-surface-mint px-3 py-1 text-xs">
                {t}
              </li>
            ))}
          </ul>
        ) : null}
        {github.languages ? (
          <ul className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            {Object.entries(github.languages)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([lang, n]) => (
                <li key={lang}>
                  {lang} {n}
                </li>
              ))}
          </ul>
        ) : null}
        {github.readmeSummary ? (
          <p className="mt-4 rounded-2xl bg-surface-blue/70 p-4 text-sm leading-relaxed">{github.readmeSummary}</p>
        ) : (
          <p className="mt-4 text-sm text-muted">尚未同步 README，或儲存庫沒有 README。</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={github.url}
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-bg"
            rel="noreferrer"
            target="_blank"
          >
            完整儲存庫
          </a>
          <a
            href={`${github.url}#readme`}
            className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
            rel="noreferrer"
            target="_blank"
          >
            README
          </a>
          {demoUrl ? (
            <a
              href={demoUrl}
              className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
              rel="noreferrer"
              target="_blank"
            >
              Live Demo
            </a>
          ) : null}
        </div>
      </div>
      <div className="rounded-2xl bg-surface p-3 shadow-card">
        <p className="mb-2 flex items-center gap-2 px-2 text-sm font-medium">
          <Folder className="size-4" />
          有限檔案樹
        </p>
        {github.fileTree?.length ? (
          <ul>
            {github.fileTree.map((node) => (
              <Node key={node.path} node={node} />
            ))}
          </ul>
        ) : (
          <p className="px-2 py-6 text-sm text-muted">同步 GitHub 後會出現根目錄檔案。不會把整座 repo 下載進資料庫。</p>
        )}
      </div>
    </div>
  );
}
