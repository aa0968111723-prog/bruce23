import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { PublicProject } from "@/lib/cms/privacy";
import { sanitizePublicHref } from "@/lib/safe-href";
import { cn } from "@/lib/cn";
import { GithubExplorer } from "./GithubExplorer";
import { CanvaStage } from "./CanvaStage";
import { LiveDemoStage } from "./LiveDemoStage";
import { ExperienceCanvas } from "./ExperienceCanvas";
import { MediaFrame } from "@/components/site/MediaFrame";
import { useRovingTabs } from "@/components/site/useRovingTabs";
import { howItWorksSteps, resolveExperienceConfig } from "@/lib/experiences/resolve";

const TABS = [
  { id: "play", label: "立即體驗" },
  { id: "visual", label: "視覺展示" },
  { id: "github", label: "GitHub 專案" },
  { id: "canva", label: "Canva 原作" },
  { id: "how", label: "如何運作" },
  { id: "source", label: "技術來源" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ExperiencePanel({
  project,
  onClose,
  variant = "overlay",
}: {
  project: PublicProject;
  onClose?: () => void;
  variant?: "overlay" | "page";
}) {
  const [tab, setTab] = useState<TabId>("play");
  const tabs = useRovingTabs(
    TABS.map((item) => item.id) as TabId[],
    tab,
    (next) => setTab(next),
  );
  const honesty = useMemo(() => {
    const config = resolveExperienceConfig(project);
    return config.honestyLabel || null;
  }, [project]);
  const galleryNote = useMemo(() => resolveExperienceConfig(project).galleryNote, [project]);

  useEffect(() => {
    if (!onClose) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const body = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted">
            {project.category} · {project.year}
          </p>
          <h2 className="font-display text-2xl font-semibold">{project.title}</h2>
          <p className="mt-1 text-sm text-muted">{project.subtitle}</p>
          {honesty ? (
            <p className="mt-2 text-xs text-mint-deep">{honesty}</p>
          ) : null}
        </div>
        {onClose ? (
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-xl bg-surface shadow-card"
            onClick={onClose}
          >
            <X className="size-5" />
            <span className="sr-only">關閉體驗</span>
          </button>
        ) : null}
      </div>

      <div
        className="flex gap-1 overflow-x-auto px-3 pt-3"
        role="tablist"
        aria-label="作品體驗"
        onKeyDown={tabs.onKeyDown}
      >
        {TABS.map((item) => {
          const active = item.id === tab;
          return (
            <button
              key={item.id}
              ref={tabs.setRef(item.id)}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={tabs.tabIndex(item.id)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
                active ? "bg-ink text-bg" : "bg-surface text-muted shadow-card",
              )}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6" role="tabpanel">
        {tab === "play" ? <ExperienceCanvas project={project} /> : null}
        {tab === "visual" ? (
          <div className="grid gap-4">
            {galleryNote ? <p className="text-sm text-muted">{galleryNote}</p> : null}
            {project.media.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {project.media.map((item) => (
                  <figure key={item.src} className="overflow-hidden rounded-2xl bg-surface-blue">
                    <MediaFrame media={item} className={item.kind === "video" ? "aspect-video" : "aspect-[4/3]"} />
                    {item.caption ? (
                      <figcaption className="px-3 py-2 text-xs text-muted">{item.caption}</figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-surface-blue px-4 py-6 text-sm text-muted">
                這件作品還沒有已發布的媒體。不會放空白畫面。
              </p>
            )}
            <LiveDemoStage project={project} />
            <p className="text-sm leading-relaxed text-ink/85">{project.summary}</p>
          </div>
        ) : null}
        {tab === "github" ? <GithubExplorer project={project} /> : null}
        {tab === "canva" ? <CanvaStage project={project} /> : null}
        {tab === "how" ? (
          <ol className="grid gap-3">
            {howItWorksSteps(project).map((step, index) => (
              <li key={`${index}-${step}`} className="rounded-2xl bg-surface px-4 py-3 shadow-card">
                <p className="text-xs text-mint-deep">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-1 text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        ) : null}
        {tab === "source" ? (
          project.sourceEvidence.length ? (
            <ul className="grid gap-3">
              {project.sourceEvidence.map((ref) => {
                const href = sanitizePublicHref(ref.href);
                return (
                <li key={ref.label} className="rounded-2xl bg-surface-blue/70 px-4 py-3 text-sm">
                  {href ? (
                    <a
                      href={href}
                      className="inline-flex min-h-11 items-center font-medium text-mint-deep"
                      rel="noreferrer"
                      target="_blank"
                    >
                      {ref.label}
                    </a>
                  ) : (
                    <span className="font-medium">{ref.label}</span>
                  )}
                  <p className="mt-1 text-muted">{ref.note}</p>
                </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-2xl bg-surface-blue px-4 py-6 text-sm text-muted">
              尚未登錄技術來源。公開 GitHub 仍可在「GitHub 專案」分頁打開。
            </p>
          )
        ) : null}
      </div>
    </div>
  );

  if (variant === "page") {
    return <section className="overflow-hidden rounded-3xl bg-surface shadow-float">{body}</section>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 sm:items-center sm:p-6">
      <div className="flex h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-bg shadow-float sm:h-[86dvh] sm:rounded-3xl">
        {body}
      </div>
    </div>
  );
}
