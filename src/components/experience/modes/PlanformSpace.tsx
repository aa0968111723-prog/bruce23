import { useState, type PointerEvent } from "react";
import type { PublicProject } from "@/lib/cms/privacy";

type Prop = {
  id: string;
  label: string;
  use: string;
  size: string;
  x: number;
  y: number;
};

const INITIAL: Prop[] = [
  { id: "desk", label: "報到桌", use: "報到／資料", size: "180×60 cm", x: 18, y: 42 },
  { id: "mats", label: "地墊區", use: "席地而坐", size: "360×360 cm", x: 48, y: 38 },
  { id: "path", label: "走道", use: "進出動線", size: "90 cm 寬（示意）", x: 78, y: 55 },
];

export function PlanformSpace(_props?: { project?: PublicProject }) {
  const [props, setProps] = useState(INITIAL);
  const [selected, setSelected] = useState<string>("desk");
  const [tilt, setTilt] = useState(18);
  const current = props.find((item) => item.id === selected);

  function onDrag(id: string, event: PointerEvent<HTMLButtonElement>) {
    const parent = event.currentTarget.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setProps((list) =>
      list.map((item) =>
        item.id === id
          ? { ...item, x: Math.min(88, Math.max(8, x)), y: Math.min(78, Math.max(18, y)) }
          : item,
      ),
    );
  }

  return (
    <div>
      <p className="text-sm text-muted">
        等角場佈示意：旋轉、拖動物件、看用途與尺寸。這是作品集空間預覽，不做容留或消防法規符合計算。
      </p>
      <label className="mt-3 flex items-center gap-3 text-sm">
        旋轉
        <input
          type="range"
          min={-24}
          max={36}
          value={tilt}
          onChange={(event) => setTilt(Number(event.target.value))}
          className="w-40"
        />
      </label>
      <div
        className="relative mt-4 aspect-[16/10] overflow-hidden rounded-2xl bg-surface-blue shadow-card"
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute inset-6 rounded-2xl bg-surface"
          style={{ transform: `rotateX(58deg) rotateZ(${tilt}deg)`, transformOrigin: "center" }}
        >
          <div className="absolute inset-x-10 top-1/2 h-2 rounded-full bg-mint/80" />
          {props.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`absolute min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 rounded-xl px-2 text-xs shadow-card ${
                selected === item.id ? "bg-mint" : "bg-surface"
              }`}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              onClick={() => setSelected(item.id)}
              onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
              onPointerMove={(event) => {
                if (event.buttons !== 1) return;
                onDrag(item.id, event);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {current ? (
        <div className="mt-4 rounded-2xl bg-surface p-4 text-sm shadow-card">
          <p className="font-display text-lg">{current.label}</p>
          <p className="mt-1">用途：{current.use}</p>
          <p>尺寸：{current.size}</p>
          <p className="mt-2 text-muted">動線為示意走道，不是法定避難寬度。</p>
        </div>
      ) : null}
    </div>
  );
}
