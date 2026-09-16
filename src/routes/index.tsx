import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Github } from "lucide-react";
import { LightField } from "@/components/site/LightField";
import { MediaFrame } from "@/components/site/MediaFrame";
import { ProjectCard } from "@/components/site/ProjectCard";
import { useLocaleDocumentTitle, useViewerLocale } from "@/components/site/LocaleProvider";
import { ExplorationField } from "@/components/home/ExplorationField";
import { ExperiencePanel } from "@/components/experience/ExperiencePanel";
import { listPublishedProjectsFn, getPublicSiteFn } from "@/lib/cms/public-fn";
import { resolveHomepageCopy } from "@/lib/cms/public-site";
import { overlayProject } from "@/lib/locale/view";
import { site as fallbackSite } from "@/content/site";
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
  head: ({ loaderData }) => {
    const copy = resolveHomepageCopy(loaderData?.site, fallbackSite, "zh");
    return {
      meta: [
        { title: copy.seoTitle || "Luminous Studio · 柏能" },
        {
          name: "description",
          content:
            copy.seoDescription ||
            "把 AI、設計與多模態創作，轉化成可使用的體驗。陳柏能的光域 AI 創作實驗室。",
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  const { projects, site } = Route.useLoaderData() as {
    projects: PublicProject[];
    site: Awaited<ReturnType<typeof getPublicSiteFn>>;
  };
  const { lang, ui } = useViewerLocale();
  const [open, setOpen] = useState<PublicProject | null>(null);
  const copy = resolveHomepageCopy(site, fallbackSite, lang);
  const localized = useMemo(
    () => projects.map((item) => overlayProject(item, lang)),
    [lang, projects],
  );
  const featured = localized.filter((item) => item.featured);
  useLocaleDocumentTitle(
    copy.seoTitle || (lang === "en" ? "Luminous Studio · Bruce Chen" : "Luminous Studio · 柏能"),
    copy.seoDescription || copy.narrative,
  );

  return (
    <div>
      <section className="relative overflow-hidden">
        <LightField />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="text-sm font-medium tracking-wide text-mint-deep">
              {copy.nameEn} · {copy.person}
            </p>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold text-ink sm:text-5xl lg:text-6xl">
              {copy.headline}
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted sm:text-lg">{copy.subhead}</p>
            <p className="mt-3 max-w-lg text-sm text-ink/80">{copy.narrative}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/work"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mint px-6 text-sm font-semibold text-primary-foreground shadow-card"
              >
                {ui.seeWorks}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex min-h-11 items-center rounded-full bg-surface px-6 text-sm font-semibold text-ink shadow-card"
              >
                {ui.aboutCta}
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
                decoding="async"
                fetchPriority="high"
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted">{ui.heroCaption}</p>
          </div>
        </div>
      </section>

      <ExplorationField
        projects={localized}
        highlightSlugs={site?.homepageHighlightSlugs}
        onOpen={setOpen}
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">{ui.featured}</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">{ui.featuredNote}</p>
          </div>
          <Link to="/work" className="inline-flex min-h-11 items-center text-sm font-medium text-mint-deep">
            {ui.allWorks}
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
            <h2 className="font-display text-3xl font-semibold">{ui.processTitle}</h2>
            <p className="mt-3 text-sm text-muted">{ui.processLead}</p>
            <div className="mt-6 overflow-hidden rounded-2xl shadow-card">
              <MediaFrame
                media={{ src: "/media/hero/modalities.svg", alt: "多模態節點", kind: "image" }}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {ui.process.map((step) => (
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
            <h2 className="font-display text-3xl font-semibold">{ui.publicIntro}</h2>
            <p className="mt-3 max-w-xl text-sm text-muted">{ui.publicIntroBody}</p>
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

      {open ? <ExperiencePanel project={overlayProject(open, lang)} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
