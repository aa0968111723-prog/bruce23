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
    assert.ok(exports.length >= 14);
    const folio = projects.find((item) => item.slug === "folio");
    const zen = projects.find((item) => item.slug === "tku-zen-ai");
    const folioExport = folio?.media.find((item) => item.src === "/media/github-exports/folio/og.jpg");
    const zenExport = zen?.media.find((item) => item.src === "/media/github-exports/tku-zen-ai/club-illustration.jpg");
    assert.ok(folioExport);
    assert.ok(zenExport);
    const folioStudio = folio?.media.find((item) => item.src === "/media/studio/folio-editor.svg");
    const zenStudio = zen?.media.find((item) => item.src === "/media/studio/tku-zen-chat.svg");
    assert.ok(folioStudio);
    assert.ok(zenStudio);
    assert.match(folioStudio?.caption ?? "", /光域工作室重建/);
    assert.match(folioStudio?.caption ?? "", /不是產品操作截圖/);
    assert.match(zenStudio?.caption ?? "", /亮色轉譯|不是產品操作截圖/);
    assert.match(zenStudio?.caption ?? "", /不是產品操作截圖|不是產品截圖|tku-zen-ai 沒有對話操作 PNG/);
    assert.match(folioExport?.caption ?? "", /分享卡/);
    assert.match(folioExport?.caption ?? "", /不是 Folio 編輯器操作截圖/);
    assert.match(zenExport?.caption ?? "", /社團插畫/);
    assert.match(zenExport?.caption ?? "", /不是 tku-zen-ai 對話截圖/);
  });
});
