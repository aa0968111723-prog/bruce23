import { useEffect, useState } from "react";
import type { PublicProject } from "@/lib/cms/privacy";
import { fillChrome } from "@/lib/locale/experience";
import { useExperienceView } from "../useExperienceView";

const MCP_TOOLS = [
  { id: "lumen", zh: "Lumen", en: "Lumen", path: "docs/LUMEN.md" },
  { id: "framelab", zh: "FrameLab", en: "FrameLab", path: "docs/FRAMELAB.md" },
  { id: "duigao", zh: "對稿", en: "Review", path: "docs/DUIGAO.md" },
  { id: "planform", zh: "PLANFORM", en: "PLANFORM", path: "docs/PLANFORM_MCP.md" },
  { id: "atlas", zh: "場圖", en: "Atlas", path: "docs/ATLAS_MCP.md" },
] as const;

export function HermesPreview({ project }: { project: PublicProject }) {
  const { lang, ex, config } = useExperienceView(project);
  const conversation = config.conversation;
  const replies = conversation?.replies ?? [];
  const suggestions = conversation?.suggestions ?? [];
  const starter = conversation?.starter ?? ex.hermesStarter;
  const [log, setLog] = useState<Array<{ role: "you" | "console"; text: string }>>([
    { role: "console", text: starter },
  ]);
  const [text, setText] = useState("");
  const [ready, setReady] = useState<"idle" | "disconnected">("idle");
  const [selectedTool, setSelectedTool] = useState<(typeof MCP_TOOLS)[number]["id"] | null>(null);

  useEffect(() => {
    setLog((list) => {
      if (list.length === 1 && list[0]?.role === "console") return [{ role: "console", text: starter }];
      return list;
    });
  }, [starter]);

  function send(raw: string) {
    const value = raw.trim();
    if (!value) return;
    const matched = replies.find((item) => item.match && value.toLowerCase().includes(item.match.toLowerCase()));
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
      <div className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-card" data-hermes-preview="true">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="font-medium">{ex.hermesWorkspace}</p>
          <p className="text-xs text-mint-deep">{ex.hermesDisconnected}</p>
        </header>
        <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-full bg-surface-blue px-4 text-sm"
            data-hermes-ready={ready}
            onClick={() => {
              setReady("disconnected");
              setLog((list) => [...list, { role: "console", text: ex.hermesReadyResult }]);
            }}
          >
            {ex.hermesReady}
          </button>
          {MCP_TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm ${
                selectedTool === tool.id ? "bg-ink text-bg" : "bg-surface-blue"
              }`}
              data-hermes-mcp={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
                setLog((list) => [
                  ...list,
                  { role: "console", text: `${ex.hermesReadyResult} · ${tool.path}` },
                ]);
              }}
            >
              {lang === "en" ? tool.en : tool.zh}
            </button>
          ))}
        </div>
        <p className="px-4 pt-3 text-xs text-muted">{ex.hermesMcpNote}</p>
        {selectedTool ? (
          <p className="px-4 text-xs text-muted" data-hermes-mcp-path={MCP_TOOLS.find((item) => item.id === selectedTool)?.path}>
            {MCP_TOOLS.find((item) => item.id === selectedTool)?.path}
          </p>
        ) : null}
        <div className="grid gap-2 p-4">
          {log.map((item, index) => (
            <p
              key={`${item.role}-${index}`}
              className={`rounded-xl px-3 py-2 text-sm ${item.role === "you" ? "ml-auto max-w-[85%] bg-surface-mint" : "bg-surface-blue"}`}
            >
              {item.text}
            </p>
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
            send(text);
          }}
        >
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm"
            placeholder={conversation?.placeholder ?? ex.hermesPlaceholder}
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
