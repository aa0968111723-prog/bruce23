import { useMemo, useState } from "react";
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
  const pages = pageIds?.filter(Boolean) ?? [];
  const [page, setPage] = useState(0);
  const src = useMemo(() => {
    if (!embedUrl) return null;
    if (!pages.length) return embedUrl;
    const url = new URL(embedUrl);
    url.searchParams.set("page", pages[page] ?? String(page + 1));
    return url.toString();
  }, [embedUrl, page, pages]);

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
    <div>
      <SafeFrame
        src={src}
        title={alt ?? "Canva 原作"}
        kind="canva"
        coverSrc={thumbnailUrl}
        openHref={shareUrl ?? embedUrl}
        openLabel="在 Canva 開啟原作"
      />
      {caption ? <p className="mt-2 text-xs text-muted">{caption}</p> : null}
      {pages.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {pages.map((id, index) => (
            <button
              key={id}
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-surface px-3 text-sm shadow-card"
              onClick={() => setPage(index)}
              aria-current={page === index}
            >
              {index + 1}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
