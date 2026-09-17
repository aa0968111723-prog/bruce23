import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { keepLastMatches } from "./keep-last.ts";

type FakeNode = {
  id: string;
  removed: boolean;
  remove: () => void;
};

function fakeRoot(ids: string[]): { root: ParentNode; nodes: FakeNode[] } {
  const nodes: FakeNode[] = ids.map((id) => {
    const node: FakeNode = {
      id,
      removed: false,
      remove() {
        node.removed = true;
      },
    };
    return node;
  });
  const root = {
    querySelectorAll(selector: string) {
      if (selector !== "[data-luminous-shell]") return [] as unknown as NodeListOf<Element>;
      return nodes.filter((node) => !node.removed) as unknown as NodeListOf<Element>;
    },
  };
  return { root: root as unknown as ParentNode, nodes };
}

describe("keepLastMatches", () => {
  it("removes earlier copies and keeps the last node", () => {
    const { root, nodes } = fakeRoot(["ssr", "client"]);
    const removed = keepLastMatches(root, "[data-luminous-shell]");
    assert.equal(removed, 1);
    assert.equal(nodes[0]?.removed, true);
    assert.equal(nodes[1]?.removed, false);
    assert.equal(nodes[1]?.id, "client");
  });

  it("is a no-op when a single match exists", () => {
    const { root, nodes } = fakeRoot(["only"]);
    assert.equal(keepLastMatches(root, "[data-luminous-shell]"), 0);
    assert.equal(nodes[0]?.removed, false);
  });
});
