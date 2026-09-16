import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/cn";
import { getViewerFlags } from "@/lib/portfolio/server-public";
import { SignedIn, UserButton } from "@/lib/auth/gates";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<"zh" | "en">("zh");
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("luminous-locale");
    if (stored === "en" || stored === "zh") setLocale(stored);
    getViewerFlags()
      .then((flags) => setAdmin(flags.isAdmin))
      .catch(() => setAdmin(false));
  }, []);

  const setLang = (next: "zh" | "en") => {
    setLocale(next);
    window.localStorage.setItem("luminous-locale", next);
    document.documentElement.lang = next === "zh" ? "zh-Hant" : "en";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex min-h-11 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-surface-mint shadow-card">
            <span className="size-2.5 rounded-full bg-mint" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-ink">
            {locale === "en" ? site.nameEn : site.nameZh}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="主要">
          {nav.map((item) => {
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
                {item.label}
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
          {admin ? (
            <Link
              to="/admin"
              className="inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-medium text-mint-deep"
            >
              後台
            </Link>
          ) : null}
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm"
            onClick={() => setLang(locale === "zh" ? "en" : "zh")}
          >
            {locale === "zh" ? "EN" : "中文"}
          </button>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-xl text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
          <span className="sr-only">{open ? "關閉選單" : "開啟選單"}</span>
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-line/70 bg-bg px-4 py-3 md:hidden"
          aria-label="行動"
        >
          <ul className="flex flex-col gap-1">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink hover:bg-surface-blue"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
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
            {admin ? (
              <li>
                <Link
                  to="/admin"
                  className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium"
                  onClick={() => setOpen(false)}
                >
                  後台
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
