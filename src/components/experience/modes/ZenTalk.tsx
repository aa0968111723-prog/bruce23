import { useEffect, useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { zenReply } from "@/lib/zen/engine";
import { useExperienceView } from "../useExperienceView";

export function ZenTalk({ project }: { project?: PublicProject }) {
  const { lang, ex, config } = useExperienceView(project);
  const conversation = config.conversation;
  const replies = conversation?.replies ?? [];
  const starter = conversation?.starter ?? conversation?.disclaimer ?? ex.zenStarter;
  const [text, setText] = useState("");
  const [log, setLog] = useState<Array<{ role: "you" | "zen"; text: string; extra?: string }>>([
    { role: "zen", text: starter },
  ]);

  useEffect(() => {
    setLog((list) => {
      if (list.length === 1 && list[0]?.role === "zen") return [{ role: "zen", text: starter }];
      return list;
    });
  }, [lang, starter]);

  function send() {
    const value = text.trim();
    const matched = replies.find((item) => item.match && value.includes(item.match));
    const engine = zenReply(text);
    const reply = matched
      ? { message: matched.reply, extra: ex.localKeyword }
      : { message: engine.message, extra: `${engine.intent} · ${engine.breath}` };
    setLog((list) => [
      ...list,
      { role: "you", text: text || ex.silence },
      { role: "zen", text: reply.message, extra: reply.extra },
    ]);
    setText("");
  }

  return (
    <div>
      <p className="text-sm text-muted">
        {config.intro ?? conversation?.sourceNote ?? ""}
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
          placeholder={conversation?.placeholder ?? ex.zenPlaceholder}
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
        >
          {ex.send}
        </button>
      </form>
    </div>
  );
}
