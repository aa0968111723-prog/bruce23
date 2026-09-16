import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GITHUB_AUTO_FIELDS,
  GITHUB_NARRATIVE_FIELDS,
  parseGithubRepoUrl,
} from "./parse.ts";

describe("parseGithubRepoUrl", () => {
  it("parses https and git urls", () => {
    const a = parseGithubRepoUrl("https://github.com/aa0968111723-prog/ai_os");
    assert.deepEqual(a, {
      owner: "aa0968111723-prog",
      repo: "ai_os",
      htmlUrl: "https://github.com/aa0968111723-prog/ai_os",
    });
    const b = parseGithubRepoUrl("git@github.com:aa0968111723-prog/FrameLab.git");
    assert.equal(b?.repo, "FrameLab");
    const c = parseGithubRepoUrl(
      "https://github.com/aa0968111723-prog/poster-vision-ai.git",
    );
    assert.equal(c?.repo, "poster-vision-ai");
  });

  it("rejects non-GitHub and junk", () => {
    assert.equal(parseGithubRepoUrl("https://gitlab.com/x/y"), null);
    assert.equal(parseGithubRepoUrl("javascript:alert(1)"), null);
    assert.equal(parseGithubRepoUrl("https://github.com/only-owner"), null);
    assert.equal(parseGithubRepoUrl("https://evil.com/github.com/a/b"), null);
  });
});

describe("sync field split", () => {
  it("never auto-updates owner narrative fields", () => {
    for (const field of GITHUB_NARRATIVE_FIELDS) {
      assert.equal(
        (GITHUB_AUTO_FIELDS as readonly string[]).includes(field),
        false,
        field,
      );
    }
  });
});
