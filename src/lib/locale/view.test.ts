import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveHomepageCopy } from "../cms/public-site.ts";
import type { PublicProject } from "../cms/privacy.ts";
import {
  chromeFor,
  overlayProject,
  parseViewerLang,
  pickLocaleField,
  VIEWER_LANG_STORAGE_KEY,
} from "./view.ts";

const fallback = {
  nameEn: "fallback-en",
  person: "fallback-person",
  headline: "fallback-headline",
  subhead: "fallback-subhead",
  narrative: "fallback-narrative",
};

function site(locale: { zh?: Record<string, string>; en?: Record<string, string> }) {
  return {
    nameZh: "柏能",
    nameEn: "Luminous Studio",
    person: "Bruce",
    role: "role",
    headline: "ROW-HEADLINE",
    subhead: "ROW-SUBHEAD",
    narrative: "ROW-NARRATIVE",
    email: "a@b.c",
    github: "https://github.com/x",
    githubHandle: "x",
    location: "Taipei",
    seoTitle: "ROW-SEO-T",
    seoDescription: "ROW-SEO-D",
    homepageHighlightSlugs: ["framelab"],
    locale,
  };
}

function project(locale: PublicProject["locale"], extras: Partial<PublicProject> = {}): PublicProject {
  return {
    id: "1",
    slug: "folio",
    title: "ZH-TITLE",
    subtitle: "ZH-SUB",
    category: "AI Product",
    year: "2026",
    productStatus: "prototype",
    featured: true,
    sortOrder: 0,
    summary: "ZH-SUM",
    problem: "ZH-PROB",
    role: "ZH-ROLE",
    decisions: [],
    modalities: [],
    process: [],
    outputs: [],
    stack: [],
    limitations: [],
    media: [],
    locale,
    seoTitle: "ZH-SEO-T",
    seoDescription: "ZH-SEO-D",
    experienceMode: null,
    experienceConfig: {},
    interactionSteps: [],
    sourceEvidence: [],
    github: {
      url: null,
      owner: null,
      repo: null,
      branch: null,
      syncStatus: "not_configured",
      lastSyncedAt: null,
    },
    canva: {
      shareUrl: null,
      embedUrl: null,
      designId: null,
      thumbnailUrl: null,
      status: "not_configured",
      lastSyncedAt: null,
    },
    demo: {
      url: null,
      label: null,
      type: null,
      embedEnabled: false,
      status: "not_configured",
      lastVerifiedAt: null,
    },
    ...extras,
  };
}

