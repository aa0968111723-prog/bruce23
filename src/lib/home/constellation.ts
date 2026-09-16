import type { PublicProject } from "../cms/privacy.ts";
import { modalityFilters, projectHubIds } from "../experiences/catalog.ts";

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

export const CONSTELLATION_WIDTH = 1200;
export const CONSTELLATION_HEIGHT = 720;
/** Label box used for overlap tests and collision resolve (SVG units). */
export const NODE_HALF_W = 94;
export const NODE_HALF_H = 36;
export const HUB_HALF_W = 40;
export const HUB_HALF_H = 28;
export const HUB_RADIUS = 24;
export const NODE_RADIUS = 28;

function yearValue(year: string): number {
  const match = year.match(/20\d{2}/);
  return match ? Number(match[0]) : 2024;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hypot(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy) || 0.0001;
}

export function rectsOverlap(
  ax: number,
  ay: number,
  ahw: number,
  ahh: number,
  bx: number,
  by: number,
  bhw: number,
  bhh: number,
  gap = 10,
): boolean {
  return Math.abs(ax - bx) < ahw + bhw + gap && Math.abs(ay - by) < ahh + bhh + gap;
}

export function boxesOverlap(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  halfW = NODE_HALF_W,
  halfH = NODE_HALF_H,
  gap = 10,
): boolean {
  return rectsOverlap(ax, ay, halfW, halfH, bx, by, halfW, halfH, gap);
}

export function nodeHitsHub(node: { x: number; y: number }, hub: { x: number; y: number }): boolean {
  return rectsOverlap(node.x, node.y, NODE_HALF_W, NODE_HALF_H, hub.x, hub.y, HUB_HALF_W, HUB_HALF_H, 12);
}

export function constellationCollisions(map: {
  hubs: ConstellationHub[];
  nodes: ConstellationNode[];
}): { nodePairs: Array<[string, string]>; hubPairs: Array<[string, string]> } {
  const nodePairs: Array<[string, string]> = [];
  const hubPairs: Array<[string, string]> = [];
  for (let i = 0; i < map.nodes.length; i += 1) {
    for (let j = i + 1; j < map.nodes.length; j += 1) {
      const a = map.nodes[i];
      const b = map.nodes[j];
      if (boxesOverlap(a.x, a.y, b.x, b.y)) nodePairs.push([a.slug, b.slug]);
    }
    for (const hub of map.hubs) {
      if (nodeHitsHub(map.nodes[i], hub)) hubPairs.push([map.nodes[i].slug, hub.id]);
    }
  }
  return { nodePairs, hubPairs };
}

function pushNodeFromHub(node: ConstellationNode, hub: ConstellationHub): boolean {
  const gap = 12;
  const ox = NODE_HALF_W + HUB_HALF_W + gap - Math.abs(node.x - hub.x);
  const oy = NODE_HALF_H + HUB_HALF_H + gap - Math.abs(node.y - hub.y);
  if (ox <= 0 || oy <= 0) return false;
  if (ox < oy) {
    node.x += (node.x >= hub.x ? 1 : -1) * (ox + 2);
  } else {
    node.y += (node.y >= hub.y ? 1 : -1) * (oy + 2);
  }
  return true;
}

function pushNodesApart(a: ConstellationNode, b: ConstellationNode): boolean {
  const gap = 12;
  const ox = NODE_HALF_W * 2 + gap - Math.abs(a.x - b.x);
  const oy = NODE_HALF_H * 2 + gap - Math.abs(a.y - b.y);
  if (ox <= 0 || oy <= 0) return false;
  if (ox < oy) {
    const dir = a.x <= b.x ? -1 : 1;
    const half = ox / 2 + 1;
    a.x += dir * half;
    b.x -= dir * half;
  } else {
    const dir = a.y <= b.y ? -1 : 1;
    const half = oy / 2 + 1;
    a.y += dir * half;
    b.y -= dir * half;
  }
  return true;
}

