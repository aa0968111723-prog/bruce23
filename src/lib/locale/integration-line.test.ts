import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { publicIntegrationLine } from "./integration-line.ts";

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
      slug: "hermes-console",
      github: { url: "https://github.com/aa0968111723-prog/hermes-console", syncStatus: "failed" },
      demo: { url: "https://344.zeabur.app", status: "unavailable", embedEnabled: false },
      canva: { status: "not_configured" },
    });
    assert.match(zh, /GitHub 同步失敗/);
    assert.match(zh, /Demo 公開網址（無法嵌入）/);
    assert.doesNotMatch(zh, /GitHub failed/);
    assert.doesNotMatch(zh, /Demo unavailable/);
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
});
