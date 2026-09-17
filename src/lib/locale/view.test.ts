import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveHomepageCopy } from "../cms/public-site.ts";
import type { PublicProject } from "../cms/privacy.ts";
import {
  ARCHIVE_ITEM_IDS,
  archiveLocaleEn,
  featuredProjectLocaleEn,
  FEATURED_WORK_SLUGS,
  localeZhFromArchive,
  localeZhFromProject,
  mergeSeedEnglish,
  siteLocaleEn,
  siteLocaleZh,
} from "../../content/locale-en.ts";
import { archiveItems } from "../../content/archive.ts";
import { projects } from "../../content/projects.ts";
import { site as siteCopy } from "../../content/site.ts";
import {
  chromeFor,
  overlayArchive,
  overlayProject,
  parseViewerLang,
  pickLocaleField,
  pickLocaleList,
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
    assert.match(chromeFor("zh").heroAlt, /光域/);
    assert.match(chromeFor("en").heroAlt, /morning light/i);
    assert.notEqual(chromeFor("zh").heroAlt, chromeFor("en").heroAlt);
    assert.notEqual(chromeFor("zh").modalitiesAlt, chromeFor("en").modalitiesAlt);
    assert.equal(chromeFor("zh").hub.image, "圖像");
    assert.equal(chromeFor("en").hub.image, "Image");
    assert.notEqual(chromeFor("zh").workTitle, chromeFor("en").workTitle);
  });

  it("uses distinct English overlays for homepage, about narrative, and all eight works", () => {
    assert.equal(FEATURED_WORK_SLUGS.length, 8);
    assert.notEqual(siteLocaleEn.headline, siteCopy.headline);
    assert.notEqual(siteLocaleEn.narrative, siteCopy.narrative);
    assert.notEqual(siteLocaleEn.seoTitle, siteLocaleZh.seoTitle);
    const homepageEn = resolveHomepageCopy(
      {
        nameZh: siteCopy.nameZh,
        nameEn: siteCopy.nameEn,
        person: siteCopy.person,
        role: siteCopy.role,
        headline: siteCopy.headline,
        subhead: siteCopy.subhead,
        narrative: siteCopy.narrative,
        email: siteCopy.email,
        github: siteCopy.github,
        githubHandle: siteCopy.githubHandle,
        location: siteCopy.location,
        seoTitle: `${siteCopy.nameZh} · ${siteCopy.person}`,
        seoDescription: siteCopy.narrative,
        homepageHighlightSlugs: [],
        locale: { zh: siteLocaleZh, en: siteLocaleEn },
      },
      fallback,
      "en",
    );
    assert.equal(homepageEn.headline, siteLocaleEn.headline);
    assert.equal(homepageEn.narrative, siteLocaleEn.narrative);
    assert.equal(homepageEn.seoTitle, siteLocaleEn.seoTitle);
    const homepageZh = resolveHomepageCopy(
      {
        nameZh: siteCopy.nameZh,
        nameEn: siteCopy.nameEn,
        person: siteCopy.person,
        role: siteCopy.role,
        headline: siteCopy.headline,
        subhead: siteCopy.subhead,
        narrative: siteCopy.narrative,
        email: siteCopy.email,
        github: siteCopy.github,
        githubHandle: siteCopy.githubHandle,
        location: siteCopy.location,
        seoTitle: `${siteCopy.nameZh} · ${siteCopy.person}`,
        seoDescription: siteCopy.narrative,
        homepageHighlightSlugs: [],
        locale: { zh: siteLocaleZh, en: siteLocaleEn },
      },
      fallback,
      "zh",
    );
    assert.equal(homepageZh.headline, siteCopy.headline);
    assert.equal(homepageZh.narrative, siteCopy.narrative);

    for (const slug of FEATURED_WORK_SLUGS) {
      const row = projects.find((item) => item.slug === slug);
      assert.ok(row, slug);
      const en = featuredProjectLocaleEn[slug];
      const zh = localeZhFromProject(slug);
      assert.ok(en.title && en.summary && zh);
      assert.notEqual(en.title, row.title, `${slug} title`);
      assert.notEqual(en.summary, row.summary, `${slug} summary`);
      assert.notEqual(en.title, zh.title, `${slug} overlay title`);
      assert.notEqual(en.summary, zh.summary, `${slug} overlay summary`);
      const locale = { zh, en };
      assert.equal(pickLocaleField("en", locale, "title", row.title), en.title);
      assert.equal(pickLocaleField("en", locale, "summary", row.summary), en.summary);
      assert.equal(pickLocaleField("zh", locale, "title", row.title), zh.title);
      const view = overlayProject(
        project(locale, {
          title: row.title,
          summary: row.summary,
          slug,
          decisions: row.decisions,
          process: row.process,
          outputs: row.outputs,
          limitations: row.limitations,
          modalities: row.modalities,
          stack: row.stack,
        }),
        "en",
      );
      assert.equal(view.title, en.title);
      assert.equal(view.summary, en.summary);
      assert.equal(view.problem, en.problem);
      assert.equal(view.role, en.role);
      assert.equal(view.seoTitle, en.seoTitle);
      assert.equal(view.seoDescription, en.seoDescription);
      assert.deepEqual(view.decisions, en.decisions);
      assert.deepEqual(view.process, en.process);
      assert.deepEqual(view.outputs, en.outputs);
      assert.deepEqual(view.limitations, en.limitations);
      assert.deepEqual(view.modalities, en.modalities);
      assert.deepEqual(view.stack, en.stack);
      assert.equal(pickLocaleList("en", locale, "decisions", row.decisions)[0], en.decisions?.[0]);
      assert.equal(pickLocaleList("zh", locale, "decisions", row.decisions)[0], row.decisions[0]);
    }
  });

  it("returns English decisions and limitations for at least two works when lang=en", () => {
    const slugs = ["framelab", "ai-director-os"] as const;
    for (const slug of slugs) {
      const row = projects.find((item) => item.slug === slug);
      const en = featuredProjectLocaleEn[slug];
      const zh = localeZhFromProject(slug);
      assert.ok(row && en.decisions?.length && en.limitations?.length && zh);
      assert.notEqual(en.decisions.join("\n"), row.decisions.join("\n"), `${slug} decisions`);
      assert.notEqual(en.limitations.join("\n"), row.limitations.join("\n"), `${slug} limitations`);
      assert.notEqual(en.decisions.join("\n"), (zh.decisions ?? []).join("\n"), `${slug} overlay decisions`);
      assert.notEqual(en.limitations.join("\n"), (zh.limitations ?? []).join("\n"), `${slug} overlay limitations`);
      const locale = { zh, en };
      assert.deepEqual(pickLocaleList("en", locale, "decisions", row.decisions), en.decisions);
      assert.deepEqual(pickLocaleList("en", locale, "limitations", row.limitations), en.limitations);
      assert.deepEqual(pickLocaleList("zh", locale, "decisions", row.decisions), zh.decisions);
      const view = overlayProject(
        project(locale, { slug, decisions: row.decisions, limitations: row.limitations }),
        "en",
      );
      assert.deepEqual(view.decisions, en.decisions);
      assert.deepEqual(view.limitations, en.limitations);
      assert.ok(view.decisions.some((item) => /[A-Za-z]/.test(item)));
      assert.ok(!view.decisions[0]?.includes("每個 frame") && !view.decisions[0]?.includes("可行實用"));
    }
  });

  it("returns English archive titles when lang=en and keeps zh on the row", () => {
    for (const id of ARCHIVE_ITEM_IDS) {
      const row = archiveItems.find((item) => item.id === id);
      const en = archiveLocaleEn[id];
      const zh = localeZhFromArchive(id);
      assert.ok(row && en.title && en.summary && zh);
      assert.notEqual(en.title, row.title, id);
      assert.notEqual(en.summary, row.summary, id);
      const item = {
        title: row.title,
        summary: row.summary,
        originNote: row.originNote,
        media: row.media ? { ...row.media } : null,
        canva: { alt: null, caption: null },
        locale: { zh, en },
      };
      const viewEn = overlayArchive(item, "en");
      const viewZh = overlayArchive(item, "zh");
      assert.equal(pickLocaleField("en", item.locale, "title", row.title), en.title);
      assert.equal(viewEn.title, en.title);
      assert.equal(viewEn.summary, en.summary);
      assert.equal(viewZh.title, row.title);
      assert.equal(viewZh.summary, row.summary);
    }
  });

  it("keeps no-Canva-paging honesty in both archive languages", () => {
    assert.match(chromeFor("zh").archiveLead, /不能翻頁/);
    assert.match(chromeFor("zh").archiveEmbedNote, /尚未提供分享連結/);
    assert.match(chromeFor("en").archiveLead, /no public Canva share URL/i);
    assert.match(chromeFor("en").archiveLead, /pages/);
    assert.match(chromeFor("en").archiveEmbedNote, /no share URL yet/i);
    const combinedEn = ARCHIVE_ITEM_IDS.map((id) => {
      const en = archiveLocaleEn[id];
      return [en.title, en.summary, en.caption, en.originNote].join("\n");
    }).join("\n");
    assert.doesNotMatch(combinedEn, /directly pageable/i);
    assert.doesNotMatch(combinedEn, /live Canva paging/i);
    assert.match(archiveLocaleEn["tku-zen-poster"].summary ?? "", /cannot page/);
    assert.match(archiveLocaleEn["tku-zen-poster"].originNote ?? "", /no public share URL/i);
  });

  it("does not clobber distinct admin English when merging seed overlays", () => {
    const merged = mergeSeedEnglish(
      { title: "Admin EN title", summary: "FrameLab" },
      { title: "FrameLab", summary: "不是剪輯軟體" },
      { title: "FrameLab: a visual-first frame-by-frame workstation", summary: "Not an NLE" },
      ["FrameLab"],
    );
    assert.equal(merged.title, "Admin EN title");
    assert.equal(merged.summary, "Not an NLE");
    const mergedLists = mergeSeedEnglish(
      { decisions: ["Admin EN decision"], limitations: ["每個 frame 是圖節點：類型、鄰居、角色、運動、修訂。"] },
      {
        decisions: ["每個 frame 是圖節點：類型、鄰居、角色、運動、修訂。"],
        limitations: ["SAM 2、RTMPose、SEA-RAFT、RIFE、Wan 僅適配器，模型未註冊時不可用。"],
      },
      {
        decisions: ["Each frame is a graph node: type, neighbors, character, motion, revision."],
        limitations: ["SAM 2, RTMPose, SEA-RAFT, RIFE, and Wan are adapters only — unavailable until a model is registered."],
      },
      ["每個 frame 是圖節點：類型、鄰居、角色、運動、修訂。"],
    );
    assert.deepEqual(mergedLists.decisions, ["Admin EN decision"]);
    assert.deepEqual(mergedLists.limitations, [
      "SAM 2, RTMPose, SEA-RAFT, RIFE, and Wan are adapters only — unavailable until a model is registered.",
    ]);
  });
});
