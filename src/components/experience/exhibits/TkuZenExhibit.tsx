import { useState } from "react";
import { localZenReply, type ZenReply } from "@/lib/portfolio/zen-engine";

export function TkuZenExhibit() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState<ZenReply | null>(null);

  return (
    <div>
      <p className="text-xs text-muted">
        本地、可重現的回應引擎。不是雲端 LLM，不會把句子送到外部模型。
      </p>
      <form
        className="mt-4 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setReply(localZenReply(text));
        }}
      >
        <label className="text-sm font-medium" htmlFor="zen-line">
          打一句心情
        </label>
        <input
          id="zen-line"
          className="min-h-11 rounded-xl border border-line bg-surface px-4"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="例如：考試好緊張"
        />
        <button type="submit" className="min-h-11 rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground">
          送出（本機）
        </button>
      </form>
      {reply ? (
        <div className="mt-4 rounded-2xl bg-surface-mint p-4">
          <p className="text-xs font-medium text-mint-deep">意圖 · {reply.intent}</p>
          <p className="mt-2 text-sm leading-relaxed">{reply.message}</p>
          <p className="mt-3 text-sm text-muted">呼吸：{reply.breath}</p>
        </div>
      ) : null}
    </div>
  );
}
