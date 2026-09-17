import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { fillChrome, joinSentences, type ExperienceChrome } from "@/lib/locale/experience";
import { useExperienceView } from "../useExperienceView";

type Region = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bright: number;
  contrast: number;
};

type Analysis = {
  areaBright: number;
  contrast: number;
  textRegions: number;
  note: string;
  downsample: string;
  regions: Region[];
};

function regionStats(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  box: { x: number; y: number; w: number; h: number },
) {
  const x0 = Math.max(0, Math.round((box.x / 100) * width));
  const y0 = Math.max(0, Math.round((box.y / 100) * height));
  const x1 = Math.min(width, x0 + Math.max(1, Math.round((box.w / 100) * width)));
  const y1 = Math.min(height, y0 + Math.max(1, Math.round((box.h / 100) * height)));
  let sum = 0;
  let sumSq = 0;
  let bright = 0;
  let n = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = (y * width + x) * 4;
      const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      sum += l;
      sumSq += l * l;
      if (l > 200) bright += 1;
      n += 1;
    }
  }
  const mean = n ? sum / n : 0;
  const variance = n ? sumSq / n - mean * mean : 0;
  return {
    bright: n ? Math.round((bright / n) * 100) : 0,
    contrast: Math.round(Math.sqrt(Math.max(0, variance))),
  };
}

function analyze(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  labels: Pick<ExperienceChrome, "canvasUnavailable" | "regionCenter" | "regionBright" | "regionText">,
): Analysis {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { areaBright: 0, contrast: 0, textRegions: 0, note: labels.canvasUnavailable, downsample: "0×0", regions: [] };
  }
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
  const boxes: Array<{ id: string; label: string; x: number; y: number; w: number; h: number }> = [
    { id: "center", label: labels.regionCenter, x: 28, y: 22, w: 44, h: 48 },
    { id: "bright", label: labels.regionBright, x: 8, y: 8, w: 28, h: 22 },
  ];
  if (textRows.length) {
    const first = textRows[0].y / h;
    const last = textRows[textRows.length - 1].y / h;
    boxes.push({
      id: "text",
      label: labels.regionText,
      x: 10,
      y: Math.round(first * 100),
      w: 80,
      h: Math.max(8, Math.round((last - first) * 100)),
    });
  }
  const regions: Region[] = boxes.map((box) => ({ ...box, ...regionStats(data, w, h, box) }));
  return {
    areaBright: Math.round((bright / n) * 100),
    contrast: Math.round(contrast),
    textRegions: textRows.length,
    note: labels.canvasUnavailable,
    downsample: `${w}×${h}`,
    regions,
  };
}

export function PosterVision({ project }: { project?: PublicProject }) {
  const { ex, config } = useExperienceView(project);
  const sampleSrc = config.comparison?.sampleSrc || "/media/samples/poster.svg";
  const disclaimer = config.comparison?.estimateDisclaimer ?? ex.estimateDisclaimer;
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heatRef = useRef<HTMLCanvasElement>(null);
  const [src, setSrc] = useState(sampleSrc);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [heatOn, setHeatOn] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const run = useCallback(() => {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    const heat = heatRef.current;
    if (!image || !canvas || !image.naturalWidth) return;
    const result = analyze(image, canvas, ex);
    result.note = disclaimer;
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
        const t = score / 255;
        out.data[i] = Math.round(99 + t * 15);
        out.data[i + 1] = Math.round(230 - t * 47);
        out.data[i + 2] = Math.round(190 + t * 65);
        out.data[i + 3] = Math.round(score * 0.5);
      }
      ctx.putImageData(out, 0, 0);
    }
  }, [disclaimer, ex]);

  useEffect(() => {
    if (imgRef.current?.complete) run();
  }, [src, run]);

  const region = analysis?.regions.find((item) => item.id === selected);

  return (
    <div>
      <p className="text-sm text-muted">{joinSentences(config.intro, disclaimer, ex.calcLimits)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card">
          {ex.uploadPoster}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setSrc(URL.createObjectURL(file));
              setAnalysis(null);
              setSelected(null);
            }}
          />
        </label>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => {
            setSrc(sampleSrc);
            setAnalysis(null);
            setSelected(null);
          }}
        >
          {ex.samplePoster}
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          onClick={run}
        >
          {ex.analyze}
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          data-heatmap-toggle={heatOn ? "on" : "off"}
          onClick={() => setHeatOn((value) => !value)}
        >
          {ex.heatmapToggle} {heatOn ? ex.on : ex.off}
        </button>
      </div>
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-surface shadow-card">
        <img
          ref={imgRef}
          src={src}
          alt={ex.posterAltPending}
          className="w-full"
          loading="lazy"
          decoding="async"
          onLoad={() => {
            run();
          }}
        />
        <canvas
          ref={heatRef}
          className={`pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply ${heatOn ? "" : "hidden"}`}
          data-heatmap-palette="studio"
        />
        <p
          className="pointer-events-none absolute left-3 top-3 max-w-[80%] rounded-full bg-surface/90 px-3 py-1 text-[11px] text-mint-deep shadow-card"
          data-heatmap-honesty="true"
        >
          {ex.heatmapBadge}
        </p>
        {analysis?.regions.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`absolute min-h-11 min-w-11 rounded-md border px-1 text-left text-[10px] text-ink ${
              selected === item.id ? "border-ink bg-mint/30" : "border-mint/80 bg-mint/10"
            }`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `${item.w}%`,
              height: `${item.h}%`,
            }}
            data-region-id={item.id}
            onClick={() => setSelected(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {analysis ? (
        <ul className="mt-4 grid gap-2 text-sm">
          <li className="rounded-xl bg-surface px-4 py-3 shadow-card">
            {fillChrome(ex.brightArea, { n: analysis.areaBright })}
          </li>
          <li className="rounded-xl bg-surface px-4 py-3 shadow-card">
            {fillChrome(ex.contrastStat, { n: analysis.contrast })}
          </li>
          <li className="rounded-xl bg-surface px-4 py-3 shadow-card">
            {fillChrome(ex.textBands, { n: analysis.textRegions })}
          </li>
          <li className="rounded-xl bg-surface-blue px-4 py-3 text-muted" data-calc-limits="">
            {ex.calcLimits} · {analysis.downsample}
          </li>
          <li className="rounded-xl bg-surface-blue px-4 py-3 text-muted">{analysis.note}</li>
          {region ? (
            <li className="rounded-xl bg-surface px-4 py-3 shadow-card" data-region-detail={region.id}>
              {region.label} · {fillChrome(ex.brightArea, { n: region.bright })} · {fillChrome(ex.contrastStat, { n: region.contrast })}
            </li>
          ) : (
            <li className="rounded-xl bg-surface-blue px-4 py-3 text-muted">{ex.regionSelect}</li>
          )}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">{ex.posterLoading}</p>
      )}
    </div>
  );
}
