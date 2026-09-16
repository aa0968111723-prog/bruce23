import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getAdminSessionFn } from "@/lib/cms/admin-fn";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "總覽", exact: true },
  { to: "/admin/projects", label: "作品" },
  { to: "/admin/archive", label: "Archive" },
  { to: "/admin/integrations", label: "整合" },
  { to: "/admin/preview", label: "預覽" },
  { to: "/admin/settings", label: "設定" },
] as const;

function AdminLayout() {
  const { user, isPending } = useCurrentUserState();
  const [gate, setGate] = useState<{ ok: boolean; reason?: string; message?: string } | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (isPending || !user) return;
    void getAdminSessionFn()
      .then((result) => setGate(result))
      .catch(() => setGate({ ok: false, reason: "forbidden", message: "無法確認後台權限。" }));
  }, [isPending, user]);

  if (isPending) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted">確認登入狀態…</div>;
  }
  if (!user) return <RedirectToSignIn />;
  if (!gate) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted">確認後台權限…</div>;
  }
  if (!gate.ok) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-display text-3xl">後台無法開啟</h1>
        <p className="mt-3 text-sm text-muted">{gate.message}</p>
        <UserButton />
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="font-display text-lg">後台</p>
          <nav className="flex flex-wrap gap-1" aria-label="後台">
            {links.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-xl px-3 text-sm",
                    active ? "bg-surface-mint text-mint-deep" : "text-muted hover:bg-surface-blue",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <UserButton />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}
