import { useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";

const REPLIES: Record<string, string> = {
  海報: "這會是對稿或 Poster Vision 的事。Hermes Console 若連上 MCP，才會把意圖交給工具。這裡沒有連線。",
  連線: "未設定 HERMES_API_URL 時，工作區仍應開啟，並顯示尚未連線。GitHub 網址不是 MCP。",
  任務: "Console 保存會話與任務版本；秘密不進瀏覽器。本頁是作品集對話預覽。",
};

export function HermesPreview({ project }: { project: PublicProject }) {
  const [log, setLog] = useState<Array<{ role: "you" | "console"; text: string }>>([
    {
      role: "console",
      text: "這是作品集互動展示，沒有連到 Hermes 執行期。輸入「海報」「連線」或「任務」看說明。",
    },
  ]);
  const [text, setText] = useState("");

  function send(raw: string) {
    const value = raw.trim();
    if (!value) return;
    const key = Object.keys(REPLIES).find((item) => value.includes(item));
    const reply = key
      ? REPLIES[key]
      : `收到「${value}」。沒有雲端模型，也不會假裝工具已執行。來源：${project.github.repo ?? "hermes-console"}。`;
    setLog((list) => [
      ...list,
      { role: "you", text: value },
      { role: "console", text: reply },
    ]);
    setText("");
  }

  return (
    <div>
      <p className="text-sm text-muted">未連線。任何回覆都是本地說明，不是 Agent 執行結果。</p>
      <div className="mt-4 grid gap-2 rounded-2xl bg-surface p-4 shadow-card">
        {log.map((item, index) => (
          <p
            key={`${item.role}-${index}`}
            className={`rounded-xl px-3 py-2 text-sm ${item.role === "you" ? "bg-surface-mint" : "bg-surface-blue"}`}
          >
            {item.text}
          </p>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send(text);
        }}
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-11 flex-1 rounded-full border border-line bg-surface px-4 text-sm"
          placeholder="輸入一句話"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-bg"
        >
          送出
        </button>
      </form>
    </div>
  );
}
