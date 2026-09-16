import { useState, type KeyboardEvent, type PointerEvent } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { githubBlobUrl } from "@/lib/github/parse";
import { usePrefersReducedMotion } from "@/lib/motion/prefers-reduced";
import { useExperienceView } from "../useExperienceView";

type Prop = {
  id: string;
  label: string;
  use: string;
  size: string;
  x: number;
  y: number;
};

export function PlanformSpace({ project }: { project?: PublicProject }) {
  const { ex, config } = useExperienceView(project);
  const catalog = (config.spatial?.objects ?? []) as Prop[];
  const [move, setMove] = useState<Record<string, { x: number; y: number }>>({});
  const props = catalog.map((item) => ({
    ...item,
    x: move[item.id]?.x ?? item.x,
    y: move[item.id]?.y ?? item.y,
  }));
  const [selected, setSelected] = useState<string>(catalog[0]?.id ?? "");
  const [tilt, setTilt] = useState(config.spatial?.tiltDefault ?? 18);
  const current = props.find((item) => item.id === selected);
  const reduced = usePrefersReducedMotion();
  const owner = project?.github.owner;
  const repo = project?.github.repo;
  const branch = project?.github.branch ?? "main";
  const sources = config.fileHints?.slice(0, 2) ?? [];

  function place(id: string, x: number, y: number) {
    setMove((value) => ({
      ...value,
      [id]: { x: Math.min(88, Math.max(8, x)), y: Math.min(78, Math.max(18, y)) },
    }));
  }

  function onDrag(id: string, event: PointerEvent<HTMLButtonElement>) {
    const parent = event.currentTarget.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    place(id, x, y);
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
      const item = props.find((prop) => prop.id === selected);
      if (!item) return;
      place(selected, item.x + dx, item.y);
    }
  }

  const tiltValue = reduced ? 0 : tilt;

  if (!props.length) {
    return <p className="text-sm text-muted">{ex.emptyObjects}</p>;
  }

  return (
    <div tabIndex={0} onKeyDown={onKey} className="outline-none" aria-label={ex.planformAria}>
      <p className="text-sm text-muted">
        {config.intro ?? ex.planformDefaultIntro}
        {config.spatial?.complianceDisclaimer ?? ""}
        {ex.planformKeyboard}
      </p>
      <label className="mt-3 flex items-center gap-3 text-sm">
        {ex.rotate}
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
          <p className="mt-1">{ex.useLabel}：{current.use}</p>
          <p>{ex.sizeLabel}：{current.size}</p>
          <p className="mt-2 text-muted">
            {config.spatial?.circulationNote ?? ""}
          </p>
          {owner && repo && sources.length ? (
            <p className="mt-2 text-xs text-muted">
              {ex.sourceLabel}{" "}
              {sources.map((item, index) => (
                <span key={item.path}>
                  {index > 0 ? " · " : null}
                  <a
                    className="inline-flex min-h-11 items-center text-mint-deep"
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
