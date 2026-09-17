import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONSTELLATION_HEIGHT,
  CONSTELLATION_WIDTH,
  NODE_HALF_H,
  NODE_HALF_W,
  constellationCollisions,
  constellationLayout,
} from "./constellation.ts";
import type { PublicProject } from "../cms/privacy.ts";
import { projects as seedProjects } from "../../content/projects.ts";

function project(slug: string, year: string, title = slug): PublicProject {
  return {
    id: slug,
    slug,
    title,
    subtitle: "",
    category: "AI Product",
    year,
    productStatus: "prototype",
    featured: true,
    sortOrder: 0,
    summary: "",
    problem: "",
    role: "",
    decisions: [],
    modalities: [],
    process: [],
    outputs: [],
    stack: [],
    limitations: [],
    media: [],
    locale: {},
    experienceMode: null,
    experienceConfig: {},
    interactionSteps: [],
    sourceEvidence: [],
    github: { url: null, owner: null, repo: null, branch: null, syncStatus: "not_configured", lastSyncedAt: null },
    canva: { shareUrl: null, embedUrl: null, designId: null, thumbnailUrl: null, status: "not_configured", lastSyncedAt: null },
    demo: { url: null, label: null, type: null, embedEnabled: false, status: "not_configured", lastVerifiedAt: null },
  };
}

const featured = [
  project("ai-director-os", "2026", "AI Director OS"),
  project("framelab", "2026", "FrameLab"),
  project("poster-vision-ai", "2026", "Poster Vision AI"),
  project("planform", "2026", "PLANFORM"),
  project("duigao", "2026", "對稿"),
  project("folio", "2026", "Folio"),
  project("hermes-console", "2026", "Hermes Console"),
  project("tku-zen-ai", "2026", "TKU Zen AI"),
].map((item) => {
  const seed = seedProjects.find((row) => row.slug === item.slug);
  return { ...item, modalities: seed?.modalities ?? item.modalities };
});

describe("homepage constellation", () => {
  it("places works using real modality membership and year, not random scatter", () => {
    const map = constellationLayout([
      project("planform", "2025"),
      project("tku-zen-ai", "2024"),
      project("framelab", "2025"),
    ]);
    assert.ok(map.hubs.some((item) => item.id === "space"));
    const planform = map.nodes.find((item) => item.slug === "planform");
    const zen = map.nodes.find((item) => item.slug === "tku-zen-ai");
    assert.ok(planform && zen);
    assert.notEqual(planform.x, zen.x);
    assert.ok(map.edges.some((edge) => edge.to === "planform" && edge.from === "space"));
    assert.ok(map.edges.some((edge) => edge.to === "framelab" && edge.from === "video"));
    const spaceOnly = constellationLayout([project("planform", "2025")]);
    assert.ok(spaceOnly.hubs.every((hub) => hub.id === "space" || hub.id === "interactive"));
    assert.equal(spaceOnly.hubs.some((hub) => hub.id === "image"), false);
  });

  it("keeps the eight featured works from sitting on hubs or on each other", () => {
    const map = constellationLayout(featured);
    assert.equal(map.nodes.length, 8);
    const collisions = constellationCollisions(map);
    assert.deepEqual(collisions.nodePairs, [], `node overlap ${JSON.stringify(collisions.nodePairs)}`);
    assert.deepEqual(collisions.hubPairs, [], `hub overlap ${JSON.stringify(collisions.hubPairs)}`);
    const folio = map.nodes.find((item) => item.slug === "folio");
    const interactive = map.hubs.find((item) => item.id === "interactive");
    assert.ok(folio && interactive);
    const dist = Math.hypot(folio.x - interactive.x, folio.y - interactive.y);
    assert.ok(dist > 120, `folio too close to interactive hub (${dist})`);
    for (const node of map.nodes) {
      assert.ok(node.x - NODE_HALF_W >= 0, `${node.slug} clips left`);
      assert.ok(node.x + NODE_HALF_W <= CONSTELLATION_WIDTH, `${node.slug} clips right`);
      assert.ok(node.y - NODE_HALF_H >= 0, `${node.slug} clips top`);
      assert.ok(node.y + NODE_HALF_H <= CONSTELLATION_HEIGHT, `${node.slug} clips bottom`);
    }
  });

  it("places an unknown slug from CMS modalities, not a hardcoded slug list", () => {
    const spatial = project("new-iso-tool", "2026", "ISO");
    spatial.modalities = ["3D", "動線"];
    const map = constellationLayout([spatial]);
    assert.ok(map.hubs.some((hub) => hub.id === "space"));
    assert.equal(map.hubs.some((hub) => hub.id === "image"), false);
    assert.ok(map.edges.some((edge) => edge.to === "new-iso-tool" && edge.from === "space"));
  });
});
