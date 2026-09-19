import type { WalkthroughStep } from "../cms/schema.ts";

export type WalkthroughStageKind = "cabinet" | "canvas" | "artboard" | "command" | "audit" | "mcp" | "document";

export function walkthroughStageKind(step: Pick<WalkthroughStep, "title" | "path">): WalkthroughStageKind {
  const hay = `${step.title} ${step.path ?? ""}`.toLowerCase();
  if (/mcp/.test(hay)) return "mcp";
  if (/audit|檢查|overflow|contrast|安全區/.test(hay)) return "audit";
  if (/command|指令|palette|快捷/.test(hay)) return "command";
  if (/artboard|畫板/.test(hay)) return "artboard";
  if (/文件櫃|file cabinet|cabinet/.test(hay)) return "cabinet";
  if (/canvas|畫布|stage/.test(hay)) return "canvas";
  return "document";
}
