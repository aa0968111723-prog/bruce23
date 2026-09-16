import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getAdminContextFn } from "@/lib/portfolio/cms-fns";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const LINKS = [
  { to: "/admin", label: "總覽" },
  { to: "/admin/projects", label: "作品" },
  { to: "/admin/archive", label: "Archive" },
  { to: "/admin/integrations", label: "整合" },
  { to: "/admin/settings", label: "設定" },
  { to: "/admin/preview", label: "預覽草稿" },
] as const;

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const [ctx, setCtx] = useState<Awaited<ReturnType<typeof getAdminContextFn>> | null>(null);

  useEffect(() => {
    void getAdminContextFn().then(setCtx);
  }, [user?.id]);

  if (isPending) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted">核對登入中…</div>;
  }
  if (!user) return <RedirectToSignIn />;
  if (!ctx) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted">核對權限中…</div>;
  }
  if (ctx.configError) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20">
        <h1 className="font-display text-3xl font-semibold">後台尚未設定</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">{ctx.configError}</p>
      </main>
    );
  }
  if (!ctx.admin) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20">
        <h1 className="font-display text-3xl font-semibold">沒有後台權限</h1>
        <p className="mt-4 text-sm text-muted">這個帳號不在允許清單。公開作品集不需要登入。</p>
        <Link to="/" className="mt-6 inline-flex min-h-11 items-center text-mint-deep">
          回作品集
        </Link>
      </main>
    );
  }
  return <>{children}</>;
}

export function AdminShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AdminGate>
      <div className="min-h-dvh bg-bg">
        <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
            <Link to="/admin" className="mr-2 font-display text-base font-semibold">
              後台
            </Link>
            <nav className="flex flex-1 flex-wrap gap-1" aria-label="後台">
              {LINKS.map((item) => {
                const active =
                  item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium",
                      active ? "bg-surface-mint text-mint-deep" : "text-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Link to="/" className="inline-flex min-h-11 items-center px-3 text-sm text-muted">
              公開站
            </Link>
            <UserButton />
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl px-4 py-8">{children ?? <Outlet />}</div>
      </div>
    </AdminGate>
  );
}
