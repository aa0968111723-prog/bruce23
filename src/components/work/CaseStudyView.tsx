import { Link } from "@tanstack/react-router";
import { ArrowLeft, Github, Globe } from "lucide-react";
import { ExperiencePanel } from "@/components/experience/ExperiencePanel";
import { StatusBadge } from "@/components/site/StatusBadge";
import { useLocaleDocumentTitle, useViewerLocale } from "@/components/site/LocaleProvider";
import type { PublicProject } from "@/lib/cms/privacy";
import { publishedCreativeWorkJsonLd, serializeJsonLd } from "@/lib/cms/jsonld";
import { englishTitle } from "@/lib/cms/locale";
import { overlayProject } from "@/lib/locale/view";
import { sanitizePublicHref } from "@/lib/safe-href";

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
  const { lang, ui } = useViewerLocale();
  const view = overlayProject(project, lang);
  const enTitle = lang === "zh" ? englishTitle(project.locale, view.title) : null;
  useLocaleDocumentTitle(
    view.seoTitle || `${view.title} · ${lang === "en" ? "Luminous Studio" : "柏能"}`,
    view.seoDescription || view.summary,
  );
  return (
    <article className="mx-auto w-full min-w-0 max-w-4xl scroll-mt-20 px-4 py-12 sm:px-6">
      {includeJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(publishedCreativeWorkJsonLd(project)),
          }}
        />
      ) : null}
      {backTo === "work" ? (
        <Link to="/work" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          {ui.caseBack}
        </Link>
      ) : null}

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-muted">
            {view.category} · {view.year}
          </span>
          <StatusBadge status={view.productStatus} />
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{view.title}</h1>
        {enTitle ? (
          <p lang="en" className="mt-1 text-sm text-muted">
            {enTitle}
          </p>
        ) : null}
        <p className="mt-3 text-lg text-muted">{view.subtitle}</p>
      </header>

      <div className="mt-8">
        <ExperiencePanel project={view} variant="page" />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">{ui.caseSummary}</h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/85">{view.summary}</p>
      </section>

      <section className="mt-8 rounded-2xl bg-surface p-5 shadow-card">
        <h2 className="font-display text-xl font-semibold">{ui.caseEvidence}</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {view.github.url ? (
            <a
              href={view.github.url}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm text-bg"
              rel="noreferrer"
              target="_blank"
            >
              <Github className="size-4" />
              GitHub
            </a>
          ) : null}
          {view.demo.url ? (
            <a
              href={view.demo.url}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-blue px-5 text-sm"
              rel="noreferrer"
              target="_blank"
            >
              <Globe className="size-4" />
              {view.demo.label ?? "Demo"}
            </a>
          ) : null}
          {view.canva.shareUrl ? (
            <a
              href={view.canva.shareUrl}
              className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
              rel="noreferrer"
              target="_blank"
            >
              {ui.caseOriginal}
            </a>
          ) : null}
        </div>
        <ul className="mt-4 grid gap-2">
          {view.sourceEvidence.map((item) => (
            <li key={`${item.label}-${item.href ?? item.note}`} className="rounded-xl bg-surface-blue/70 px-4 py-3 text-sm">
              <p className="font-medium">{item.label}</p>
              <p className="text-muted">{item.note}</p>
              {sanitizePublicHref(item.href) ? (
                <a href={sanitizePublicHref(item.href)} className="mt-1 flex min-h-11 max-w-full items-center break-all text-mint-deep" rel="noreferrer" target="_blank">
                  {item.href}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          GitHub {view.github.syncStatus} · Demo {view.demo.status} · Canva {view.canva.status}
        </p>
      </section>

      <section className="mt-10 grid gap-8">
        <Block title={ui.caseProblem}>{view.problem}</Block>
        <Block title={ui.caseRole}>{view.role}</Block>
        <ListBlock title={ui.caseDecisions} items={view.decisions} />
        <ListBlock title={ui.caseModalities} items={view.modalities} />
        <ListBlock title={ui.caseProcess} items={view.process} />
        <ListBlock title={ui.caseOutputs} items={view.outputs} />
        <ListBlock title={ui.caseStack} items={view.stack} />
        <ListBlock title={ui.caseLimits} items={view.limitations} />
      </section>

      {others.length ? (
        <section className="mt-14 border-t border-line pt-8">
          <h2 className="font-display text-xl font-semibold">{ui.caseOthers}</h2>
          <ul className="mt-4 grid gap-3">
            {others.map((item) => {
              const other = overlayProject(item, lang);
              return (
                <li key={other.slug}>
                  <Link
                    to="/work/$slug"
                    params={{ slug: other.slug }}
                    className="flex min-h-11 items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-card"
                  >
                    <span>
                      <span className="block font-medium">{other.title}</span>
                      <span className="text-sm text-muted">{other.subtitle}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
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
