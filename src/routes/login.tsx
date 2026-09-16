import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { LightField } from "@/components/site/LightField";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <LightField />
      <div className="relative w-full max-w-sm rounded-2xl bg-surface p-6 shadow-float">
        <p className="text-sm font-medium text-mint-deep">Luminous Studio</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">管理者登入</h1>
        <p className="mt-2 text-sm text-muted">使用 Google 帳號。非允許清單的帳號無法進入後台。</p>
        {authEnabled ? (
          <div className="mt-6 grid gap-2">
            {GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/admin" })}
                className="min-h-11 w-full rounded-full bg-ink px-4 text-sm font-medium text-bg"
              >
                使用 {p.label} 繼續
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">登入尚未啟用。</p>
        )}
      </div>
    </main>
  );
}
