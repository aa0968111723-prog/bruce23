import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CANVA_FIXTURE_DESIGN_ID,
  CANVA_FIXTURE_EMBED_URL,
  CANVA_FIXTURE_PAGE_IDS,
  CANVA_FIXTURE_SHARE_URL,
  canvaEmbedSrc,
  canvaOpenOriginalUrl,
  evaluateCanvaEmbedTest,
  parseCanvaPageIds,
} from "./embed.ts";
import { parseCanvaDesign } from "./parse.ts";

describe("canva embed fixtures", () => {
  it("parses a syntactically valid canva.com/design URL without claiming a live design", () => {
    const parsed = parseCanvaDesign(CANVA_FIXTURE_SHARE_URL);
    assert.equal(parsed?.designId, CANVA_FIXTURE_DESIGN_ID);
    assert.equal(parsed?.embedUrl, CANVA_FIXTURE_EMBED_URL);
    assert.equal(parsed?.shareUrl.includes("/view"), true);
  });

  it("builds page-switcher embed src from an allowlisted URL", () => {
    const cover = canvaEmbedSrc(CANVA_FIXTURE_EMBED_URL, CANVA_FIXTURE_PAGE_IDS[0]);
    const page2 = canvaEmbedSrc(CANVA_FIXTURE_EMBED_URL, CANVA_FIXTURE_PAGE_IDS[1]);
    assert.equal(cover, CANVA_FIXTURE_EMBED_URL);
    assert.ok(page2.includes("page=page-2"));
    assert.deepEqual(parseCanvaPageIds("cover, page-2"), CANVA_FIXTURE_PAGE_IDS);
  });

  it("does not mark a syntactically valid share URL as verified", () => {
    const result = evaluateCanvaEmbedTest(CANVA_FIXTURE_SHARE_URL);
    assert.equal(result.status, "pending");
    assert.equal(result.status === "pending" && result.liveProbe, false);
    assert.equal(result.status === "pending" && result.parsed, true);
    const html = evaluateCanvaEmbedTest(`<iframe src="${CANVA_FIXTURE_EMBED_URL}"></iframe>`);
    assert.equal(html.status, "pending");
    const denied = evaluateCanvaEmbedTest("https://evil.example/design/DAGfake/view");
    assert.equal(denied.status, "failed");
  });

  it("uses a /d/ short URL as the original link without treating it as an embed", () => {
    assert.equal(
      canvaOpenOriginalUrl("https://www.canva.com/d/ysK5sYZisVEjZFe"),
      "https://www.canva.com/d/ysK5sYZisVEjZFe",
    );
    assert.equal(canvaOpenOriginalUrl(CANVA_FIXTURE_SHARE_URL), "https://www.canva.com/design/DAGfixtureEmbedShape/view");
  });
});
