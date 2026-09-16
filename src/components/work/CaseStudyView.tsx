import { Link } from "@tanstack/react-router";
import { ArrowLeft, Github, Globe } from "lucide-react";
import { ExperiencePanel } from "@/components/experience/ExperiencePanel";
import { StatusBadge } from "@/components/site/StatusBadge";
import type { PublicProject } from "@/lib/cms/privacy";
import { publishedCreativeWorkJsonLd } from "@/lib/cms/jsonld";

export function CaseStudyView({
  project,
  others = [],
  backTo = "work",
  includeJsonLd = true,
}: {
  project: PublicProject;
  others?: PublicProject[];
  backTo?: "work" | "none";
  includeJsonLd?: boolean;
}) {
  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {includeJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(publishedCreativeWorkJsonLd(project)),
          }}
        />
      ) : null}
      {backTo === "work" ? (
        <Link to="/work" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          作品總覽
        </Link>
      ) : null}

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-muted">
            {project.category} · {project.year}
          </span>
          <StatusBadge status={project.productStatus} />
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{project.title}</h1>
        <p className="mt-3 text-lg text-muted">{project.subtitle}</p>
      </header>

      <div className="mt-8">
        <ExperiencePanel project={project} variant="page" />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">一句話</h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/85">{project.summary}</p>
      </section>

      <section className="mt-8 rounded-2xl bg-surface p-5 shadow-card">
        <h2 className="font-display text-xl font-semibold">來源與證據</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {project.github.url ? (
            <a
              href={project.github.url}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm text-bg"
              rel="noreferrer"
              target="_blank"
            >
              <Github className="size-4" />
              GitHub
            </a>
          ) : null}
          {project.demo.url ? (
            <a
              href={project.demo.url}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-blue px-5 text-sm"
              rel="noreferrer"
              target="_blank"
            >
              <Globe className="size-4" />
              {project.demo.label ?? "Demo"}
            </a>
          ) : null}
          {project.canva.shareUrl ? (
            <a
              href={project.canva.shareUrl}
              className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
              rel="noreferrer"
              target="_blank"
            >
              Canva 原作
            </a>
          ) : null}
        </div>
        <ul className="mt-4 grid gap-2">
          {project.sourceEvidence.map((item) => (
            <li key={`${item.label}-${item.href ?? item.note}`} className="rounded-xl bg-surface-blue/70 px-4 py-3 text-sm">
              <p className="font-medium">{item.label}</p>
              <p className="text-muted">{item.note}</p>
              {item.href ? (
                <a href={item.href} className="mt-1 inline-flex min-h-11 items-center text-mint-deep" rel="noreferrer" target="_blank">
                  {item.href}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          GitHub {project.github.syncStatus} · Demo {project.demo.status} · Canva {project.canva.status}
        </p>
      </section>

      <section className="mt-10 grid gap-8">
        <Block title="問題">{project.problem}</Block>
        <Block title="我的角色">{project.role}</Block>
        <ListBlock title="設計決策" items={project.decisions} />
        <ListBlock title="AI 使用方式 / 多模態" items={project.modalities} />
        <ListBlock title="流程" items={project.process} />
        <ListBlock title="產出" items={project.outputs} />
        <ListBlock title="技術" items={project.stack} />
        <ListBlock title="限制與尚未完成" items={project.limitations} />
      </section>

      {others.length ? (
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
      ) : null}
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
          <li key={item} className="rounded-xl bg-surface-blue/70 px-4 py-3 text-sm leading-relaxed text-ink/85">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
