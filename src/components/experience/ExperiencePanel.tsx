import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { PublicProject } from "@/lib/cms/privacy";
import { cn } from "@/lib/cn";
import { GithubExplorer } from "./GithubExplorer";
import { CanvaStage } from "./CanvaStage";
import { LiveDemoStage } from "./LiveDemoStage";
import { ExperienceCanvas } from "./ExperienceCanvas";

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
  const honesty = useMemo(() => {
    const label = project.experienceConfig.honestyLabel;
    return typeof label === "string" ? label : null;
  }, [project.experienceConfig]);

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
      >
        {TABS.map((item) => {
          const active = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
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
            {project.media[0] ? (
              <img
                src={project.media[0].src}
                alt={project.media[0].alt}
                className="w-full rounded-2xl bg-surface-blue object-cover"
              />
            ) : null}
            <p className="text-sm leading-relaxed text-ink/85">{project.summary}</p>
          </div>
        ) : null}
        {tab === "github" ? <GithubExplorer project={project} /> : null}
        {tab === "canva" ? <CanvaStage project={project} /> : null}
        {tab === "how" ? (
          <ol className="grid gap-3">
            {(project.interactionSteps.length ? project.interactionSteps : project.process).map(
              (step, index) => (
                <li key={step} className="rounded-2xl bg-surface px-4 py-3 shadow-card">
                  <p className="text-xs text-mint-deep">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-1 text-sm leading-relaxed">{step}</p>
                </li>
              ),
            )}
          </ol>
        ) : null}
        {tab === "source" ? (
          <ul className="grid gap-3">
            {project.sourceEvidence.map((ref) => (
              <li key={ref.label} className="rounded-2xl bg-surface-blue/70 px-4 py-3 text-sm">
                {ref.href ? (
                  <a href={ref.href} className="font-medium text-mint-deep" rel="noreferrer" target="_blank">
                    {ref.label}
                  </a>
                ) : (
                  <span className="font-medium">{ref.label}</span>
                )}
                <p className="mt-1 text-muted">{ref.note}</p>
              </li>
            ))}
          </ul>
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
