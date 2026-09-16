import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canvaEmbedAllowed,
  parseCanvaEmbedSnippet,
  parseCanvaShareUrl,
} from "./urls.ts";

describe("Canva URL allowlist", () => {
  it("accepts canva.com design links", () => {
    const parsed = parseCanvaShareUrl(
      "https://www.canva.com/design/DAGabc123/view?utm_content=DAGabc123",
    );
    assert.ok(parsed);
    assert.equal(parsed?.designId, "DAGabc123");
    assert.match(parsed!.embedUrl, /embed/);
    assert.equal(canvaEmbedAllowed(parsed!.embedUrl), true);
  });

  it("rejects arbitrary hosts", () => {
    assert.equal(parseCanvaShareUrl("https://evil.example/canva"), null);
    assert.equal(parseCanvaShareUrl("http://www.canva.com/design/x/view"), null);
    assert.equal(canvaEmbedAllowed("https://example.com"), false);
  });

  it("parses iframe snippets but only keeps Canva src", () => {
    const ok = parseCanvaEmbedSnippet(
      '<iframe src="https://www.canva.com/design/DAGxyz/view?embed"></iframe>',
    );
    assert.ok(ok);
    const bad = parseCanvaEmbedSnippet(
      '<iframe src="https://evil.test/pwn"></iframe><script>alert(1)</script>',
    );
    assert.equal(bad, null);
  });
});
