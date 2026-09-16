import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ExperiencePanel } from "@/components/experience/ExperiencePanel";
import { NotFoundView } from "@/components/site/NotFoundView";
import { StatusBadge } from "@/components/site/StatusBadge";
import { getPublicProject, listPublicProjects } from "@/lib/portfolio/server-public";
import { creativeWorkJsonLd } from "@/lib/portfolio/jsonld";
import { pickCopy } from "@/lib/portfolio/i18n";
import { useLocale } from "@/lib/portfolio/locale";
import type { ProjectStatus } from "@/content/types";

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ params }) => {
    const [project, all] = await Promise.all([
      getPublicProject({ data: { slug: params.slug } }),
      listPublicProjects(),
    ]);
    if (!project) throw notFound();
    return { project, others: all.filter((item) => item.slug !== project.slug).slice(0, 3) };
  },
  head: ({ loaderData }) => {
    const project = loaderData?.project;
    if (!project) return {};
    return {
      meta: [
        { title: `${project.seo?.title || project.title} · Luminous Studio` },
        { name: "description", content: project.seo?.description || project.summary },
      ],
    };
  },
  notFoundComponent: NotFoundView,
  component: CaseStudy,
});

function CaseStudy() {
  const { project, others } = Route.useLoaderData();
  const { locale } = useLocale();
  const jsonLd = creativeWorkJsonLd(project);
  const title = pickCopy(locale, project.title, project.title_en);
  const subtitle = pickCopy(locale, project.subtitle, project.subtitle_en);
  const summary = pickCopy(locale, project.summary, project.summary_en);
  const problem = pickCopy(locale, project.problem, project.problem_en);
  const role = pickCopy(locale, project.role, project.role_en);

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
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
          <StatusBadge status={project.product_status as ProjectStatus} />
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-3 text-lg text-muted">{subtitle}</p>
      </header>

      <div className="mt-8">
        <ExperiencePanel project={project} />
      </div>

      <p className="mt-10 text-[0.95rem] leading-relaxed text-ink/85">{summary}</p>

      <section className="mt-8 rounded-2xl bg-surface-blue p-5">
        <h2 className="font-display text-xl font-semibold">來源與證據</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {project.github ? (
            <li>
              GitHub · {project.github.owner}/{project.github.repo}
            </li>
          ) : null}
          {project.canva?.embedUrl ? <li>Canva 公開嵌入已設定</li> : <li>Canva：未設定公開嵌入</li>}
          {project.live_demo?.url ? (
            <li>
              Demo 狀態：{project.live_demo.status}
            </li>
          ) : (
            <li>沒有已驗證的即時 demo</li>
          )}
        </ul>
      </section>

      <section className="mt-10 grid gap-8">
        <Block title={locale === "en" ? "Problem" : "問題"}>{problem}</Block>
        <Block title={locale === "en" ? "My role" : "我的角色"}>{role}</Block>
        <ListBlock title="設計決策" items={project.decisions} />
        <ListBlock title="限制與尚未完成" items={project.limitations} />
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
          <li key={item} className="rounded-xl bg-surface-blue/70 px-4 py-3 text-sm leading-relaxed text-ink/85">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
