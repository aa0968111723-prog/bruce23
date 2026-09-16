import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ProjectMedia } from "@/content/types";

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

  if (errored) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-surface-blue text-muted",
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

  const contain = media.src.startsWith("/media/github-exports/");

  return (
    <img
      src={media.src}
      alt={media.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("h-full w-full", contain ? "object-contain bg-surface-blue" : "object-cover", className)}
      onError={() => setErrored(true)}
    />
  );
}
