import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Github, Globe } from "lucide-react";
import { MediaFrame } from "@/components/site/MediaFrame";
import { NotFoundView } from "@/components/site/NotFoundView";
import { StatusBadge } from "@/components/site/StatusBadge";
import { getProject, projects } from "@/content/projects";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return project;
  },
  notFoundComponent: NotFoundView,
  component: CaseStudy,
});

function CaseStudy() {
  const project = Route.useLoaderData();
  const others = projects.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <Link
        to="/work"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        作品總覽
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-muted">
            {project.category} · {project.year}
          </span>
          <StatusBadge status={project.status} />
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
          {project.title}
        </h1>
        <p className="mt-3 text-lg text-muted">{project.subtitle}</p>
      </header>

      {project.media[0] ? (
        <figure className="mt-8 overflow-hidden rounded-2xl shadow-float">
          <MediaFrame media={project.media[0]} priority className="aspect-[4/3]" />
          {project.media[0].caption ? (
            <figcaption className="bg-surface-blue px-4 py-3 text-xs text-muted">
              {project.media[0].caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <section className="mt-10 grid gap-8">
        <Block title="一句話">{project.summary}</Block>
        <Block title="問題">{project.problem}</Block>
        <Block title="我的角色">{project.role}</Block>
        <ListBlock title="設計決策" items={project.decisions} />
        <ListBlock title="AI 使用方式 / 多模態" items={project.modalities} />
        <ListBlock title="流程" items={project.process} />
        <ListBlock title="產出" items={project.outputs} />
        <ListBlock title="技術" items={project.stack} />
        <ListBlock title="限制與尚未完成" items={project.limitations} />
      </section>

      <section className="mt-10 flex flex-wrap gap-3">
        {project.links.github ? (
          <a
            href={project.links.github}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg"
            rel="noreferrer"
            target="_blank"
          >
            <Github className="size-4" />
            GitHub
          </a>
        ) : null}
        {project.links.live ? (
          <a
            href={project.links.live}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-medium shadow-card"
            rel="noreferrer"
            target="_blank"
          >
            <Globe className="size-4" />
            公開網址（狀態可能變動）
          </a>
        ) : null}
        {project.links.demo ? (
          <a
            href={project.links.demo}
            className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
            rel="noreferrer"
            target="_blank"
          >
            Demo
          </a>
        ) : null}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">資料來源</h2>
        <ul className="mt-3 grid gap-2">
          {project.sourceReferences.map((ref) => (
            <li key={ref.label} className="text-sm text-muted">
              {ref.href ? (
                <a href={ref.href} className="text-mint-deep" rel="noreferrer" target="_blank">
                  {ref.label}
                </a>
              ) : (
                ref.label
              )}
              <span> — {ref.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 border-t border-line pt-8">
        <h2 className="font-display text-xl font-semibold">其他作品</h2>
        <ul className="mt-4 grid gap-3">
          {others.map((item) => (
            <li key={item.slug}>
              <Link
                to="/work/$slug"
                params={{ slug: item.slug }}
                className="flex min-h-11 items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-card"
              >
                <span>
                  <span className="block font-medium">{item.title}</span>
                  <span className="text-sm text-muted">{item.subtitle}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function Block({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/85">{children}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-xl bg-surface-blue/70 px-4 py-3 text-sm leading-relaxed text-ink/85"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
