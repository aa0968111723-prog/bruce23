import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import type { FileTreeNode } from "@/lib/portfolio/schema";
import { githubBlobUrl } from "@/lib/portfolio/github";

function TreeNode({
  node,
  owner,
  repo,
  branch,
}: {
  node: FileTreeNode;
  owner: string;
  repo: string;
  branch: string;
}) {
  const [open, setOpen] = useState(node.type === "dir" && !node.path.includes("/"));
  if (node.type === "dir") {
    return (
      <li>
        <button
          type="button"
          className="flex min-h-11 w-full items-center gap-2 rounded-xl px-2 text-left text-sm hover:bg-surface-blue"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          <Folder className="size-4 text-mint-deep" />
          <span className="font-medium">{node.path.split("/").at(-1)}</span>
        </button>
        {open && node.children?.length ? (
          <ul className="ml-5 border-l border-line pl-2">
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                owner={owner}
                repo={repo}
                branch={branch}
              />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }
  return (
    <li>
      <a
        href={githubBlobUrl(owner, repo, branch, node.path)}
        className="flex min-h-11 items-start gap-2 rounded-xl px-2 py-2 text-sm hover:bg-surface-blue"
        rel="noreferrer"
        target="_blank"
      >
        <FileText className="mt-0.5 size-4 text-sky" />
        <span>
          <span className="block font-medium">{node.path.split("/").at(-1)}</span>
          {node.purpose ? (
            <span className="block text-xs text-muted">{node.purpose}</span>
          ) : null}
          {node.stage ? (
            <span className="mt-1 inline-flex rounded-full bg-surface-mint px-2 py-0.5 text-[11px] text-mint-deep">
              {node.stage}
            </span>
          ) : null}
        </span>
      </a>
    </li>
  );
}

export function GithubTree({
  nodes,
  owner,
  repo,
  branch,
}: {
  nodes: FileTreeNode[];
  owner: string;
  repo: string;
  branch: string;
}) {
  if (!nodes.length) {
    return (
      <p className="text-sm text-muted">
        尚未同步檔案樹。請在後台按「同步 GitHub」，或確認儲存庫是公開的。
      </p>
    );
  }
  return (
    <ul className="rounded-2xl bg-surface p-2 shadow-card">
      {nodes.map((node) => (
        <TreeNode key={node.path} node={node} owner={owner} repo={repo} branch={branch} />
      ))}
    </ul>
  );
}
