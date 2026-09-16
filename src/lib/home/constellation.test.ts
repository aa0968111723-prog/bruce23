import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { constellationLayout } from "./constellation.ts";
import type { PublicProject } from "../cms/privacy.ts";

function project(slug: string, year: string): PublicProject {
  return {
    id: slug,
    slug,
    title: slug,
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
  });
});
