import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { LocaleProvider, useViewerLocale } from "./LocaleProvider";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bare = pathname.startsWith("/admin") || pathname === "/login";
  if (bare) {
    return <>{children}</>;
  }
  return (
    <LocaleProvider>
      <PublicFrame>{children}</PublicFrame>
    </LocaleProvider>
  );
}

function PublicFrame({ children }: { children: ReactNode }) {
  const { ui } = useViewerLocale();
  return (
    <div className="flex min-h-dvh min-w-0 flex-col bg-bg text-ink" data-luminous-shell="">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        {ui.skip}
      </a>
      <SiteHeader />
      <main id="content" className="min-w-0 flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
