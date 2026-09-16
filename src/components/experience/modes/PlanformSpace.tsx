import { useState, type KeyboardEvent, type PointerEvent } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { resolveExperienceConfig } from "@/lib/experiences/resolve";
import { githubBlobUrl } from "@/lib/github/parse";
import { usePrefersReducedMotion } from "@/lib/motion/prefers-reduced";

type Prop = {
  id: string;
  label: string;
  use: string;
  size: string;
  x: number;
  y: number;
};

export function PlanformSpace({ project }: { project?: PublicProject }) {
  const config = project ? resolveExperienceConfig(project) : {};
  const initial = (config.spatial?.objects ?? []) as Prop[];
  const [props, setProps] = useState<Prop[]>(initial);
  const [selected, setSelected] = useState<string>(initial[0]?.id ?? "");
  const [tilt, setTilt] = useState(config.spatial?.tiltDefault ?? 18);
  const current = props.find((item) => item.id === selected);
  const reduced = usePrefersReducedMotion();
  const owner = project?.github.owner;
  const repo = project?.github.repo;
  const branch = project?.github.branch ?? "main";
  const sources = config.fileHints?.slice(0, 2) ?? [];

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

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "[" || event.key === "ArrowDown") {
      event.preventDefault();
      setTilt((value) => Math.max(-40, value - 4));
    } else if (event.key === "]" || event.key === "ArrowUp") {
      event.preventDefault();
      setTilt((value) => Math.min(50, value + 4));
    } else if (["ArrowLeft", "ArrowRight"].includes(event.key) && (event.shiftKey || event.altKey)) {
      event.preventDefault();
      const dx = event.key === "ArrowRight" ? 3 : -3;
      setProps((list) =>
        list.map((item) =>
          item.id === selected ? { ...item, x: Math.min(88, Math.max(8, item.x + dx)) } : item,
        ),
      );
    }
  }

  const tiltValue = reduced ? 0 : tilt;

  if (!props.length) {
    return <p className="text-sm text-muted">尚未設定空間物件。</p>;
  }

  return (
    <div tabIndex={0} onKeyDown={onKey} className="outline-none" aria-label="PLANFORM 場佈">
      <p className="text-sm text-muted">
        {config.intro ?? "等角場佈示意：旋轉、拖動物件、看用途與尺寸。"}
        {config.spatial?.complianceDisclaimer ?? "這是作品集空間預覽，不做容留或消防法規符合計算。"}
        上下鍵旋轉，Shift＋左右移動選取物件。
      </p>
      <label className="mt-3 flex items-center gap-3 text-sm">
        旋轉
        <input
          type="range"
          min={-40}
          max={50}
          value={tiltValue}
          onChange={(event) => setTilt(Number(event.target.value))}
          className="min-h-11 w-40"
          disabled={reduced}
        />
      </label>
      <div
        className="relative mt-4 aspect-[16/10] overflow-hidden rounded-2xl bg-surface-blue shadow-card"
        style={{ perspective: reduced ? undefined : "1200px" }}
      >
        <div
          className="absolute inset-6 rounded-2xl bg-surface"
          style={{
            transform: reduced ? undefined : `rotateX(58deg) rotateZ(${tiltValue}deg)`,
            transformOrigin: "center",
          }}
        >
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path
              d="M12 70 Q40 48 88 62"
              fill="none"
              stroke="#63e6be"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
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
          <p className="mt-2 text-muted">
            {config.spatial?.circulationNote ?? "薄荷色曲線是示意動線，不是法定避難寬度，也不做規範符合計算。"}
          </p>
          {owner && repo && sources.length ? (
            <p className="mt-2 text-xs text-muted">
              來源{" "}
              {sources.map((item, index) => (
                <span key={item.path}>
                  {index > 0 ? " · " : null}
                  <a
                    className="text-mint-deep"
                    href={githubBlobUrl(owner, repo, branch, item.path)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {item.path}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
