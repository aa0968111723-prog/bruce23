import type { PublicProject } from "@/lib/cms/public-types";

export const RELATION_NODES = [
  { id: "圖像", match: ["圖像", "海報", "熱圖", "畫布"] },
  { id: "影片", match: ["影片", "影像序列", "時間軸", "分鏡"] },
  { id: "空間", match: ["3D", "空間", "動線", "平面圖"] },
  { id: "文宣", match: ["圖像", "註記", "OCR"] },
  { id: "互動", match: ["互動", "對話", "MCP", "註記"] },
  { id: "GitHub", match: [] },
  { id: "Canva", match: [] },
  { id: "Live Demo", match: [] },
] as const;

export type RelationNodeId = (typeof RELATION_NODES)[number]["id"];

export function relatedProjects(projects: PublicProject[], nodeId: string) {
  if (nodeId === "GitHub") return projects.filter((p) => p.github);
  if (nodeId === "Canva") return projects.filter((p) => p.canva?.embedUrl || p.canva?.shareUrl);
  if (nodeId === "Live Demo") return projects.filter((p) => p.demo?.url);
  const node = RELATION_NODES.find((n) => n.id === nodeId);
  if (!node) return [];
  return projects.filter(
    (p) =>
      p.modalities.some((m) => node.match.some((k) => m.includes(k))) ||
      (nodeId === "空間" && p.category === "Spatial Design") ||
      (nodeId === "文宣" &&
        (p.slug === "duigao" || p.slug === "poster-vision-ai" || p.slug === "folio")) ||
      (nodeId === "互動" && (p.category === "Interaction" || p.slug === "tku-zen-ai")),
  );
}
