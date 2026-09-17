import { canvaEmbedAllowed } from "../canva/urls.ts";

export function canvaViewMode(
  embedUrl: string | null | undefined,
  failed: boolean,
): "embed" | "fallback" {
  if (failed || !embedUrl || !canvaEmbedAllowed(embedUrl)) return "fallback";
  return "embed";
}

export function demoViewMode(input: {
  embedEnabled: boolean;
  failed: boolean;
  status?: string | null;
}): "iframe" | "fallback" {
  if (!input.embedEnabled || input.failed || input.status === "failed") return "fallback";
  return "iframe";
}
