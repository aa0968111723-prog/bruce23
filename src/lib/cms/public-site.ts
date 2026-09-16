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
) {
  return {
    nameEn: site?.nameEn ?? fallback.nameEn,
    person: site?.person ?? fallback.person,
    headline: site?.locale?.zh?.headline?.trim() || site?.headline || fallback.headline,
    subhead:
      site?.locale?.en?.subhead?.trim() ||
      site?.locale?.zh?.subhead?.trim() ||
      site?.locale?.en?.headline?.trim() ||
      site?.subhead ||
      fallback.subhead,
    narrative: site?.locale?.zh?.narrative?.trim() || site?.narrative || fallback.narrative,
    seoTitle:
      site?.locale?.zh?.seoTitle?.trim() ||
      site?.locale?.en?.seoTitle?.trim() ||
      site?.seoTitle?.trim() ||
      null,
    seoDescription:
      site?.locale?.zh?.seoDescription?.trim() ||
      site?.locale?.en?.seoDescription?.trim() ||
      site?.seoDescription?.trim() ||
      null,
  };
}
