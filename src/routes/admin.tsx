import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { getViewerAuth } from "@/lib/cms/admin-fns";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "總覽", exact: true },
  { to: "/admin/projects", label: "作品" },
  { to: "/admin/archive", label: "Archive" },
  { to: "/admin/integrations", label: "整合" },
  { to: "/admin/settings", label: "設定" },
  { to: "/admin/preview", label: "預覽" },
];

function AdminLayout() {
  const { user, isPending } = useCurrentUserState();
  const [gate, setGate] = useState<Awaited<ReturnType<typeof getViewerAuth>> | null>(null);

  useEffect(() => {
    if (isPending || !user) return;
    void getViewerAuth().then(setGate).catch(() =>
      setGate({
        signedIn: false,
        isAdmin: false,
        reason: "unauthenticated",
        message: "Unauthorized",
        email: null,
        allowlistConfigured: false,
      }),
    );
  }, [isPending, user]);

  if (isPending) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted">核對登入狀態…</div>;
  }
  if (!user) return <RedirectToSignIn />;
  if (!gate) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted">核對管理權限…</div>;
  }
  if (!gate.allowlistConfigured || gate.reason === "not_configured") {
    return (
      <main className="mx-auto max-w-lg px-4 py-20">
        <h1 className="font-display text-3xl font-semibold">後台已關閉</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {gate.message || "PORTFOLIO_ADMIN_EMAILS 未設定。沒有允許清單時，任何登入者都不能管理。"}
        </p>
      </main>
    );
  }
  if (!gate.isAdmin) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20">
        <h1 className="font-display text-3xl font-semibold">沒有管理權限</h1>
        <p className="mt-4 text-sm text-muted">這個帳號不在管理員允許清單。公開作品集仍可瀏覽。</p>
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-bg">
      <AdminNav />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </div>
    </div>
  );
}

function AdminNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/admin" className="font-display text-lg font-semibold">
          光域後台
        </Link>
        <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto" aria-label="後台">
          {LINKS.map((item) => {
            const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-sm",
                  active ? "bg-surface-mint text-mint-deep" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link to="/" className="min-h-11 text-sm text-muted">
          公開站
        </Link>
        <UserButton />
      </div>
    </header>
  );
}
