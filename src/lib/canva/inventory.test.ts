import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { archiveItems } from "../../content/archive.ts";
import { projects } from "../../content/projects.ts";
import {
  archiveCanvaInventory,
  canvaFieldsForProject,
  collectCanvaUrlsFromText,
  collectCanvaShortUrlsFromText,
  CANVA_SHORTLINK_CANDIDATES,
  projectCanvaInventory,
} from "./inventory.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));

const SOURCE_FILES = [
  "src/content/projects.ts",
  "src/content/archive.ts",
  "src/content/site.ts",
  "PORTFOLIO_TASK_STATE.md",
  "project-manifest.json",
];

describe("canva content inventory", () => {
  it("finds no real canva.com share or embed URLs in existing content", () => {
    const combined = SOURCE_FILES.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
    assert.deepEqual(collectCanvaUrlsFromText(combined), []);
  });

  it("collects the healing-studio /d/ short URL without treating it as a design embed", () => {
    const combined = SOURCE_FILES.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
    const shorts = collectCanvaShortUrlsFromText(combined);
    assert.ok(shorts.includes("https://www.canva.com/d/ysK5sYZisVEjZFe"));
    assert.ok(CANVA_SHORTLINK_CANDIDATES["ai-director-os"]?.includes("https://www.canva.com/d/ysK5sYZisVEjZFe"));
  });

  it("parses a real share URL when one is supplied later", () => {
    const parsed = collectCanvaUrlsFromText(
      "poster https://www.canva.com/design/DAGOnlyInTests/view?utm=1 extra",
    );
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].designId, "DAGOnlyInTests");
    assert.ok(parsed[0].embedUrl.includes("embed"));
  });

  it("keeps all eight works honest: local thumbnails, unavailable short links, never invented embeds", () => {
    const inventory = projectCanvaInventory();
    assert.equal(Object.keys(inventory).length, 8);
    assert.equal(projects.length, 8);
    for (const project of projects) {
      const fields = inventory[project.slug];
      assert.equal(fields.embedUrl, null, project.slug);
      assert.equal(fields.designId, null, project.slug);
      if (project.slug === "tku-zen-ai") {
        assert.equal(fields.shareUrl, null, project.slug);
        assert.equal(fields.status, "unavailable");
        assert.equal(fields.thumbnailUrl, "/media/archive/tku-zen-poster.svg");
      } else if (project.slug === "ai-director-os") {
        assert.equal(fields.shareUrl, "https://www.canva.com/d/ysK5sYZisVEjZFe");
        assert.equal(fields.status, "unavailable");
        assert.equal(fields.embedUrl, null);
        assert.equal(fields.designId, null);
        assert.equal(fields.thumbnailUrl, null);
      } else {
        assert.equal(fields.shareUrl, null, project.slug);
        assert.equal(fields.status, "not_configured");
        assert.equal(fields.thumbnailUrl, null);
      }
    }
  });

  it("marks Canva-origin archive items unavailable without share URLs", () => {
    const inventory = archiveCanvaInventory();
    for (const item of archiveItems) {
      const fields = inventory[item.id];
      assert.equal(fields.shareUrl, null, item.id);
      assert.equal(fields.embedUrl, null, item.id);
      if (item.originNote.includes("Canva")) {
        assert.equal(fields.status, "unavailable", item.id);
        assert.ok(fields.thumbnailUrl?.startsWith("/media/"), item.id);
      } else {
        assert.equal(fields.status, "not_configured", item.id);
      }
    }
  });

  it("does not invent remote photo or video CDNs in content media", () => {
    for (const project of projects) {
      for (const media of project.media) {
        assert.ok(media.src.startsWith("/media/"), `${project.slug} ${media.src}`);
      }
    }
    for (const item of archiveItems) {
      if (item.media) assert.ok(item.media.src.startsWith("/media/"), item.id);
    }
  });

  it("wires a parsed Canva URL onto a project when content actually contains one", () => {
    const fake = {
      ...projects[0],
      sourceReferences: [
        {
          label: "Canva",
          href: "https://www.canva.com/design/DAGwiredFromContent/view",
          note: "only in this unit test object",
        },
      ],
    };
    const fields = canvaFieldsForProject(fake);
    assert.equal(fields.designId, "DAGwiredFromContent");
    assert.equal(fields.status, "pending");
    assert.ok(fields.embedUrl?.includes("embed"));
  });
});
