import { statusLabel } from "@/content/projects";
import type { ProjectStatus } from "@/content/types";
import { cn } from "@/lib/cn";

const tone: Record<ProjectStatus, string> = {
  completed: "bg-surface-mint text-mint-deep",
  "in-progress": "bg-surface-blue text-sky",
  prototype: "bg-surface text-muted ring-1 ring-line",
  concept: "bg-surface text-muted ring-1 ring-line",
  planned: "bg-sun/30 text-ink",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-medium",
        tone[status],
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
