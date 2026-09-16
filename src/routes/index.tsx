import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Github } from "lucide-react";
import { LightField } from "@/components/site/LightField";
import { MediaFrame } from "@/components/site/MediaFrame";
import { ProjectCard } from "@/components/site/ProjectCard";
import { featuredProjects } from "@/content/projects";
import { modalities, processSteps, site } from "@/content/site";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const featured = featuredProjects();

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
              {site.headline}
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted sm:text-lg">
              {site.subhead}
            </p>
            <p className="mt-3 max-w-lg text-sm text-ink/80">{site.narrative}</p>
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
                className="inline-flex min-h-11 items-center rounded-full bg-surface px-6 text-sm font-semibold text-ink shadow-card transition-transform duration-150 active:scale-[0.96]"
              >
                關於定位
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2 text-xs font-medium text-muted">
              {["AI Designer", "Multimodal", "Product Builder", "Interaction"].map(
                (item) => (
                  <li
                    key={item}
                    className="rounded-full bg-surface px-3 py-1.5 shadow-card"
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="float-card overflow-hidden rounded-2xl bg-surface p-1.5">
              <div className="overflow-hidden rounded-[1.15rem]">
                <img
                  src="/media/hero/light-lab.jpg"
                  alt="光域 AI 創作實驗室：晨光中漂浮的玻璃展品卡片"
                  className="aspect-[16/10] w-full object-cover"
                  width={1792}
                  height={1008}
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted">
              作品像漂在光場裡的展品。圖為工作室視覺，不是截圖。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">精選作品</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              只放最能代表定位的 8 件。狀態按真實進度標示，沒有使用者數或成效數字。
            </p>
          </div>
          <Link
            to="/work"
            className="inline-flex min-h-11 items-center text-sm font-medium text-mint-deep"
          >
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
              <li
                key={step.n}
                className="rounded-2xl bg-surface p-5 shadow-card"
              >
                <p className="font-display text-sm text-mint-deep">{step.n}</p>
                <h3 className="mt-2 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">多模態能力</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          不是六個開關全開。每件作品只使用它真正接上的模態，沒接上的會寫在限制裡。
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modalities.map((item) => (
            <li key={item.label} className="rounded-2xl bg-surface p-5 shadow-card">
              <h3 className="font-display text-lg font-semibold">{item.label}</h3>
              <p className="mt-2 text-sm text-muted">{item.note}</p>
            </li>
          ))}
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
