import { useMemo, useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";

type Kind = "key" | "breakdown" | "generated";

const FRAMES: Array<{ i: number; kind: Kind; x: number; y: number }> = [
  { i: 0, kind: "key", x: 24, y: 110 },
  { i: 1, kind: "breakdown", x: 52, y: 78 },
  { i: 2, kind: "generated", x: 80, y: 54 },
  { i: 3, kind: "generated", x: 108, y: 42 },
  { i: 4, kind: "key", x: 136, y: 48 },
  { i: 5, kind: "generated", x: 164, y: 70 },
  { i: 6, kind: "breakdown", x: 192, y: 102 },
  { i: 7, kind: "generated", x: 220, y: 128 },
  { i: 8, kind: "key", x: 248, y: 138 },
];

const KIND_LABEL: Record<Kind, string> = {
  key: "Key",
  breakdown: "Breakdown",
  generated: "Generated",
};

export function FrameTimeline({ project }: { project: PublicProject }) {
  const [index, setIndex] = useState(0);
  const [onion, setOnion] = useState(true);
  const [compare, setCompare] = useState(false);
  const frame = FRAMES[index];
  const problem = index === 6;
  const ghosts = useMemo(
    () => (onion ? FRAMES.slice(Math.max(0, index - 2), index + 1) : [frame]),
    [index, onion, frame],
  );

  return (
    <div>
      <p className="text-sm text-muted">
        作品集示範：彈跳球時間軸、onion-skin 與問題幀概念。真實 GPU 適配器（Wan / RIFE / SAM）未載入。來源：
        {project.github.repo ?? "FrameLab"} · sample-ball / timeline-engine。
      </p>
      <svg viewBox="0 0 320 180" className="mt-4 w-full rounded-2xl bg-surface shadow-card">
        <rect width="320" height="180" fill="#F7FBFF" />
        <line x1="16" y1="150" x2="304" y2="150" stroke="#D9EAF2" />
        {ghosts.map((item, ghostIndex) => (
          <circle
            key={item.i}
            cx={item.x}
            cy={item.y}
            r={item.kind === "key" ? 16 : 12}
            fill={item.kind === "key" ? "#63E6BE" : item.kind === "breakdown" ? "#72B7FF" : "#FFD166"}
            opacity={ghostIndex === ghosts.length - 1 ? 1 : 0.28}
          />
        ))}
        {problem ? (
          <rect x={frame.x - 22} y={frame.y - 22} width="44" height="44" fill="none" stroke="#c45c4a" strokeDasharray="4 3" />
        ) : null}
      </svg>
      <div className="mt-3 flex flex-wrap gap-1">
        {FRAMES.map((item) => (
          <button
            key={item.i}
            type="button"
            onClick={() => setIndex(item.i)}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-xs ${
              item.i === index ? "bg-ink text-bg" : "bg-surface shadow-card"
            }`}
          >
            F{item.i}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => setOnion((v) => !v)}
        >
          Onion skin {onion ? "開" : "關"}
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => setCompare((v) => !v)}
        >
          幀比較 {compare ? "開" : "關"}
        </button>
      </div>
      <p className="mt-3 text-sm">
        目前 F{frame.i} · {KIND_LABEL[frame.kind]}
        {problem ? " · 接觸點不穩，概念上只重產這一窗，不重跑整段。" : ""}
      </p>
      {compare ? (
        <p className="mt-2 text-sm text-muted">
          比較 F{Math.max(0, index - 1)} 與 F{index}：這是作品集示意，不是模型輸出。
        </p>
      ) : null}
    </div>
  );
}
