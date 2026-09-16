import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  htmlLang,
  LOCALE_STORAGE_KEY,
  parseLocale,
  type Locale,
} from "./i18n";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (next: Locale) => void;
}>({
  locale: "zh",
  setLocale: () => undefined,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const stored = parseLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
    setLocaleState(stored);
    document.documentElement.lang = htmlLang(stored);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (next: Locale) => {
        setLocaleState(next);
        window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
        document.documentElement.lang = htmlLang(next);
      },
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Hook lives next to the provider; Fast Refresh warning is expected for this pair. */
export function useLocale() {
  return useContext(LocaleContext);
}
