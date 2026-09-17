import { useRef, useState } from "react";
import { Github, BookOpen, ExternalLink } from "lucide-react";
import type { PublicProject } from "@/lib/portfolio/public";
import { EXPERIENCE_TABS } from "@/lib/portfolio/constants";
import { moveTabIndex } from "@/lib/portfolio/a11y";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/portfolio/locale";
import { GithubTree } from "./GithubTree";
import { CanvaBoard } from "./CanvaBoard";
import { SafeFrame } from "./SafeFrame";
import { ProcessMapExperience } from "./ProcessMapExperience";
import { TimelineExperience } from "./TimelineExperience";
import { PosterVisionExperience } from "./PosterVisionExperience";
import { PlanformExperience } from "./PlanformExperience";
import { DuigaoExperience } from "./DuigaoExperience";
import { FolioWalkthrough } from "./FolioWalkthrough";
import { HermesConversation } from "./HermesConversation";
import { ZenChatExperience } from "./ZenChatExperience";

function TryNow({ project }: { project: PublicProject }) {
  const cover = project.media[0]?.src;
  switch (project.slug) {
    case "ai-director-os":
      return <ProcessMapExperience project={project} />;
    case "framelab":
      return <TimelineExperience />;
    case "poster-vision-ai":
      return <PosterVisionExperience coverSrc={cover} />;
    case "planform":
      return <PlanformExperience />;
    case "duigao":
      return <DuigaoExperience coverSrc={cover} />;
    case "folio":
      return <FolioWalkthrough />;
    case "hermes-console":
      return <HermesConversation connected={project.live_demo?.status === "verified"} />;
    case "tku-zen-ai":
      return <ZenChatExperience />;
    default:
      if (project.experience_mode === "canva-embed") {
        return <CanvaBoard {...(project.canva ?? {})} />;
      }
      return <FolioWalkthrough />;
  }
}

export function ExperiencePanel({ project }: { project: PublicProject }) {
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { locale } = useLocale();
  const current = EXPERIENCE_TABS[tab];
  const selectTab = (index: number) => {
    setTab(index);
    queueMicrotask(() => tabRefs.current[index]?.focus());
  };

  return (
    <section id="experience" className="rounded-3xl bg-surface p-4 shadow-float sm:p-6">
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="體驗面板"
        onKeyDown={(event) => {
          const next = moveTabIndex(tab, event.key, EXPERIENCE_TABS.length);
          if (next !== tab) {
            event.preventDefault();
            selectTab(next);
          }
        }}
      >
        {EXPERIENCE_TABS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === index}
            tabIndex={tab === index ? 0 : -1}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
              tab === index ? "bg-ink text-bg" : "bg-surface-blue text-muted",
            )}
            onClick={() => selectTab(index)}
          >
            {locale === "en" ? item.labelEn : item.labelZh}
          </button>
        ))}
      </div>

      <div className="mt-5" role="tabpanel">
        {current.id === "try" ? <TryNow project={project} /> : null}
        {current.id === "visual" ? (
          <div>
            {project.media[0]?.kind === "video" ? (
              <video
                src={project.media[0].src}
                poster={project.media[0].poster}
                controls
                className="w-full rounded-2xl"
              >
                無法播放時請改看封面或來源連結。
              </video>
            ) : project.media[0] ? (
              <img
                src={project.media[0].src}
                alt={project.media[0].alt}
                className="w-full rounded-2xl"
              />
            ) : (
              <p className="text-sm text-muted">尚未設定公開畫面。</p>
            )}
            {project.media[0]?.caption ? (
              <p className="mt-2 text-xs text-muted">{project.media[0].caption}</p>
            ) : null}
          </div>
        ) : null}
        {current.id === "github" ? (
          project.github ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-2xl">{project.github.name ?? project.github.repo}</h3>
                <p className="mt-1 text-sm text-muted">{project.github.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(project.github.languages ?? {}).map(([lang, bytes]) => (
                  <span key={lang} className="rounded-full bg-surface-blue px-3 py-1">
                    {lang} · {bytes}
                  </span>
                ))}
                {project.github.topics?.map((topic) => (
                  <span key={topic} className="rounded-full bg-surface-mint px-3 py-1">
                    {topic}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted">
                更新 {project.github.updatedAt ?? "未知"}
                {project.github.latestCommit
                  ? ` · ${project.github.latestCommit.sha.slice(0, 7)} ${project.github.latestCommit.message}`
                  : ""}
              </p>
              {project.github.readmeSummary ? (
                <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl bg-surface-blue p-4 text-xs">
                  {project.github.readmeSummary}
                </pre>
              ) : (
                <p className="text-sm text-muted">README 尚未同步，或讀取失敗。</p>
              )}
              <GithubTree
                nodes={project.github.fileTree ?? []}
                owner={project.github.owner}
                repo={project.github.repo}
                branch={project.github.branch ?? "main"}
              />
              <div className="flex flex-wrap gap-2">
                <a
                  href={project.github.url}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm text-bg"
                  rel="noreferrer"
                  target="_blank"
                >
                  <Github className="size-4" /> 儲存庫
                </a>
                <a
                  href={`${project.github.url}#readme`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm shadow-card"
                  rel="noreferrer"
                  target="_blank"
                >
                  <BookOpen className="size-4" /> README
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">沒有可公開的 GitHub 資料。私人儲存庫不會出現在這裡。</p>
          )
        ) : null}
        {current.id === "canva" ? (
          <CanvaBoard
            shareUrl={project.canva?.shareUrl}
            embedUrl={project.canva?.embedUrl}
            thumbnailUrl={project.canva?.thumbnailUrl}
            alt={project.canva?.alt}
            caption={project.canva?.caption}
            pageIds={project.canva?.pageIds}
          />
        ) : null}
        {current.id === "how" ? (
          <ol className="grid gap-3">
            {(project.interaction_steps.length
              ? project.interaction_steps
              : project.process.map((item, index) => ({
                  id: String(index),
                  title: `步驟 ${index + 1}`,
                  body: item,
                }))
            ).map((step) => (
              <li key={step.id} className="rounded-2xl bg-surface-blue p-4">
                <p className="font-display text-lg">{step.title}</p>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        ) : null}
        {current.id === "source" ? (
          <ul className="grid gap-2">
            {project.source_evidence.map((item) => (
              <li key={item.label} className="rounded-xl bg-surface-blue px-4 py-3 text-sm">
                {item.href ? (
                  <a href={item.href} className="text-mint-deep" rel="noreferrer" target="_blank">
                    {item.label}
                  </a>
                ) : (
                  item.label
                )}
                <span className="text-muted"> — {item.note}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {project.live_demo?.url && current.id === "try" && project.live_demo.embedEnabled ? (
        <div className="mt-6">
          <SafeFrame
            src={project.live_demo.url}
            title={project.live_demo.label ?? "Live demo"}
            kind="demo"
            coverSrc={project.media[0]?.src}
            openHref={project.live_demo.url}
            openLabel="開新分頁"
          />
        </div>
      ) : project.live_demo?.url && current.id === "github" ? (
        <a
          href={project.live_demo.url}
          className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-mint-deep"
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink className="size-4" />
          {project.live_demo.label ?? "公開網址"}
        </a>
      ) : null}
    </section>
  );
}
