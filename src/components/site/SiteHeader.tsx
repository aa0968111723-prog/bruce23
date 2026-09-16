import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex min-h-11 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-surface-mint shadow-card">
            <span className="size-2.5 rounded-full bg-mint" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-ink">
            {site.nameZh}
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
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
