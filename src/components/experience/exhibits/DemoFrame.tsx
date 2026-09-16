import { useState } from "react";
import { demoFallbackCopy } from "@/lib/portfolio/demo-url";
import type { PublicLiveDemo } from "@/lib/portfolio/types";

export function DemoFrame({ demo }: { demo: PublicLiveDemo }) {
  const [failed, setFailed] = useState(false);
  const embed = demo.embedEnabled && demo.type === "iframe";

  if (!embed || failed) {
    return (
      <div className="rounded-2xl bg-surface-blue p-4">
        <p className="text-sm">{failed ? demoFallbackCopy(false) : "Demo 以新分頁開啟，避免把未驗證的 iframe 假裝成已連線。"}</p>
        <a
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-bg"
          href={demo.url}
          rel="noreferrer"
          target="_blank"
        >
          {demo.label ?? "開啟 Demo"}
        </a>
        {demo.status !== "verified" ? (
          <p className="mt-2 text-xs text-muted">狀態：{demo.status}（不是成功連線）</p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <iframe
        title={demo.label ?? "Live demo"}
        src={demo.url}
        className="aspect-[16/10] w-full rounded-2xl bg-surface-blue"
        sandbox="allow-scripts allow-same-origin allow-forms"
        onError={() => setFailed(true)}
      />
      <a className="mt-3 inline-flex min-h-11 items-center text-sm text-mint-deep" href={demo.url} rel="noreferrer" target="_blank">
        新分頁開啟
      </a>
    </div>
  );
}
