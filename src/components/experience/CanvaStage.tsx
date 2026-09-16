import { useRef, useState } from "react";
import { Expand, ExternalLink } from "lucide-react";
import { canvaViewerState, publicCanvaEmbedUrl, type PublicProject } from "@/lib/cms/privacy";
import { canvaEmbedSrc, canvaOpenOriginalUrl } from "@/lib/canva/embed";
import { fillChrome } from "@/lib/locale/experience";
import { useExperienceView } from "./useExperienceView";

export function CanvaStage({ project }: { project: PublicProject }) {
  const { ex, config } = useExperienceView(project);
  const canva = project.canva;
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
        {config.canvaNote ?? ex.canvaEmptyNote}
      </div>
    );
  }

  if (state === "local") {
    return (
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        {thumb}
        <div className="space-y-2 p-4 text-sm">
          <p className="font-medium">
            {canva.status === "unavailable" ? ex.unavailableTitle : ex.noShareTitle}
          </p>
          <p className="text-muted">{canva.status === "unavailable" ? ex.unavailableBody : ex.noShareBody}</p>
          {canva.caption ? <p className="text-sm text-muted">{canva.caption}</p> : null}
          {original ? (
            <a
              className="inline-flex min-h-11 items-center gap-2 text-mint-deep"
              href={original}
              rel="noreferrer"
              target="_blank"
            >
              {ex.openOriginal}
              <ExternalLink className="size-4" />
            </a>
          ) : null}
          <p className="text-xs text-muted">{fillChrome(ex.sourcePublicEmbed, { status: canva.status })}</p>
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
            {canva.status === "pending" && !embed ? ex.pendingTitle : ex.embedFailTitle}
          </p>
          <p className="text-muted">
            {canva.status === "pending" && !embed ? ex.pendingBody : ex.embedFailBody}
          </p>
          {original ? (
            <a
              className="inline-flex min-h-11 items-center gap-2 text-mint-deep"
              href={original}
              rel="noreferrer"
              target="_blank"
            >
              {ex.openOriginal}
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
          title={canva.alt ?? fillChrome(ex.iframeTitle, { title: project.title })}
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
                config.canvaPageLabels?.find((pageItem) => pageItem.id === item)?.label ??
                fillChrome(ex.pageN, { n: index + 1 });
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
          {ex.fullscreen}
        </button>
        {original ? (
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm text-bg"
            href={original}
            rel="noreferrer"
            target="_blank"
          >
            {ex.openOriginal}
            <ExternalLink className="size-4" />
          </a>
        ) : null}
      </div>
      <p className="text-xs text-muted">{fillChrome(ex.sourceCanvaEmbed, { status: canva.status })}</p>
      {config.canvaNote ? <p className="text-sm text-muted">{config.canvaNote}</p> : null}
      {canva.caption ? <p className="text-sm text-muted">{canva.caption}</p> : null}
    </div>
  );
}
