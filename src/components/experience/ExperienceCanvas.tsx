import type { PublicProject } from "@/lib/cms/privacy";
import { ProcessMap } from "./modes/ProcessMap";
import { FrameTimeline } from "./modes/FrameTimeline";
import { PosterVision } from "./modes/PosterVision";
import { PlanformSpace } from "./modes/PlanformSpace";
import { DuigaoBoard } from "./modes/DuigaoBoard";
import { FolioWalkthrough } from "./modes/FolioWalkthrough";
import { HermesPreview } from "./modes/HermesPreview";
import { ZenTalk } from "./modes/ZenTalk";
import { LiveDemoStage } from "./LiveDemoStage";
import { CanvaStage } from "./CanvaStage";
import { GithubExplorer } from "./GithubExplorer";

export function ExperienceCanvas({ project }: { project: PublicProject }) {
  const mode = project.experienceMode;
  if (mode === "process-map") return <ProcessMap project={project} />;
  if (mode === "timeline") return <FrameTimeline project={project} />;
  if (mode === "spatial-preview") return <PlanformSpace project={project} />;
  if (mode === "conversation-preview" && project.slug === "tku-zen-ai") {
    return <ZenTalk />;
  }
  if (mode === "conversation-preview") return <HermesPreview project={project} />;
  if (mode === "interactive-walkthrough") return <FolioWalkthrough project={project} />;
  if (mode === "image-comparison" && project.slug === "poster-vision-ai") {
    return <PosterVision />;
  }
  if (mode === "image-comparison") return <DuigaoBoard project={project} />;
  if (mode === "live-demo") return <LiveDemoStage project={project} />;
  if (mode === "canva-embed") return <CanvaStage project={project} />;
  if (mode === "github-explorer") return <GithubExplorer project={project} />;
  if (mode === "media-gallery") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {project.media.map((item) =>
          item.kind === "video" ? (
            <figure key={item.src} className="overflow-hidden rounded-2xl bg-surface shadow-card">
              <video className="aspect-video w-full object-cover" controls playsInline preload="metadata" poster={item.poster}>
                <source src={item.src} />
              </video>
              {item.caption ? <figcaption className="px-3 py-2 text-xs text-muted">{item.caption}</figcaption> : null}
            </figure>
          ) : (
            <figure key={item.src} className="overflow-hidden rounded-2xl bg-surface shadow-card">
              <img src={item.src} alt={item.alt} className="aspect-[4/3] w-full object-cover" />
              {item.caption ? <figcaption className="px-3 py-2 text-xs text-muted">{item.caption}</figcaption> : null}
            </figure>
          ),
        )}
      </div>
    );
  }
  return <GithubExplorer project={project} />;
}
