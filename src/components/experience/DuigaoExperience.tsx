import { useState } from "react";
import { cn } from "@/lib/cn";

const VERSIONS = [
  {
    id: "v1",
    label: "初稿",
    pins: [{ x: 28, y: 36, text: "主標在手機縮圖會偏小" }],
  },
  {
    id: "v2",
    label: "改一",
    pins: [
      { x: 28, y: 36, text: "主標已加大" },
      { x: 62, y: 58, text: "報名資訊對比不足" },
    ],
  },
];

export function DuigaoExperience({ note }: { note?: string }) {
  const [version, setVersion] = useState(0);
  const [showPins, setShowPins] = useState(true);
  const [compare, setCompare] = useState(false);
  const [picked, setPicked] = useState<{ x: number; y: number } | null>(null);
  const current = VERSIONS[version];

  return (
    <div>
      <p className="text-sm font-medium text-mint-deep">對稿 · 註記層</p>
      {note ? <p className="mt-1 text-sm text-muted">{note}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {VERSIONS.map((v, idx) => (
          <button
            key={v.id}
            type="button"
            className={cn(
              "min-h-11 rounded-full px-4 text-sm",
              idx === version ? "bg-ink text-bg" : "bg-surface shadow-card",
            )}
            onClick={() => setVersion(idx)}
          >
            {v.label}
          </button>
        ))}
        <button type="button" className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card" onClick={() => setShowPins((v) => !v)}>
          {showPins ? "只看原稿" : "顯示註記"}
        </button>
        <button type="button" className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card" onClick={() => setCompare((v) => !v)}>
          {compare ? "單頁" : "版本對照"}
        </button>
      </div>
      <div className={cn("mt-4 grid gap-3", compare && "md:grid-cols-2")}>
        {(compare ? VERSIONS : [current]).map((v) => (
          <Poster
            key={v.id}
            label={v.label}
            pins={showPins ? v.pins : []}
            onPick={setPicked}
          />
        ))}
      </div>
      {picked ? (
        <p className="mt-3 text-sm text-muted">
          點到相對位置 {Math.round(picked.x)}% / {Math.round(picked.y)}%。示範註記不連私人討論資料。
        </p>
      ) : null}
    </div>
  );
}

function Poster({
  label,
  pins,
  onPick,
}: {
  label: string;
  pins: Array<{ x: number; y: number; text: string }>;
  onPick: (p: { x: number; y: number }) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
      <button
        type="button"
        className="relative block aspect-[3/4] w-full bg-gradient-to-b from-surface-blue to-surface-mint"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onPick({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }}
      >
        <span className="absolute left-8 right-8 top-16 rounded-xl bg-surface/90 p-4 text-left shadow-card">
          <span className="block font-display text-2xl">淡江禪學社</span>
          <span className="mt-2 block text-sm text-muted">{label} · 活動文宣</span>
        </span>
        {pins.map((pin) => (
          <span
            key={`${pin.x}-${pin.y}`}
            className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint ring-4 ring-surface"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            title={pin.text}
          />
        ))}
      </button>
      {pins.length ? (
        <ul className="space-y-1 p-4 text-sm text-muted">
          {pins.map((pin) => (
            <li key={pin.text}>{pin.text}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
