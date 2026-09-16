import { useMemo, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import { SafeFrame } from "./SafeFrame";

export function CanvaBoard({
  shareUrl,
  embedUrl,
  thumbnailUrl,
  alt,
  caption,
  pageIds,
}: {
  shareUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  pageIds?: string[];
}) {
  const [page, setPage] = useState(0);
  const [full, setFull] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const pages = pageIds?.filter(Boolean) ?? [];
  const src = useMemo(() => {
    if (!embedUrl) return null;
    if (!pages.length) return embedUrl;
    const url = new URL(embedUrl);
    url.searchParams.set("page", pages[page] ?? String(page + 1));
    return url.toString();
  }, [embedUrl, page, pageIds]);

  if (!embedUrl || !src) {
    return (
      <div className="rounded-2xl bg-surface-blue p-6">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={alt ?? "Canva 封面"} className="mb-4 rounded-xl" />
        ) : null}
        <p className="font-display text-lg font-semibold">尚未設定公開嵌入</p>
        <p className="mt-2 text-sm text-muted">
          這不是已連線狀態。後台提供 Canva 分享連結後，這裡才會嵌入原作。
        </p>
        {shareUrl ? (
          <a
            href={shareUrl}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-mint-deep"
            rel="noreferrer"
            target="_blank"
          >
            若有分享連結，在 Canva 開啟
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={boxRef} className={full ? "fixed inset-4 z-50 rounded-3xl bg-bg p-3 shadow-float" : undefined}>
      <SafeFrame
        src={src}
        title={alt ?? "Canva 原作"}
        kind="canva"
        coverSrc={thumbnailUrl}
        openHref={shareUrl ?? embedUrl}
        openLabel="在 Canva 開啟原作"
      />
      {caption ? <p className="mt-2 text-xs text-muted">{caption}</p> : null}
      <p className="mt-2 text-xs text-muted">來源：Canva 公開嵌入，不是截圖替代。</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={async () => {
            if (!document.fullscreenElement && boxRef.current?.requestFullscreen) {
              await boxRef.current.requestFullscreen();
              setFull(true);
            } else if (document.fullscreenElement) {
              await document.exitFullscreen();
              setFull(false);
            } else {
              setFull((value) => !value);
            }
          }}
        >
          <Maximize2 className="size-4" />
          全螢幕
        </button>
        {pages.length > 1
          ? pages.map((id, index) => (
              <button
                key={id}
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-surface px-3 text-sm shadow-card"
                onClick={() => setPage(index)}
                aria-current={page === index}
              >
                {index + 1}
              </button>
            ))
          : null}
      </div>
    </div>
  );
}
