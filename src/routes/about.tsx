import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, Mail } from "lucide-react";
import { site as fallbackSite } from "@/content/site";
import { getPublicSiteFn } from "@/lib/cms/public-fn";
import { resolveHomepageCopy } from "@/lib/cms/public-site";

export const Route = createFileRoute("/about")({
  loader: async () => ({ site: await getPublicSiteFn() }),
  head: ({ loaderData }) => {
    const copy = resolveHomepageCopy(loaderData?.site, fallbackSite);
    return {
      meta: [
        { title: copy.seoTitle ? `${copy.seoTitle} · 關於` : "關於 · 柏能" },
        {
          name: "description",
          content: copy.seoDescription || copy.narrative,
        },
      ],
    };
  },
  component: About,
});

const beliefs = [
  "人的意圖是起點，AI 是可驗證的加速器，不是自動完成的導演。",
  "沒接上的模型要寫「不可用」，不要給假分數或假成效。",
  "跨媒介經驗要能回到現場：教室、LINE、手機、社團文宣。",
  "作品集只放整理過的公開敘事。",
];

const publicWork = [
  "AI 產品與創作作業系統",
  "逐幀動畫與視覺 AI 工具",
  "空間場佈與 3D 彩排",
  "文宣對稿與設計編輯器",
  "校園現場互動體驗",
  "平面、攝影與活動紀錄（Archive）",
];

function About() {
  const { site: cms } = Route.useLoaderData() as { site: Awaited<ReturnType<typeof getPublicSiteFn>> };
  const copy = resolveHomepageCopy(cms, fallbackSite);
  const email = cms?.email ?? fallbackSite.email;
  const github = cms?.github ?? fallbackSite.github;
  const role = cms?.role ?? fallbackSite.role;
  return (
    <div>
      <section className="bg-surface-blue/50">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <p className="text-sm font-medium text-mint-deep">{copy.nameEn}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            關於我
          </h1>
          <p className="mt-4 text-lg text-muted">
            我是{copy.person}，{role}。
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl space-y-10 px-4 py-14 sm:px-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">公開定位</h2>
          <p className="mt-3 leading-relaxed text-ink/85">{copy.narrative}</p>
          <p className="mt-3 leading-relaxed text-muted">
            目標觀眾是 AI 產品團隊、設計主管、多模態創作者與合作夥伴。這個網站要讓人快速看出我正在做什麼、解決什麼、AI 扮演什麼角色，以及作品能不能被使用。
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold">為什麼這樣做</h2>
          <p className="mt-3 leading-relaxed text-muted">
            從活動現場、平面與攝影走到 AI 產品，問題從來不是「會不會生成」，而是如何把文字、圖像、影片、聲音、3D 與互動編成一條別人真的走得完的工作流。
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold">核心信念</h2>
          <ul className="mt-4 grid gap-3">
            {beliefs.map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-surface px-4 py-3 text-sm leading-relaxed shadow-card"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold">公開工作面向</h2>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {publicWork.map((item) => (
              <li
                key={item}
                className="rounded-xl bg-surface-mint/70 px-4 py-3 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-card">
          <h2 className="font-display text-2xl font-semibold">聯絡</h2>
          <p className="mt-2 text-sm text-muted">
            只提供已公開的 GitHub 與 Email。不會在這裡放電話、住址或內部社團資料。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`mailto:${email}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
            >
              <Mail className="size-4" />
              寄信
            </a>
            <a
              href={github}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg"
              rel="noreferrer"
              target="_blank"
            >
              <Github className="size-4" />
              GitHub
            </a>
            <Link
              to="/work"
              className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-5 text-sm font-medium"
            >
              看作品
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
