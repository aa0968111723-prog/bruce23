export type Locale = "zh" | "en";

export const LOCALE_STORAGE_KEY = "luminous-locale";

export function parseLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "zh";
}

export function htmlLang(locale: Locale): string {
  return locale === "en" ? "en" : "zh-Hant";
}

export function pickCopy(
  locale: Locale,
  zh: string,
  en?: string | null,
): string {
  if (locale === "en" && en?.trim()) return en;
  return zh;
}
