import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { demoViewMode } from "@/lib/experience/embed-fallback";

export function LiveDemoFrame({
  url,
  title,
  embedEnabled,
  status,
  error,
}: {
  url: string;
  title: string;
  embedEnabled: boolean;
  status?: string | null;
  error?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const blocked = demoViewMode({ embedEnabled, failed, status }) === "fallback";

  if (blocked) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-surface-blue px-6 py-10 text-center">
        <ImageOff className="size-8 text-muted" aria-hidden />
        <p className="text-sm text-ink">
          {error || "這個 Demo 目前不能嵌入，或目標站拒絕 iframe。"}
        </p>
        <a
          href={url}
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-bg"
          rel="noreferrer"
          target="_blank"
        >
          開新分頁查看
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
      <iframe
        title={title}
        src={url}
        className={cn("aspect-video w-full border-0")}
        sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
