import { useState } from "react";

const OBJECTS = [
  { id: "desk", label: "報到桌", use: "報到與引導", size: "180 × 60 × 74 cm", x: 18, y: 42 },
  { id: "mats", label: "地墊", use: "靜坐區", size: "約 90 × 90 cm / 張", x: 48, y: 52 },
  { id: "door", label: "入口", use: "動線起點，保留走道", size: "門寬示意 90 cm", x: 8, y: 62 },
  { id: "screen", label: "投影", use: "講者區", size: "示意 200 cm 寬", x: 72, y: 28 },
];

export function PlanformExperience() {
  const [yaw, setYaw] = useState(-18);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(OBJECTS[0]);

  return (
    <div>
      <p className="text-xs font-medium text-mint-deep">
        作品集空間預覽 · 不做容留人數或法規符合宣稱
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => setYaw((value) => value - 12)}
        >
          左轉
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => setYaw((value) => value + 12)}
        >
          右轉
        </button>
      </div>
      <div
        className="mt-4 h-72 cursor-grab overflow-hidden rounded-2xl bg-surface-blue"
        onPointerDown={(event) => setDrag({ x: event.clientX - pan.x, y: event.clientY - pan.y })}
        onPointerUp={() => setDrag(null)}
        onPointerMove={(event) => {
          if (!drag) return;
          setPan({ x: event.clientX - drag.x, y: event.clientY - drag.y });
        }}
      >
        <div
          className="iso-space relative mx-auto mt-10 h-48 w-[85%] origin-center rounded-xl bg-surface shadow-float"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) rotateX(58deg) rotateZ(${yaw}deg)`,
          }}
        >
          <svg className="absolute inset-6" viewBox="0 0 100 60" aria-hidden="true">
            <path
              d="M8 50 C 20 40, 30 38, 48 36 S 80 20, 88 18"
              fill="none"
              stroke="var(--color-mint-deep)"
              strokeWidth="2"
            />
          </svg>
          {OBJECTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="absolute min-h-11 min-w-11 rounded-lg bg-mint/90 px-2 text-[11px] font-medium"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              onClick={(event) => {
                event.stopPropagation();
                setActive(item);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-surface p-4 shadow-card">
        <p className="font-display text-lg">{active.label}</p>
        <p className="text-sm text-muted">用途：{active.use}</p>
        <p className="text-sm text-muted">尺寸：{active.size}</p>
        <p className="mt-2 text-xs text-muted">
          動線為示意。設計提醒仍需依現場與專業規範確認。
        </p>
      </div>
    </div>
  );
}
