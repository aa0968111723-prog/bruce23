import type { PublicProject } from "./types";

export type ExploreKind =
  | "image"
  | "video"
  | "space"
  | "print"
  | "interaction"
  | "github"
  | "canva"
  | "demo"
  | "experience";

export type RelationNode = {
  id: string;
  kind: ExploreKind;
  label: string;
  slugs: string[];
};

const MODALITY_MAP: Record<ExploreKind, string[]> = {
  image: ["圖像", "影像序列", "海報", "熱圖", "畫布"],
  video: ["影片", "時間軸", "分鏡", "影片時間點"],
  space: ["3D", "空間", "平面圖", "動線"],
  print: ["文宣", "圖像", "註記"],
  interaction: ["互動", "對話", "MCP", "審批流程"],
  github: [],
  canva: [],
  demo: [],
  experience: [],
};

export function projectMatchesKind(project: PublicProject, kind: ExploreKind): boolean {
  if (kind === "github") return Boolean(project.github?.url);
  if (kind === "canva") return Boolean(project.canva?.shareUrl || project.canva?.embedUrl);
  if (kind === "demo") return Boolean(project.liveDemo?.url);
  if (kind === "experience") return Boolean(project.experienceMode);
  const needles = MODALITY_MAP[kind];
  const hay = [...project.modalities, project.category, project.title].join(" ");
  if (kind === "print") {
    return (
      project.category === "Visual AI" ||
      project.slug === "duigao" ||
      project.slug === "poster-vision-ai" ||
      hay.includes("文宣")
    );
  }
  return needles.some((needle) => hay.includes(needle));
}

export function buildRelationGraph(projects: PublicProject[]): RelationNode[] {
  const kinds: Array<{ kind: ExploreKind; label: string }> = [
    { kind: "image", label: "圖像" },
    { kind: "video", label: "影片" },
    { kind: "space", label: "空間" },
    { kind: "print", label: "文宣" },
    { kind: "interaction", label: "互動" },
    { kind: "github", label: "GitHub" },
    { kind: "canva", label: "Canva 原作" },
    { kind: "demo", label: "Live Demo" },
    { kind: "experience", label: "可操作體驗" },
  ];
  return kinds.map((item) => ({
    id: item.kind,
    kind: item.kind,
    label: item.label,
    slugs: projects.filter((project) => projectMatchesKind(project, item.kind)).map((p) => p.slug),
  }));
}

export function relatedSlugs(projects: PublicProject[], slug: string, limit = 3): string[] {
  const current = projects.find((p) => p.slug === slug);
  if (!current) return projects.filter((p) => p.slug !== slug).slice(0, limit).map((p) => p.slug);
  const scored = projects
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0;
      if (p.category === current.category) score += 3;
      score += p.modalities.filter((m) => current.modalities.includes(m)).length;
      if (p.experienceMode && p.experienceMode === current.experienceMode) score += 1;
      return { slug: p.slug, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((item) => item.slug);
}
