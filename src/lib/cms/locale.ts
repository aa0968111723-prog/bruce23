import type { LocaleCopy } from "./schema.ts";

export type LocaleBundle = {
  zh?: LocaleCopy;
  en?: LocaleCopy;
};

function pick(copy: LocaleCopy | undefined, key: keyof LocaleCopy): string {
  const value = copy?.[key];
  return typeof value === "string" ? value.trim() : "";
}

/** Public pages prefer saved zh copy, then the row, then en. SEO may use either locale. */
export function applyPublicLocale<T extends {
  title: string;
  subtitle: string;
  summary: string;
  problem: string;
  role: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  locale: LocaleBundle;
}>(project: T): T {
  const zh = project.locale.zh;
  const en = project.locale.en;
  return {
    ...project,
    title: pick(zh, "title") || project.title,
    subtitle: pick(zh, "subtitle") || project.subtitle,
    summary: pick(zh, "summary") || project.summary,
    problem: pick(zh, "problem") || project.problem,
    role: pick(zh, "role") || project.role,
    seoTitle: pick(zh, "seoTitle") || pick(en, "seoTitle") || project.seoTitle || null,
    seoDescription: pick(zh, "seoDescription") || pick(en, "seoDescription") || project.seoDescription || null,
  };
}

export function englishTitle(locale: LocaleBundle, zhTitle: string): string | null {
  const en = pick(locale.en, "title");
  if (!en || en === zhTitle) return null;
  return en;
}
