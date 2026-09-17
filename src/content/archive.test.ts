import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { archiveItems } from "./archive.ts";
import { ARCHIVE_ITEM_IDS, archiveLocaleEn } from "./locale-en.ts";
import { notionAdapter } from "./adapters/notion.ts";

describe("archive honesty", () => {
  it("does not claim live Canva paging, original photos, or scans for SVG translations", () => {
    const combined = archiveItems
      .map((item) => [item.summary, item.originNote, item.media?.alt, item.media?.caption].join("\n"))
      .join("\n");
    assert.doesNotMatch(combined, /直接可翻頁/);
    assert.doesNotMatch(combined, /有 Canva 嵌入的會/);
    assert.doesNotMatch(combined, /Canva 原作縮圖/);
    const photo = archiveItems.find((item) => item.id === "landscape-series");
    const event = archiveItems.find((item) => item.id === "flashmob-813");
    const graphic = archiveItems.find((item) => item.id === "graphic-portfolio");
    const stroop = archiveItems.find((item) => item.id === "stroop-challenge");
    const zen = archiveItems.find((item) => item.id === "tku-zen-poster");
    assert.match(photo?.summary ?? "", /不是原作照片/);
    assert.match(photo?.summary ?? "", /SVG 轉譯/);
    assert.match(event?.summary ?? "", /不是原作照片/);
    assert.match(graphic?.summary ?? "", /不是原作掃描/);
    assert.match(stroop?.summary ?? "", /不是現場成績截圖/);
    assert.match(zen?.summary ?? "", /不是 Canva 嵌入/);
    assert.match(zen?.summary ?? "", /也不能翻頁/);
  });

  it("English archive overlays stay honest about SVG translations and no Canva paging", () => {
    const combined = ARCHIVE_ITEM_IDS.map((id) => {
      const en = archiveLocaleEn[id];
      return [en.summary, en.originNote, en.caption, en.alt].join("\n");
    }).join("\n");
    assert.doesNotMatch(combined, /directly pageable/i);
    assert.doesNotMatch(combined, /original photo embed/i);
    assert.match(archiveLocaleEn["landscape-series"].summary ?? "", /not the original photo/i);
    assert.match(archiveLocaleEn["tku-zen-poster"].summary ?? "", /cannot page/);
    assert.match(archiveLocaleEn["graphic-portfolio"].summary ?? "", /not a scan/i);
    assert.match(archiveLocaleEn["stroop-challenge"].summary ?? "", /not a live-score screenshot/i);
  });

  it("keeps archive SVG labels readable instead of garbled bytes", () => {
    const stroop = readFileSync(new URL("../../public/media/archive/stroop-challenge.svg", import.meta.url), "utf8");
    const graphic = readFileSync(new URL("../../public/media/archive/graphic-portfolio.svg", import.meta.url), "utf8");
    assert.match(stroop, /aria-label="Stroop 60s challenge translation/);
    assert.match(graphic, /aria-label="Graphic portfolio translation/);
    assert.match(stroop, /not a live score/);
    assert.match(graphic, /Drive index only/);
  });
});

describe("notion adapter", () => {
  it("fails closed: never connected and never invents pages", async () => {
    assert.equal(notionAdapter.isConnected(), false);
    assert.deepEqual(await notionAdapter.listPortfolioPages(), []);
  });
});
