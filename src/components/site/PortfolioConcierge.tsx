import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X, ExternalLink, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  answerQuestion,
  getConciergeWelcome,
  SUGGESTED_QUESTIONS,
  type ConciergeAction,
  type ConciergeMessage,
} from "@/lib/agent/concierge";

export function PortfolioConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ConciergeMessage[]>([getConciergeWelcome()]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const handleSend = (textToSend?: string) => {
    const q = (textToSend ?? input).trim();
    if (!q) return;

    const userMsg: ConciergeMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");

    // 模擬微小延遲營造自然對話感
    setTimeout(() => {
      const reply = answerQuestion(q);
      setMessages((prev) => [...prev, reply]);
    }, 150);
  };

  const handleActionClick = (action: ConciergeAction) => {
    if (action.href) {
      window.open(action.href, "_blank", "noopener,noreferrer");
    } else if (action.slug) {
      if (action.slug === "featured") {
        handleSend("介紹陳柏能的 8 大精選 AI 專案");
      } else {
        handleSend(`介紹 ${action.slug} 專案`);
      }
    } else {
      handleSend(action.label);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Luminous Studio 作品集 AI 客服"
          className={cn(
            "glass-panel mb-3 flex h-[540px] max-h-[82vh] w-[370px] max-w-[calc(100vw-2rem)] sm:w-[420px] flex-col overflow-hidden rounded-3xl p-0 shadow-float transition-all",
            "border border-white/80 backdrop-blur-2xl bg-surface/95"
          )}
        >
          {/* 頂部標題列 */}
          <div className="flex items-center justify-between border-b border-line bg-surface-blue/50 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-mint/30 text-mint-deep shadow-sm">
                <Bot className="size-5" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-surface bg-mint" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-ink flex items-center gap-1.5">
                  Luminous Concierge
                  <span className="rounded-full bg-mint/20 px-2 py-0.5 text-[10px] font-medium text-mint-deep">
                    MCP 在線
                  </span>
                </h3>
                <p className="text-xs text-muted">作品集 AI 導覽與全專案諮詢</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink transition-colors"
              aria-label="關閉客服"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* 對話訊息清單 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col",
                  msg.sender === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed",
                    msg.sender === "user"
                      ? "bg-ink text-bg rounded-br-none shadow-sm"
                      : "bg-surface text-ink border border-line/70 rounded-bl-none shadow-card"
                  )}
                >
                  <p className="whitespace-pre-line text-xs sm:text-sm">{msg.text}</p>
                </div>

                {/* 結構化引導行動按鈕 */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                    {msg.actions.map((act, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleActionClick(act)}
                        className="inline-flex items-center gap-1 rounded-xl bg-surface-blue/80 hover:bg-surface-blue border border-line px-2.5 py-1 text-xs font-medium text-ink transition-colors shadow-xs"
                      >
                        {act.label}
                        {act.href ? (
                          <ExternalLink className="size-3 text-muted" />
                        ) : (
                          <ArrowRight className="size-3 text-mint-deep" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 快捷提問導引 */}
          {messages.length <= 2 && (
            <div className="border-t border-line/60 bg-surface-blue/20 px-3 py-2">
              <p className="text-[11px] text-muted mb-1.5 flex items-center gap-1 font-medium">
                <Sparkles className="size-3 text-mint-deep" /> 常用提問快捷引導：
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {SUGGESTED_QUESTIONS.slice(0, 4).map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="shrink-0 rounded-lg bg-surface border border-line px-2.5 py-1 text-xs text-ink hover:border-mint transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 輸入框 */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-line bg-surface p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="詢問 17 個專案、MCP 工具或技術架構..."
              className="flex-1 rounded-xl bg-surface-blue/40 border border-line px-3.5 py-2 text-xs sm:text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-mint/50"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="送出問題"
              className="inline-flex size-9 items-center justify-center rounded-xl bg-ink text-bg disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}

      {/* 懸浮呼叫光球按鈕 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="開啟作品集 AI 客服代理"
        className={cn(
          "group relative flex size-14 items-center justify-center rounded-full bg-surface shadow-float transition-transform hover:scale-105 active:scale-95",
          "border-2 border-white/90 backdrop-blur-md bg-gradient-to-tr from-surface-mint via-surface to-surface-blue"
        )}
      >
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="size-6 text-ink transition-transform group-hover:rotate-90" />
          ) : (
            <>
              <Bot className="size-6 text-ink transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-mint-deep" />
              </span>
            </>
          )}
        </div>
        {!isOpen && (
          <span className="absolute right-16 hidden rounded-xl bg-ink/90 px-3 py-1.5 text-xs font-medium text-bg shadow-card sm:block whitespace-nowrap">
            💬 AI 導覽客服 · 17專案全公開
          </span>
        )}
      </button>
    </div>
  );
}
