import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { PublicProject } from "@/lib/portfolio/types";
import { MediaFrame } from "./MediaFrame";
import { StatusBadge } from "./StatusBadge";

export type CardProject = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  summary: string;
  media: ProjectMedia[];
  productStatus?: ProjectStatus;
  status?: ProjectStatus;
};

export function ProjectCard({
  project,
  featured = false,
}: {
  project: PublicProject;
  featured?: boolean;
}) {
  const status = project.productStatus ?? project.status ?? "prototype";
  return (
    <Link
      to="/work/$slug"
      params={{ slug: project.slug }}
      className="group block rounded-2xl p-1.5 shadow-card transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-float focus-visible:outline-offset-4"
    >
      <article className="overflow-hidden rounded-[1.15rem] bg-surface">
        <div
          className={
            featured
              ? "relative aspect-[4/3] overflow-hidden bg-surface-blue"
              : "relative aspect-[16/10] overflow-hidden bg-surface-blue"
          }
        >
          {project.media[0] ? (
            <MediaFrame
              media={project.media[0]}
              className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium tracking-wide text-muted">
              {project.category}
            </span>
            <StatusBadge status={project.productStatus} />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">
              {project.title}
            </h3>
            <p className="mt-1 text-sm text-muted">{project.subtitle}</p>
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed text-ink/80">
            {project.summary}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-mint-deep">
            進入體驗
            <ArrowUpRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}
