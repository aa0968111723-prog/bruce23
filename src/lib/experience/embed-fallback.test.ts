import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canvaViewMode, demoViewMode } from "./embed-fallback.ts";

describe("Canva embed fallback", () => {
  it("falls back for non-Canva hosts and failed iframes", () => {
    assert.equal(canvaViewMode("https://evil.example/pwn", false), "fallback");
    assert.equal(canvaViewMode("https://www.canva.com/design/x/view?embed", true), "fallback");
    assert.equal(canvaViewMode(null, false), "fallback");
  });

  it("embeds only allowlisted Canva URLs", () => {
    assert.equal(
      canvaViewMode("https://www.canva.com/design/DAGabc/view?embed", false),
      "embed",
    );
  });
});

describe("demo iframe fallback", () => {
  it("falls back when embed is off, failed, or status failed", () => {
    assert.equal(demoViewMode({ embedEnabled: false, failed: false }), "fallback");
    assert.equal(demoViewMode({ embedEnabled: true, failed: true }), "fallback");
    assert.equal(
      demoViewMode({ embedEnabled: true, failed: false, status: "failed" }),
      "fallback",
    );
    assert.equal(demoViewMode({ embedEnabled: true, failed: false, status: "verified" }), "iframe");
  });
});
