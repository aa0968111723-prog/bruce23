import { useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { fillChrome, joinSentences } from "@/lib/locale/experience";
import { useExperienceView } from "../useExperienceView";

type Pin = { id: string; x: number; y: number; note: string };
type Version = { id: string; label: string; filter: string };

export function DuigaoBoard({ project }: { project: PublicProject }) {
  const { ex, config } = useExperienceView(project);
  const versions: Version[] = config.comparison?.versions ?? [];
  const poster = project.media[0]?.src ?? "/media/covers/duigao.svg";
  const [version, setVersion] = useState(versions[0]?.id ?? "");
  const seedPins: Pin[] = config.comparison?.seedPins ?? [];
  const [extras, setExtras] = useState<Pin[]>([]);
  const pins = [...seedPins, ...extras];
  const [compare, setCompare] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const current = versions.find((item) => item.id === version) ?? versions[0];
  const prompt = config.comparison?.prompt ?? ex.annotatePrompt;

  if (!current) {
    return <p className="text-sm text-muted">{ex.emptyVersions}</p>;
  }

  return (
    <div>
      <p className="text-sm text-muted">
        {joinSentences(config.intro ?? ex.duigaoDefaultIntro, ex.duigaoPrivateNote)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {versions.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm ${
              version === item.id ? "bg-ink text-bg" : "bg-surface shadow-card"
            }`}
            onClick={() => setVersion(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => setCompare((value) => !value)}
        >
          {ex.compare} {compare ? ex.on : ex.off}
        </button>
      </div>
      <div className={`mt-4 grid gap-3 ${compare ? "md:grid-cols-2" : ""}`}>
        <PosterLayer
          src={poster}
          label={current.label}
          alt={fillChrome(ex.posterAlt, { label: current.label })}
          filter={current.filter}
          pins={pins}
          onPick={(point) => setPending(point)}
        />
        {compare && versions[1] ? (
          <PosterLayer
            src={poster}
            label={versions[versions.length - 1]?.label ?? ex.compare}
            alt={fillChrome(ex.posterAlt, { label: versions[versions.length - 1]?.label ?? ex.compare })}
            filter={versions[versions.length - 1]?.filter ?? "grayscale(1)"}
            pins={pins}
          />
        ) : null}
      </div>
      {pending ? (
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const note = draft.trim();
            if (!note) return;
            setExtras((list) => [...list, { id: crypto.randomUUID(), x: pending.x, y: pending.y, note }]);
            setDraft("");
            setPending(null);
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-11 flex-1 rounded-full border border-line bg-surface px-4 text-sm"
            placeholder={prompt}
            autoFocus
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          >
            {ex.addNote}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-muted">{ex.clickToAnnotate}</p>
      )}
      <ul className="mt-4 grid gap-2">
        {pins.map((pin, index) => (
          <li key={pin.id} className="rounded-xl bg-surface px-4 py-3 text-sm shadow-card">
            {index + 1}. {pin.note}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PosterLayer({
  src,
  filter,
  pins,
  onPick,
  label,
  alt,
}: {
  src: string;
  filter: string;
  pins: Pin[];
  onPick?: (point: { x: number; y: number }) => void;
  label: string;
  alt: string;
}) {
  return (
    <figure>
      <button
        type="button"
        className="relative block w-full overflow-hidden rounded-2xl bg-surface shadow-card"
        onClick={(event) => {
          if (!onPick) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          onPick({ x, y });
        }}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full object-cover"
          style={{ filter }}
        />
        {pins.map((pin, index) => (
          <span
            key={pin.id}
            className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-mint text-[10px] font-semibold text-primary-foreground ring-2 ring-white"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            data-pin-index={index + 1}
          >
            {index + 1}
          </span>
        ))}
      </button>
      <figcaption className="mt-2 text-xs text-muted">{label}</figcaption>
    </figure>
  );
}
