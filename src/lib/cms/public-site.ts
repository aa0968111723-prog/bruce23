import { pickLocaleField, type ViewerLang } from "../locale/view.ts";

export type PublicSite = {
  nameZh: string;
  nameEn: string;
  person: string;
  role: string;
  headline: string;
  subhead: string;
  narrative: string;
  email: string;
  github: string;
  githubHandle: string;
  location: string;
  seoTitle: string | null;
  seoDescription: string | null;
  homepageHighlightSlugs: string[];
  locale: {
    zh?: Record<string, string>;
    en?: Record<string, string>;
  };
};

export function resolveHomepageCopy(
  site: PublicSite | null | undefined,
  fallback: {
    nameEn: string;
    person: string;
    headline: string;
    subhead: string;
    narrative: string;
  },
  lang: ViewerLang = "zh",
) {
  const locale = site?.locale;
  return {
    nameEn: site?.nameEn ?? fallback.nameEn,
    person: site?.person ?? fallback.person,
    headline: pickLocaleField(lang, locale, "headline", site?.headline, fallback.headline),
    subhead: pickLocaleField(lang, locale, "subhead", site?.subhead, fallback.subhead),
    narrative: pickLocaleField(lang, locale, "narrative", site?.narrative, fallback.narrative),
    seoTitle: pickLocaleField(lang, locale, "seoTitle", site?.seoTitle, "") || null,
    seoDescription: pickLocaleField(lang, locale, "seoDescription", site?.seoDescription, "") || null,
  };
}
