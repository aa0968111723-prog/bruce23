import { Link } from "@tanstack/react-router";
import { site } from "@/content/site";
import { publicNav } from "@/lib/locale/view";
import { useViewerLocale } from "./LocaleProvider";

export function SiteFooter() {
  const { ui } = useViewerLocale();
  return (
    <footer className="border-t border-line/80 bg-surface-blue/50">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold">{site.nameZh}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{site.nameEn}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{ui.footerNav}</p>
          <ul className="mt-3 grid gap-2">
            {publicNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-flex min-h-11 items-center text-sm text-muted hover:text-mint-deep"
                >
                  {ui[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{ui.footerContact}</p>
          <a
            href={`mailto:${site.email}`}
            className="mt-3 flex min-h-11 max-w-full items-center break-all text-sm text-muted hover:text-mint-deep"
          >
            {site.email}
          </a>
          <a
            href={site.github}
            className="mt-2 inline-flex min-h-11 items-center text-sm text-muted hover:text-mint-deep"
            rel="noreferrer"
            target="_blank"
          >
            github.com/{site.githubHandle}
          </a>
        </div>
      </div>
      <p className="border-t border-line/70 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.person}. {ui.footerLight}
      </p>
    </footer>
  );
}
