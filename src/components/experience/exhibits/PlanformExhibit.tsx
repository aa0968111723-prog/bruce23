import { useState } from "react";

type Prop = {
  id: string;
  label: string;
  use: string;
  size: string;
  x: number;
  y: number;
};

const PROPS: Prop[] = [
  { id: "desk", label: "報到桌", use: "報到與文宣", size: "180×60 cm", x: 38, y: 58 },
  { id: "mat", label: "地墊", use: "席地而坐", size: "90×90 cm × 8", x: 52, y: 42 },
  { id: "door", label: "門口", use: "進出，勿擋", size: "90 cm 淨寬示意", x: 18, y: 70 },
];

export function PlanformExhibit() {
  const [yaw, setYaw] = useState(-18);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<Prop | null>(PROPS[0]);

  return (
    <div>
      <p className="text-xs text-muted">
        等角場佈示意，可旋轉與拖曳。點物件看用途與尺寸。不做消防或無障礙「已符合法規」宣稱。
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card" onClick={() => setYaw((v) => v - 8)}>
          左轉
        </button>
        <button type="button" className="min-h-11 rounded-full bg-surface px-4 text-sm shadow-card" onClick={() => setYaw((v) => v + 8)}>
          右轉
        </button>
      </div>
      <div
        className="spatial-stage mt-4 h-64 cursor-grab overflow-hidden rounded-2xl bg-surface-mint"
        onPointerDown={(event) => setDrag({ x: event.clientX, y: event.clientY })}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
        onPointerMove={(event) => {
          if (!drag) return;
          setOffset((o) => ({
            x: o.x + (event.clientX - drag.x) * 0.4,
            y: o.y + (event.clientY - drag.y) * 0.4,
          }));
          setDrag({ x: event.clientX, y: event.clientY });
        }}
      >
        <div
          className="flex h-full items-center justify-center"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) rotateX(58deg) rotateZ(${yaw}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div className="relative h-40 w-64 rounded-lg bg-surface shadow-float">
            <div className="absolute inset-x-8 top-6 h-1 rounded bg-mint" aria-hidden="true" />
            {PROPS.map((prop) => (
              <button
                key={prop.id}
                type="button"
                className="absolute min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 rounded-md bg-sky/80 px-2 text-[10px] font-medium text-accent-foreground"
                style={{ left: `${prop.x}%`, top: `${prop.y}%` }}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelected(prop);
                }}
              >
                {prop.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {selected ? (
        <div className="mt-4 rounded-xl bg-surface-blue p-4 text-sm">
          <p className="font-semibold">{selected.label}</p>
          <p>用途：{selected.use}</p>
          <p>尺寸：{selected.size}</p>
          <p className="mt-2 text-xs text-muted">動線：薄荷線為進出示意，不是法定走道計算。</p>
        </div>
      ) : null}
    </div>
  );
}
