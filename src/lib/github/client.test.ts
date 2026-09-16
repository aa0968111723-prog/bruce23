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

  it("parses repository metadata from GitHub JSON", async () => {
    const result = await fetchPublicRepo("https://github.com/aa0968111723-prog/FrameLab", {
      fetchImpl: async (input) => {
        const url = String(input);
        if (url.includes("/readme")) return new Response("# FrameLab", { status: 200 });
        if (url.includes("/languages")) return new Response(JSON.stringify({ TypeScript: 80 }), { status: 200 });
        if (url.includes("/commits")) return new Response("[]", { status: 200 });
        if (url.includes("/git/trees")) return new Response(JSON.stringify({ tree: [] }), { status: 200 });
        return new Response(
          JSON.stringify({
            name: "FrameLab",
            description: "frame workstation",
            private: false,
            archived: false,
            default_branch: "main",
            html_url: "https://github.com/aa0968111723-prog/FrameLab",
            updated_at: "2026-09-01T00:00:00Z",
            language: "TypeScript",
            topics: ["animation"],
          }),
          { status: 200 },
        );
      },
    });
    assert.equal(result.ok, true);
    assert.equal(result.owner, "aa0968111723-prog");
    assert.equal(result.repo, "FrameLab");
    assert.equal(result.metadata?.name, "FrameLab");
    assert.equal(result.metadata?.description, "frame workstation");
    assert.equal(result.metadata?.language, "TypeScript");
    assert.equal(result.metadata?.defaultBranch, "main");
    assert.equal(result.metadata?.private, false);
    assert.equal(result.languages?.TypeScript, 80);
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

  it("treats a cached 304 as a successful tree, not HTTP failure", async () => {
    const store = new Map<string, { etag?: string; lastModified?: string; body: string }>();
    const cache = {
      async read(key: string) {
        return store.get(key) ?? null;
      },
      async write(key: string, value: { etag?: string; lastModified?: string; body: string; status: number }) {
        store.set(key, { etag: value.etag, lastModified: value.lastModified, body: value.body });
      },
    };
    const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const headers = new Headers(init?.headers);
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
      if (url.includes("/git/trees")) {
        if (headers.get("If-None-Match")) {
          return new Response(null, { status: 304, headers: { etag: '"tree"' } });
        }
        return new Response(
          JSON.stringify({ tree: [{ path: "README.md", type: "blob", size: 12 }] }),
          { status: 200, headers: { etag: '"tree"' } },
        );
      }
      if (headers.get("If-None-Match")) {
        return new Response(null, { status: 304, headers: { etag: '"repo"' } });
      }
      return new Response(
        JSON.stringify({
          name: "FrameLab",
          description: "demo",
          private: false,
          default_branch: "main",
          html_url: "https://github.com/aa0968111723-prog/FrameLab",
          topics: [],
        }),
        { status: 200, headers: { etag: '"repo"' } },
      );
    };
    const first = await fetchPublicRepo("https://github.com/aa0968111723-prog/FrameLab", { fetchImpl, cache });
    assert.equal(first.status, "verified");
    const second = await fetchPublicRepo("https://github.com/aa0968111723-prog/FrameLab", { fetchImpl, cache });
    assert.equal(second.ok, true);
    assert.equal(second.status, "verified");
    assert.ok(second.fileTree?.some((item) => item.path === "README.md"));
  });
});
