import { useRef, useState } from "react";
import { estimatePoster, type PosterEstimate } from "@/lib/experiences/poster-estimate";

const SAMPLES = [
  { src: "/media/covers/poster-vision-ai.jpg", label: "檢測中心視覺" },
  { src: "/media/archive/tku-zen-poster.jpg", label: "禪學社文宣原作縮圖" },
];

export function PosterVisionExperience({ note }: { note?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [estimate, setEstimate] = useState<PosterEstimate | null>(null);
  const [source, setSource] = useState(SAMPLES[0].src);
  const [busy, setBusy] = useState(false);

  async function run(src: string) {
    setBusy(true);
    setSource(src);
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image"));
      img.src = src;
    }).catch(() => undefined);
    const canvas = canvasRef.current;
    if (!canvas || !img.width) {
      setBusy(false);
      return;
    }
    const w = 480;
    const h = Math.round((img.height / img.width) * w) || 320;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);
    setEstimate(estimatePoster(data, 20));
    setBusy(false);
  }

  return (
    <div>
      <p className="text-sm font-medium text-mint-deep">Poster Vision · 像素推估</p>
      {note ? <p className="mt-1 text-sm text-muted">{note}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s.src}
            type="button"
            className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card"
            onClick={() => void run(s.src)}
          >
            {s.label}
          </button>
        ))}
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground">
          上傳海報
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void run(URL.createObjectURL(file));
            }}
          />
        </label>
      </div>
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-surface-blue">
        <img src={source} alt="分析中的海報" className="aspect-[4/3] w-full object-cover" />
        {estimate
          ? estimate.heatmap.slice(0, 18).map((h, i) => (
              <span
                key={`${h.x}-${h.y}-${i}`}
                className="pointer-events-none absolute rounded-full bg-sun/50 blur-md"
                style={{
                  left: `${h.x * 100}%`,
                  top: `${h.y * 100}%`,
                  width: `${8 + h.v * 18}%`,
                  height: `${8 + h.v * 18}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))
          : null}
        {estimate
          ? estimate.regions.map((r) => (
              <button
                key={r.id}
                type="button"
                className="absolute border border-mint/80"
                style={{
                  left: `${r.x * 100}%`,
                  top: `${r.y * 100}%`,
                  width: `${r.w * 100}%`,
                  height: `${r.h * 100}%`,
                }}
                aria-label={`${r.kind} 區域`}
              />
            ))
          : null}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="對比" value={estimate ? estimate.contrast.toFixed(2) : busy ? "…" : "—"} />
        <Stat label="文字區面積（推估）" value={estimate ? `${Math.round(estimate.textAreaRatio * 100)}%` : "—"} />
        <Stat label="區域數" value={estimate ? String(estimate.regions.length) : "—"} />
      </div>
      <ul className="mt-4 grid gap-2 text-sm text-muted">
        {(estimate?.limits ?? [
          "熱圖是 AI／演算法推估，不是眼動追蹤。",
          "點「樣本」或上傳後才會計算。",
        ]).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}
