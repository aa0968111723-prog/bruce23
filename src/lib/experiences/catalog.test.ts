import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { experienceCatalog } from "./catalog.ts";

describe("experience catalog", () => {
  it("covers all eight works with distinct modes", () => {
    const slugs = [
      "ai-director-os",
      "framelab",
      "poster-vision-ai",
      "planform",
      "duigao",
      "folio",
      "hermes-console",
      "tku-zen-ai",
    ];
    const modes = slugs.map((slug) => experienceCatalog[slug].mode);
    assert.equal(new Set(slugs.filter((slug) => experienceCatalog[slug])).size, 8);
    assert.ok(modes.includes("process-map"));
    assert.ok(modes.includes("timeline"));
    assert.ok(modes.includes("spatial-preview"));
    assert.ok(experienceCatalog["ai-director-os"].honestyLabel.includes("作品集"));
    assert.ok(experienceCatalog["tku-zen-ai"].honestyLabel.includes("不是雲端"));
  });
});

describe("frontend contract", () => {
  it("does not put integration tokens in client modules", () => {
    const files = [
      "src/components/experience/ExperiencePanel.tsx",
      "src/components/experience/GithubExplorer.tsx",
      "src/components/experience/CanvaStage.tsx",
      "src/components/home/ExplorationField.tsx",
      "src/components/admin/ProjectForm.tsx",
      "src/routes/index.tsx",
      "src/routes/login.tsx",
      "src/routes/admin/integrations.tsx",
      "src/lib/cms/public-fn.ts",
      "src/lib/cms/privacy.ts",
    ];
    for (const file of files) {
      const text = readFileSync(new URL(`../../../${file}`, import.meta.url), "utf8");
      assert.doesNotMatch(text, /GITHUB_READ_TOKEN/);
      assert.doesNotMatch(text, /CANVA_CLIENT_SECRET/);
      assert.doesNotMatch(text, /CANVA_CLIENT_ID/);
      assert.doesNotMatch(text, /service_role/);
      assert.doesNotMatch(text, /VITE_GITHUB/);
      assert.doesNotMatch(text, /VITE_CANVA/);
    }
  });

  it("keeps reduced-motion, skip link, and 44px targets", () => {
    const css = readFileSync(new URL("../../../src/styles.css", import.meta.url), "utf8");
    assert.match(css, /prefers-reduced-motion/);
    assert.match(css, /overflow-x:\s*clip/);
    const header = readFileSync(new URL("../../../src/components/site/SiteHeader.tsx", import.meta.url), "utf8");
    assert.match(header, /min-h-11/);
    const shell = readFileSync(new URL("../../../src/components/site/SiteShell.tsx", import.meta.url), "utf8");
    assert.match(shell, /跳到內容/);
    const panel = readFileSync(
      new URL("../../../src/components/experience/ExperiencePanel.tsx", import.meta.url),
      "utf8",
    );
    assert.match(panel, /role="tab"/);
    assert.match(panel, /Escape/);
    assert.match(header, /mobile-nav/);
  });
});
