import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { nextIndex } from "./roving.ts";

describe("keyboard roving", () => {
  it("wraps left and right", () => {
    assert.equal(nextIndex(6, 0, -1), 5);
    assert.equal(nextIndex(6, 5, 1), 0);
  });
});

describe("reduced motion", () => {
  it("disables decorative motion in CSS", () => {
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../styles.css"),
      "utf8",
    );
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
    assert.match(css, /\.relation-space/);
  });
});

describe("mobile layout contract", () => {
  it("keeps page-level overflow-x hidden", () => {
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../styles.css"),
      "utf8",
    );
    assert.match(css, /overflow-x:\s*hidden/);
  });
});
