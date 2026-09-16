import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Github } from "lucide-react";
import { LightField } from "@/components/site/LightField";
import { MediaFrame } from "@/components/site/MediaFrame";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ExplorationField } from "@/components/home/ExplorationField";
import { ExperiencePanel } from "@/components/experience/ExperiencePanel";
import { listPublishedProjectsFn, getPublicSiteFn } from "@/lib/cms/public-fn";
import { processSteps, site as fallbackSite } from "@/content/site";
import type { PublicProject } from "@/lib/cms/privacy";

export const Route = createFileRoute("/")({
  loader: async (): Promise<{
    projects: PublicProject[];
    site: Awaited<ReturnType<typeof getPublicSiteFn>>;
  }> => {
    const [projects, site] = await Promise.all([
      listPublishedProjectsFn(),
      getPublicSiteFn(),
    ]);
    return { projects, site };
  },
  component: Home,
});

function Home() {
  const { projects, site } = Route.useLoaderData() as {
    projects: PublicProject[];
    site: Awaited<ReturnType<typeof getPublicSiteFn>>;
  };
  const [open, setOpen] = useState<PublicProject | null>(null);
  const featured = projects.filter((item) => item.featured);
  const nameEn = site?.nameEn ?? fallbackSite.nameEn;
  const person = site?.person ?? fallbackSite.person;
  const headline = site?.headline ?? fallbackSite.headline;
  const subhead = site?.subhead ?? fallbackSite.subhead;
  const narrative = site?.narrative ?? fallbackSite.narrative;

  return (
    <div>
      <section className="relative overflow-hidden">
        <LightField />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="text-sm font-medium tracking-wide text-mint-deep">
              {nameEn} · {person}
            </p>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold text-ink sm:text-5xl lg:text-6xl">
              {headline}
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted sm:text-lg">{subhead}</p>
            <p className="mt-3 max-w-lg text-sm text-ink/80">{narrative}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/work"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mint px-6 text-sm font-semibold text-primary-foreground shadow-card"
              >
                看精選作品
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex min-h-11 items-center rounded-full bg-surface px-6 text-sm font-semibold text-ink shadow-card"
              >
                關於定位
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="float-card overflow-hidden rounded-2xl bg-surface p-1.5">
              <img
                src="/media/hero/light-lab.svg"
                alt="光域 AI 創作實驗室：晨光中漂浮的玻璃展品卡片"
                className="aspect-[16/10] w-full object-cover"
                width={1280}
                height={720}
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted">作品像漂在光場裡的展品。點下方節點即可操作。</p>
          </div>
        </div>
      </section>

      <ExplorationField
        projects={projects}
        highlightSlugs={site?.homepageHighlightSlugs}
        onOpen={setOpen}
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">精選作品</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">只放已發布作品。狀態按真實進度標示。</p>
          </div>
          <Link to="/work" className="inline-flex min-h-11 items-center text-sm font-medium text-mint-deep">
            全部作品
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {featured.slice(0, 2).map((project) => (
            <ProjectCard key={project.slug} project={project} featured />
          ))}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(2).map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <section className="bg-surface-mint/60">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold">AI 創作流程</h2>
            <p className="mt-3 text-sm text-muted">先現場、再模態、再工具，最後問能不能被使用。</p>
            <div className="mt-6 overflow-hidden rounded-2xl shadow-card">
              <MediaFrame
                media={{ src: "/media/hero/modalities.svg", alt: "多模態節點", kind: "image" }}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {processSteps.map((step) => (
              <li key={step.n} className="rounded-2xl bg-surface p-5 shadow-card">
                <p className="font-display text-sm text-mint-deep">{step.n}</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-line/80 bg-surface-blue/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">公開簡介</h2>
            <p className="mt-3 max-w-xl text-sm text-muted">
              GitHub 是專案真實性來源。本站不放電話、住址或內部帳號。
            </p>
          </div>
          <a
            href={site?.github ?? fallbackSite.github}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg"
            rel="noreferrer"
            target="_blank"
          >
            <Github className="size-4" />
            GitHub
          </a>
        </div>
      </section>

      {open ? <ExperiencePanel project={open} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
