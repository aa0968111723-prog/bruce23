import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Github } from "lucide-react";
import { useState } from "react";
import { LightField } from "@/components/site/LightField";
import { MediaFrame } from "@/components/site/MediaFrame";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ExplorationMap, type ExploreId } from "@/components/experience/ExplorationMap";
import { listPublicProjects, getPublicSite } from "@/lib/portfolio/server-public";
import { modalities, processSteps, site } from "@/content/site";
import type { PublicProject } from "@/lib/portfolio/public";
import type { Project } from "@/content/types";
import { pickCopy } from "@/lib/portfolio/i18n";
import { useLocale } from "@/lib/portfolio/locale";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [projects, settings] = await Promise.all([
      listPublicProjects(),
      getPublicSite(),
    ]);
    return { projects, settings };
  },
  component: Home,
});

function toCard(project: PublicProject, locale: "zh" | "en"): Project {
  const title = locale === "en" && project.title_en ? project.title_en : project.title;
  const subtitle =
    locale === "en" && project.subtitle_en ? project.subtitle_en : project.subtitle;
  const summary = locale === "en" && project.summary_en ? project.summary_en : project.summary;
  return {
    slug: project.slug,
    title,
    subtitle,
    category: project.category as Project["category"],
    year: project.year,
    status: project.product_status as Project["status"],
    featured: project.featured,
    summary,
    problem: locale === "en" && project.problem_en ? project.problem_en : project.problem,
    role: locale === "en" && project.role_en ? project.role_en : project.role,
    decisions: project.decisions,
    modalities: project.modalities,
    process: project.process,
    outputs: project.outputs,
    stack: project.stack,
    limitations: project.limitations,
    links: { github: project.github?.url, live: project.live_demo?.url },
    media: project.media,
    sourceReferences: project.source_evidence,
    visibility: "public",
  };
}

function Home() {
  const { projects, settings } = Route.useLoaderData();
  const { locale } = useLocale();
  const headline = pickCopy(
    locale,
    String(settings.profile.headline || "") || site.headline,
    settings.profile.headlineEn,
  );
  const narrative = pickCopy(
    locale,
    String(settings.profile.narrative || "") || site.narrative,
    settings.profile.narrativeEn,
  );
  const featuredIntro = pickCopy(
    locale,
    String(settings.homepage.featuredIntro || "") ||
      "只放最能代表定位的作品。狀態按真實進度標示，沒有使用者數或成效數字。",
    settings.homepage.featuredIntroEn,
  );
  const featured = projects.filter((project) => project.featured);
  const [explore, setExplore] = useState<ExploreId>("image");

  const activate = (id: ExploreId) => {
    setExplore(id);
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <section className="relative overflow-hidden">
        <LightField />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="text-sm font-medium tracking-wide text-mint-deep">
              {site.nameEn} · {site.person}
            </p>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold text-ink sm:text-5xl lg:text-6xl">
              {headline}
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted sm:text-lg">
              {pickCopy(locale, site.subhead, settings.profile.subhead)}
            </p>
            <p className="mt-3 max-w-lg text-sm text-ink/80">{narrative}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/work"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mint px-6 text-sm font-semibold text-primary-foreground shadow-card transition-transform duration-150 active:scale-[0.96]"
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

      <ExplorationMap projects={projects} active={explore} onActiveChange={setExplore} />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">精選作品</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">{featuredIntro}</p>
          </div>
          <Link to="/work" className="inline-flex min-h-11 items-center text-sm font-medium text-mint-deep">
            全部作品
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {featured.slice(0, 2).map((project) => (
            <ProjectCard key={project.slug} project={toCard(project, locale)} featured />
          ))}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(2).map((project) => (
            <ProjectCard key={project.slug} project={toCard(project, locale)} />
          ))}
        </div>
      </section>

      <section className="bg-surface-mint/60">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold">AI 創作流程</h2>
            <p className="mt-3 text-sm text-muted">
              導演不是堆模型。先現場、再模態、再工具，最後問：這東西能不能被使用。
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl shadow-card">
              <MediaFrame
                media={{
                  src: "/media/hero/modalities.jpg",
                  alt: "文字、圖像、影片、聲音與 3D 以光絲連在白桌上",
                  kind: "image",
                }}
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

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">多模態能力</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modalities.map((item) => {
            const nodeId: ExploreId | null =
              item.label === "圖像"
                ? "image"
                : item.label === "影片"
                  ? "video"
                  : item.label.includes("空間")
                    ? "space"
                    : item.label === "互動"
                      ? "interact"
                      : item.label === "文字"
                        ? "print"
                        : null;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  className="h-full w-full rounded-2xl bg-surface p-5 text-left shadow-card"
                  onClick={() => activate(nodeId ?? "all")}
                >
                  <h3 className="font-display text-lg font-semibold">{item.label}</h3>
                  <p className="mt-2 text-sm text-muted">{item.note}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-t border-line/80 bg-surface-blue/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">公開簡介</h2>
            <p className="mt-3 max-w-xl text-sm text-muted">
              {site.role}。GitHub 是專案真實性來源。本站不放電話、住址或內部帳號。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={site.github}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg"
              rel="noreferrer"
              target="_blank"
            >
              <Github className="size-4" />
              GitHub
            </a>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm font-medium shadow-card"
            >
              {site.email}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
