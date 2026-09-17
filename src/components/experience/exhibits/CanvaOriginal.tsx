import { useState } from "react";
import { parseCanvaInput } from "@/lib/portfolio/canva-url";
import type { PublicProject } from "@/lib/portfolio/types";

export function CanvaOriginal({ project }: { project: PublicProject }) {
  const canva = project.canva;
  const [failed, setFailed] = useState(false);

  if (!canva?.embedUrl && !canva?.shareUrl) {
    return <p className="text-sm text-muted">這件作品尚未綁定可公開嵌入的 Canva 原作。</p>;
  }

  const parsed = parseCanvaInput(canva.embedUrl || canva.shareUrl || "");
  if (!parsed.ok) {
    return (
      <Fallback
        cover={canva.thumbnailUrl || project.media[0]?.src}
        alt={canva.alt || project.title}
        href={canva.shareUrl}
        message={parsed.error}
      />
    );
  }

  const embed = parsed.value.embedUrl;

  if (failed) {
    return (
      <Fallback
        cover={canva.thumbnailUrl || project.media[0]?.src}
        alt={canva.alt || project.title}
        href={parsed.value.shareUrl}
        message="這個設計可能需要權限，或嵌入暫時無法顯示。"
      />
    );
  }

  return (
    <div>
      <p className="text-xs text-muted">Canva 原作嵌入 · 允許清單內的網域才會顯示。</p>
      <div className="mt-3 overflow-hidden rounded-2xl bg-surface-blue">
        <iframe
          title={canva.alt || `${project.title} Canva`}
          src={embed}
          className="aspect-[16/10] w-full"
          allow="fullscreen"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-bg"
          href={parsed.value.shareUrl}
          rel="noreferrer"
          target="_blank"
        >
          在 Canva 開啟原作
        </a>
        {parsed.value.editUrl ? (
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
            href={parsed.value.editUrl}
            rel="noreferrer"
            target="_blank"
          >
            官方編輯頁
          </a>
        ) : null}
        <button
          type="button"
          className="min-h-11 rounded-full bg-surface-mint px-4 text-sm"
          onClick={() => {
            const iframe = document.querySelector("iframe[title]") as HTMLIFrameElement | null;
            void iframe?.requestFullscreen?.();
          }}
        >
          全螢幕
        </button>
      </div>
    </div>
  );
}

function Fallback({
  cover,
  alt,
  href,
  message,
}: {
  cover?: string | null;
  alt: string;
  href?: string | null;
  message: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-blue p-4">
      {cover ? <img src={cover} alt={alt} className="aspect-[16/10] w-full rounded-xl object-cover" /> : null}
      <p className="mt-3 text-sm">{message}</p>
      <p className="mt-1 text-xs text-muted">這個設計可能需要權限。</p>
      {href ? (
        <a className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-mint-deep" href={href} rel="noreferrer" target="_blank">
          在 Canva 開啟
        </a>
      ) : null}
    </div>
  );
}
