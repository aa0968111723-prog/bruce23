import { useRef, useState } from "react";

type Region = { label: string; x: number; y: number; w: number; h: number; contrast: number };

const SAMPLE = "/media/covers/poster-vision-ai.jpg";

function analyze(image: HTMLImageElement): Region[] {
  const canvas = document.createElement("canvas");
  const w = 160;
  const h = 120;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(image, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const cells: Region[] = [];
  const gw = 4;
  const gh = 3;
  for (let gy = 0; gy < gh; gy += 1) {
    for (let gx = 0; gx < gw; gx += 1) {
      let luma = 0;
      let contrast = 0;
      let count = 0;
      const x0 = Math.floor((gx * w) / gw);
      const y0 = Math.floor((gy * h) / gh);
      const x1 = Math.floor(((gx + 1) * w) / gw);
      const y1 = Math.floor(((gy + 1) * h) / gh);
      let min = 255;
      let max = 0;
      for (let y = y0; y < y1; y += 2) {
        for (let x = x0; x < x1; x += 2) {
          const i = (y * w + x) * 4;
          const v = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
          luma += v;
          min = Math.min(min, v);
          max = Math.max(max, v);
          count += 1;
        }
      }
      contrast = max - min;
      const avg = luma / Math.max(1, count);
      cells.push({
        label: avg < 90 ? "深色塊" : contrast > 80 ? "可能文字區" : "主視覺",
        x: gx / gw,
        y: gy / gh,
        w: 1 / gw,
        h: 1 / gh,
        contrast: Math.round(contrast),
      });
    }
  }
  return cells;
}

export function PosterVisionExhibit() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState(SAMPLE);
  const [regions, setRegions] = useState<Region[]>([]);

  function run(from: HTMLImageElement) {
    setRegions(analyze(from));
  }

  return (
    <div>
      <p className="text-xs text-muted">
        面積與對比來自像素運算。熱圖是顯著性推估，不是眼動儀。沒有把原圖送到雲端。
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 rounded-full bg-surface-mint px-4 text-sm"
          onClick={() => {
            setSrc(SAMPLE);
            if (imgRef.current) run(imgRef.current);
          }}
        >
          使用樣本海報
        </button>
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-surface px-4 text-sm shadow-card">
          上傳海報
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setSrc(url);
            }}
          />
        </label>
      </div>
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-surface-blue">
        <img
          ref={imgRef}
          src={src}
          alt="待檢測海報"
          className="aspect-[4/3] w-full object-cover"
          crossOrigin="anonymous"
          onLoad={(event) => run(event.currentTarget)}
        />
        {regions.map((region, i) => (
          <div
            key={`${region.label}-${i}`}
            className="absolute rounded-md border border-mint/80 bg-mint/15"
            style={{
              left: `${region.x * 100}%`,
              top: `${region.y * 100}%`,
              width: `${region.w * 100}%`,
              height: `${region.h * 100}%`,
            }}
          >
            <span className="m-1 inline-block rounded bg-surface/90 px-1.5 text-[10px]">
              {region.label} · 對比 {region.contrast}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        實際計算：把圖縮成 160×120，分 4×3 格算亮度與對比。限制：無法辨識語意，也不是真實視線。
      </p>
    </div>
  );
}
