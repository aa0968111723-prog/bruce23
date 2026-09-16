import { useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { PublicProject } from "@/lib/portfolio/types";
import { AiDirectorExhibit } from "./exhibits/AiDirectorExhibit";
import { CanvaOriginal } from "./exhibits/CanvaOriginal";
import { DemoFrame } from "./exhibits/DemoFrame";
import { DuigaoExhibit } from "./exhibits/DuigaoExhibit";
import { FrameLabExhibit } from "./exhibits/FrameLabExhibit";
import { GithubExplorer } from "./exhibits/GithubExplorer";
import { HowItWorks } from "./exhibits/HowItWorks";
import { PlanformExhibit } from "./exhibits/PlanformExhibit";
import { PosterVisionExhibit } from "./exhibits/PosterVisionExhibit";
import { SourceEvidencePanel } from "./exhibits/SourceEvidencePanel";
import { TkuZenExhibit } from "./exhibits/TkuZenExhibit";

const TABS = [
  { id: "try", label: "立即體驗" },
  { id: "visual", label: "視覺展示" },
  { id: "github", label: "GitHub 專案" },
  { id: "canva", label: "Canva 原作" },
  { id: "how", label: "如何運作" },
  { id: "source", label: "技術來源" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ExperiencePanel({ project }: { project: PublicProject }) {
  const [tab, setTab] = useState<TabId>("try");
  const labelId = useId();

  useEffect(() => {
    setTab("try");
  }, [project.slug]);

  return (
    <section className="mt-8 rounded-2xl bg-surface shadow-float" aria-labelledby={labelId}>
      <div className="border-b border-line px-4 pt-4 sm:px-6">
        <p id={labelId} className="text-xs font-medium tracking-wide text-mint-deep">
          體驗區 · 可操作
        </p>
        <div
          className="mt-3 flex gap-1 overflow-x-auto pb-3"
          role="tablist"
          aria-label="作品體驗"
        >
          {TABS.map((item) => {
            const selected = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
                  selected ? "bg-ink text-bg" : "bg-surface-blue/80 text-muted hover:text-ink",
                )}
                onClick={() => setTab(item.id)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                  event.preventDefault();
                  const index = TABS.findIndex((t) => t.id === tab);
                  const next =
                    event.key === "ArrowRight"
                      ? TABS[(index + 1) % TABS.length]
                      : TABS[(index - 1 + TABS.length) % TABS.length];
                  setTab(next.id);
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4 sm:p-6" role="tabpanel">
        {tab === "try" ? <TryTab project={project} /> : null}
        {tab === "visual" ? <VisualTab project={project} /> : null}
        {tab === "github" ? <GithubExplorer project={project} /> : null}
        {tab === "canva" ? <CanvaOriginal project={project} /> : null}
        {tab === "how" ? <HowItWorks project={project} /> : null}
        {tab === "source" ? <SourceEvidencePanel project={project} /> : null}
      </div>
    </section>
  );
}

function TryTab({ project }: { project: PublicProject }) {
  const exhibit = exhibitFor(project);
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        {exhibit.label}。這不是雲端後台登入，也不會寫入你的私人資料。
      </p>
      {exhibit.node}
    </div>
  );
}

function VisualTab({ project }: { project: PublicProject }) {
  const cover = project.media[0];
  return (
    <div className="grid gap-4">
      {cover ? (
        <figure className="overflow-hidden rounded-2xl bg-surface-blue">
          {cover.kind === "video" ? (
            <video className="aspect-[16/10] w-full object-cover" controls playsInline poster={cover.poster}>
              <source src={cover.src} />
            </video>
          ) : (
            <img src={cover.src} alt={cover.alt} className="aspect-[16/10] w-full object-cover" />
          )}
          {cover.caption ? (
            <figcaption className="px-4 py-3 text-xs text-muted">{cover.caption}</figcaption>
          ) : null}
        </figure>
      ) : (
        <p className="text-sm text-muted">尚未放入公開媒體。</p>
      )}
      <ul className="flex flex-wrap gap-2">
        {project.modalities.map((item) => (
          <li key={item} className="rounded-full bg-surface-mint px-3 py-1.5 text-xs font-medium">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function exhibitFor(project: PublicProject): { label: string; node: ReactNode } {
  switch (project.slug) {
    case "ai-director-os":
      return { label: "作品集互動展示 · 流程節點", node: <AiDirectorExhibit project={project} /> };
    case "framelab":
      return { label: "作品集互動展示 · 時間軸", node: <FrameLabExhibit /> };
    case "poster-vision-ai":
      return { label: "作品集互動展示 · 像素推估", node: <PosterVisionExhibit /> };
    case "planform":
      return { label: "作品集互動展示 · 等角場佈", node: <PlanformExhibit /> };
    case "duigao":
      return { label: "作品集互動展示 · 對稿註記", node: <DuigaoExhibit /> };
    case "tku-zen-ai":
      return { label: "本地回應引擎 · 不是雲端 LLM", node: <TkuZenExhibit /> };
    default:
      if (project.experienceMode === "live-demo" && project.liveDemo?.embedEnabled) {
        return { label: project.liveDemo.label ?? "Live Demo", node: <DemoFrame demo={project.liveDemo} /> };
      }
      if (project.experienceMode === "canva-embed") {
        return { label: "Canva 原作", node: <CanvaOriginal project={project} /> };
      }
      return { label: "GitHub 真實結構", node: <GithubExplorer project={project} /> };
  }
}
