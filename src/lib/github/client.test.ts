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

  it("fetches the git tree by commit tree sha when present", async () => {
    const calls: string[] = [];
    const result = await fetchPublicRepo("https://github.com/aa0968111723-prog/FrameLab", {
      fetchImpl: async (input) => {
        const url = String(input);
        calls.push(url);
        if (url.includes("/readme")) return new Response("# FrameLab", { status: 200 });
        if (url.includes("/languages")) return new Response("{}", { status: 200 });
        if (url.includes("/commits")) {
          return new Response(
            JSON.stringify([
              {
                sha: "abc",
                html_url: "https://github.com/aa0968111723-prog/FrameLab/commit/abc",
                commit: {
                  message: "docs",
                  author: { date: "2026-09-01T00:00:00Z" },
                  tree: { sha: "treesha123" },
                },
              },
            ]),
            { status: 200 },
          );
        }
        if (url.includes("/git/trees/treesha123")) {
          return new Response(
            JSON.stringify({
              tree: [
                { path: ".grok/a.md", type: "blob", size: 1 },
                { path: "README.md", type: "blob", size: 12 },
                { path: "src/lib/domain/timeline-engine.ts", type: "blob", size: 40 },
              ],
            }),
            { status: 200 },
          );
        }
        if (url.includes("/git/trees/")) return new Response(JSON.stringify({ tree: [] }), { status: 200 });
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
    assert.ok(calls.some((url) => url.includes("/git/trees/treesha123")));
    assert.ok(result.fileTree?.some((item) => item.path === "README.md"));
    assert.ok(result.fileTree?.some((item) => item.path.startsWith("src/")));
  });

  it("does not treat a failed tree fetch as an empty verified tree", async () => {
    const result = await fetchPublicRepo("https://github.com/aa0968111723-prog/FrameLab", {
      fetchImpl: async (input) => {
        const url = String(input);
        if (url.includes("/readme")) return new Response("# FrameLab", { status: 200 });
        if (url.includes("/languages")) return new Response("{}", { status: 200 });
        if (url.includes("/commits")) {
          return new Response(
            JSON.stringify([
              {
                sha: "abc",
                html_url: "https://github.com/aa0968111723-prog/FrameLab/commit/abc",
                commit: {
                  message: "docs",
                  author: { date: "2026-09-01T00:00:00Z" },
                  tree: { sha: "treesha123" },
                },
              },
            ]),
            { status: 200 },
          );
        }
        if (url.includes("/git/trees")) return new Response("missing", { status: 404 });
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
    assert.equal(result.status, "stale");
    assert.equal(result.fileTree, undefined);
    assert.notEqual(result.status, "verified");
  });
});
