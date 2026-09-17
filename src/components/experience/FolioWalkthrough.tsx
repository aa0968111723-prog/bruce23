import { useState } from "react";

const STEPS = [
  { id: "canvas", title: "畫布", body: "文字、形狀、元件共用同一份文件模型。" },
  { id: "check", title: "設計檢查", body: "對比、溢出、安全區。這是工具檢查，不是品牌分數。" },
  { id: "bridge", title: "外部網站", body: "未裝 SDK 的跨來源網站只提供 Live iframe 或 Snapshot。" },
  { id: "mcp", title: "MCP", body: "寫入預設 dry-run。未發布文件不會出現在公開 /mcp。" },
];

export function FolioWalkthrough() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  return (
    <div>
      <p className="text-xs font-medium text-mint-deep">作品集互動展示 · Folio / canva2 指令層</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {STEPS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="min-h-11 rounded-2xl bg-surface px-3 text-sm shadow-card"
            onClick={() => setStep(index)}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-surface-mint p-5">
        <h3 className="font-display text-xl">{current.title}</h3>
        <p className="mt-2 text-sm leading-relaxed">{current.body}</p>
      </div>
    </div>
  );
}
