import { useMemo, useState, type KeyboardEvent } from "react";
import type { TimelineFrame } from "@/lib/cms/schema";
import type { PublicProject } from "@/lib/cms/privacy";
import { githubBlobUrl } from "@/lib/github/parse";
import { usePrefersReducedMotion } from "@/lib/motion/prefers-reduced";
import { joinSentences } from "@/lib/locale/experience";
import { useExperienceView } from "../useExperienceView";

const KIND_LABEL: Record<TimelineFrame["kind"], string> = {
  key: "Key",
  breakdown: "Breakdown",
  generated: "Generated",
};

function BallStrip({
  frames,
  index,
  onion,
  reduced,
}: {
  frames: TimelineFrame[];
  index: number;
  onion: boolean;
  reduced: boolean;
}) {
  const frame = frames[index];
  if (!frame) return null;
  const ghosts = onion && !reduced ? frames.slice(Math.max(0, index - 2), index + 1) : [frame];
  return (
    <svg viewBox="0 0 320 180" className="w-full rounded-2xl bg-surface shadow-card">
      <rect width="320" height="180" fill="#F7FBFF" />
      <line x1="16" y1="150" x2="304" y2="150" stroke="#D9EAF2" />
      {ghosts.map((item, ghostIndex) => (
        <circle
          key={`${item.i}-${ghostIndex}`}
          cx={item.x}
          cy={item.y}
          r={item.kind === "key" ? 16 : 12}
          fill={item.kind === "key" ? "#63E6BE" : item.kind === "breakdown" ? "#72B7FF" : "#FFD166"}
          opacity={ghostIndex === ghosts.length - 1 ? 1 : 0.28}
        />
      ))}
      {frame.problem ? (
        <rect
          x={frame.x - 22}
          y={frame.y - 22}
          width="44"
          height="44"
          fill="none"
          stroke="#c45c4a"
          strokeDasharray="4 3"
        />
      ) : null}
    </svg>
  );
}

export function FrameTimeline({ project }: { project: PublicProject }) {
  const { ex, config } = useExperienceView(project);
  const frames = config.timeline?.frames ?? [];
  const [index, setIndex] = useState(0);
  const [onion, setOnion] = useState(config.timeline?.onionDefault ?? true);
  const [compare, setCompare] = useState(config.timeline?.compareDefault ?? false);
  const reduced = usePrefersReducedMotion();
  const frame = frames[index] ?? frames[0];
  const owner = project.github.owner;
  const repo = project.github.repo;
  const branch = project.github.branch ?? "main";
  const sourcePaths = useMemo(() => config.fileHints?.slice(0, 4) ?? [], [config.fileHints]);

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setIndex((value) => Math.min(Math.max(0, frames.length - 1), value + 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setIndex((value) => Math.max(0, value - 1));
    } else if (event.key === "o") {
      setOnion((value) => !value);
    } else if (event.key === "c") {
      setCompare((value) => !value);
    }
  }

  if (!frame) {
    return <p className="text-sm text-muted">{ex.emptyFrames}</p>;
  }

  return (
    <div tabIndex={0} onKeyDown={onKey} className="outline-none" aria-label={ex.timelineAria}>
      <p className="text-sm text-muted">
        {joinSentences(config.intro ?? ex.timelineDefaultIntro, config.timeline?.demoDisclaimer, ex.timelineKeyboard)}
      </p>
      <div className={`mt-4 grid gap-3 ${compare ? "md:grid-cols-2" : ""}`}>
        <figure>
          <BallStrip frames={frames} index={index} onion={onion} reduced={reduced} />
          <figcaption className="mt-2 text-xs text-muted">
            {ex.demoMark} · F{frame.i} {KIND_LABEL[frame.kind]}
          </figcaption>
        </figure>
        {compare ? (
          <figure>
            <BallStrip frames={frames} index={Math.max(0, index - 1)} onion={false} reduced={reduced} />
            <figcaption className="mt-2 text-xs text-muted">{ex.comparePrev}</figcaption>
          </figure>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-1" role="group" aria-label={ex.framesAria}>
        {frames.map((item, frameIndex) => (
          <button
            key={`f-${item.i}-${frameIndex}`}
            type="button"
            onClick={() => setIndex(frameIndex)}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-xs ${
              frameIndex === index ? "bg-ink text-bg" : "bg-surface shadow-card"
            }`}
          >
            F{item.i}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => setOnion((value) => !value)}
        >
          {ex.onionSkin} {onion ? ex.on : ex.off}
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => setCompare((value) => !value)}
        >
          {ex.frameCompare} {compare ? ex.on : ex.off}
        </button>
      </div>
      <p className="mt-3 text-sm">
        {ex.currentFrame} F{frame.i} · {KIND_LABEL[frame.kind]}
        {frame.problem ? ` · ${ex.problemNote}` : ""}
      </p>
      <ul className="mt-4 grid gap-1 text-xs text-muted">
        {sourcePaths.map((item) => (
          <li key={item.path}>
            {item.stage} · {item.path}
            {owner && repo ? (
              <>
                {" "}
                <a
                  className="inline-flex min-h-11 items-center text-mint-deep"
                  href={githubBlobUrl(owner, repo, branch, item.path)}
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHub
                </a>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
