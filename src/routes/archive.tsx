import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MediaFrame } from "@/components/site/MediaFrame";
import { CanvaStage } from "@/components/experience/CanvaStage";
import { listPublishedArchiveFn } from "@/lib/cms/public-fn";
import { archiveKinds } from "@/content/archive";
import { cn } from "@/lib/cn";
import type { PublicProject } from "@/lib/cms/privacy";
import type { PublicArchiveItem } from "@/lib/cms/store";
import { useRovingTabs } from "@/components/site/useRovingTabs";

export const Route = createFileRoute("/archive")({
  loader: async (): Promise<PublicArchiveItem[]> => listPublishedArchiveFn(),
  component: Archive,
});

function Archive() {
  const items = Route.useLoaderData() as PublicArchiveItem[];
  const [kind, setKind] = useState<(typeof archiveKinds)[number]["id"]>("all");
  const kindIds = archiveKinds.map((item) => item.id) as Array<(typeof archiveKinds)[number]["id"]>;
  const tabs = useRovingTabs(kindIds, kind, (next) => setKind(next));
  const visible = useMemo(() => {
    if (kind === "all") return items;
    if (kind === "graphic") {
      return items.filter((item) => item.kind === "graphic" || item.kind === "social");
    }
    return items.filter((item) => item.kind === kind);
  }, [kind, items]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">Archive</h1>
      <p className="mt-3 max-w-2xl text-muted">
        攝影、平面、活動、社團文宣與招生活動互動。私人 Drive 不公開；有 Canva 嵌入的會直接可翻頁。
      </p>
      <div
        className="mt-8 flex gap-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Archive 分類"
        onKeyDown={tabs.onKeyDown}
      >
        {archiveKinds.map((item) => {
          const active = item.id === kind;
          return (
            <button
              key={item.id}
              ref={tabs.setRef(item.id)}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={tabs.tabIndex(item.id)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
                active ? "bg-ink text-bg" : "bg-surface text-muted shadow-card",
              )}
              onClick={() => setKind(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl bg-surface shadow-card">
            {item.canva.embedUrl || item.canva.shareUrl || item.canva.thumbnailUrl ? (
              <CanvaStage
                project={
                  {
                    title: item.title,
                    canva: {
                      shareUrl: item.canva.shareUrl,
                      embedUrl: item.canva.embedUrl,
                      designId: item.canva.designId,
                      thumbnailUrl: item.canva.thumbnailUrl,
                      status: item.canva.status,
                      lastSyncedAt: null,
                      alt: item.canva.alt,
                      caption: item.canva.caption,
                    },
                    media: item.media ? [item.media] : [],
                  } as unknown as PublicProject
                }
              />
            ) : item.media ? (
              <div className="aspect-[4/3] overflow-hidden bg-surface-blue">
                <MediaFrame media={item.media} />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-surface-mint px-6 text-center text-sm text-muted">
                原件在私人來源，尚未放入公開媒體層
              </div>
            )}
            <div className="p-5">
              <p className="text-xs font-medium tracking-wide text-muted">{item.year}</p>
              <h2 className="mt-1 font-display text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.summary}</p>
              <p className="mt-3 text-xs text-muted">{item.originNote}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-mint-deep"
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHub
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
