import { type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bare = pathname.startsWith("/admin") || pathname === "/login";
  if (bare) {
    return <div className="min-h-dvh bg-bg text-ink">{children}</div>;
  }
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        跳到內容
      </a>
      <SiteHeader />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
