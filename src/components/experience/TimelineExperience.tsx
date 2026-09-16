import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

const TYPES = ["key", "breakdown", "generated", "generated", "key"] as const;

export function TimelineExperience({
  frames = 24,
  problemFrames = [12, 13],
  note,
}: {
  frames?: number;
  problemFrames?: number[];
  note?: string;
}) {
  const [playhead, setPlayhead] = useState(0);
  const [onion, setOnion] = useState(true);
  const seq = useMemo(
    () =>
      Array.from({ length: frames }, (_, i) => {
        const t = i / (frames - 1);
        const y = Math.abs(Math.sin(t * Math.PI)) * 70;
        const squash = y < 8 ? 1.25 : 1;
        return { i, y, squash, type: TYPES[i % TYPES.length], problem: problemFrames.includes(i) };
      }),
    [frames, problemFrames],
  );
  const current = seq[playhead] ?? seq[0];

  return (
    <div>
      <p className="text-sm font-medium text-mint-deep">FrameLab 作品集時間軸</p>
      {note ? <p className="mt-1 text-sm text-muted">{note}</p> : null}
      <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl bg-surface-blue">
        {onion
          ? seq
              .filter((_, idx) => Math.abs(idx - playhead) === 1)
              .map((f) => (
                <Ball key={`o-${f.i}`} y={f.y} squash={f.squash} className="opacity-30" />
              ))
          : null}
        <Ball y={current.y} squash={current.squash} className="opacity-100" />
        <p className="absolute left-4 top-4 text-xs text-muted">
          F{String(playhead).padStart(3, "0")} · {current.type}
          {current.problem ? " · 問題幀（接觸點）" : ""}
        </p>
      </div>
      <div className="mt-4">
        <div className="flex gap-1 overflow-x-auto pb-2" role="listbox" aria-label="時間軸">
          {seq.map((f) => (
            <button
              key={f.i}
              type="button"
              role="option"
              aria-selected={f.i === playhead}
              onClick={() => setPlayhead(f.i)}
              className={cn(
                "h-14 w-8 shrink-0 rounded-md text-[10px]",
                f.i === playhead
                  ? "bg-ink text-bg"
                  : f.problem
                    ? "bg-sun/80 text-ink"
                    : f.type === "key"
                      ? "bg-mint text-primary-foreground"
                      : f.type === "breakdown"
                        ? "bg-sky/70 text-accent-foreground"
                        : "bg-surface text-muted shadow-card",
              )}
            >
              {f.i}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card"
            onClick={() => setOnion((v) => !v)}
          >
            {onion ? "關閉 onion skin" : "開啟 onion skin"}
          </button>
          {current.problem ? (
            <p className="self-center text-sm text-muted">
              修復概念：只重產這一窗，不重跑整段。GPU 適配器在來源標為不可用。
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Ball({ y, squash, className }: { y: number; squash: number; className?: string }) {
  return (
    <span
      className={cn("absolute left-1/2 size-16 -translate-x-1/2 rounded-full bg-mint", className)}
      style={{
        bottom: `${12 + y}%`,
        transform: `translateX(-50%) scale(${squash}, ${2 - squash})`,
      }}
    />
  );
}
