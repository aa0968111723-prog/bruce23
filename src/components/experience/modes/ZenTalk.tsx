import { useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { resolveExperienceConfig } from "@/lib/experiences/resolve";
import { zenReply } from "@/lib/zen/engine";

export function ZenTalk({ project }: { project?: PublicProject }) {
  const config = project ? resolveExperienceConfig(project) : {};
  const conversation = config.conversation;
  const replies = conversation?.replies ?? [];
  const starter =
    conversation?.starter ?? conversation?.disclaimer ?? "這是本地回應引擎，不是雲端 LLM。同一句話會得到同一組回覆。";
  const [text, setText] = useState("");
  const [log, setLog] = useState<Array<{ role: "you" | "zen"; text: string; extra?: string }>>([
    { role: "zen", text: starter },
  ]);

  function send() {
    const value = text.trim();
    const matched = replies.find((item) => item.match && value.includes(item.match));
    const engine = zenReply(text);
    const reply = matched
      ? { message: matched.reply, extra: "本地關鍵詞回覆 · 不是雲端 LLM" }
      : { message: engine.message, extra: `${engine.intent} · ${engine.breath}` };
    setLog((list) => [
      ...list,
      { role: "you", text: text || "（沉默）" },
      { role: "zen", text: reply.message, extra: reply.extra },
    ]);
    setText("");
  }

  return (
    <div>
      <p className="text-sm text-muted">
        {config.intro ?? conversation?.sourceNote ?? "來源對齊 tku-zen-ai 的 src/lib/zen.ts。全程無網路呼叫。"}
      </p>
      {conversation?.disclaimer ? <p className="mt-2 text-xs text-mint-deep">{conversation.disclaimer}</p> : null}
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
          placeholder={conversation?.placeholder ?? "輸入一句心情"}
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
