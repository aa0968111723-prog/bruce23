import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({
    meta: [
      { title: "隱私 · 柏能" },
      {
        name: "description",
        content: "這個作品集只放整理過的公開敘事。不放電話、住址、內部帳號或整合金鑰。",
      },
    ],
  }),
});

function Privacy() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">隱私與公開範圍</h1>
      <p className="mt-4 text-lg text-muted">
        這是公開作品集，不是履歷資料庫，也不是後台儀表板。訪客看到的只有已發布列。
      </p>
      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl font-semibold">會公開的</h2>
        <ul className="grid gap-2 text-sm leading-relaxed text-ink/85">
          <li className="rounded-2xl bg-surface px-4 py-3 shadow-card">已發布作品的中文敘事、狀態、媒體與來源連結。</li>
          <li className="rounded-2xl bg-surface px-4 py-3 shadow-card">公開 GitHub 儲存庫的 metadata、有限檔案樹與 README 摘要。</li>
          <li className="rounded-2xl bg-surface px-4 py-3 shadow-card">已驗證可嵌入的 Demo，或開新分頁的公開網址。</li>
          <li className="rounded-2xl bg-surface px-4 py-3 shadow-card">
            Canva 只在有公開 /design/{"{id}"} 時嵌入。沒有就放縮圖與「開啟原作」，不放空白 iframe。
          </li>
          <li className="rounded-2xl bg-surface px-4 py-3 shadow-card">已公開的 Email 與 GitHub 帳號。</li>
        </ul>
      </section>
      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl font-semibold">不會公開的</h2>
        <ul className="grid gap-2 text-sm leading-relaxed text-ink/85">
          <li className="rounded-2xl bg-surface-blue/70 px-4 py-3">電話、住址、私人履歷細節、內部社團名冊。</li>
          <li className="rounded-2xl bg-surface-blue/70 px-4 py-3">Google Drive 資料夾、原始大檔影片、未授權人像。</li>
          <li className="rounded-2xl bg-surface-blue/70 px-4 py-3">GitHub、Canva、Notion 的 token、client secret 或 service role。</li>
          <li className="rounded-2xl bg-surface-blue/70 px-4 py-3">草稿、封存列、後台修訂快照、整合密文。</li>
        </ul>
      </section>
      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl font-semibold">登入</h2>
        <p className="text-sm leading-relaxed text-muted">
          後台只用 Google，且必須在允許名單。未登入者看不到草稿。沒有密碼登入，也沒有公開的 session 鑄造路徑。
        </p>
      </section>
      <p className="mt-10">
        <Link to="/" className="inline-flex min-h-11 items-center text-sm font-medium text-mint-deep">
          回首頁
        </Link>
      </p>
    </article>
  );
}
