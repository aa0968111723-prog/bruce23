import { useState } from "react";
import { cn } from "@/lib/cn";

type Pin = { id: string; x: number; y: number; note: string };

const VERSIONS = [
  { id: "v1", label: "v1 初稿", src: "/media/covers/duigao.jpg" },
  { id: "v2", label: "v2 調整", src: "/media/archive/tku-zen-poster.jpg" },
];

export function DuigaoExhibit() {
  const [version, setVersion] = useState("v1");
  const [compare, setCompare] = useState(false);
  const [draft, setDraft] = useState("主標再大一級");
  const [pins, setPins] = useState<Pin[]>([
    { id: "p1", x: 28, y: 32, note: "主標再大一級" },
  ]);
  const current = VERSIONS.find((v) => v.id === version) ?? VERSIONS[0];

  return (
    <div>
      <p className="text-xs text-muted">
        先寫註記，再點海報位置。原稿保持乾淨。這是作品集展示，不會連到對稿私人房間。
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {VERSIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "min-h-11 rounded-full px-4 text-sm",
              item.id === version ? "bg-ink text-bg" : "bg-surface shadow-card",
            )}
            onClick={() => setVersion(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className="min-h-11 rounded-full bg-surface-mint px-4 text-sm"
          onClick={() => setCompare((v) => !v)}
        >
          {compare ? "結束對切" : "對切比較"}
        </button>
      </div>
      <label className="mt-3 grid gap-1 text-sm">
        <span>註記內容</span>
        <input className="input" value={draft} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div
          className="relative overflow-hidden rounded-2xl bg-surface-blue"
          onClick={(event) => {
            if (!draft.trim()) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            setPins((list) => [...list, { id: crypto.randomUUID(), x, y, note: draft.trim() }]);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || !draft.trim()) return;
            setPins((list) => [...list, { id: crypto.randomUUID(), x: 50, y: 50, note: draft.trim() }]);
          }}
          role="button"
          tabIndex={0}
        >
          <img src={current.src} alt="對稿海報" className="aspect-[4/3] w-full object-cover" />
          {pins.map((pin) => (
            <span
              key={pin.id}
              className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint ring-2 ring-surface"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              title={pin.note}
            />
          ))}
        </div>
        {compare ? (
          <img
            src={VERSIONS[1].src}
            alt="比較版本"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        ) : (
          <ul className="grid gap-2">
            {pins.map((pin) => (
              <li key={pin.id} className="rounded-xl bg-surface-blue px-3 py-2 text-sm">
                {pin.note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
