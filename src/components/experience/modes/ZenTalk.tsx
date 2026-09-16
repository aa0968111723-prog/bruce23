import { useState } from "react";
import { zenReply } from "@/lib/zen/engine";

export function ZenTalk() {
  const [text, setText] = useState("");
  const [log, setLog] = useState<Array<{ role: "you" | "zen"; text: string; extra?: string }>>([
    {
      role: "zen",
      text: "這是本地回應引擎，不是雲端 LLM。同一句話會得到同一組回覆。",
    },
  ]);

  function send() {
    const reply = zenReply(text);
    setLog((list) => [
      ...list,
      { role: "you", text: text || "（沉默）" },
      { role: "zen", text: reply.message, extra: `${reply.intent} · ${reply.breath}` },
    ]);
    setText("");
  }

  return (
    <div>
      <p className="text-sm text-muted">來源對齊 tku-zen-ai 的 src/lib/zen.ts。全程無網路呼叫。</p>
      <div className="mt-4 grid gap-2">
        {log.map((item, index) => (
          <div
            key={`${item.role}-${index}`}
            className={`rounded-2xl px-4 py-3 text-sm ${item.role === "you" ? "bg-surface" : "bg-surface-mint"}`}
          >
            <p>{item.text}</p>
            {item.extra ? <p className="mt-1 text-xs text-muted">{item.extra}</p> : null}
          </div>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-11 flex-1 rounded-full border border-line bg-surface px-4 text-sm"
          placeholder="輸入一句心情"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
        >
          送出
        </button>
      </form>
    </div>
  );
}
