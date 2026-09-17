import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("public CMS surfaces", () => {
  it("only selects published rows", () => {
    const queries = readFileSync(join(root, "lib/cms/queries.ts"), "utf8");
    assert.match(queries, /publication_status = 'published'/);
    assert.match(
      queries,
      /select slug from projects where publication_status = 'published'/,
    );
  });

  it("does not expose integration secrets on public fns", () => {
    const fns = readFileSync(join(root, "lib/cms/public-fns.ts"), "utf8");
    assert.doesNotMatch(fns, /integration_secrets/);
    assert.doesNotMatch(fns, /GITHUB_READ_TOKEN/);
    assert.doesNotMatch(fns, /CANVA_CLIENT_SECRET/);
    assert.doesNotMatch(fns, /payload_encrypted/);
  });

  it("admin middleware verifies origin via authMiddleware", () => {
    const mw = readFileSync(join(root, "lib/cms/admin-middleware.ts"), "utf8");
    assert.match(mw, /authMiddleware/);
    const auth = readFileSync(join(root, "lib/auth/middleware.ts"), "utf8");
    assert.match(auth, /assertSameSiteRequest/);
  });
});
