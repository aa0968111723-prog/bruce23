import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CANVA_FIXTURE_DESIGN_ID,
  CANVA_FIXTURE_EMBED_URL,
  CANVA_FIXTURE_PAGE_IDS,
  CANVA_FIXTURE_SHARE_URL,
  canvaEmbedSrc,
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
});
