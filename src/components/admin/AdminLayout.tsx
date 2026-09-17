import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getAdminSession } from "@/lib/portfolio/server-admin";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const LINKS = [
  { to: "/admin", label: "總覽" },
  { to: "/admin/projects", label: "作品" },
  { to: "/admin/archive", label: "Archive" },
  { to: "/admin/integrations", label: "Integrations" },
  { to: "/admin/settings", label: "設定" },
  { to: "/admin/preview", label: "預覽" },
] as const;

export function AdminLayout() {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [gate, setGate] = useState<{
    ok: boolean;
    configError: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (isPending || !user) return;
    getAdminSession()
      .then((result) =>
        setGate({
          ok: result.ok,
          configError: result.configError,
          message: "message" in result ? result.message : undefined,
        }),
      )
      .catch(() => setGate({ ok: false, configError: false }));
  }, [isPending, user]);

  if (isPending) {
    return <div className="grid min-h-dvh place-items-center text-muted">讀取登入狀態…</div>;
  }
  if (!user) return <RedirectToSignIn />;
  if (!gate) return <div className="grid min-h-dvh place-items-center text-muted">核對管理員權限…</div>;
  if (gate.configError) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-display text-3xl">後台尚未開放</h1>
        <p className="mt-3 text-sm text-muted">
          缺少 PORTFOLIO_ADMIN_EMAILS。未設定時沒有任何登入者能進入後台。
        </p>
      </main>
    );
  }
  if (!gate.ok) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-display text-3xl">沒有後台權限</h1>
        <p className="mt-3 text-sm text-muted">這個帳號不在管理員允許清單裡。</p>
        <UserButton />
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <p className="font-display font-semibold">Luminous CMS</p>
          <UserButton />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3" aria-label="後台">
          {LINKS.map((item) => {
            const active =
              item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-sm",
                  active ? "bg-surface-mint text-mint-deep" : "text-muted",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link to="/" className="inline-flex min-h-11 items-center px-3 text-sm text-muted">
            公開網站
          </Link>
        </nav>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}
