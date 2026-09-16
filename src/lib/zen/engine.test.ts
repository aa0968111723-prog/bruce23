import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { zenReply } from "./engine.ts";

describe("tku zen local engine", () => {
  it("is deterministic and labels stress intent", () => {
    const a = zenReply("I feel stressed about my exams");
    const b = zenReply("I feel stressed about my exams");
    assert.equal(a.intent, "stress");
    assert.deepEqual(a, b);
  });
});
