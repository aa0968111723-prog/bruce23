import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

const FRAMES = Array.from({ length: 24 }, (_, index) => {
  const t = index / 23;
  const y = Math.abs(Math.sin(t * Math.PI));
  const kind =
    index === 0 || index === 12 || index === 23
      ? "key"
      : index % 4 === 0
        ? "breakdown"
        : "generated";
  return { index, y, kind, problem: index === 12 };
});

export function TimelineExperience() {
  const [playhead, setPlayhead] = useState(8);
  const [compare, setCompare] = useState(true);
  const frame = FRAMES[playhead];
  const onion = useMemo(
    () => FRAMES.filter((item) => Math.abs(item.index - playhead) <= 2),
    [playhead],
  );

  return (
    <div>
      <p className="text-xs font-medium text-mint-deep">
        作品集互動展示 · Classic ball 節奏。不是 FrameLab 產品、也沒有 GPU 模型。
      </p>
      <div className="relative mt-4 h-56 overflow-hidden rounded-2xl bg-surface-blue">
        {onion.map((item) => (
          <span
            key={item.index}
            className="absolute rounded-full bg-mint"
            style={{
              left: `${12 + item.index * 3.4}%`,
              bottom: `${18 + item.y * 42}%`,
              width: item.index === playhead ? 36 : 22,
              height: item.index === playhead ? 36 : 22,
              opacity: item.index === playhead ? 1 : 0.28,
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex gap-1 overflow-x-auto pb-2">
        {FRAMES.map((item) => (
          <button
            key={item.index}
            type="button"
            onClick={() => setPlayhead(item.index)}
            className={cn(
              "flex h-14 min-w-10 flex-col items-center justify-center rounded-lg text-[10px]",
              item.problem ? "bg-sun/80" : item.kind === "key" ? "bg-ink text-bg" : "bg-surface shadow-card",
              playhead === item.index && "ring-2 ring-sky",
            )}
          >
            F{item.index}
            <span>{item.kind === "key" ? "K" : item.kind === "breakdown" ? "B" : "G"}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <p className="text-sm text-muted">
          {frame.problem
            ? "F12 是問題幀：接觸點示範。只標這格，不重產整段。"
            : `${frame.kind} frame · onion skin 顯示鄰近兩格。`}
        </p>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => setCompare((value) => !value)}
        >
          {compare ? "關閉比較" : "幀比較"}
        </button>
      </div>
    </div>
  );
}
