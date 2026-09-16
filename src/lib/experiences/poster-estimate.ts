export type Region = {
  id: string;
  kind: "contrast" | "text-like" | "face-like";
  x: number;
  y: number;
  w: number;
  h: number;
  area: number;
  score: number;
};

export type PosterEstimate = {
  width: number;
  height: number;
  regions: Region[];
  heatmap: Array<{ x: number; y: number; v: number }>;
  contrast: number;
  textAreaRatio: number;
  limits: string[];
};

function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Real pixel math on ImageData. Not eye-tracking. */
export function estimatePoster(image: ImageData, cell = 16): PosterEstimate {
  const { width, height, data } = image;
  const cols = Math.max(1, Math.floor(width / cell));
  const rows = Math.max(1, Math.floor(height / cell));
  const grid: number[] = [];
  let contrastAcc = 0;
  for (let gy = 0; gy < rows; gy += 1) {
    for (let gx = 0; gx < cols; gx += 1) {
      let min = 255;
      let max = 0;
      let sum = 0;
      let n = 0;
      for (let y = gy * cell; y < Math.min(height, (gy + 1) * cell); y += 1) {
        for (let x = gx * cell; x < Math.min(width, (gx + 1) * cell); x += 1) {
          const i = (y * width + x) * 4;
          const l = luminance(data[i], data[i + 1], data[i + 2]);
          min = Math.min(min, l);
          max = Math.max(max, l);
          sum += l;
          n += 1;
        }
      }
      const c = n ? max - min : 0;
      contrastAcc += c;
      grid.push(n ? sum / n : 0);
      void c;
    }
  }

  const heatmap: PosterEstimate["heatmap"] = [];
  const regions: Region[] = [];
  for (let gy = 0; gy < rows; gy += 1) {
    for (let gx = 0; gx < cols; gx += 1) {
      const idx = gy * cols + gx;
      const here = grid[idx] ?? 0;
      const neighbors = [
        grid[idx - 1],
        grid[idx + 1],
        grid[idx - cols],
        grid[idx + cols],
      ].filter((v) => typeof v === "number") as number[];
      const localVar =
        neighbors.reduce((acc, v) => acc + Math.abs(v - here), 0) /
        Math.max(1, neighbors.length);
      const v = Math.min(1, localVar / 80);
      if (v > 0.22) {
        heatmap.push({
          x: (gx + 0.5) / cols,
          y: (gy + 0.5) / rows,
          v,
        });
      }
      if (v > 0.45) {
        const area = (cell * cell) / (width * height);
        regions.push({
          id: `r-${gx}-${gy}`,
          kind: v > 0.7 ? "text-like" : "contrast",
          x: gx / cols,
          y: gy / rows,
          w: 1 / cols,
          h: 1 / rows,
          area,
          score: v,
        });
      }
    }
  }

  const textAreaRatio = regions
    .filter((r) => r.kind === "text-like")
    .reduce((acc, r) => acc + r.area, 0);

  return {
    width,
    height,
    regions: regions.slice(0, 24),
    heatmap: heatmap.sort((a, b) => b.v - a.v).slice(0, 48),
    contrast: contrastAcc / Math.max(1, rows * cols) / 255,
    textAreaRatio,
    limits: [
      "熱圖是對比變化的推估，不是眼動儀。",
      "文字區只看高對比橫向區塊，沒有 OCR。",
      "沒有呼叫雲端視覺模型。",
    ],
  };
}
