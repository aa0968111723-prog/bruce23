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

  it("gracefully falls back for unknown topics", () => {
    const reply = answerQuestion("宇宙大爆炸是哪一年發生的？");
    assert.ok(reply.text.includes("感謝您的提問"));
    assert.ok(reply.actions && reply.actions.length >= 4);
  });
});
