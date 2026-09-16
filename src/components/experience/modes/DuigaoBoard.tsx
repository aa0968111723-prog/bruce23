import { useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";

type Pin = { id: string; x: number; y: number; note: string };
type Version = { id: string; label: string; filter: string };

const VERSIONS: Version[] = [
  { id: "v1", label: "v1 彩色", filter: "none" },
  { id: "v2", label: "v2 對比", filter: "contrast(1.15) saturate(1.1)" },
  { id: "bw", label: "黑白", filter: "grayscale(1)" },
];

export function DuigaoBoard({ project }: { project: PublicProject }) {
  const poster = project.media[0]?.src ?? "/media/covers/duigao.svg";
  const [version, setVersion] = useState("v1");
  const [pins, setPins] = useState<Pin[]>([
    { id: "p1", x: 32, y: 28, note: "主標再大一點" },
  ]);
  const [compare, setCompare] = useState(false);
  const current = VERSIONS.find((item) => item.id === version) ?? VERSIONS[0];

  return (
    <div>
      <p className="text-sm text-muted">
        作品集對稿示意：點位置留言、切版本、比較。這裡不連真實房間、不放邀請連結或私人討論。
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {VERSIONS.map((item) => (
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
          onClick={() => setCompare((v) => !v)}
        >
          比較 {compare ? "開" : "關"}
        </button>
      </div>
      <div className={`mt-4 grid gap-3 ${compare ? "md:grid-cols-2" : ""}`}>
        <PosterLayer
          src={poster}
          filter={current.filter}
          pins={pins}
          onAdd={(pin) => setPins((list) => [...list, pin])}
        />
        {compare ? (
          <PosterLayer src={poster} filter="grayscale(1)" pins={pins} readOnly />
        ) : null}
      </div>
      <ul className="mt-4 grid gap-2">
        {pins.map((pin) => (
          <li key={pin.id} className="rounded-xl bg-surface px-4 py-3 text-sm shadow-card">
            {pin.note}
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
  onAdd,
  readOnly,
}: {
  src: string;
  filter: string;
  pins: Pin[];
  onAdd?: (pin: Pin) => void;
  readOnly?: boolean;
}) {
  return (
    <button
      type="button"
      className="relative block overflow-hidden rounded-2xl bg-surface shadow-card"
      onClick={(event) => {
        if (readOnly || !onAdd) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        const note = window.prompt("這位置要改什麼？");
        if (!note) return;
        onAdd({ id: crypto.randomUUID(), x, y, note });
      }}
    >
      <img src={src} alt="對稿海報" className="aspect-[4/3] w-full object-cover" style={{ filter }} />
      {pins.map((pin) => (
        <span
          key={pin.id}
          className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint ring-2 ring-white"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        />
      ))}
    </button>
  );
}
