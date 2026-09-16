import { useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { resolveExperienceConfig } from "@/lib/experiences/resolve";

export function HermesPreview({ project }: { project: PublicProject }) {
  const config = resolveExperienceConfig(project);
  const conversation = config.conversation;
  const replies = conversation?.replies ?? [];
  const starter =
    conversation?.starter ?? "這是作品集互動展示，沒有連到 Hermes 執行期。輸入關鍵詞看說明。";
  const [log, setLog] = useState<Array<{ role: "you" | "console"; text: string }>>([
    { role: "console", text: starter },
  ]);
  const [text, setText] = useState("");

  function send(raw: string) {
    const value = raw.trim();
    if (!value) return;
    const matched = replies.find((item) => item.match && value.includes(item.match));
    const reply = matched
      ? matched.reply
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
      <p className="text-sm text-muted">
        {config.intro ?? conversation?.sourceNote ?? "未連線。任何回覆都是本地說明，不是 Agent 執行結果。"}
      </p>
      {conversation?.disclaimer ? <p className="mt-2 text-xs text-mint-deep">{conversation.disclaimer}</p> : null}
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
          placeholder={conversation?.placeholder ?? "輸入一句話"}
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
