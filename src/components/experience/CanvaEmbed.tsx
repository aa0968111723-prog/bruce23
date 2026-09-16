import { useMemo, useRef, useState } from "react";
import { ExternalLink, Maximize2 } from "lucide-react";
import { canvaEmbedAllowed } from "@/lib/canva/urls";
import { canvaViewMode } from "@/lib/experience/embed-fallback";

export function CanvaEmbed({
  embedUrl,
  shareUrl,
  thumbnailUrl,
  alt,
  caption,
  pageIds,
}: {
  embedUrl: string | null;
  shareUrl: string | null;
  thumbnailUrl?: string | null;
  alt?: string | null;
  caption?: string | null;
  pageIds?: string[];
}) {
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trusted = embedUrl && canvaEmbedAllowed(embedUrl);
  const pages = useMemo(() => pageIds?.filter(Boolean) ?? [], [pageIds]);
  const mode = canvaViewMode(embedUrl, failed);
  const src = useMemo(() => {
    if (mode !== "embed" || !trusted || !embedUrl) return null;
    if (!pages.length) return embedUrl;
    const url = new URL(embedUrl);
    url.searchParams.set("page", pages[page] ?? "1");
    return url.toString();
  }, [embedUrl, page, pages, trusted, mode]);

  if (mode === "fallback" || !src) {
    return (
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={alt ?? "Canva 封面"} className="aspect-[16/10] w-full object-cover" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-surface-blue text-sm text-muted">
            嵌入失敗。可能需要權限，或連結不是 Canva 網域。
          </div>
        )}
        <div className="space-y-2 p-4">
          <p className="text-sm text-ink">無法顯示 Canva 嵌入。</p>
          {shareUrl ? (
            <a
              href={shareUrl}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-mint-deep"
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-4" />
              在 Canva 開啟原作
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded-2xl bg-surface shadow-card">
      <div ref={wrapRef} className="relative aspect-[16/10] bg-surface-blue">
        <iframe
          title={alt ?? "Canva 原作"}
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          allow="fullscreen"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-xs text-muted">{caption ?? "來源：Canva 原作嵌入，不是截圖替代。"}</p>
        <div className="flex flex-wrap gap-2">
          {pages.length > 1
            ? pages.map((id, idx) => (
                <button
                  key={id}
                  type="button"
                  className="min-h-11 rounded-full bg-surface-mint px-3 text-sm"
                  onClick={() => setPage(idx)}
                >
                  頁 {idx + 1}
                </button>
              ))
            : null}
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-1 rounded-full bg-surface-blue px-3 text-sm"
            onClick={() => {
              const node = wrapRef.current;
              if (node && node.requestFullscreen) void node.requestFullscreen();
            }}
          >
            <Maximize2 className="size-3.5" />
            全螢幕
          </button>
          {shareUrl ? (
            <a
              href={shareUrl}
              className="inline-flex min-h-11 items-center gap-1 rounded-full bg-ink px-3 text-sm text-bg"
              rel="noreferrer"
              target="_blank"
            >
              開啟原作
            </a>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}
