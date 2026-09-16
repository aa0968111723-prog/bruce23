import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectIntent, zenReply } from "./zen.ts";

describe("local zen engine", () => {
  it("is deterministic", () => {
    const a = zenReply("我考試好焦慮");
    const b = zenReply("我考試好焦慮");
    assert.deepEqual(a, b);
    assert.equal(a.local, true);
    assert.equal(detectIntent("我考試好焦慮"), "stress");
  });

  it("does not pretend to be a cloud LLM", () => {
    const reply = zenReply("hello");
    assert.equal(reply.local, true);
    assert.ok(reply.intent);
  });
});
