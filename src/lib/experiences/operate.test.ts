import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyFolioCommand,
  folioAudit,
  initialFolioDoc,
  repairProblemFrame,
} from "./operate.ts";
import type { TimelineFrame } from "../cms/schema.ts";

describe("portfolio operate helpers", () => {
  it("repairs only the problem frame by blending neighbors", () => {
    const frames: TimelineFrame[] = [
      { i: 0, kind: "key", x: 20, y: 100 },
      { i: 1, kind: "generated", x: 80, y: 40, problem: true },
      { i: 2, kind: "key", x: 140, y: 120 },
    ];
    const next = repairProblemFrame(frames, 1);
    assert.equal(next[1]?.problem, false);
    assert.equal(next[1]?.x, 80);
    assert.equal(next[1]?.y, 110);
    assert.equal(frames[1]?.problem, true);
    assert.deepEqual(repairProblemFrame(frames, 0), frames);
  });

  it("applies Folio commands onto one artboard of the same document", () => {
    const start = initialFolioDoc();
    const afterText = applyFolioCommand(start, "board-a", "insert-text", "指令", "n-cmd");
    const afterShape = applyFolioCommand(afterText, "board-a", "add-shape", "", "n-box");
    const boardA = afterShape.find((board) => board.id === "board-a");
    const boardB = afterShape.find((board) => board.id === "board-b");
    assert.equal(boardA?.nodes.some((node) => node.id === "n-cmd" && node.kind === "text"), true);
    assert.equal(boardA?.nodes.some((node) => node.id === "n-box" && node.kind === "shape"), true);
    assert.equal(boardB?.nodes.length, start[1]?.nodes.length);
    assert.equal(folioAudit(boardA).overflow, false);
    const placed = applyFolioCommand(start, "board-a", "insert-text", "點放", "n-click", { x: 61, y: 44 });
    const clicked = placed.find((board) => board.id === "board-a")?.nodes.find((node) => node.id === "n-click");
    assert.equal(clicked?.x, 61);
    assert.equal(clicked?.y, 44);
    const long = applyFolioCommand(start, "board-b", "insert-text", "超長標題溢出了", "n-long");
    assert.equal(folioAudit(long.find((board) => board.id === "board-b")).overflow, true);
  });
});