function resolveCollisions(hubs: ConstellationHub[], nodes: ConstellationNode[]): ConstellationNode[] {
  const placed = nodes.map((node) => ({ ...node }));
  const minX = NODE_HALF_W + 16;
  const maxX = CONSTELLATION_WIDTH - NODE_HALF_W - 16;
  const minY = NODE_HALF_H + 16;
  const maxY = CONSTELLATION_HEIGHT - NODE_HALF_H - 16;

  for (let iter = 0; iter < 220; iter += 1) {
    let moved = false;
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        if (pushNodesApart(placed[i], placed[j])) moved = true;
      }
      for (const hub of hubs) {
        if (pushNodeFromHub(placed[i], hub)) moved = true;
      }
      placed[i].x = clamp(placed[i].x, minX, maxX);
      placed[i].y = clamp(placed[i].y, minY, maxY);
    }
    if (!moved) break;
  }
  return placed;
}

/** Place works by the modalities they actually use, not decorative scatter. */
export function constellationLayout(projects: PublicProject[]): {
  hubs: ConstellationHub[];
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
} {
  const activeFilters = modalityFilters.filter((item) =>
    projects.some((project) => projectHubIds(project).includes(item.id)),
  );
  const cx0 = CONSTELLATION_WIDTH / 2;
  const cy0 = CONSTELLATION_HEIGHT / 2;
  const hubs: ConstellationHub[] = activeFilters.map((item, index) => {
    const count = Math.max(activeFilters.length, 1);
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const radiusX = count <= 2 ? 240 : 430;
    const radiusY = count <= 2 ? 180 : 270;
    return {
      id: item.id,
      label: item.label,
      x: cx0 + Math.cos(angle) * radiusX,
      y: cy0 + Math.sin(angle) * radiusY,
    };
  });
  const hubById = new Map(hubs.map((item) => [item.id, item]));
  const years = projects.map((item) => yearValue(item.year));
  const minYear = Math.min(...years, 2020);
  const maxYear = Math.max(...years, 2026);
  const groups = new Map<string, number[]>();
  const membership = projects.map((project, index) => {
    const linked = modalityFilters.filter((item) => projectHubIds(project).includes(item.id) && hubById.has(item.id));
    const key = linked.map((item) => item.id).sort().join("|") || "_";
    const list = groups.get(key) ?? [];
    list.push(index);
    groups.set(key, list);
    return { linked, key };
  });

  const draft: ConstellationNode[] = projects.map((project, index) => {
    const { linked, key } = membership[index];
    const points = linked
      .map((item) => hubById.get(item.id))
      .filter((item): item is ConstellationHub => Boolean(item));
    const fallbackAngle = (Math.PI * 2 * index) / Math.max(projects.length, 1);
    const gx = points.length ? points.reduce((sum, item) => sum + item.x, 0) / points.length : cx0 + Math.cos(fallbackAngle) * 160;
    const gy = points.length ? points.reduce((sum, item) => sum + item.y, 0) / points.length : cy0 + Math.sin(fallbackAngle) * 120;
    const siblings = groups.get(key) ?? [index];
    const k = Math.max(siblings.indexOf(index), 0);
    const n = Math.max(siblings.length, 1);
    const t = (yearValue(project.year) - minYear) / Math.max(maxYear - minYear, 1);
    const away = hypot(gx - cx0, gy - cy0);
    const ux = (gx - cx0) / away;
    const uy = (gy - cy0) / away;
    const px = -uy;
    const py = ux;
    const along = n === 1 ? 168 + t * 18 : 78 + t * 16;
    const spread = (k - (n - 1) / 2) * 118;
    return {
      slug: project.slug,
      title: project.title,
      x: gx + ux * along + px * spread,
      y: gy + uy * along + py * spread,
      category: project.category,
      year: project.year,
      modalities: linked.map((item) => item.label),
    };
  });

  const nodes = resolveCollisions(hubs, draft);
  const edges: ConstellationEdge[] = [];
  for (const node of nodes) {
    for (const label of node.modalities) {
      const hub = hubs.find((item) => item.label === label);
      if (hub) edges.push({ from: hub.id, to: node.slug });
    }
  }
  return { hubs, nodes, edges };
}
