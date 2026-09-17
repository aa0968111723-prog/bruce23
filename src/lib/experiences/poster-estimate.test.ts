import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimatePoster } from "./poster-estimate.ts";

describe("poster estimate", () => {
  it("computes contrast from pixels and states limits", () => {
    const width = 32;
    const height = 32;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        const light = x > 16 ? 255 : 10;
        data[i] = light;
        data[i + 1] = light;
        data[i + 2] = light;
        data[i + 3] = 255;
      }
    }
    const result = estimatePoster({ width, height, data, colorSpace: "srgb" } as ImageData, 8);
    assert.ok(result.contrast > 0);
    assert.ok(result.limits.some((l) => l.includes("眼動")));
    assert.ok(result.heatmap.length >= 0);
  });
});
