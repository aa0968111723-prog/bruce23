import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  publicCanvaSourceMark,
  publicGithubStatusLabel,
  publicIntegrationLine,
  publicLiveDemoMark,
} from "./integration-line.ts";

describe("public integration line", () => {
  it("does not claim Zen GitHub is missing or that the live desk is unavailable", () => {
    const zh = publicIntegrationLine("zh", {
      slug: "tku-zen-agent",
      github: { url: null, syncStatus: "not_configured" },
      demo: { url: "https://tku-zen-agent-k7f2.zeabur.app/?mode=ask", status: "unavailable", embedEnabled: false },
      canva: { status: "not_configured" },
    });
    assert.match(zh, /GitHub 暫不公開連結/);
    assert.match(zh, /Demo 公開網址（無法嵌入）/);
    assert.match(zh, /Canva 尚未設定/);
    assert.doesNotMatch(zh, /not_configured/);
    assert.doesNotMatch(zh, /unavailable/);
    assert.doesNotMatch(zh, /還沒有公開 GitHub 來源/);
    assert.doesNotMatch(zh, /Demo unavailable/);

    const en = publicIntegrationLine("en", {
      slug: "tku-zen-agent",
      github: { url: null, syncStatus: "not_configured" },
      demo: { url: "https://tku-zen-agent-k7f2.zeabur.app/?mode=ask", status: "unavailable", embedEnabled: false },
      canva: { status: "not_configured" },
    });
    assert.match(en, /GitHub withheld pending review/);
    assert.match(en, /Demo public URL \(cannot embed\)/);
    assert.doesNotMatch(en, /not_configured|unavailable|Demo unavailable/);
  });

  it("keeps a public GitHub URL visible when hydrate failed", () => {
    const zh = publicIntegrationLine("zh", {
      slug: "cutos",
      github: { url: "https://github.com/aa0968111723-prog/CUTOS", syncStatus: "failed" },
      demo: { url: "https://cutos.zeabur.app", status: "verified", embedEnabled: true },
      canva: { status: "not_configured" },
    });
    assert.match(zh, /GitHub 公開連結（檔案樹未同步）/);
    assert.match(zh, /Demo 已驗證/);
    assert.doesNotMatch(zh, /GitHub 同步失敗/);
    assert.doesNotMatch(zh, /GitHub failed/);
    assert.doesNotMatch(zh, /Demo unavailable/);

    const en = publicIntegrationLine("en", {
      slug: "xiaocai",
      github: { url: "https://github.com/aa0968111723-prog/-1", syncStatus: "failed" },
      demo: { url: "https://untitled-5.zeabur.app", status: "verified", embedEnabled: true },
      canva: { status: "not_configured" },
    });
    assert.match(en, /GitHub public link \(file tree not synced\)/);
    assert.doesNotMatch(en, /GitHub sync failed/);

    const explorer = publicGithubStatusLabel("zh", {
      slug: "focus-challenge",
      github: { url: "https://github.com/aa0968111723-prog/ty", syncStatus: "failed" },
    });
    assert.match(explorer, /公開連結（檔案樹未同步）/);
    assert.doesNotMatch(explorer, /同步失敗|failed|not_configured/);
  });

  it("says demo is not set up only when there is no public URL", () => {
    const zh = publicIntegrationLine("zh", {
      slug: "poster-vision-ai",
      github: { url: "https://github.com/aa0968111723-prog/poster-vision-ai", syncStatus: "verified" },
      demo: { url: null, status: "unavailable", embedEnabled: false },
      canva: { status: "not_configured" },
    });
    assert.match(zh, /GitHub 已同步/);
    assert.match(zh, /Demo 尚未設定/);
    assert.doesNotMatch(zh, /公開網址/);
    assert.doesNotMatch(zh, /unavailable/);
  });

  it("does not interpolate raw CMS enums into Live Demo or Canva chrome", () => {
    const liveZh = publicLiveDemoMark("zh", {
      url: "https://cutos.zeabur.app",
      status: "verified",
      embedEnabled: true,
    });
    assert.equal(liveZh, "Live Demo · 已驗證");
    assert.doesNotMatch(liveZh, /狀態 verified|not_configured|unavailable|failed/);

    const liveEn = publicLiveDemoMark("en", {
      url: "https://untitled-5.zeabur.app",
      status: "verified",
      embedEnabled: true,
    });
    assert.equal(liveEn, "Live Demo · verified");
    assert.doesNotMatch(liveEn, /status verified|not_configured|unavailable/);

    const blockedZh = publicLiveDemoMark("zh", {
      url: "https://344.zeabur.app",
      status: "unavailable",
      embedEnabled: false,
    });
    assert.match(blockedZh, /公開網址（無法嵌入）/);
    assert.doesNotMatch(blockedZh, /unavailable|not_configured|狀態 /);

    const canvaZh = publicCanvaSourceMark("zh", { status: "not_configured" }, "public-embed");
    assert.match(canvaZh, /公開嵌入模式/);
    assert.match(canvaZh, /尚未設定/);
    assert.match(canvaZh, /未宣稱 Connect 已連線/);
    assert.doesNotMatch(canvaZh, /not_configured|狀態 not_configured|狀態 \{status\}/);

    const canvaEn = publicCanvaSourceMark("en", { status: "unavailable" }, "canva-embed");
    assert.match(canvaEn, /Canva public embed/);
    assert.match(canvaEn, /cannot embed/);
    assert.match(canvaEn, /not claiming Connect is linked/);
    assert.doesNotMatch(canvaEn, /unavailable|not_configured|status \{status\}/);
  });
});
