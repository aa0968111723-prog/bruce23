import { useState } from "react";
import { Expand, ExternalLink } from "lucide-react";
import type { PublicProject } from "@/lib/cms/privacy";

export function CanvaStage({ project }: { project: PublicProject }) {
  const canva = project.canva;
  const [failed, setFailed] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const pages = canva.pageIds?.length ? canva.pageIds : ["cover"];
  const embed = canva.embedUrl;

  if (!embed && !canva.shareUrl && !canva.thumbnailUrl) {
    return (
      <div className="rounded-2xl bg-surface-blue px-4 py-8 text-sm text-muted">
        這件作品還沒有公開的 Canva 嵌入。不會顯示空白 iframe，也不會假裝已連上 Canva API。
      </div>
    );
  }

  if (failed || !embed) {
    return (
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        {canva.thumbnailUrl ? (
          <img src={canva.thumbnailUrl} alt={canva.alt ?? project.title} className="w-full object-cover" />
        ) : project.media[0] ? (
          <img src={project.media[0].src} alt={project.media[0].alt} className="w-full object-cover" />
        ) : null}
        <div className="space-y-2 p-4 text-sm">
          <p className="font-medium">Canva 嵌入無法顯示</p>
          <p className="text-muted">
            可能是權限改成私人、分享連結失效，或瀏覽器擋住嵌入。請用「在 Canva 開啟原作」。
          </p>
          {canva.shareUrl ? (
            <a
              className="inline-flex min-h-11 items-center gap-2 text-mint-deep"
              href={canva.shareUrl}
              rel="noreferrer"
              target="_blank"
            >
              在 Canva 開啟
              <ExternalLink className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        <iframe
          title={canva.alt ?? `${project.title} Canva 原作`}
          src={embed}
          className="aspect-[4/3] w-full bg-surface-blue"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="fullscreen"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {pages.map((page, index) => (
          <button
            key={page}
            type="button"
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm ${
              pageIndex === index ? "bg-ink text-bg" : "bg-surface shadow-card"
            }`}
            onClick={() => setPageIndex(index)}
          >
            第 {index + 1} 頁
          </button>
        ))}
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-mint px-4 text-sm"
          href={embed.replace("?embed", "")}
          rel="noreferrer"
          target="_blank"
        >
          <Expand className="size-4" />
          全螢幕／原作
        </a>
        {canva.shareUrl ? (
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm text-bg"
            href={canva.shareUrl}
            rel="noreferrer"
            target="_blank"
          >
            在 Canva 開啟
            <ExternalLink className="size-4" />
          </a>
        ) : null}
      </div>
      <p className="text-xs text-muted">來源標記：Canva 公開嵌入 · 狀態 {canva.status}</p>
      {canva.caption ? <p className="text-sm text-muted">{canva.caption}</p> : null}
    </div>
  );
}
