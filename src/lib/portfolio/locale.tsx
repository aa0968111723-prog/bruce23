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
  type Locale,
} from "./i18n";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (next: Locale) => void;
}>({
  locale: "zh",
  setLocale: () => undefined,
});

export function LocaleProvider({
  children,
  defaultLocale = "zh",
}: {
  children: ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const storedRaw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (storedRaw === "en" || storedRaw === "zh") {
      setLocaleState(storedRaw);
      document.documentElement.lang = htmlLang(storedRaw);
      return;
    }
    let cancelled = false;
    void import("./server-public")
      .then(({ getPublicSite }) => getPublicSite())
      .then((site) => {
        if (cancelled) return;
        const next = site.i18n?.defaultLocale === "en" ? "en" : defaultLocale;
        setLocaleState(next);
        document.documentElement.lang = htmlLang(next);
      })
      .catch(() => {
        if (cancelled) return;
        setLocaleState(defaultLocale);
        document.documentElement.lang = htmlLang(defaultLocale);
      });
    return () => {
      cancelled = true;
    };
  }, [defaultLocale]);

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
