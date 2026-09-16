import { useState } from "react";

const OBJECTS = [
  { id: "door", label: "門", x: 8, y: 42, w: 10, h: 28, use: "出入口", size: "90 × 210 cm" },
  { id: "desk", label: "報到桌", x: 22, y: 58, w: 22, h: 10, use: "報到／引導", size: "180 × 60 cm" },
  { id: "mats", label: "地墊", x: 48, y: 40, w: 36, h: 28, use: "座位區", size: "約 4 × 3 m" },
  { id: "screen", label: "投影", x: 78, y: 18, w: 16, h: 10, use: "講者視線", size: "16:9 幕" },
];

export function PlanformExperience({ note }: { note?: string }) {
  const [rot, setRot] = useState(12);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [holding, setHolding] = useState<null | { sx: number; sy: number; ox: number; oy: number }>(null);
  const [active, setActive] = useState<(typeof OBJECTS)[number] | null>(OBJECTS[1]);

  return (
    <div>
      <p className="text-sm font-medium text-mint-deep">PLANFORM 等角預覽</p>
      {note ? <p className="mt-1 text-sm text-muted">{note}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card" onClick={() => setRot((r) => r - 8)}>
          左轉
        </button>
        <button type="button" className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card" onClick={() => setRot((r) => r + 8)}>
          右轉
        </button>
      </div>
      <div
        className="relative mt-4 h-80 touch-pan-y overflow-hidden rounded-2xl bg-surface-mint"
        onPointerDown={(e) => {
          setHolding({ sx: e.clientX, sy: e.clientY, ox: drag.x, oy: drag.y });
        }}
        onPointerMove={(e) => {
          if (!holding) return;
          setDrag({
            x: holding.ox + (e.clientX - holding.sx),
            y: holding.oy + (e.clientY - holding.sy),
          });
        }}
        onPointerUp={() => setHolding(null)}
        onPointerLeave={() => setHolding(null)}
      >
        <div
          className="absolute left-1/2 top-1/2 h-56 w-[28rem] origin-center"
          style={{
            transform: `translate(-50%, -50%) translate(${drag.x}px, ${drag.y}px) rotateX(56deg) rotateZ(${rot}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div className="absolute inset-0 rounded-xl bg-surface shadow-float" />
          <svg className="absolute inset-6 overflow-visible" viewBox="0 0 100 80">
            <path d="M10 70 L22 62 L70 62 L86 18" fill="none" stroke="var(--color-mint-deep)" strokeWidth="1.4" />
            {OBJECTS.map((obj) => (
              <rect
                key={obj.id}
                x={obj.x}
                y={obj.y}
                width={obj.w}
                height={obj.h}
                rx="1.5"
                role="button"
                tabIndex={0}
                onClick={() => setActive(obj)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setActive(obj);
                }}
                fill={active?.id === obj.id ? "var(--color-mint)" : "var(--color-surface-blue)"}
                stroke="var(--color-line)"
              />
            ))}
          </svg>
        </div>
      </div>
      {active ? (
        <div className="mt-4 rounded-2xl bg-surface p-4 shadow-card">
          <h3 className="font-display text-lg font-semibold">{active.label}</h3>
          <p className="mt-1 text-sm text-muted">用途：{active.use}</p>
          <p className="text-sm text-muted">尺寸：{active.size}</p>
          <p className="mt-2 text-xs text-muted">設計提醒，仍需依現場確認。本工具不做法規符合宣告。</p>
        </div>
      ) : null}
    </div>
  );
}
