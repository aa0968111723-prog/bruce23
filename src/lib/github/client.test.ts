import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { diffGithubFields, fetchPublicGithubSnapshot } from "./client.ts";

function jsonRes(status: number, body: unknown, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...extra },
  });
}

describe("fetchPublicGithubSnapshot", () => {
  it("parses metadata, languages, topics, commit, tree", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      if (url.endsWith("/ai_os") && !url.includes("/contents") && !url.includes("/commits")) {
        return jsonRes(200, {
          html_url: "https://github.com/aa0968111723-prog/ai_os",
          description: "AI Director OS",
          homepage: "https://ai-os-ten.vercel.app",
          default_branch: "main",
          updated_at: "2026-09-01T00:00:00Z",
          private: false,
          archived: false,
        });
      }
      if (url.endsWith("/languages")) return jsonRes(200, { TypeScript: 10, Python: 2 });
      if (url.endsWith("/topics")) return jsonRes(200, { names: ["ai", "multimodal"] });
      if (url.includes("/commits")) {
        return jsonRes(200, [
          {
            sha: "abcdef123456",
            html_url: "https://github.com/aa0968111723-prog/ai_os/commit/abcdef123456",
            commit: { message: "docs: roadmap\n\nmore", committer: { date: "2026-09-01T00:00:00Z" } },
          },
        ]);
      }
      if (url.endsWith("/readme")) {
        return jsonRes(200, {
          encoding: "base64",
          content: Buffer.from("# AI Director OS\n團隊向作業系統").toString("base64"),
        });
      }
      if (url.includes("/contents")) {
        return jsonRes(200, [
          { name: "client", type: "dir", html_url: "https://github.com/aa0968111723-prog/ai_os/tree/main/client" },
          { name: "README.md", type: "file", html_url: "https://github.com/aa0968111723-prog/ai_os/blob/main/README.md" },
          { name: "node_modules", type: "dir" },
        ]);
      }
      return jsonRes(404, { message: "no" });
    };

    const result = await fetchPublicGithubSnapshot("aa0968111723-prog", "ai_os", {
      fetch: fetchImpl,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.snapshot.description, "AI Director OS");
    assert.deepEqual(result.snapshot.topics, ["ai", "multimodal"]);
    assert.equal(result.snapshot.latestCommit?.sha, "abcdef1");
    assert.equal(result.snapshot.fileTree.some((n) => n.path === "node_modules"), false);
    assert.ok(result.snapshot.readme?.includes("作業系統"));
  });

  it("surfaces README 404 as empty, not fake success body", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      if (url.endsWith("/missing") && !url.includes("contents") && !url.includes("commits") && !url.includes("readme")) {
        return jsonRes(200, {
          html_url: "https://github.com/aa0968111723-prog/missing",
          default_branch: "main",
          private: false,
        });
      }
      if (url.endsWith("/readme")) return jsonRes(404, { message: "Not Found" });
      if (url.endsWith("/languages")) return jsonRes(200, {});
      if (url.endsWith("/topics")) return jsonRes(200, { names: [] });
      if (url.includes("/commits")) return jsonRes(200, []);
      if (url.includes("/contents")) return jsonRes(200, []);
      return jsonRes(404, {});
    };
    const result = await fetchPublicGithubSnapshot("aa0968111723-prog", "missing", {
      fetch: fetchImpl,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.snapshot.readme, null);
  });

  it("records rate-limit instead of success", async () => {
    const fetchImpl: typeof fetch = async () =>
      jsonRes(403, { message: "API rate limit exceeded" }, { "x-ratelimit-remaining": "0" });
    const result = await fetchPublicGithubSnapshot("aa0968111723-prog", "ai_os", {
      fetch: fetchImpl,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.rateLimited, true);
    assert.equal(result.status, "failed");
  });
});

describe("diffGithubFields", () => {
  it("does not include narrative copy fields", () => {
    const changes = diffGithubFields(
      { title: "舊標題", github_branch: "main" },
      {
        owner: "o",
        repo: "r",
        htmlUrl: "https://github.com/o/r",
        description: "d",
        homepage: null,
        defaultBranch: "dev",
        updatedAt: "t",
        isPrivate: false,
        archived: false,
        topics: [],
        languages: {},
        readme: "x",
        latestCommit: null,
        fileTree: [],
      },
    );
    assert.equal(changes.some((c) => c.field === "title"), false);
    assert.ok(changes.some((c) => c.field === "github_branch"));
  });
});
