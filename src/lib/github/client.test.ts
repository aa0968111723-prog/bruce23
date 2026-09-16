import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fetchPublicRepo } from "./client.server.ts";

describe("github client honesty", () => {
  it("maps 429 to a failed rate-limit state", async () => {
    const result = await fetchPublicRepo("https://github.com/aa0968111723-prog/FrameLab", {
      fetchImpl: async () => new Response("rate", { status: 429 }),
    });
    assert.equal(result.ok, false);
    assert.equal(result.errorCode, "rate_limited");
    assert.equal(result.status, "failed");
  });

  it("maps missing readme to a fail state without fake text", async () => {
    const result = await fetchPublicRepo("https://github.com/aa0968111723-prog/FrameLab", {
      fetchImpl: async (input) => {
        const url = String(input);
        if (url.includes("/readme")) return new Response("missing", { status: 404 });
        if (url.includes("/languages")) return new Response("{}", { status: 200 });
        if (url.includes("/commits")) return new Response("[]", { status: 200 });
        if (url.includes("/git/trees")) return new Response(JSON.stringify({ tree: [] }), { status: 200 });
        return new Response(
          JSON.stringify({
            name: "FrameLab",
            description: "demo",
            private: false,
            default_branch: "main",
            html_url: "https://github.com/aa0968111723-prog/FrameLab",
            topics: [],
          }),
          { status: 200 },
        );
      },
    });
    assert.equal(result.ok, true);
    assert.equal(result.readme, null);
    assert.match(result.readmeError ?? "", /README/);
  });

  it("does not invent metadata for invalid urls", async () => {
    const result = await fetchPublicRepo("not-a-url");
    assert.equal(result.ok, false);
    assert.equal(result.errorCode, "invalid_url");
  });
});
