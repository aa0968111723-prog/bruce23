import { useEffect, useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { fillChrome } from "@/lib/locale/experience";
import { useExperienceView } from "../useExperienceView";

export function HermesPreview({ project }: { project: PublicProject }) {
  const { lang, ex, config } = useExperienceView(project);
  const conversation = config.conversation;
  const replies = conversation?.replies ?? [];
  const starter = conversation?.starter ?? ex.hermesStarter;
  const [log, setLog] = useState<Array<{ role: "you" | "console"; text: string }>>([
    { role: "console", text: starter },
  ]);
  const [text, setText] = useState("");

  useEffect(() => {
    setLog((list) => {
      if (list.length === 1 && list[0]?.role === "console") return [{ role: "console", text: starter }];
      return list;
    });
  }, [lang, starter]);

  function send(raw: string) {
    const value = raw.trim();
    if (!value) return;
    const matched = replies.find((item) => item.match && value.includes(item.match));
    const reply = matched
      ? matched.reply
      : fillChrome(ex.hermesUnmatched, { value, repo: project.github.repo ?? "hermes-console" });
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
        {config.intro ?? conversation?.sourceNote ?? ""}
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
          placeholder={conversation?.placeholder ?? ex.hermesPlaceholder}
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-bg"
        >
          {ex.send}
        </button>
      </form>
    </div>
  );
}
