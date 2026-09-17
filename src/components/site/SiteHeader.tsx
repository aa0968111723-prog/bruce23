import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { site } from "@/content/site";
import { publicNav } from "@/lib/locale/view";
import { cn } from "@/lib/cn";
import { LocaleToggle } from "./LocaleToggle";
import { useViewerLocale } from "./LocaleProvider";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { lang, ui } = useViewerLocale();
  const brand = lang === "en" ? site.nameEn : site.nameZh;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link to="/" className="flex min-h-11 min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-mint shadow-card">
            <span className="size-2.5 rounded-full bg-mint" />
          </span>
          <span className="truncate font-display text-base font-semibold tracking-tight text-ink">{brand}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={ui.navLabel}>
          {publicNav.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-surface-mint text-mint-deep"
                    : "text-muted hover:bg-surface-blue hover:text-ink",
                )}
              >
                {ui[item.key]}
              </Link>
            );
          })}
          <a
            href={site.github}
            className="inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-medium text-muted hover:bg-surface-blue hover:text-ink"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <LocaleToggle />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <LocaleToggle />
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-xl text-ink"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">{open ? ui.menuClose : ui.menuOpen}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-line/70 bg-bg px-4 py-3 md:hidden"
          aria-label={ui.mobileNav}
        >
          <ul className="flex flex-col gap-1">
            {publicNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink hover:bg-surface-blue"
                  onClick={() => setOpen(false)}
                >
                  {ui[item.key]}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={site.github}
                className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink hover:bg-surface-blue"
                rel="noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
