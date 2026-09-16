import { useRef, useState } from "react";

type Region = { id: string; label: string; x: number; y: number; w: number; h: number };

type Analysis = {
  areaBright: number;
  contrast: number;
  textRegions: number;
  note: string;
  regions: Region[];
};

function analyze(image: HTMLImageElement, canvas: HTMLCanvasElement): Analysis {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { areaBright: 0, contrast: 0, textRegions: 0, note: "畫布不可用", regions: [] };
  const w = 160;
  const h = Math.max(1, Math.round((image.height / image.width) * w));
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(image, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  let sum = 0;
  let sumSq = 0;
  let bright = 0;
  const rowEdges = new Array(h).fill(0);
  for (let y = 0; y < h; y += 1) {
    let edge = 0;
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      sum += l;
      sumSq += l * l;
      if (l > 200) bright += 1;
      if (x > 0) {
        const j = (y * w + x - 1) * 4;
        const prev = 0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2];
        if (Math.abs(l - prev) > 42) edge += 1;
      }
    }
    rowEdges[y] = edge;
  }
  const n = w * h;
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  const contrast = Math.sqrt(Math.max(0, variance));
  const textRows = rowEdges
    .map((count, y) => ({ y, count }))
    .filter((row) => row.count > w * 0.18);
  const regions: Region[] = [
    { id: "center", label: "中央顯著性（推估）", x: 28, y: 22, w: 44, h: 48 },
    { id: "bright", label: "高亮面積（推估）", x: 8, y: 8, w: 28, h: 22 },
  ];
  if (textRows.length) {
    const first = textRows[0].y / h;
    const last = textRows[textRows.length - 1].y / h;
    regions.push({
      id: "text",
      label: "文字帶（推估）",
      x: 10,
      y: Math.round(first * 100),
      w: 80,
      h: Math.max(8, Math.round((last - first) * 100)),
    });
  }
  return {
    areaBright: Math.round((bright / n) * 100),
    contrast: Math.round(contrast),
    textRegions: textRows.length,
    note: "熱圖與區域是像素對比推估，不是眼動追蹤。",
    regions,
  };
}

export function PosterVision() {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heatRef = useRef<HTMLCanvasElement>(null);
  const [src, setSrc] = useState("/media/samples/poster.svg");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  function run() {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    const heat = heatRef.current;
    if (!image || !canvas) return;
    const result = analyze(image, canvas);
    setAnalysis(result);
    if (heat) {
      const ctx = heat.getContext("2d");
      if (!ctx) return;
      heat.width = canvas.width;
      heat.height = canvas.height;
      const srcData = canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height);
      if (!srcData) return;
      const out = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < srcData.data.length; i += 4) {
        const l = 0.2126 * srcData.data[i] + 0.7152 * srcData.data[i + 1] + 0.0722 * srcData.data[i + 2];
        const cx = ((i / 4) % canvas.width) / canvas.width - 0.5;
        const cy = Math.floor(i / 4 / canvas.width) / canvas.height - 0.5;
        const center = 1 - Math.min(1, Math.hypot(cx, cy) * 1.6);
        const score = Math.min(255, (255 - l) * 0.45 + center * 140);
        out.data[i] = 255;
        out.data[i + 1] = 80 + score * 0.2;
        out.data[i + 2] = 40;
        out.data[i + 3] = score * 0.55;
      }
      ctx.putImageData(out, 0, 0);
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">
        上傳或使用樣本海報。面積、對比、文字帶是本機像素運算。熱圖與框選區域是顯著性推估，不是眼動儀。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card">
          上傳海報
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setSrc(URL.createObjectURL(file));
              setAnalysis(null);
            }}
          />
        </label>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => {
            setSrc("/media/samples/poster.svg");
            setAnalysis(null);
          }}
        >
          樣本海報
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          onClick={run}
        >
          分析
        </button>
      </div>
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-surface shadow-card">
        <img ref={imgRef} src={src} alt="待分析海報" className="w-full" onLoad={() => setAnalysis(null)} />
        <canvas ref={heatRef} className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply" />
        {analysis?.regions.map((region) => (
          <div
            key={region.id}
            className="pointer-events-none absolute rounded-md border border-mint/80 bg-mint/10 px-1 text-[10px] text-ink"
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.w}%`,
              height: `${region.h}%`,
            }}
          >
            {region.label}
          </div>
        ))}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {analysis ? (
        <ul className="mt-4 grid gap-2 text-sm">
          <li className="rounded-xl bg-surface px-4 py-3 shadow-card">高亮面積約 {analysis.areaBright}%（推估）</li>
          <li className="rounded-xl bg-surface px-4 py-3 shadow-card">對比（標準差）{analysis.contrast}（推估）</li>
          <li className="rounded-xl bg-surface px-4 py-3 shadow-card">疑似文字列 {analysis.textRegions} 帶（推估）</li>
          <li className="rounded-xl bg-surface-blue px-4 py-3 text-muted">{analysis.note}</li>
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">按分析後才會畫熱圖。計算有解析度上限，細節會被縮小。</p>
      )}
    </div>
  );
}
