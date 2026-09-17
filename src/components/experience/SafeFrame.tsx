import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { iframeFallbackCopy } from "@/lib/portfolio/a11y";

export function SafeFrame({
  src,
  title,
  kind,
  coverSrc,
  openHref,
  openLabel,
  className,
}: {
  src: string;
  title: string;
  kind: "canva" | "demo";
  coverSrc?: string;
  openHref: string;
  openLabel: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const copy = iframeFallbackCopy(kind);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div
        className={cn(
          "flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-surface-blue p-6 text-center",
          className,
        )}
      >
        {coverSrc ? (
          <img src={coverSrc} alt="" className="mb-2 max-h-40 rounded-xl object-cover" />
        ) : (
          <ImageOff className="size-8 text-muted" />
        )}
        <p className="font-display text-lg font-semibold">{copy.titleZh}</p>
        <p className="max-w-md text-sm text-muted">{copy.bodyZh}</p>
        <a
          href={openHref}
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-bg"
          rel="noreferrer"
          target="_blank"
        >
          {openLabel}
        </a>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl bg-surface-blue shadow-card", className)}>
      <div className="relative min-h-72">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        ) : null}
        <iframe
          title={title}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="relative z-10 h-[min(70vh,32rem)] w-full bg-surface"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-xs text-muted">
          {kind === "canva"
            ? "若畫面空白，可能需要 Canva 分享權限。"
            : "公開網址狀態可能變動，不是穩定 SLA。"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
            onClick={() => setFailed(true)}
          >
            無法顯示
          </button>
          <a
            href={openHref}
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-bg"
            rel="noreferrer"
            target="_blank"
          >
            {openLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
