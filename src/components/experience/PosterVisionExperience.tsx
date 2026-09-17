import { useRef, useState } from "react";
import { analyzePosterPixels, type PosterAnalysis } from "@/lib/portfolio/poster-analysis";

export function PosterVisionExperience({ coverSrc }: { coverSrc?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analysis, setAnalysis] = useState<PosterAnalysis | null>(null);
  const [region, setRegion] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = (source: CanvasImageSource, width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(source, 0, 0, width, height);
    const image = ctx.getImageData(0, 0, width, height);
    setAnalysis(analyzePosterPixels(image.data, width, height));
    setError(null);
  };

  const fromUrl = (url: string) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => run(image, Math.min(640, image.width), Math.min(480, image.height));
    image.onerror = () => setError("無法讀取樣張。這次沒有假裝分析成功。");
    image.src = url;
  };

  return (
    <div>
      <p className="text-xs font-medium text-mint-deep">
        熱圖為 AI 推估 · 像素對比與面積，不是眼動儀
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          onClick={() => coverSrc && fromUrl(coverSrc)}
        >
          分析樣張
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
              const image = new Image();
              image.onload = () =>
                run(image, Math.min(640, image.width), Math.min(480, image.height));
              image.src = URL.createObjectURL(file);
            }}
          />
        </label>
      </div>
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-surface-blue">
        <canvas
          ref={canvasRef}
          className="w-full"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setRegion({
              x: (event.clientX - rect.left) / rect.width,
              y: (event.clientY - rect.top) / rect.height,
            });
          }}
        />
        {analysis ? (
          <div
            className="pointer-events-none absolute inset-0 grid opacity-50"
            style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
          >
            {analysis.heatmap.map((value, index) => (
              <span key={index} style={{ background: `hsl(200 80% 60% / ${value * 0.55})` }} />
            ))}
          </div>
        ) : (
          <p className="p-8 text-sm text-muted">先分析樣張或上傳海報。</p>
        )}
      </div>
      {analysis ? (
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <li className="rounded-xl bg-surface p-3 shadow-card">對比 {(analysis.contrast * 100).toFixed(0)}%</li>
          <li className="rounded-xl bg-surface p-3 shadow-card">平均亮度 {(analysis.meanLuma * 100).toFixed(0)}%</li>
          <li className="rounded-xl bg-surface p-3 shadow-card">邊緣密度 {(analysis.textLikeRatio * 100).toFixed(1)}%</li>
        </ul>
      ) : null}
      {region ? (
        <p className="mt-2 text-sm text-muted">
          點選位置 {(region.x * 100).toFixed(0)}% / {(region.y * 100).toFixed(0)}% · 面積估算以點選格為準
        </p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-muted">{error}</p> : null}
      {analysis ? (
        <ul className="mt-3 grid gap-1 text-xs text-muted">
          {analysis.limits.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
