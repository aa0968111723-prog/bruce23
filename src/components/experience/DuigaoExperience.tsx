import { useState } from "react";

type Pin = { id: string; x: number; y: number; note: string };

export function DuigaoExperience({ coverSrc }: { coverSrc?: string }) {
  const [version, setVersion] = useState<"a" | "b">("a");
  const [pins, setPins] = useState<Pin[]>([
    { id: "1", x: 0.32, y: 0.28, note: "主標再大一級" },
  ]);
  const [compare, setCompare] = useState(false);

  return (
    <div>
      <p className="text-xs font-medium text-mint-deep">
        作品集互動展示 · 不讀取對稿私人房間或 token
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => setVersion("a")}
        >
          版本 A
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
          onClick={() => setVersion("b")}
        >
          版本 B
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          onClick={() => setCompare((value) => !value)}
        >
          {compare ? "關閉對切" : "對切比較"}
        </button>
      </div>
      <div
        className="relative mt-4 overflow-hidden rounded-2xl bg-surface-blue"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          setPins((list) => [
            ...list,
            { id: crypto.randomUUID(), x, y, note: "點這裡調整" },
          ]);
        }}
      >
        <img
          src={coverSrc}
          alt="對稿海報"
          className="w-full"
          style={{ filter: version === "b" ? "grayscale(1)" : undefined }}
        />
        {compare ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-ink/20" />
        ) : null}
        {pins.map((pin) => (
          <button
            key={pin.id}
            type="button"
            className="absolute min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint text-xs font-semibold"
            style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
            onClick={(event) => event.stopPropagation()}
          >
            {pin.note}
          </button>
        ))}
      </div>
    </div>
  );
}
