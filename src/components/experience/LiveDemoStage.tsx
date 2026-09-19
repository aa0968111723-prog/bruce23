import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { demoViewerState, type PublicProject } from "@/lib/cms/privacy";
import { isSafeHttpUrl } from "@/lib/safe-href";
import { fillChrome } from "@/lib/locale/experience";
import { useExperienceView } from "./useExperienceView";

export function LiveDemoStage({ project }: { project: PublicProject }) {
  const { ex, config } = useExperienceView(project);
  const demo = project.demo;
  const [failed, setFailed] = useState(false);
  const state = demoViewerState(demo, failed);

  if (state === "empty") {
    return (
      <div className="rounded-2xl bg-surface-blue px-4 py-8 text-sm text-muted">
        {config.demoNote ?? ex.emptyDemo}
      </div>
    );
  }

  if (state === "fallback") {
    return (
      <div className="rounded-2xl bg-surface p-5 shadow-card">
        <p className="font-medium">{demo.label ?? ex.publicUrl}</p>
        <p className="mt-2 text-sm text-muted">
          {demo.error || (demo.status === "pending" ? ex.pendingEmbed : ex.cannotEmbed)}
        </p>
        {demo.url && isSafeHttpUrl(demo.url) ? (
          <a
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm text-bg"
            href={demo.url}
            rel="noreferrer"
            target="_blank"
          >
            {ex.newTab}
            <ExternalLink className="size-4" />
          </a>
        ) : null}
      </div>
    );
  }

  if (state === "embed" && demo.url && isSafeHttpUrl(demo.url)) {
    return (
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        <iframe
          title={demo.label ?? `${project.title} live demo`}
          src={demo.url}
          className="aspect-[16/10] w-full min-h-[28rem] bg-surface-blue sm:min-h-[min(70vh,36rem)]"
          loading="lazy"
          onError={() => setFailed(true)}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-muted">
          <span>{fillChrome(ex.liveStatus, { status: demo.status })}</span>
          <a
            href={demo.url}
            className="inline-flex min-h-11 items-center text-mint-deep"
            rel="noreferrer"
            target="_blank"
          >
            {ex.openSite}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface p-5 shadow-card">
      <p className="font-medium">{demo.label ?? ex.publicUrl}</p>
      <p className="mt-2 text-sm text-muted">{ex.noEmbedUrl}</p>
    </div>
  );
}


