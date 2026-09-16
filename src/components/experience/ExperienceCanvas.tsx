import type { PublicProject } from "@/lib/cms/privacy";
import { resolveExperienceConfig } from "@/lib/experiences/resolve";
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
import { MediaFrame } from "@/components/site/MediaFrame";

export function ExperienceCanvas({ project }: { project: PublicProject }) {
  const mode = project.experienceMode;
  const config = resolveExperienceConfig(project);
  if (mode === "process-map") return <ProcessMap project={project} />;
  if (mode === "timeline") return <FrameTimeline project={project} />;
  if (mode === "spatial-preview") return <PlanformSpace project={project} />;
  if (mode === "conversation-preview" && config.conversation?.engine === "zen-local") {
    return <ZenTalk project={project} />;
  }
  if (mode === "conversation-preview") return <HermesPreview project={project} />;
  if (mode === "interactive-walkthrough") return <FolioWalkthrough project={project} />;
  if (mode === "image-comparison" && config.comparison?.variant === "poster-analysis") {
    return <PosterVision project={project} />;
  }
  if (mode === "image-comparison") return <DuigaoBoard project={project} />;
  if (mode === "live-demo") return <LiveDemoStage project={project} />;
  if (mode === "canva-embed") return <CanvaStage project={project} />;
  if (mode === "github-explorer") return <GithubExplorer project={project} />;
  if (mode === "media-gallery") {
    return (
      <div className="grid gap-3">
        {config.galleryNote ? <p className="text-sm text-muted">{config.galleryNote}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {project.media.map((item) => (
            <figure key={item.src} className="overflow-hidden rounded-2xl bg-surface shadow-card">
              <MediaFrame media={item} className={item.kind === "video" ? "aspect-video" : "aspect-[4/3]"} />
              {item.caption ? <figcaption className="px-3 py-2 text-xs text-muted">{item.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </div>
    );
  }
  return <GithubExplorer project={project} />;
}
