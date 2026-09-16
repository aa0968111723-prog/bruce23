import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, Mail } from "lucide-react";
import { site as fallbackSite } from "@/content/site";
import { getPublicSiteFn } from "@/lib/cms/public-fn";
import { resolveHomepageCopy } from "@/lib/cms/public-site";
import { useLocaleDocumentTitle, useViewerLocale } from "@/components/site/LocaleProvider";

export const Route = createFileRoute("/about")({
  loader: async () => ({ site: await getPublicSiteFn() }),
  head: ({ loaderData }) => {
    const copy = resolveHomepageCopy(loaderData?.site, fallbackSite, "zh");
    return {
      meta: [
        { title: copy.seoTitle ? `${copy.seoTitle} · 關於` : "關於 · 柏能" },
        {
          name: "description",
          content: copy.seoDescription || copy.narrative,
        },
      ],
    };
  },
  component: About,
});

function About() {
  const { site: cms } = Route.useLoaderData() as { site: Awaited<ReturnType<typeof getPublicSiteFn>> };
  const { lang, ui } = useViewerLocale();
  const copy = resolveHomepageCopy(cms, fallbackSite, lang);
  const email = cms?.email ?? fallbackSite.email;
  const github = cms?.github ?? fallbackSite.github;
  const role = cms?.role ?? fallbackSite.role;
  useLocaleDocumentTitle(
    copy.seoTitle
      ? `${copy.seoTitle} · ${lang === "en" ? "About" : "關於"}`
      : lang === "en"
        ? "About · Luminous Studio"
        : "關於 · 柏能",
    copy.seoDescription || copy.narrative,
  );
  return (
    <div>
      <section className="bg-surface-blue/50">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <p className="text-sm font-medium text-mint-deep">{copy.nameEn}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{ui.aboutTitle}</h1>
          <p className="mt-4 text-lg text-muted">
            {ui.aboutIam}
            {copy.person}，{role}。
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl space-y-10 px-4 py-14 sm:px-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">{ui.aboutPosition}</h2>
          <p className="mt-3 leading-relaxed text-ink/85">{copy.narrative}</p>
          <p className="mt-3 leading-relaxed text-muted">{ui.aboutAudience}</p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold">{ui.aboutWhy}</h2>
          <p className="mt-3 leading-relaxed text-muted">{ui.aboutWhyBody}</p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold">{ui.aboutBeliefs}</h2>
          <ul className="mt-4 grid gap-3">
            {ui.beliefs.map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-surface px-4 py-3 text-sm leading-relaxed shadow-card"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold">{ui.aboutWork}</h2>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ui.publicWork.map((item) => (
              <li key={item} className="rounded-xl bg-surface-mint/70 px-4 py-3 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-card">
          <h2 className="font-display text-2xl font-semibold">{ui.aboutContact}</h2>
          <p className="mt-2 text-sm text-muted">{ui.aboutContactNote}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`mailto:${email}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
            >
              <Mail className="size-4" />
              {ui.mail}
            </a>
            <a
              href={github}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg"
              rel="noreferrer"
              target="_blank"
            >
              <Github className="size-4" />
              GitHub
            </a>
            <Link
              to="/work"
              className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-5 text-sm font-medium"
            >
              {ui.seeWork}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
