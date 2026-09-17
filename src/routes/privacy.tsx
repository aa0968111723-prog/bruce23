import { createFileRoute, Link } from "@tanstack/react-router";
import { useLocaleDocumentTitle, useViewerLocale } from "@/components/site/LocaleProvider";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({
    meta: [
      { title: "隱私 · 柏能" },
      {
        name: "description",
        content: "這個作品集只放整理過的公開敘事。不放電話、住址、內部帳號或整合金鑰。",
      },
    ],
  }),
});

function Privacy() {
  const { ui } = useViewerLocale();
  useLocaleDocumentTitle(ui.privacyTitle, ui.privacyLead);
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">{ui.privacyTitle}</h1>
      <p className="mt-4 text-lg text-muted">{ui.privacyLead}</p>
      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl font-semibold">{ui.privacyPublic}</h2>
        <ul className="grid gap-2 text-sm leading-relaxed text-ink/85">
          {ui.privacyPublicItems.map((item) => (
            <li key={item} className="rounded-2xl bg-surface px-4 py-3 shadow-card">
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl font-semibold">{ui.privacyHidden}</h2>
        <ul className="grid gap-2 text-sm leading-relaxed text-ink/85">
          {ui.privacyHiddenItems.map((item) => (
            <li key={item} className="rounded-2xl bg-surface-blue/70 px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl font-semibold">{ui.privacyLogin}</h2>
        <p className="text-sm leading-relaxed text-muted">{ui.privacyLoginBody}</p>
      </section>
      <p className="mt-10">
        <Link to="/" className="inline-flex min-h-11 items-center text-sm font-medium text-mint-deep">
          {ui.homeBack}
        </Link>
      </p>
    </article>
  );
}
