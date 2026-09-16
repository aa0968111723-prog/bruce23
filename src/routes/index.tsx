import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Github } from "lucide-react";
import { ExperiencePanel } from "@/components/experience/ExperiencePanel";
import { RelationSpace } from "@/components/home/RelationSpace";
import { LightField } from "@/components/site/LightField";
import { ProjectCard } from "@/components/site/ProjectCard";
import { fetchPublicSite, fetchPublishedProjects } from "@/lib/cms/public-fns";
import type { PublicProject } from "@/lib/cms/public-types";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [projects, siteContent] = await Promise.all([
      fetchPublishedProjects(),
      fetchPublicSite(),
    ]);
    return { projects, siteContent };
  },
  component: Home,
});

function Home() {
  const { projects, siteContent } = Route.useLoaderData();
  const featured = useMemo(
    () => projects.filter((p) => p.featured).sort((a, b) => a.sortOrder - b.sortOrder),
    [projects],
  );
  const [selected, setSelected] = useState<PublicProject | null>(null);

  return (
    <div>
      <section className="relative overflow-hidden">
        <LightField />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="text-sm font-medium tracking-wide text-mint-deep">
              {siteContent.profile.nameEn} · {siteContent.profile.person}
            </p>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold text-ink sm:text-5xl lg:text-6xl">
              {siteContent.profile.headline}
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted sm:text-lg">
              {siteContent.profile.subhead}
            </p>
            <p className="mt-3 max-w-lg text-sm text-ink/80">{siteContent.profile.narrative}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#explore"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mint px-6 text-sm font-semibold text-primary-foreground shadow-card"
              >
                開始探索
                <ArrowRight className="size-4" />
              </a>
              <Link
                to="/work"
                className="inline-flex min-h-11 items-center rounded-full bg-surface px-6 text-sm font-semibold text-ink shadow-card"
              >
                作品總覽
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="float-card overflow-hidden rounded-2xl bg-surface p-1.5">
              <img
                src="/media/hero/light-lab.jpg"
                alt="光域 AI 創作實驗室：晨光中漂浮的玻璃展品卡片"
                className="aspect-[16/10] w-full object-cover"
                width={1792}
                height={1008}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="explore" className="border-y border-line/70 bg-surface-blue/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-semibold">
            {siteContent.homepage.explorationTitle || "從模態走進作品"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            {siteContent.homepage.explorationBody}
          </p>
          <div className="mt-8">
            <RelationSpace
              projects={projects}
              onSelect={(slug) => {
                const hit = projects.find((p) => p.slug === slug) ?? null;
                setSelected(hit);
              }}
            />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Fact label="GitHub" value={`${projects.filter((p) => p.github).length} 件公開來源`} />
            <Fact label="Live Demo" value={`${projects.filter((p) => p.demo?.url).length} 件可核對網址`} />
            <Fact label="Canva" value={`${projects.filter((p) => p.canva?.embedUrl).length} 件可嵌入原作`} />
          </div>
          {selected ? (
            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-2xl font-semibold">{selected.title}</h3>
                <Link
                  to="/work/$slug"
                  params={{ slug: selected.slug }}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-mint-deep"
                >
                  打開個案頁
                </Link>
              </div>
              <ExperiencePanel project={selected} />
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">點一個作品節點，體驗面板會在這裡打開。手機可直接橫向滑動節點，不必拖 3D。</p>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">精選作品</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              只放已發布的作品。草稿不會出現在這裡。
            </p>
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

      <section className="border-t border-line/80 bg-surface-blue/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">公開簡介</h2>
            <p className="mt-3 max-w-xl text-sm text-muted">
              {siteContent.profile.role}。GitHub 是專案真實性來源。本站不放電話、住址或內部帳號。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={siteContent.profile.github}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg"
              rel="noreferrer"
              target="_blank"
            >
              <Github className="size-4" />
              GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