describe("viewer locale", () => {
  it("parses only zh and en, defaulting to zh", () => {
    assert.equal(parseViewerLang("en"), "en");
    assert.equal(parseViewerLang("zh"), "zh");
    assert.equal(parseViewerLang("fr"), "zh");
    assert.equal(parseViewerLang(null), "zh");
    assert.equal(VIEWER_LANG_STORAGE_KEY, "luminous-studio-lang");
  });

  it("switches homepage headline from a persisted English overlay", () => {
    const copyZh = resolveHomepageCopy(
      site({
        zh: { headline: "中文標題", subhead: "中文副標" },
        en: { headline: "EN-HEADLINE-OVERLAY", subhead: "EN-SUBHEAD-OVERLAY" },
      }),
      fallback,
      "zh",
    );
    const copyEn = resolveHomepageCopy(
      site({
        zh: { headline: "中文標題", subhead: "中文副標" },
        en: { headline: "EN-HEADLINE-OVERLAY", subhead: "EN-SUBHEAD-OVERLAY" },
      }),
      fallback,
      "en",
    );
    assert.equal(copyZh.headline, "中文標題");
    assert.equal(copyZh.subhead, "中文副標");
    assert.equal(copyEn.headline, "EN-HEADLINE-OVERLAY");
    assert.equal(copyEn.subhead, "EN-SUBHEAD-OVERLAY");
  });

  it("falls back to zh when English overlay fields are empty", () => {
    assert.equal(
      pickLocaleField("en", { zh: { headline: "中文標題" }, en: { headline: "" } }, "headline", "ROW-HEADLINE"),
      "中文標題",
    );
    assert.equal(
      pickLocaleField("en", { zh: { headline: "中文標題" }, en: {} }, "headline", "ROW-HEADLINE"),
      "中文標題",
    );
    const copy = resolveHomepageCopy(
      site({
        zh: { headline: "中文標題", narrative: "中文敘事", seoTitle: "中 SEO", seoDescription: "中 desc" },
        en: { headline: "   ", narrative: "", seoTitle: "", seoDescription: "" },
      }),
      fallback,
      "en",
    );
    assert.equal(copy.headline, "中文標題");
    assert.equal(copy.narrative, "中文敘事");
    assert.equal(copy.seoTitle, "中 SEO");
    assert.equal(copy.seoDescription, "中 desc");
    assert.equal(pickLocaleField("zh", { zh: { title: "中" }, en: { title: "EN" } }, "title", "row"), "中");
  });

  it("round-trips admin-saved English copy onto the public resolver", () => {
    const saved = site({
      zh: {
        headline: "RT-ZH-HEADLINE",
        subhead: "RT-ZH-SUBHEAD",
        narrative: "RT-ZH-NARRATIVE",
        seoTitle: "RT-ZH-SITE-SEO-T",
        seoDescription: "RT-ZH-SITE-SEO-D",
      },
      en: {
        headline: "RT-EN-HEADLINE",
        subhead: "RT-EN-SUBHEAD",
        narrative: "RT-EN-NARRATIVE",
        seoTitle: "RT-EN-SITE-SEO-T",
        seoDescription: "RT-EN-SITE-SEO-D",
      },
    });
    const zh = resolveHomepageCopy(saved, fallback, "zh");
    const en = resolveHomepageCopy(saved, fallback, "en");
    assert.equal(zh.headline, "RT-ZH-HEADLINE");
    assert.equal(zh.seoTitle, "RT-ZH-SITE-SEO-T");
    assert.equal(en.headline, "RT-EN-HEADLINE");
    assert.equal(en.subhead, "RT-EN-SUBHEAD");
    assert.equal(en.narrative, "RT-EN-NARRATIVE");
    assert.equal(en.seoTitle, "RT-EN-SITE-SEO-T");
    assert.equal(en.seoDescription, "RT-EN-SITE-SEO-D");
  });

  it("overlays project title, summary, and SEO from locale_json", () => {
    const row = project({
      zh: { title: "ZH-TITLE", summary: "ZH-SUM", seoTitle: "ZH-SEO-T" },
      en: { title: "EN-TITLE", summary: "EN-SUM", seoTitle: "EN-SEO-T", seoDescription: "EN-SEO-D" },
    });
    assert.equal(overlayProject(row, "zh").title, "ZH-TITLE");
    assert.equal(overlayProject(row, "zh").summary, "ZH-SUM");
    const en = overlayProject(row, "en");
    assert.equal(en.title, "EN-TITLE");
    assert.equal(en.summary, "EN-SUM");
    assert.equal(en.seoTitle, "EN-SEO-T");
    assert.equal(en.seoDescription, "EN-SEO-D");
    const emptyEn = overlayProject(
      project({ zh: { title: "ZH-TITLE", summary: "ZH-SUM" }, en: { title: "", summary: "" } }),
      "en",
    );
    assert.equal(emptyEn.title, "ZH-TITLE");
    assert.equal(emptyEn.summary, "ZH-SUM");
  });

  it("keeps chrome dictionaries distinct and skip-link copy in zh", () => {
    assert.equal(chromeFor("zh").skip, "跳到內容");
    assert.equal(chromeFor("en").skip, "Skip to content");
    assert.equal(chromeFor("zh").hub.image, "圖像");
    assert.equal(chromeFor("en").hub.image, "Image");
    assert.notEqual(chromeFor("zh").workTitle, chromeFor("en").workTitle);
  });
});
