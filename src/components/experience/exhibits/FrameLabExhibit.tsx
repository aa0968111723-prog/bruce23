import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type FrameKind = "key" | "breakdown" | "generated";

const FRAMES: Array<{ n: number; kind: FrameKind; problem?: string }> = [
  { n: 100, kind: "key" },
  { n: 108, kind: "breakdown" },
  { n: 116, kind: "generated", problem: "接觸點斷了" },
  { n: 122, kind: "generated", problem: "殘影偏移" },
  { n: 130, kind: "key" },
];

export function FrameLabExhibit() {
  const [index, setIndex] = useState(2);
  const [onion, setOnion] = useState(true);
  const current = FRAMES[index];
  const prev = FRAMES[Math.max(0, index - 1)];

  const balls = useMemo(() => {
    return FRAMES.map((frame, i) => ({
      x: 40 + i * 52,
      y: 70 + Math.sin(i * 1.2) * 28,
      frame,
    }));
  }, []);

  return (
    <div>
      <p className="text-xs text-muted">
        作品集時間軸。GPU 模型未註冊時不會假裝有深度或姿勢。點問題幀看修復概念。
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-blue p-4">
        <svg viewBox="0 0 320 140" className="h-40 w-full" role="img" aria-label="onion skin 彈跳球">
          {onion ? (
            <circle cx={balls[Math.max(0, index - 1)].x} cy={balls[Math.max(0, index - 1)].y} r="16" fill="#72B7FF" opacity="0.28" />
          ) : null}
          <circle cx={balls[index].x} cy={balls[index].y} r="18" fill="#63E6BE" />
          <text x="12" y="20" fontSize="11" fill="#59748A">
            F{current.n} · {current.kind}
          </text>
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {FRAMES.map((frame, i) => (
          <button
            key={frame.n}
            type="button"
            className={cn(
              "min-h-11 rounded-xl px-3 text-xs font-medium shadow-card",
              i === index ? "bg-ink text-bg" : "bg-surface",
              frame.problem ? "ring-1 ring-sun" : "",
            )}
            onClick={() => setIndex(i)}
          >
            F{frame.n}
            <span className="ml-1 text-[10px] opacity-70">{frame.kind}</span>
          </button>
        ))}
        <button
          type="button"
          className="min-h-11 rounded-full bg-surface-mint px-4 text-sm"
          onClick={() => setOnion((v) => !v)}
        >
          {onion ? "關閉 onion skin" : "開啟 onion skin"}
        </button>
      </div>
      {current.problem ? (
        <div className="mt-4 rounded-xl bg-sun/30 p-4 text-sm">
          <p className="font-semibold">問題幀 F{current.n}：{current.problem}</p>
          <p className="mt-1 text-muted">
            修復概念：只重產 {prev.n}–{current.n} 這一窗，不重跑整段。這是作品集示意，不是工作站連線。
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">這幀標示為 {current.kind}，目前沒有修復標記。</p>
      )}
    </div>
  );
}
