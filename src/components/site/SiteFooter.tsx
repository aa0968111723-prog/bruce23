import { Link } from "@tanstack/react-router";
import { nav, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/80 bg-surface-blue/50">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold">{site.nameZh}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{site.narrative}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">導覽</p>
          <ul className="mt-3 grid gap-2">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-muted hover:text-mint-deep"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">公開聯絡</p>
          <a
            href={`mailto:${site.email}`}
            className="mt-3 block break-all text-sm text-muted hover:text-mint-deep"
          >
            {site.email}
          </a>
          <a
            href={site.github}
            className="mt-2 block text-sm text-muted hover:text-mint-deep"
            rel="noreferrer"
            target="_blank"
          >
            github.com/{site.githubHandle}
          </a>
        </div>
      </div>
      <p className="border-t border-line/70 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.person}. 亮色光域 · 不作深色模式。
      </p>
    </footer>
  );
}
