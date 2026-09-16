import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { probeLiveDemo } from "./probe.ts";

describe("probeLiveDemo", () => {
  it("marks iframe-denied sites as reachable but not embeddable", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(null, {
        status: 200,
        headers: { "x-frame-options": "DENY" },
      });
    const result = await probeLiveDemo("https://ai-os-ten.vercel.app", fetchImpl);
    assert.equal(result.ok, true);
    assert.equal(result.embeddable, false);
    assert.match(result.error ?? "", /拒絕被嵌入/);
  });

  it("rejects localhost", async () => {
    const result = await probeLiveDemo("http://127.0.0.1:3000");
    assert.equal(result.ok, false);
    assert.match(result.error ?? "", /內網|本機/);
  });
});
