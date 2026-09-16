import { cn } from "@/lib/cn";
import { productStatusLabel } from "@/lib/cms/status";
import { useViewerLocale } from "./LocaleProvider";

const tone: Record<string, string> = {
  completed: "bg-surface-mint text-mint-deep",
  "in-progress": "bg-surface-blue text-sky",
  prototype: "bg-surface text-muted ring-1 ring-line",
  concept: "bg-surface text-muted ring-1 ring-line",
  planned: "bg-sun/30 text-ink",
};

export function StatusBadge({ status }: { status: string }) {
  const { ui } = useViewerLocale();
  const label =
    ui.productStatus[status as keyof typeof ui.productStatus] ??
    productStatusLabel[status as keyof typeof productStatusLabel] ??
    status;
  return (
    <span className={cn("inline-flex h-7 items-center rounded-full px-3 text-xs font-medium", tone[status] ?? tone.prototype)}>
      {label}
    </span>
  );
}
