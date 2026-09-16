import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toPublicProject } from "./queries.ts";

describe("public projection", () => {
  it("omits private GitHub from public payloads", () => {
    const pub = toPublicProject({
      id: "1",
      slug: "secret",
      title: "Secret",
      subtitle: "",
      summary: "s",
      problem: "",
      role: "",
      decisions: [],
      modalities: [],
      process: [],
      outputs: [],
      stack: [],
      limitations: [],
      category: "AI Product",
      year: "2026",
      product_status: "prototype",
      publication_status: "published",
      featured: false,
      sort_order: 0,
      media: [],
      github_url: "https://github.com/aa0968111723-prog/private-repo",
      github_owner: "aa0968111723-prog",
      github_repo: "private-repo",
      github_is_private: true,
      github_public_approved: false,
      github_readme: "secret readme",
      canva_share_url: null,
      live_demo_url: null,
      experience_mode: "media-gallery",
      experience_config: {},
      interaction_steps: [],
      source_evidence: [],
      seo: {},
    });
    assert.equal(pub.github, null);
    assert.equal(JSON.stringify(pub).includes("secret readme"), false);
    assert.equal(JSON.stringify(pub).includes("payload_encrypted"), false);
  });

  it("keeps approved public GitHub metadata", () => {
    const pub = toPublicProject({
      id: "2",
      slug: "ai-director-os",
      title: "AI Director OS",
      subtitle: "",
      summary: "s",
      problem: "",
      role: "",
      decisions: [],
      modalities: [],
      process: [],
      outputs: [],
      stack: [],
      limitations: [],
      category: "AI Product",
      year: "2026",
      product_status: "in-progress",
      publication_status: "published",
      featured: true,
      sort_order: 0,
      media: [],
      github_url: "https://github.com/aa0968111723-prog/ai_os",
      github_owner: "aa0968111723-prog",
      github_repo: "ai_os",
      github_is_private: false,
      github_public_approved: true,
      github_readme: "# Hello",
      github_topics: ["ai"],
      experience_mode: "process-map",
      experience_config: {},
      interaction_steps: [],
      source_evidence: [],
      seo: {},
    });
    assert.equal(pub.github?.repo, "ai_os");
    assert.ok(pub.github?.readmeSummary);
  });
});
