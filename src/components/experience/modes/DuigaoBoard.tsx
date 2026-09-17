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
  const [removed, setRemoved] = useState<string[]>([]);
  const pins = [...seedPins, ...extras].filter((pin) => !removed.includes(pin.id));
  const [compare, setCompare] = useState(false);
  const [layer, setLayer] = useState(true);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const current = versions.find((item) => item.id === version) ?? versions[0];
  const prompt = config.comparison?.prompt ?? ex.annotatePrompt;
  const selectedPin = pins.find((pin) => pin.id === selected);

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
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          data-annotation-layer={layer ? "on" : "off"}
          onClick={() => setLayer((value) => !value)}
        >
          {ex.annotationLayer} {layer ? ex.on : ex.off}
        </button>
      </div>
      <div className={`mt-4 grid gap-3 ${compare ? "md:grid-cols-2" : ""}`}>
        <PosterLayer
          src={poster}
          label={current.label}
          alt={fillChrome(ex.posterAlt, { label: current.label })}
          filter={current.filter}
          pins={layer ? pins : []}
          selected={selected}
          onPick={(point) => {
            setSelected(null);
            setPending(point);
          }}
          onSelectPin={setSelected}
        />
        {compare && versions[1] ? (
          <PosterLayer
            src={poster}
            label={versions[versions.length - 1]?.label ?? ex.compare}
            alt={fillChrome(ex.posterAlt, { label: versions[versions.length - 1]?.label ?? ex.compare })}
            filter={versions[versions.length - 1]?.filter ?? "grayscale(1)"}
            pins={layer ? pins : []}
            selected={selected}
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
            const id = crypto.randomUUID();
            setExtras((list) => [...list, { id, x: pending.x, y: pending.y, note }]);
            setDraft("");
            setPending(null);
            setSelected(id);
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
      {selectedPin ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm shadow-card" data-selected-pin={selectedPin.id}>
          <p className="flex-1">
            {ex.selectedPin}: {selectedPin.note}
          </p>
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-4"
            onClick={() => {
              setRemoved((list) => [...list, selectedPin.id]);
              setSelected(null);
            }}
          >
            {ex.deletePin}
          </button>
        </div>
      ) : null}
      <ul className="mt-4 grid gap-2">
        {pins.map((pin, index) => (
          <li key={pin.id}>
            <button
              type="button"
              className={`w-full rounded-xl px-4 py-3 text-left text-sm shadow-card ${
                selected === pin.id ? "bg-mint text-primary-foreground" : "bg-surface"
              }`}
              onClick={() => setSelected(pin.id)}
            >
              {index + 1}. {pin.note}
            </button>
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
  onSelectPin,
  selected,
  label,
  alt,
}: {
  src: string;
  filter: string;
  pins: Pin[];
  onPick?: (point: { x: number; y: number }) => void;
  onSelectPin?: (id: string) => void;
  selected?: string | null;
  label: string;
  alt: string;
}) {
  return (
    <figure>
      <div className="relative block w-full overflow-hidden rounded-2xl bg-surface shadow-card">
        <button
          type="button"
          className="block w-full"
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
        </button>
        {pins.map((pin, index) => (
          <button
            key={pin.id}
            type="button"
            className={`absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-white ${
              selected === pin.id ? "bg-ink text-bg" : "bg-mint text-primary-foreground"
            }`}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            data-pin-index={index + 1}
            onClick={(event) => {
              event.stopPropagation();
              onSelectPin?.(pin.id);
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <figcaption className="mt-2 text-xs text-muted">{label}</figcaption>
    </figure>
  );
}
