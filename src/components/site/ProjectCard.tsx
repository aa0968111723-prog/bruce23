import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { PublicProject } from "@/lib/cms/privacy";
import { overlayProject } from "@/lib/locale/view";
import { MediaFrame } from "./MediaFrame";
import { StatusBadge } from "./StatusBadge";
import { useViewerLocale } from "./LocaleProvider";

export function ProjectCard({
  project,
  featured = false,
}: {
  project: PublicProject;
  featured?: boolean;
}) {
  const { lang, ui } = useViewerLocale();
  const view = overlayProject(project, lang);
  const media = view.media[0];
  return (
    <Link
      to="/work/$slug"
      params={{ slug: view.slug }}
      className="group block rounded-2xl p-1.5 shadow-card transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-float focus-visible:outline-offset-4"
    >
      <article className="overflow-hidden rounded-[1.15rem] bg-surface border border-white/80 shadow-xs transition-colors group-hover:border-mint/50">
        <div
          className={
            featured
              ? "relative aspect-[4/3] overflow-hidden bg-surface-blue"
              : "relative aspect-[16/10] overflow-hidden bg-surface-blue"
          }
        >
          {media ? (
            <MediaFrame
              media={media}
              className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : null}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-surface/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-ink shadow-xs border border-white/60">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-mint-deep" />
            </span>
            <span>在線</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium tracking-wide text-muted">{view.category}</span>
            <StatusBadge status={view.productStatus} />
            {view.stack?.some((s) => s.toLowerCase().includes("mcp")) && (
              <span className="inline-flex h-7 items-center rounded-full bg-mint/15 px-2.5 text-xs font-medium text-mint-deep border border-mint/30">
                ⚡ MCP 協定
              </span>
            )}
            {Boolean(view.github?.url || view.github?.repo) && (
              <span className="inline-flex h-7 items-center rounded-full bg-surface-blue/70 px-2.5 text-xs font-medium text-ink/70 border border-line">
                公開倉庫
              </span>
            )}
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">{view.title}</h3>
            <p className="mt-1 text-sm text-muted">{view.subtitle}</p>
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed text-ink/80">{view.summary}</p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-mint-deep">
            {ui.caseView}
            <ArrowUpRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}
