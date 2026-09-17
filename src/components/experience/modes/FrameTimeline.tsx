import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { TimelineFrame } from "@/lib/cms/schema";
import type { PublicProject } from "@/lib/cms/privacy";
import { githubBlobUrl } from "@/lib/github/parse";
import { repairProblemFrame } from "@/lib/experiences/operate";
import { usePrefersReducedMotion } from "@/lib/motion/prefers-reduced";
import { joinSentences } from "@/lib/locale/experience";
import { useExperienceView } from "../useExperienceView";

function kindLabel(
  kind: TimelineFrame["kind"],
  repaired: boolean,
  ex: {
    frameKindKey: string;
    frameKindBreakdown: string;
    frameKindGenerated: string;
    repairedNote: string;
  },
) {
  if (repaired) return ex.repairedNote;
  if (kind === "key") return ex.frameKindKey;
  if (kind === "breakdown") return ex.frameKindBreakdown;
  return ex.frameKindGenerated;
}

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
      <rect width="320" height="180" className="fill-bg" />
      <line x1="16" y1="150" x2="304" y2="150" className="stroke-line" />
      {ghosts.map((item, ghostIndex) => (
        <circle
          key={`${item.i}-${ghostIndex}`}
          cx={item.x}
          cy={item.y}
          r={item.kind === "key" ? 16 : 12}
          className={item.kind === "key" ? "fill-mint" : item.kind === "breakdown" ? "fill-sky" : "fill-sun"}
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
          className="stroke-alert"
          strokeDasharray="4 3"
        />
      ) : null}
    </svg>
  );
}

export function FrameTimeline({ project }: { project: PublicProject }) {
  const { ex, config } = useExperienceView(project);
  const seed = config.timeline?.frames ?? [];
  const [frames, setFrames] = useState(seed);
  const [index, setIndex] = useState(0);
  const [onion, setOnion] = useState(config.timeline?.onionDefault ?? true);
  const [compare, setCompare] = useState(config.timeline?.compareDefault ?? false);
  const [playing, setPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();
  const frame = frames[index] ?? frames[0];
  const owner = project.github.owner;
  const repo = project.github.repo;
  const branch = project.github.branch ?? "main";
  const sourcePaths = useMemo(() => config.fileHints?.slice(0, 4) ?? [], [config.fileHints]);
  const repaired = Boolean(frame && !frame.problem && seed[index]?.problem);
  const acc = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    if (!playing || reduced || frames.length < 2) return;
    last.current = performance.now();
    acc.current = 0;
    let raf = 0;
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last.current) / 1000);
      last.current = now;
      acc.current += dt;
      if (acc.current >= 1 / 8) {
        acc.current = 0;
        setIndex((value) => (value + 1) % frames.length);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced, frames.length]);

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setPlaying(false);
      setIndex((value) => Math.min(Math.max(0, frames.length - 1), value + 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPlaying(false);
      setIndex((value) => Math.max(0, value - 1));
    } else if (event.key === " ") {
      event.preventDefault();
      if (!reduced) setPlaying((value) => !value);
    } else if (event.key === "o") {
      setOnion((value) => !value);
    } else if (event.key === "c") {
      setCompare((value) => !value);
    } else if (event.key === "r") {
      setFrames((list) => repairProblemFrame(list, index));
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
            {ex.demoMark} · F{frame.i} {kindLabel(frame.kind, repaired, ex)}
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
            onClick={() => {
              setPlaying(false);
              setIndex(frameIndex);
            }}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-xs ${
              frameIndex === index ? "bg-ink text-bg" : item.problem ? "bg-surface text-alert shadow-card" : "bg-surface shadow-card"
            }`}
            data-frame-problem={item.problem ? "true" : "false"}
          >
            F{item.i}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          data-timeline-play={playing ? "on" : "off"}
          onClick={() => {
            if (reduced) return;
            setPlaying((value) => !value);
          }}
          disabled={reduced}
        >
          {playing ? ex.pauseTimeline : ex.playTimeline}
        </button>
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
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          data-repair-frame=""
          disabled={!frame.problem}
          onClick={() => setFrames((list) => repairProblemFrame(list, index))}
        >
          {ex.repairHere}
        </button>
      </div>
      <p className="mt-3 text-sm" data-frame-kind={frame.kind} data-frame-repaired={repaired ? "true" : "false"}>
        {ex.currentFrame} F{frame.i} · {kindLabel(frame.kind, repaired, ex)}
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
