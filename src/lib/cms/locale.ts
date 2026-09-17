import type { LocaleCopy } from "./schema.ts";

export type LocaleBundle = {
  zh?: LocaleCopy;
  en?: LocaleCopy;
};

function pick(copy: LocaleCopy | undefined, key: keyof LocaleCopy): string {
  const value = copy?.[key];
  return typeof value === "string" ? value.trim() : "";
}

/** Public pages use the row as canonical zh copy. Locale fills blanks; SEO may use either locale. */
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
    title: project.title.trim() || pick(zh, "title") || project.title,
    subtitle: project.subtitle.trim() || pick(zh, "subtitle") || project.subtitle,
    summary: project.summary.trim() || pick(zh, "summary") || project.summary,
    problem: project.problem.trim() || pick(zh, "problem") || project.problem,
    role: project.role.trim() || pick(zh, "role") || project.role,
    seoTitle: pick(zh, "seoTitle") || pick(en, "seoTitle") || project.seoTitle || null,
    seoDescription: pick(zh, "seoDescription") || pick(en, "seoDescription") || project.seoDescription || null,
  };
}

export function englishTitle(locale: LocaleBundle, zhTitle: string): string | null {
  const en = pick(locale.en, "title");
  if (!en || en === zhTitle) return null;
  return en;
}
