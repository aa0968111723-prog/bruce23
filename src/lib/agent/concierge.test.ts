import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { answerQuestion, getConciergeWelcome, SUGGESTED_QUESTIONS } from "./concierge.ts";

describe("portfolio concierge agent", () => {
  it("provides structured welcome message with quick actions", () => {
    const welcome = getConciergeWelcome();
    assert.equal(welcome.sender, "concierge");
    assert.ok(welcome.text.includes("Luminous Studio"));
    assert.ok(welcome.actions && welcome.actions.length >= 4);
    assert.ok(SUGGESTED_QUESTIONS.length >= 6);
  });

  it("answers featured projects question with all 8 core works and 17 public projects note", () => {
    const reply = answerQuestion("介紹陳柏能的 8 大精選 AI 專案");
    assert.equal(reply.sender, "concierge");
    assert.ok(reply.text.includes("AI Director OS"));
    assert.ok(reply.text.includes("FrameLab"));
    assert.ok(reply.text.includes("對稿"));
    assert.ok(reply.text.includes("PLANFORM"));
    assert.ok(reply.text.includes("100% 在線"));
    assert.ok(reply.actions && reply.actions.length > 0);
  });

  it("answers FrameLab frame repair question accurately", () => {
    const reply = answerQuestion("FrameLab 逐幀動畫修復原理是什麼？");
    assert.ok(reply.text.includes("壞幀只修壞幀"));
    assert.ok(reply.text.includes("Frame Graph"));
    assert.ok(reply.actions?.some((a) => a.href?.includes("cabin-shale")));
  });

  it("answers MCP and Hermes Agent architecture question", () => {
    const reply = answerQuestion("Hermes Agent 與 Console 的 MCP 架構");
    assert.ok(reply.text.includes("NousResearch"));
    assert.ok(reply.text.includes("344.zeabur.app"));
    assert.ok(reply.text.includes("TKU MCP"));
    assert.ok(reply.text.includes("Folio Design Bridge"));
  });

  it("explains public access and login requirements transparently", () => {
    const reply = answerQuestion("有哪些作品需要登入？如何體驗？");
    assert.ok(reply.text.includes("所有專案倉庫"));
    assert.ok(reply.text.includes("Public 公開"));
    assert.ok(reply.text.includes("Hermes Agent"));
    assert.ok(reply.text.includes("禪學社工作台"));
  });

  it("matches specific project title and slug", () => {
    const reply = answerQuestion("ai-director-os");
    assert.ok(reply.text.includes("AI Director OS"));
    assert.ok(reply.text.includes("核心產出"));
    assert.ok(reply.text.includes("GitHub 倉庫已完全公開"));
  });

  it("answers Tamkang World 3D campus pass and WebGL details", () => {
    const reply = answerQuestion("淡江世界 3D 怎麼逛？");
    assert.ok(reply.text.includes("五虎崗"));
    assert.ok(reply.text.includes("校園通行證"));
    assert.ok(reply.actions?.some((a) => a.href?.includes("forge-bloom")));
  });

  it("answers SkateHub roller skate platform features", () => {
    const reply = answerQuestion("介紹 SkateHub 直排輪平台");
    assert.ok(reply.text.includes("款式圖鑑"));
    assert.ok(reply.text.includes("輪滑的世界"));
    assert.ok(reply.actions?.some((a) => a.href?.includes("dd-k3f9")));
  });

  it("answers CUTOS video editing conversational workflow", () => {
    const reply = answerQuestion("CUTOS 對話影片剪輯是做什麼的？");
    assert.ok(reply.text.includes("對話直接剪輯"));
    assert.ok(reply.actions?.some((a) => a.href?.includes("cutos.zeabur.app")));
  });

  it("answers TKU Zen AI emotional companion features", () => {
    const reply = answerQuestion("TKU Zen AI 是做什麼的心情陪伴？");
    assert.ok(reply.text.includes("Welcome to TKU Zen AI"));
    assert.ok(reply.text.includes("確定性情緒標註引擎"));
    assert.ok(reply.actions?.some((a) => a.href?.includes("tku-zen-ai")));
  });

  it("answers full endpoint probe health and latency question", () => {
    const reply = answerQuestion("全部網站端點健康狀態與在線延遲如何？");
    assert.ok(reply.text.includes("全部 19 個端點 100% HTTP 200 OK"));
    assert.ok(reply.text.includes("淡江世界 3D"));
    assert.ok(reply.text.includes("Public 公開"));
  });

  it("gracefully falls back for unknown topics", () => {
    const reply = answerQuestion("宇宙大爆炸是哪一年發生的？");
    assert.ok(reply.text.includes("感謝您的提問"));
    assert.ok(reply.actions && reply.actions.length >= 4);
  });
});

