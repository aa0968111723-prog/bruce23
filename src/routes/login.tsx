import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { LightField } from "@/components/site/LightField";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : "/admin",
  }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  return (
    <main className="relative grid min-h-dvh place-items-center bg-bg px-4">
      <LightField />
      <div className="relative w-full max-w-sm rounded-3xl bg-surface p-6 shadow-float">
        <p className="text-sm text-mint-deep">Luminous Studio</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">登入後台</h1>
        <p className="mt-2 text-sm text-muted">使用 Google 帳號。管理員需在允許清單內。</p>
        <div className="mt-6 grid gap-2">
          {authEnabled ? (
            GROK_PROVIDERS.filter((provider) => provider.idp === "google").map((provider) => (
              <button
                key={provider.providerId}
                type="button"
                onClick={() => signIn(provider.providerId, { callbackURL: next })}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-medium text-bg"
              >
                Continue with {provider.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
      </div>
    </main>
  );
}
