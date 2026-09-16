import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "admin-fns.ts"),
  "utf8",
);

describe("admin server functions", () => {
  it("keeps every mutation behind adminMiddleware", () => {
    const names = [
      "listAdminProjectsFn",
      "getAdminProjectFn",
      "createProjectFn",
      "saveProjectFn",
      "setPublicationFn",
      "listRevisionsFn",
      "restoreRevisionFn",
      "saveSiteSettingsFn",
      "previewGithubSyncFn",
      "applyGithubSyncFn",
      "verifyReadmeFn",
      "verifyLiveDemoFn",
      "testCanvaEmbedFn",
      "getIntegrationsOverviewFn",
      "startCanvaConnectFn",
      "disconnectCanvaFn",
    ];
    for (const name of names) {
      const idx = source.indexOf(`export const ${name}`);
      assert.notEqual(idx, -1, `${name} missing`);
      const slice = source.slice(idx, idx + 280);
      assert.match(slice, /adminMiddleware/, `${name} must use adminMiddleware`);
    }
  });

  it("does not treat all signed-in users as admin", () => {
    assert.match(source, /adminMiddleware/);
    assert.doesNotMatch(source, /mock user|demoUser|DEV_ADMIN/i);
  });
});
