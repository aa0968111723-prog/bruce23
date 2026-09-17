export type PosterAnalysis = {
  width: number;
  height: number;
  contrast: number;
  meanLuma: number;
  textLikeRatio: number;
  heatmap: number[];
  limits: string[];
};

export function analyzePosterPixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): PosterAnalysis {
  const bins = 16;
  const heatmap = Array.from({ length: bins * bins }, () => 0);
  const binW = width / bins;
  const binH = height / bins;
  let sum = 0;
  let min = 255;
  let max = 0;
  let textLike = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      sum += luma;
      if (luma < min) min = luma;
      if (luma > max) max = luma;
      const bx = Math.min(bins - 1, Math.floor(x / binW));
      const by = Math.min(bins - 1, Math.floor(y / binH));
      heatmap[by * bins + bx] += luma;
      if (x + 1 < width) {
        const j = (y * width + x + 1) * 4;
        const luma2 = 0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2];
        if (Math.abs(luma - luma2) > 40) textLike += 1;
      }
    }
  }
  const pixels = width * height;
  const maxBin = Math.max(...heatmap, 1);
  return {
    width,
    height,
    contrast: (max - min) / 255,
    meanLuma: sum / pixels / 255,
    textLikeRatio: textLike / pixels,
    heatmap: heatmap.map((value) => value / maxBin),
    limits: [
      "熱圖是對比與面積的推估，不是眼動追蹤。",
      "沒有雲端視覺模型時，不會做 OCR 語意標籤。",
      "分數只描述這次像素計算，不是成效保證。",
    ],
  };
}
