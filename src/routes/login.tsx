import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-8 shadow-float">
        <p className="text-sm font-medium text-mint-deep">Luminous Studio</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">後台登入</h1>
        <p className="mt-3 text-sm text-muted">
          只用 Google 帳號，且必須在允許名單。未設定允許名單時後台會關閉，不會讓所有已登入者進來。
        </p>
        {authEnabled ? (
          <div className="mt-6 grid gap-2">
            {GROK_PROVIDERS.filter((item) => item.idp === "google").map((provider) => (
              <button
                key={provider.providerId}
                type="button"
                onClick={() => signIn(provider.providerId, { callbackURL: "/admin" })}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-mint text-sm font-semibold text-primary-foreground"
              >
                使用 {provider.label} 登入
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">登入未開啟。</p>
        )}
        <Link to="/" className="mt-6 inline-flex min-h-11 items-center text-sm text-muted">
          回作品集
        </Link>
      </div>
    </main>
  );
}
