import { useState } from "react";

const REPLIES: Record<string, string> = {
  連線: "Hermes 尚未連線。未設定端點時會顯示尚未連線，不會假裝工具已通。",
  任務: "Console 保存會話與任務。這是作品集預覽，不是已連線的 Hermes 實例。",
  MCP: "GitHub 倉庫網址不是 MCP。要填真實 HTTPS endpoint 與 token 後才探測。",
};

export function HermesConversation({ connected }: { connected: boolean }) {
  const [log, setLog] = useState<Array<{ role: "you" | "console"; text: string }>>([
    {
      role: "console",
      text: connected
        ? "公開網址曾驗證可達。仍可能隨時變動。"
        : "尚未連線 Hermes。此預覽是作品集互動展示。",
    },
  ]);

  return (
    <div>
      <p className="text-xs font-medium text-mint-deep">
        {connected ? "公開網址曾驗證" : "作品集互動展示"} · 秘密不會出現在這裡
      </p>
      <div className="mt-4 min-h-48 rounded-2xl bg-surface p-4 shadow-card">
        {log.map((line, index) => (
          <p key={index} className="mb-2 text-sm">
            <span className="font-medium">{line.role === "you" ? "你" : "Console"} · </span>
            {line.text}
          </p>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.keys(REPLIES).map((key) => (
          <button
            key={key}
            type="button"
            className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-4 text-sm"
            onClick={() =>
              setLog((list) => [
                ...list,
                { role: "you", text: key },
                { role: "console", text: REPLIES[key] },
              ])
            }
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
