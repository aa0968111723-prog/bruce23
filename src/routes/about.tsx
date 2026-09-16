import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, Mail } from "lucide-react";
import { fetchPublicSite } from "@/lib/cms/public-fns";

export const Route = createFileRoute("/about")({
  loader: () => fetchPublicSite(),
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
  const site = Route.useLoaderData().profile;
  return (
    <div>
      <section className="bg-surface-blue/50">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <p className="text-sm font-medium text-mint-deep">{site.nameEn}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">關於我</h1>
          <p className="mt-4 text-lg text-muted">
            我是{site.person}，{site.role}。
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl space-y-10 px-4 py-14 sm:px-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">公開定位</h2>
          <p className="mt-3 leading-relaxed text-ink/85">{site.narrative}</p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">我相信</h2>
          <ul className="mt-4 grid gap-3">
            {beliefs.map((item) => (
              <li key={item} className="rounded-2xl bg-surface p-4 text-sm leading-relaxed shadow-card">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">公開工作範圍</h2>
          <ul className="mt-4 grid gap-2 text-sm text-muted">
            {publicWork.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link to="/work" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-mint-deep">
            看作品
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`mailto:${site.email}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm shadow-card"
          >
            <Mail className="size-4" />
            {site.email}
          </a>
          <a
            href={site.github}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm text-bg"
            rel="noreferrer"
            target="_blank"
          >
            <Github className="size-4" />
            GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
