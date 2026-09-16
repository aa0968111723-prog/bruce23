import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { projects } from "./projects.ts";

describe("github export media", () => {
  it("keeps every /media src on disk with honest GitHub-export captions", () => {
    const root = fileURLToPath(new URL("../../", import.meta.url));
    const exports: string[] = [];
    for (const project of projects) {
      for (const item of project.media) {
        assert.match(item.src, /^\/media\//);
        assert.equal(existsSync(`${root}public${item.src}`), true, item.src);
        if (item.src.startsWith("/media/github-exports/")) {
          exports.push(item.src);
          assert.match(item.caption ?? "", /GitHub 匯出/);
          assert.doesNotMatch(item.caption ?? "", /Canva 原作嵌入|Connect 已連線/);
        }
      }
    }
    assert.ok(exports.length >= 12);
    assert.equal(
      projects.find((item) => item.slug === "tku-zen-ai")?.media.some((item) => item.src.includes("github-exports")),
      false,
    );
    assert.equal(
      projects.find((item) => item.slug === "folio")?.media.some((item) => item.src.includes("github-exports")),
      false,
    );
  });
});
