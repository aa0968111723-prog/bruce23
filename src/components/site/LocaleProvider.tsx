import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { experienceChromeFor, type ExperienceChrome } from "@/lib/locale/experience";
import {
  parseViewerLang,
  readStoredViewerLang,
  writeStoredViewerLang,
  chromeFor,
  type ChromeCopy,
  type ViewerLang,
} from "@/lib/locale/view";

type LocaleContextValue = {
  lang: ViewerLang;
  setLang: (lang: ViewerLang) => void;
  ui: ChromeCopy;
  ex: ExperienceChrome;
};

const LocaleContext = createContext<LocaleContextValue>({
  lang: "zh",
  setLang: () => undefined,
  ui: chromeFor("zh"),
  ex: experienceChromeFor("zh"),
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<ViewerLang>("zh");

  useEffect(() => {
    setLangState(readStoredViewerLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
  }, [lang]);

  const setLang = useCallback((next: ViewerLang) => {
    const parsed = parseViewerLang(next);
    setLangState(parsed);
    writeStoredViewerLang(parsed);
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      ui: chromeFor(lang),
      ex: experienceChromeFor(lang),
    }),
    [lang, setLang],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useViewerLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

export function useLocaleDocumentTitle(title: string, description?: string | null) {
  useEffect(() => {
    if (title.trim()) document.title = title;
    if (description == null) return;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }, [title, description]);
}
