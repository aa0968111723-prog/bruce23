import { useEffect, useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { zenReply } from "@/lib/zen/engine";
import { useExperienceView } from "../useExperienceView";
import { usePrefersReducedMotion } from "@/lib/motion/prefers-reduced";

export function ZenTalk({ project }: { project?: PublicProject }) {
  const { lang, ex, config } = useExperienceView(project);
  const conversation = config.conversation;
  const replies = conversation?.replies ?? [];
  const suggestions = conversation?.suggestions ?? [];
  const starter = conversation?.starter ?? conversation?.disclaimer ?? ex.zenStarter;
  const [text, setText] = useState("");
  const [breath, setBreath] = useState<"idle" | "in" | "hold" | "out">("idle");
  const reduced = usePrefersReducedMotion();
  const [log, setLog] = useState<Array<{ role: "you" | "zen"; text: string; extra?: string }>>([
    { role: "zen", text: starter, extra: ex.zenBreath },
  ]);

  useEffect(() => {
    setLog((list) => {
      if (list.length === 1 && list[0]?.role === "zen") {
        return [{ role: "zen", text: starter, extra: ex.zenBreath }];
      }
      return list;
    });
  }, [lang, starter, ex.zenBreath]);

  useEffect(() => {
    if (breath === "idle" || reduced) return;
    const order: Array<"in" | "hold" | "out"> = ["in", "hold", "out"];
    const ms = breath === "in" ? 4000 : breath === "hold" ? 4000 : 6000;
    const timer = window.setTimeout(() => {
      const next = order[(order.indexOf(breath) + 1) % order.length];
      setBreath(next);
    }, ms);
    return () => window.clearTimeout(timer);
  }, [breath, reduced]);

  function send(raw = text) {
    const value = raw.trim();
    const matched = replies.find((item) => item.match && value.includes(item.match));
    const engine = zenReply(raw);
    const reply = matched
      ? { message: matched.reply, extra: `${ex.localKeyword} · ${engine.breath}` }
      : { message: engine.message, extra: `${engine.intent} · ${engine.breath}` };
    setLog((list) => [
      ...list,
      { role: "you", text: value || ex.silence },
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
      <div className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-card" data-zen-chat="true">
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-surface-mint" aria-hidden>
            <span className="size-3 rounded-full bg-mint" />
          </div>
          <div>
            <p className="font-medium">{ex.zenTitle}</p>
            <p className="text-xs text-mint-deep">{ex.zenLocalBadge}</p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex min-h-11 items-center rounded-full bg-surface-blue px-4 text-sm"
            data-zen-breath={breath}
            onClick={() => setBreath((value) => (value === "idle" ? "in" : "idle"))}
          >
            {ex.zenBreathe}
            {breath !== "idle" ? ` · ${breath}` : ""}
          </button>
        </header>
        <div className="grid gap-2 p-4">
          {log.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                item.role === "you" ? "ml-auto bg-surface-blue" : "bg-surface-mint"
              }`}
            >
              <p>{item.text}</p>
              {item.extra ? <p className="mt-2 border-t border-line/70 pt-2 text-xs italic text-mint-deep">{item.extra}</p> : null}
            </div>
          ))}
        </div>
        {suggestions.length ? (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-3 text-sm"
                onClick={() => send(item)}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
        <form
          className="flex gap-2 border-t border-line p-3"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm"
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
    </div>
  );
}
