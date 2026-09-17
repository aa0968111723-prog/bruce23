import { useState } from "react";
import { zenReply } from "@/lib/portfolio/zen-engine";

export function ZenChatExperience() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "you" | "zen"; text: string; breath?: string }>>([
    {
      role: "zen",
      text: "這是本地回應引擎，不是雲端 LLM。不會把社團名冊或個資送出。",
    },
  ]);

  const send = () => {
    const reply = zenReply(input);
    setMessages((list) => [
      ...list,
      { role: "you", text: input || "（沉默）" },
      { role: "zen", text: reply.message, breath: reply.breath },
    ]);
    setInput("");
  };

  return (
    <div>
      <p className="text-xs font-medium text-mint-deep">本地回應引擎 · 不是雲端 LLM</p>
      <div className="mt-4 space-y-3 rounded-2xl bg-surface p-4 shadow-card">
        {messages.map((line, index) => (
          <div key={index}>
            <p className="text-sm">
              <span className="font-medium">{line.role === "you" ? "你" : "Zen"} · </span>
              {line.text}
            </p>
            {line.breath ? <p className="text-xs text-muted">{line.breath}</p> : null}
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
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-h-11 flex-1 rounded-full bg-surface px-4 text-sm shadow-card"
          placeholder="輸入一句心情"
          aria-label="心情"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
        >
          送出
        </button>
      </form>
    </div>
  );
}
