import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { buildRelationGraph, projectMatchesKind, type ExploreKind } from "@/lib/portfolio/relations";
import type { PublicProject } from "@/lib/portfolio/types";
import { cn } from "@/lib/cn";

const PRIMARY: Array<{ kind: ExploreKind; label: string; note: string }> = [
  { kind: "image", label: "圖像", note: "海報、構圖、畫布" },
  { kind: "video", label: "影片", note: "分鏡、逐幀、時間軸" },
  { kind: "space", label: "空間", note: "等角場佈與動線" },
  { kind: "print", label: "文宣", note: "對稿與視覺檢測" },
  { kind: "interaction", label: "互動", note: "對話、MCP、體驗" },
  { kind: "github", label: "GitHub", note: "真實儲存庫資料" },
  { kind: "canva", label: "Canva", note: "可嵌入原作" },
  { kind: "demo", label: "Demo", note: "公開試用網址" },
  { kind: "experience", label: "體驗", note: "可操作展示" },
];

export function ExploreField({ projects }: { projects: PublicProject[] }) {
  const graph = useMemo(() => buildRelationGraph(projects), [projects]);
  const [kind, setKind] = useState<ExploreKind>("image");
  const visible = projects.filter((p) => projectMatchesKind(p, kind));
  const node = graph.find((item) => item.kind === kind);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-3xl font-semibold">視覺探索</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        點模態看真正接上的作品。關係來自作品資料，不是裝飾用的 3D。手機上以卡片為主，不必拖空間才能找到作品。
      </p>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="模態">
        {PRIMARY.map((item) => (
          <button
            key={item.kind}
            type="button"
            role="tab"
            aria-selected={kind === item.kind}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
              kind === item.kind ? "bg-ink text-bg" : "bg-surface text-muted shadow-card",
            )}
            onClick={() => setKind(item.kind)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">
        {PRIMARY.find((item) => item.kind === kind)?.note} · {node?.slugs.length ?? 0} 件
      </p>
      <div className="mt-6 hidden gap-3 md:flex md:flex-wrap">
        {graph
          .filter((item) => item.slugs.length > 0)
          .map((item) => (
            <button
              key={item.id}
              type="button"
              className="relation-node min-h-11 rounded-2xl bg-surface px-4 py-3 text-left shadow-card"
              onClick={() => setKind(item.kind)}
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="text-xs text-muted">{item.slugs.length} 件作品</span>
            </button>
          ))}
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 md:hidden">
        {visible.map((project) => (
          <Link
            key={project.slug}
            to="/work/$slug"
            params={{ slug: project.slug }}
            className="min-w-[16rem] shrink-0 rounded-2xl bg-surface p-4 shadow-card"
          >
            <p className="text-xs text-muted">{project.category}</p>
            <p className="mt-1 font-display text-lg font-semibold">{project.title}</p>
            <p className="mt-2 line-clamp-2 text-sm text-muted">{project.summary}</p>
          </Link>
        ))}
      </div>
      <ul className="mt-6 hidden grid-cols-2 gap-3 md:grid lg:grid-cols-3">
        {visible.map((project) => (
          <li key={project.slug}>
            <Link
              to="/work/$slug"
              params={{ slug: project.slug }}
              className="flex min-h-11 items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-card"
            >
              <span>
                <span className="block font-medium">{project.title}</span>
                <span className="text-sm text-muted">{project.subtitle}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
