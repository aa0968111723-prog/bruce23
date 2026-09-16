import { useRef, useState } from "react";
import { Expand, ExternalLink } from "lucide-react";
import { canvaViewerState, publicCanvaEmbedUrl, type PublicProject } from "@/lib/cms/privacy";
import { canvaEmbedSrc, canvaOpenOriginalUrl } from "@/lib/canva/embed";
import { resolveExperienceConfig } from "@/lib/experiences/resolve";

export function CanvaStage({ project }: { project: PublicProject }) {
  const canva = project.canva;
  const config = resolveExperienceConfig(project);
  const [failed, setFailed] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const pages = canva.pageIds?.filter(Boolean) ?? [];
  const state = canvaViewerState(canva, failed);
  const embed = publicCanvaEmbedUrl(canva.embedUrl);
  const original = canvaOpenOriginalUrl(canva.shareUrl ?? canva.embedUrl) ?? canva.shareUrl;
  const thumb = canva.thumbnailUrl ? (
    <img
      src={canva.thumbnailUrl}
      alt={canva.alt ?? project.title}
      className="mx-auto max-h-80 w-full object-contain bg-surface-blue"
    />
  ) : project.media[0] ? (
    <img
      src={project.media[0].src}
      alt={project.media[0].alt}
      className="mx-auto max-h-80 w-full object-contain bg-surface-blue"
    />
  ) : null;

  if (state === "empty") {
    return (
      <div className="rounded-2xl bg-surface-blue px-4 py-8 text-sm text-muted">
        {config.canvaNote ??
          "這件作品還沒有公開的 Canva 分享或嵌入網址。目前是公開嵌入模式，沒有 Canva Connect 憑證，不會顯示空白 iframe，也不會假裝已連上 Canva API。後台可貼 canva.com/design 或 /d/ 短網址；短網址由伺服器跟隨轉址後才嵌入。"}
      </div>
    );
  }

  if (state === "local") {
    return (
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        {thumb}
        <div className="space-y-2 p-4 text-sm">
          <p className="font-medium">
            {canva.status === "unavailable" ? "Canva 原作目前無法公開嵌入" : "Canva 原作沒有公開分享連結"}
          </p>
          <p className="text-muted">
            {canva.status === "unavailable"
              ? "可能需要登入、權限不是公開分享，或短網址沒有轉到 /design/{id}。站內只放縮圖，不嵌入空白 iframe。"
              : "站內只放已匯出的縮圖。沒有 canva.com 分享／嵌入網址，所以不嵌入空白 iframe。"}
          </p>
          {canva.caption ? <p className="text-sm text-muted">{canva.caption}</p> : null}
          {original ? (
            <a
              className="inline-flex min-h-11 items-center gap-2 text-mint-deep"
              href={original}
              rel="noreferrer"
              target="_blank"
            >
              在 Canva 開啟原作
              <ExternalLink className="size-4" />
            </a>
          ) : null}
          <p className="text-xs text-muted">來源標記：公開嵌入模式 · 狀態 {canva.status} · 未宣稱 Connect 已連線</p>
        </div>
      </div>
    );
  }

  if (state === "fallback" || !embed) {
    return (
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        {thumb}
        <div className="space-y-2 p-4 text-sm">
          <p className="font-medium">
            {canva.status === "pending" && !embed
              ? "Canva 短網址還沒有公開設計可嵌入"
              : "Canva 嵌入無法顯示"}
          </p>
          <p className="text-muted">
            {canva.status === "pending" && !embed
              ? "伺服器還沒有從 canva.com 轉址得到 /design/{id}。不會嵌入空白 iframe，也不會標成已驗證。"
              : "可能是失效短網址、Cloudflare 驗證頁、登入牆，或瀏覽器擋住嵌入。沒有空白 iframe。"}
          </p>
          {original ? (
            <a
              className="inline-flex min-h-11 items-center gap-2 text-mint-deep"
              href={original}
              rel="noreferrer"
              target="_blank"
            >
              在 Canva 開啟原作
              <ExternalLink className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  const page = pages[pageIndex];
  const embedSrc = canvaEmbedSrc(embed, page);

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        <iframe
          ref={frameRef}
          key={embedSrc}
          title={canva.alt ?? `${project.title} Canva 原作`}
          src={embedSrc}
          className="aspect-[4/3] w-full bg-surface-blue"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="fullscreen"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {pages.length > 1
          ? pages.map((item, index) => {
              const label =
                config.canvaPageLabels?.find((page) => page.id === item)?.label ?? `第 ${index + 1} 頁`;
              return (
                <button
                  key={item}
                  type="button"
                  className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm ${
                    pageIndex === index ? "bg-ink text-bg" : "bg-surface shadow-card"
                  }`}
                  onClick={() => setPageIndex(index)}
                >
                  {label}
                </button>
              );
            })
          : null}
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-mint px-4 text-sm"
          onClick={() => {
            const node = frameRef.current;
            if (node && typeof node.requestFullscreen === "function") {
              void node.requestFullscreen().catch(() => {
                if (original) window.open(original, "_blank", "noopener,noreferrer");
              });
              return;
            }
            if (original) window.open(original, "_blank", "noopener,noreferrer");
          }}
        >
          <Expand className="size-4" />
          全螢幕
        </button>
        {original ? (
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm text-bg"
            href={original}
            rel="noreferrer"
            target="_blank"
          >
            在 Canva 開啟原作
            <ExternalLink className="size-4" />
          </a>
        ) : null}
      </div>
      <p className="text-xs text-muted">來源標記：Canva 公開嵌入 · 狀態 {canva.status} · 未宣稱 Connect 已連線</p>
      {config.canvaNote ? <p className="text-sm text-muted">{config.canvaNote}</p> : null}
      {canva.caption ? <p className="text-sm text-muted">{canva.caption}</p> : null}
    </div>
  );
}
