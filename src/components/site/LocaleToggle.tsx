import { useRef } from "react";
import { cn } from "@/lib/cn";
import { VIEWER_LANGS, type ViewerLang } from "@/lib/locale/view";
import { useViewerLocale } from "./LocaleProvider";

const LANG_NAME: Record<ViewerLang, string> = {
  zh: "中文",
  en: "English",
};

export function LocaleToggle({ className }: { className?: string }) {
  const { lang, setLang, ui } = useViewerLocale();
  const buttons = useRef<Partial<Record<ViewerLang, HTMLButtonElement | null>>>({});

  function select(next: ViewerLang) {
    setLang(next);
    queueMicrotask(() => buttons.current[next]?.focus());
  }

  function move(delta: number) {
    const index = VIEWER_LANGS.indexOf(lang);
    select(VIEWER_LANGS[(index + delta + VIEWER_LANGS.length) % VIEWER_LANGS.length]);
  }

  return (
    <div
      role="radiogroup"
      aria-label={ui.language}
      className={cn("inline-flex rounded-full bg-surface-blue p-0.5 shadow-card", className)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          move(1);
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          move(-1);
        }
        if (event.key === "Home") {
          event.preventDefault();
          select("zh");
        }
        if (event.key === "End") {
          event.preventDefault();
          select("en");
        }
      }}
    >
      {VIEWER_LANGS.map((item) => {
        const checked = lang === item;
        return (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={LANG_NAME[item]}
            tabIndex={checked ? 0 : -1}
            ref={(node) => {
              buttons.current[item] = node;
            }}
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-semibold tracking-wide transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky",
              checked ? "bg-surface text-mint-deep shadow-card" : "text-muted hover:text-ink",
            )}
            onClick={() => select(item)}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
