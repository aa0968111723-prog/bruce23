import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seedProjects } from "./seed-data.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

describe("admin auth contracts", () => {
  it("unauthenticated visitors are redirected away from admin shell", () => {
    const shell = read("src/components/admin/AdminShell.tsx");
    assert.match(shell, /RedirectToSignIn/);
    assert.match(shell, /沒有後台權限/);
  });

  it("admin mutation server functions use authMiddleware", () => {
    const fns = read("src/lib/portfolio/cms-fns.ts");
    const mutations = [
      "createAdminProjectFn",
      "updateAdminProjectFn",
      "saveDraftProjectFn",
      "publishProjectFn",
      "unpublishProjectFn",
      "applyGithubSyncFn",
      "verifyDemoFn",
      "verifyCanvaFn",
    ];
    for (const name of mutations) {
      const idx = fns.indexOf(`export const ${name}`);
      assert.ok(idx >= 0, name);
      const slice = fns.slice(idx, idx + 280);
      assert.match(slice, /authMiddleware/, name);
    }
  });

  it("public reads do not use authMiddleware", () => {
    const pub = read("src/lib/portfolio/public-fns.ts");
    assert.doesNotMatch(pub, /authMiddleware/);
  });
});

describe("seed uniqueness", () => {
  it("does not emit duplicate slugs", () => {
    const slugs = seedProjects().map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    assert.equal(slugs.length, 8);
  });
});

describe("keyboard and reduced motion affordances", () => {
  it("experience tabs are keyboard operable", () => {
    const panel = read("src/components/experience/ExperiencePanel.tsx");
    assert.match(panel, /ArrowRight/);
    assert.match(panel, /role="tablist"/);
  });
  it("css honors prefers-reduced-motion", () => {
    const css = read("src/styles.css");
    assert.match(css, /prefers-reduced-motion/);
    assert.match(css, /overflow-x: hidden/);
  });
});
