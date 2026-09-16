import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ProjectMedia } from "@/content/types";

function isGithubExportSrc(src: string) {
  return src.startsWith("/media/github-exports/");
}

export function MediaFrame({
  media,
  className,
  priority = false,
}: {
  media: ProjectMedia;
  className?: string;
  priority?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const exportShot = isGithubExportSrc(media.src);

  if (errored) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] flex-col items-center justify-center gap-2 text-muted",
          exportShot ? "bg-mat" : "bg-surface-blue",
          className,
        )}
      >
        <ImageOff className="size-7" aria-hidden="true" />
        <p className="px-4 text-center text-sm">{media.alt}</p>
      </div>
    );
  }

  if (media.kind === "video") {
    return (
      <video
        className={cn("aspect-video w-full object-cover", className)}
        controls
        playsInline
        preload="metadata"
        poster={media.poster}
        onError={() => setErrored(true)}
      >
        <source src={media.src} />
        你的瀏覽器無法播放這段影片。
      </video>
    );
  }

  if (exportShot) {
    return (
      <div
        data-github-export=""
        className={cn("flex h-full w-full flex-col bg-mat", className)}
      >
        <div className="flex min-h-0 flex-1 items-center justify-center p-3">
          <img
            src={media.src}
            alt={media.alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="max-h-full max-w-full rounded-lg object-contain shadow-card outline-none ring-1 ring-line/80"
            onError={() => setErrored(true)}
          />
        </div>
        <p className="px-3 pb-2.5 text-center text-xs font-medium tracking-wide text-muted">
          GitHub 匯出
        </p>
      </div>
    );
  }

  return (
    <img
      src={media.src}
      alt={media.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("h-full w-full object-cover", className)}
      onError={() => setErrored(true)}
    />
  );
}
