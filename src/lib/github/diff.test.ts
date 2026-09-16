import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { githubSyncDiff, NARRATIVE_FIELDS_NEVER_SYNCED } from "./diff.ts";

describe("github sync diff", () => {
  it("compares current vs incoming metadata without narrative fields", () => {
    const rows = githubSyncDiff(
      {
        github_url: "https://github.com/aa0968111723-prog/ai_os",
        github_owner: "aa0968111723-prog",
        github_repo: "ai_os",
        github_branch: "main",
        github_readme: "old readme",
        github_metadata: { description: "old", homepage: null },
        github_topics: [],
        github_latest_commit: { sha: "aaa1111", message: "old" },
      },
      {
        github_url: "https://github.com/aa0968111723-prog/ai_os",
        github_owner: "aa0968111723-prog",
        github_repo: "ai_os",
        github_branch: "main",
        github_readme: "new readme from GitHub",
        github_metadata: { description: "AI Director OS", homepage: "https://ai-os-ten.vercel.app" },
        github_topics: ["ai"],
        github_latest_commit: { sha: "bbb2222", message: "docs" },
      },
    );
    assert.ok(rows.some((row) => row.field === "description" && row.changed));
    assert.ok(rows.some((row) => row.field === "homepage" && row.incoming.includes("ai-os-ten.vercel.app")));
    assert.ok(rows.some((row) => row.field === "readme" && row.changed));
    for (const field of NARRATIVE_FIELDS_NEVER_SYNCED) {
      assert.equal(
        rows.some((row) => row.field === field),
        false,
        `diff must not include narrative field ${field}`,
      );
    }
  });
});
