import { useState } from "react";
import { zenReply, type ZenReply } from "@/lib/experiences/zen";

export function ZenExperience({ note }: { note?: string }) {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<Array<{ role: "you" | "zen"; text: string; meta?: ZenReply }>>([]);

  function send() {
    const reply = zenReply(input);
    setLog((prev) => [
      ...prev,
      { role: "you", text: input || "（沉默）" },
      { role: "zen", text: reply.message, meta: reply },
    ]);
    setInput("");
  }

  return (
    <div>
      <p className="text-sm font-medium text-mint-deep">TKU Zen AI · 本地引擎</p>
      {note ? <p className="mt-1 text-sm text-muted">{note}</p> : null}
      <p className="mt-2 text-xs text-muted">不是雲端 LLM。同輸入同輸出，可重測。</p>
      <div className="mt-4 min-h-56 space-y-3 rounded-2xl bg-surface p-4 shadow-card">
        {log.length === 0 ? (
          <p className="text-sm text-muted">輸入一句心情，例如「考試好累」。 </p>
        ) : (
          log.map((line, idx) => (
            <div key={`${line.role}-${idx}`} className={line.role === "you" ? "text-right" : ""}>
              <p className="text-sm">{line.text}</p>
              {line.meta ? (
                <p className="mt-1 text-xs text-muted">
                  意圖 {line.meta.intent} · {line.meta.breath}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-11 flex-1 rounded-full border border-line bg-surface px-4 text-sm"
          placeholder="打一句話"
          aria-label="禪意對話輸入"
        />
        <button type="submit" className="min-h-11 rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground">
          送出
        </button>
      </form>
    </div>
  );
}
