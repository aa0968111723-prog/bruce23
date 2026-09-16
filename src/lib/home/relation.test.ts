import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { relatedProjects } from "./relations.ts";
import type { PublicProject } from "../cms/public-types.ts";

function project(partial: Partial<PublicProject> & Pick<PublicProject, "slug" | "title">): PublicProject {
  return {
    id: partial.slug,
    subtitle: "",
    subtitleEn: null,
    titleEn: null,
    summary: "",
    summaryEn: null,
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
    productStatus: "prototype",
    publicationStatus: "published",
    featured: false,
    sortOrder: 0,
    media: [],
    videoUrl: null,
    github: null,
    canva: null,
    demo: null,
    experienceMode: "media-gallery",
    experienceConfig: {},
    interactionSteps: [],
    sourceEvidence: [],
    seo: {},
    updatedAt: null,
    ...partial,
  };
}

describe("homepage relation nodes", () => {
  const projects = [
    project({
      slug: "ai-director-os",
      title: "AI Director OS",
      github: {
        url: "https://github.com/aa0968111723-prog/ai_os",
        owner: "aa0968111723-prog",
        repo: "ai_os",
        branch: "main",
        description: "x",
        homepage: null,
        languages: {},
        topics: [],
        updatedAt: null,
        latestCommit: null,
        readmeSummary: "",
        fileTree: [],
        isPrivate: false,
      },
      demo: {
        url: "https://ai-os-ten.vercel.app",
        label: "Demo",
        type: "link",
        embedEnabled: false,
        status: "connected",
      },
    }),
    project({
      slug: "folio",
      title: "Folio",
      canva: {
        shareUrl: "https://www.canva.com/design/x/view",
        embedUrl: "https://www.canva.com/design/x/view?embed",
        designId: "x",
        pageIds: [],
        thumbnailUrl: null,
        alt: null,
        caption: null,
        status: "verified",
      },
    }),
    project({
      slug: "planform",
      title: "PLANFORM",
      category: "Spatial Design",
    }),
  ];

  it("maps GitHub / Canva / Live Demo to real published works", () => {
    assert.deepEqual(
      relatedProjects(projects, "GitHub").map((p) => p.slug),
      ["ai-director-os"],
    );
    assert.deepEqual(
      relatedProjects(projects, "Canva").map((p) => p.slug),
      ["folio"],
    );
    assert.deepEqual(
      relatedProjects(projects, "Live Demo").map((p) => p.slug),
      ["ai-director-os"],
    );
    assert.deepEqual(
      relatedProjects(projects, "空間").map((p) => p.slug),
      ["planform"],
    );
  });
});
