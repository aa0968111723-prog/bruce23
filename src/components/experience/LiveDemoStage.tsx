import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { demoViewerState, type PublicProject } from "@/lib/cms/privacy";
import { resolveExperienceConfig } from "@/lib/experiences/resolve";

export function LiveDemoStage({ project }: { project: PublicProject }) {
  const demo = project.demo;
  const config = resolveExperienceConfig(project);
  const [failed, setFailed] = useState(false);
  const state = demoViewerState(demo, failed);

  if (state === "empty") {
    return (
      <div className="rounded-2xl bg-surface-blue px-4 py-8 text-sm text-muted">
        {config.demoNote ?? "沒有已驗證的公開 Demo。GitHub 仍可展開，但這裡不會放假的產品畫面。"}
      </div>
    );
  }

  if (state === "fallback") {
    return (
      <div className="rounded-2xl bg-surface p-5 shadow-card">
        <p className="font-medium">{demo.label ?? "公開網址"}</p>
        <p className="mt-2 text-sm text-muted">
          {demo.error ||
            (demo.status === "pending"
              ? "這個網址還沒驗證能不能嵌入。"
              : "無法在頁內嵌入。請開新分頁查看，狀態可能隨部署變動。")}
        </p>
        {demo.url ? (
          <a
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm text-bg"
            href={demo.url}
            rel="noreferrer"
            target="_blank"
          >
            開新分頁
            <ExternalLink className="size-4" />
          </a>
        ) : null}
        {config.demoNote ? <p className="mt-3 text-xs text-muted">{config.demoNote}</p> : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
      <iframe
        title={demo.label ?? `${project.title} live demo`}
        src={demo.url ?? undefined}
        className="aspect-[16/10] w-full bg-surface-blue"
        loading="lazy"
        onError={() => setFailed(true)}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-muted">
        <span>Live Demo · 狀態 {demo.status}</span>
        {demo.url ? (
          <a
            href={demo.url}
            className="inline-flex min-h-11 items-center text-mint-deep"
            rel="noreferrer"
            target="_blank"
          >
            開原站
          </a>
        ) : null}
      </div>
      {config.demoNote ? <p className="px-4 pb-3 text-xs text-muted">{config.demoNote}</p> : null}
    </div>
  );
}
