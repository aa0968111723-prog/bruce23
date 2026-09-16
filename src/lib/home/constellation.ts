import type { PublicProject } from "../cms/privacy.ts";
import { modalityFilters } from "../experiences/catalog.ts";

export type ConstellationNode = {
  slug: string;
  title: string;
  x: number;
  y: number;
  category: string;
  year: string;
  modalities: string[];
};

export type ConstellationHub = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type ConstellationEdge = {
  from: string;
  to: string;
};

export const CONSTELLATION_WIDTH = 1000;
export const CONSTELLATION_HEIGHT = 560;

function yearValue(year: string): number {
  const match = year.match(/20\d{2}/);
  return match ? Number(match[0]) : 2024;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function slugAngle(slug: string, index: number): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return (hash % 628) / 100 + index * 0.41;
}

/** Place works by the modalities they actually use, not decorative scatter. */
export function constellationLayout(projects: PublicProject[]): {
  hubs: ConstellationHub[];
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
} {
  const activeFilters = modalityFilters.filter((item) =>
    projects.some((project) => item.slugs.includes(project.slug)),
  );
  const hubs: ConstellationHub[] = activeFilters.map((item, index) => {
    const count = Math.max(activeFilters.length, 1);
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const radiusX = count <= 2 ? 160 : 210;
    const radiusY = count <= 2 ? 120 : 170;
    return {
      id: item.id,
      label: item.label,
      x: 500 + Math.cos(angle) * radiusX,
      y: 280 + Math.sin(angle) * radiusY,
    };
  });
  const hubById = new Map(hubs.map((item) => [item.id, item]));
  const years = projects.map((item) => yearValue(item.year));
  const minY = Math.min(...years, 2020);
  const maxY = Math.max(...years, 2026);
  const nodes = projects.map((project, index) => {
    const linked = modalityFilters.filter((item) => item.slugs.includes(project.slug) && hubById.has(item.id));
    const points = linked
      .map((item) => hubById.get(item.id))
      .filter((item): item is ConstellationHub => Boolean(item));
    const fallbackAngle = (Math.PI * 2 * index) / Math.max(projects.length, 1);
    const cx = points.length ? points.reduce((sum, item) => sum + item.x, 0) / points.length : 500 + Math.cos(fallbackAngle) * 80;
    const cy = points.length ? points.reduce((sum, item) => sum + item.y, 0) / points.length : 280 + Math.sin(fallbackAngle) * 60;
    const t = (yearValue(project.year) - minY) / Math.max(maxY - minY, 1);
    const radial = 0.55 + t * 0.45;
    const angle = slugAngle(project.slug, index);
    const spread = 40 + (index % 4) * 16;
    return {
      slug: project.slug,
      title: project.title,
      x: clamp(500 + (cx - 500) * radial + Math.cos(angle) * spread, 70, 930),
      y: clamp(280 + (cy - 280) * radial + Math.sin(angle) * spread * 0.72, 48, 512),
      category: project.category,
      year: project.year,
      modalities: linked.map((item) => item.label),
    };
  });
  const edges: ConstellationEdge[] = [];
  for (const node of nodes) {
    for (const label of node.modalities) {
      const hub = hubs.find((item) => item.label === label);
      if (hub) edges.push({ from: hub.id, to: node.slug });
    }
  }
  return { hubs, nodes, edges };
}
