import { useEffect, useState } from "react";
import type { PublicProject } from "@/lib/cms/public-types";
import { nextIndex } from "@/lib/ui/roving";
import { cn } from "@/lib/cn";
import { CanvaEmbed } from "./CanvaEmbed";
import { GithubExplorer } from "./GithubExplorer";
import { LiveDemoFrame } from "./LiveDemoFrame";
import { ProcessMapExperience } from "./ProcessMapExperience";
import { TimelineExperience } from "./TimelineExperience";
import { PosterVisionExperience } from "./PosterVisionExperience";
import { PlanformExperience } from "./PlanformExperience";
import { DuigaoExperience } from "./DuigaoExperience";
import { ZenExperience } from "./ZenExperience";
import { MediaFrame } from "@/components/site/MediaFrame";

const TABS = [
  { id: "play", label: "立即體驗" },
  { id: "visual", label: "視覺展示" },
  { id: "github", label: "GitHub 專案" },
  { id: "canva", label: "Canva 原作" },
  { id: "how", label: "如何運作" },
  { id: "source", label: "技術來源" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ExperiencePanel({ project }: { project: PublicProject }) {
  const [tab, setTab] = useState<TabId>("play");

  useEffect(() => {
    setTab("play");
  }, [project.slug]);

  return (
    <section className="rounded-2xl bg-surface/80 p-3 shadow-card sm:p-5">
      <div
        className="flex gap-2 overflow-x-auto pb-2"
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
              tabIndex={selected ? 0 : -1}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
                selected ? "bg-ink text-bg" : "bg-surface-blue text-muted",
              )}
              onClick={() => setTab(item.id)}
              onKeyDown={(e) => {
                const idx = TABS.findIndex((t) => t.id === tab);
                if (e.key === "ArrowRight") {
                  setTab(TABS[nextIndex(TABS.length, idx, 1)].id);
                }
                if (e.key === "ArrowLeft") {
                  setTab(TABS[nextIndex(TABS.length, idx, -1)].id);
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="mt-5" role="tabpanel">
        {tab === "play" ? <PlayTab project={project} /> : null}
        {tab === "visual" ? <VisualTab project={project} /> : null}
        {tab === "github" ? (
          project.github ? (
            <GithubExplorer github={project.github} demoUrl={project.demo?.url} />
          ) : (
            <p className="text-sm text-muted">沒有已核准的公開 GitHub 資料。私有來源不會出現在這裡。</p>
          )
        ) : null}
        {tab === "canva" ? (
          project.canva?.embedUrl || project.canva?.shareUrl ? (
            <CanvaEmbed
              embedUrl={project.canva.embedUrl}
              shareUrl={project.canva.shareUrl}
              thumbnailUrl={project.canva.thumbnailUrl}
              alt={project.canva.alt}
              caption={project.canva.caption}
              pageIds={project.canva.pageIds}
            />
          ) : (
            <p className="text-sm text-muted">尚未設定公開 Canva 嵌入。管理員可在後台貼上分享連結。</p>
          )
        ) : null}
        {tab === "how" ? (
          <ol className="grid gap-2">
            {(project.interactionSteps.length ? project.interactionSteps : project.process).map((step, idx) => (
              <li key={step} className="rounded-xl bg-surface-blue/80 px-4 py-3 text-sm">
                <span className="mr-2 text-mint-deep">{String(idx + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
        ) : null}
        {tab === "source" ? (
          <ul className="grid gap-2">
            {project.sourceEvidence.map((ref) => (
              <li key={ref.label} className="text-sm text-muted">
                {ref.href ? (
                  <a href={ref.href} className="text-mint-deep" rel="noreferrer" target="_blank">
                    {ref.label}
                  </a>
                ) : (
                  ref.label
                )}
                {ref.path ? <span className="ml-2 font-mono text-xs">{ref.path}</span> : null}
                <span> — {ref.note}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function PlayTab({ project }: { project: PublicProject }) {
  const cfg = project.experienceConfig;
  const note = cfg.honestNote;
  const label = cfg.label;

  if (project.experienceMode === "process-map") {
    const nodes = cfg.nodes ?? [];
    return (
      <ProcessMapExperience
        nodes={nodes}
        label={label}
        note={note}
        githubUrl={project.github?.url}
      />
    );
  }
  if (project.experienceMode === "timeline" || project.experienceMode === "interactive-walkthrough") {
    return (
      <TimelineExperience
        frames={typeof cfg.frames === "number" ? cfg.frames : 24}
        problemFrames={cfg.problemFrames ?? [12, 13]}
        note={note}
      />
    );
  }
  if (project.experienceMode === "image-comparison" && project.slug === "poster-vision-ai") {
    return <PosterVisionExperience note={note} />;
  }
  if (project.slug === "poster-vision-ai") {
    return <PosterVisionExperience note={note} />;
  }
  if (project.slug === "duigao" || project.experienceMode === "image-comparison") {
    return <DuigaoExperience note={note} />;
  }
  if (project.experienceMode === "spatial-preview") {
    return <PlanformExperience note={note} />;
  }
  if (project.experienceMode === "conversation-preview") {
    return <ZenExperience note={note} />;
  }
  if (project.experienceMode === "canva-embed" && project.canva) {
    return (
      <CanvaEmbed
        embedUrl={project.canva.embedUrl}
        shareUrl={project.canva.shareUrl}
        thumbnailUrl={project.canva.thumbnailUrl}
        alt={project.canva.alt}
        caption={project.canva.caption}
        pageIds={project.canva.pageIds}
      />
    );
  }
  if (project.experienceMode === "live-demo" && project.demo?.url) {
    return (
      <LiveDemoFrame
        url={project.demo.url}
        title={project.title}
        embedEnabled={project.demo.embedEnabled}
        status={project.demo.status}
      />
    );
  }
  if (project.github) {
    return <GithubExplorer github={project.github} demoUrl={project.demo?.url} />;
  }
  return <VisualTab project={project} />;
}

function VisualTab({ project }: { project: PublicProject }) {
  const media = project.media[0];
  if (!media) return <p className="text-sm text-muted">尚無視覺素材。</p>;
  return (
    <figure className="overflow-hidden rounded-2xl shadow-float">
      <MediaFrame media={media} className="aspect-[16/10]" />
      {media.caption ? (
        <figcaption className="bg-surface-blue px-4 py-3 text-xs text-muted">{media.caption}</figcaption>
      ) : null}
    </figure>
  );
}
