import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { experienceCatalog, projectHubIds } from "./catalog.ts";
import { nextRovingTabIndex } from "../../components/site/useRovingTabs.ts";

describe("experience catalog", () => {
  it("covers all eight works with distinct modes", () => {
    const slugs = [
      "ai-director-os",
      "framelab",
      "poster-vision-ai",
      "planform",
      "duigao",
      "folio",
      "hermes-console",
      "tku-zen-ai",
    ];
    const modes = slugs.map((slug) => experienceCatalog[slug].mode);
    assert.equal(new Set(slugs.filter((slug) => experienceCatalog[slug])).size, 8);
    assert.equal(experienceCatalog["ai-director-os"].mode, "process-map");
    assert.equal(experienceCatalog.framelab.mode, "timeline");
    assert.equal(experienceCatalog["poster-vision-ai"].mode, "image-comparison");
    assert.equal(experienceCatalog.planform.mode, "spatial-preview");
    assert.equal(experienceCatalog.duigao.mode, "image-comparison");
    assert.equal(experienceCatalog.folio.mode, "interactive-walkthrough");
    assert.equal(experienceCatalog["hermes-console"].mode, "conversation-preview");
    assert.equal(experienceCatalog["tku-zen-ai"].mode, "conversation-preview");
    assert.ok(modes.includes("process-map"));
    assert.ok(modes.includes("timeline"));
    assert.ok(modes.includes("spatial-preview"));
    assert.ok(experienceCatalog["ai-director-os"].honestyLabel.includes("作品集"));
    assert.ok(experienceCatalog["tku-zen-ai"].honestyLabel.includes("不是雲端"));
  });

  it("wires only hunted public demo URLs into featured seed content", () => {
    const source = readFileSync(new URL("../../../src/content/projects.ts", import.meta.url), "utf8");
    assert.match(source, /live: "https:\/\/ai-os-app\.zeabur\.app"/);
    assert.match(source, /https:\/\/ai-os-ten\.vercel\.app/);
    assert.match(source, /https:\/\/ai-os-app\.zeabur\.app/);
    assert.match(source, /https:\/\/duigao-k7q2\.zeabur\.app/);
    assert.match(source, /https:\/\/344\.zeabur\.app/);
    assert.match(source, /https:\/\/planform-iso-k7d2\.zeabur\.app/);
    assert.doesNotMatch(source, /canva\.com\/design\/DAG/);
    assert.doesNotMatch(source, /github\.io\/planform/);
    assert.match(source, /\/media\/github-exports\/\$\{slug\}\/\$\{file\}/);
    assert.match(source, /desktop-dashboard\.png/);
    assert.match(source, /"og.jpg"/);
    assert.match(source, /"club-illustration.jpg"/);
    assert.match(source, /公開 GitHub 匯出/);
    assert.doesNotMatch(source, /drive\.google\.com\/file/);
  });

  it("uses real GitHub source paths for AI Director OS and FrameLab", () => {
    const nodes = experienceCatalog["ai-director-os"].processNodes ?? [];
    assert.ok(nodes.some((node) => node.githubPath === "server/services/projectCore.ts"));
    assert.ok(nodes.some((node) => node.githubPath === "shared/worldview.ts"));
    assert.ok(nodes.some((node) => node.githubPath === "shared/storyboardScript.ts"));
    assert.ok(nodes.some((node) => node.githubPath === "server/db/schema/generation.ts"));
    const frameHints = experienceCatalog.framelab.fileHints ?? [];
    assert.ok(frameHints.some((item) => item.path === "src/lib/domain/timeline-engine.ts"));
    assert.ok(frameHints.some((item) => item.path === "src/lib/domain/sample-ball.ts"));
    assert.ok((experienceCatalog.planform.fileHints ?? []).some((item) => item.path === "src/core/placement.ts"));
  });

  it("maps CMS modalities onto hubs instead of guessing from slug", () => {
    assert.deepEqual(projectHubIds({ slug: "unknown-work", modalities: ["3D", "動線"] }).sort(), ["space"]);
    assert.ok(projectHubIds({ slug: "planform", modalities: [] }).includes("space"));
    assert.deepEqual(
      projectHubIds({ slug: "planform", modalities: ["3D", "平面圖", "動線"] }).sort(),
      ["space"],
    );
    assert.equal(projectHubIds({ slug: "planform", modalities: ["3D", "平面圖"] }).includes("poster"), false);
  });
});

describe("frontend contract", () => {
  it("does not put integration tokens in client modules", () => {
    const files = [
      "src/components/experience/ExperiencePanel.tsx",
      "src/components/experience/GithubExplorer.tsx",
      "src/components/experience/CanvaStage.tsx",
      "src/components/home/ExplorationField.tsx",
      "src/components/admin/ProjectForm.tsx",
      "src/components/admin/ExperienceEditor.tsx",
      "src/routes/index.tsx",
      "src/routes/login.tsx",
      "src/routes/admin/integrations.tsx",
      "src/routes/admin/settings.tsx",
      "src/lib/cms/public-fn.ts",
      "src/components/admin/GithubSyncDiff.tsx",
      "src/components/work/CaseStudyView.tsx",
    ];
    for (const file of files) {
      const text = readFileSync(new URL(`../../../${file}`, import.meta.url), "utf8");
      assert.doesNotMatch(text, /GITHUB_READ_TOKEN/);
      assert.doesNotMatch(text, /CANVA_CLIENT_SECRET/);
      assert.doesNotMatch(text, /CANVA_CLIENT_ID/);
      assert.doesNotMatch(text, /service_role/);
      assert.doesNotMatch(text, /VITE_GITHUB/);
      assert.doesNotMatch(text, /VITE_CANVA/);
      assert.doesNotMatch(text, /access_token/);
      assert.doesNotMatch(text, /refresh_token/);
    }
  });

  it("keeps reduced-motion, skip link, and 44px targets", () => {
    const css = readFileSync(new URL("../../../src/styles.css", import.meta.url), "utf8");
    assert.match(css, /prefers-reduced-motion/);
    assert.match(css, /overflow-x:\s*clip/);
    const header = readFileSync(new URL("../../../src/components/site/SiteHeader.tsx", import.meta.url), "utf8");
    assert.match(header, /min-h-11/);
    const footer = readFileSync(new URL("../../../src/components/site/SiteFooter.tsx", import.meta.url), "utf8");
    assert.match(footer, /min-h-11/);
    const shell = readFileSync(new URL("../../../src/components/site/SiteShell.tsx", import.meta.url), "utf8");
    assert.match(shell, /ui\.skip/);
    assert.match(shell, /LocaleProvider/);
    const localeView = readFileSync(new URL("../../../src/lib/locale/view.ts", import.meta.url), "utf8");
    assert.match(localeView, /跳到內容/);
    const toggle = readFileSync(new URL("../../../src/components/site/LocaleToggle.tsx", import.meta.url), "utf8");
    assert.match(toggle, /role="radiogroup"/);
    assert.match(toggle, /min-h-11/);
    assert.match(toggle, /min-w-11/);
    assert.match(header, /LocaleToggle/);
    const panel = readFileSync(
      new URL("../../../src/components/experience/ExperiencePanel.tsx", import.meta.url),
      "utf8",
    );
    assert.match(panel, /role="tab"/);
    assert.match(panel, /tabIndex/);
    assert.match(panel, /useRovingTabs/);
    assert.match(panel, /onKeyDown/);
    assert.match(panel, /Escape/);
    const experienceLocale = readFileSync(
      new URL("../../../src/lib/locale/experience.ts", import.meta.url),
      "utf8",
    );
    const explorer = readFileSync(
      new URL("../../../src/components/experience/GithubExplorer.tsx", import.meta.url),
      "utf8",
    );
    assert.match(explorer, /ArrowRight/);
    assert.match(explorer, /ArrowLeft/);
    assert.match(explorer, /ArrowDown/);
    assert.match(explorer, /ArrowUp/);
    assert.match(explorer, /keyboardNav/);
    assert.match(explorer, /itemRefs/);
    assert.match(explorer, /aria-expanded/);
    assert.match(explorer, /role="tree"/);
    assert.match(explorer, /ex\.hintTreeAria|ex\.hintNote/);
    assert.match(experienceLocale, /來源路徑/);
    assert.match(experienceLocale, /Limited file tree/);
    assert.match(css, /animation:\s*none/);
    assert.match(css, /--color-mat/);
    assert.match(panel, /howItWorksSteps/);
    assert.match(panel, /useExperienceView/);
    assert.match(panel, /ex\.tabPlay/);
    assert.match(panel, /galleryNote/);
    assert.match(panel, /MediaFrame/);
    assert.match(panel, /github-exports/);
    const mediaFrame = readFileSync(new URL("../../../src/components/site/MediaFrame.tsx", import.meta.url), "utf8");
    assert.match(mediaFrame, /bg-mat/);
    assert.match(mediaFrame, /GitHub 匯出/);
    assert.match(mediaFrame, /data-github-export/);
    assert.doesNotMatch(mediaFrame, /dark:|bg-black|className="[^"]*bg-ink/);
    assert.match(panel, /inline-flex min-h-11 items-center font-medium text-mint-deep/);
    assert.match(header, /mobile-nav/);
    const rootDoc = readFileSync(new URL("../../../src/routes/__root.tsx", import.meta.url), "utf8");
    assert.match(rootDoc, /\/favicon.svg/);
    assert.match(rootDoc, /\/icon-192.png/);
    assert.match(rootDoc, /\/icon-512.png/);
    const roving = readFileSync(
      new URL("../../../src/components/site/useRovingTabs.ts", import.meta.url),
      "utf8",
    );
    assert.match(roving, /ArrowRight/);
    assert.match(roving, /nextRovingTabIndex/);
    assert.equal(nextRovingTabIndex(3, 0, "ArrowRight"), 1);
    assert.equal(nextRovingTabIndex(3, 2, "ArrowRight"), 0);
    assert.equal(nextRovingTabIndex(3, 0, "ArrowLeft"), 2);
    assert.equal(nextRovingTabIndex(4, 2, "Home"), 0);
    assert.equal(nextRovingTabIndex(4, 0, "End"), 3);
    assert.equal(nextRovingTabIndex(3, 1, "Tab"), null);
    assert.equal(nextRovingTabIndex(0, 0, "ArrowRight"), null);
    const work = readFileSync(new URL("../../../src/routes/work/index.tsx", import.meta.url), "utf8");
    assert.match(work, /useRovingTabs/);
    assert.match(work, /name: "description"/);
    const archive = readFileSync(new URL("../../../src/routes/archive.tsx", import.meta.url), "utf8");
    assert.match(archive, /useRovingTabs/);
    assert.match(archive, /name: "description"/);
    const stage = readFileSync(
      new URL("../../../src/components/experience/CanvaStage.tsx", import.meta.url),
      "utf8",
    );
    assert.match(experienceLocale, /沒有公開分享連結/);
    assert.match(experienceLocale, /空白 iframe/);
    assert.match(experienceLocale, /全螢幕/);
    assert.match(experienceLocale, /在 Canva 開啟原作/);
    assert.match(experienceLocale, /The Canva original cannot be publicly embedded/);
    assert.match(experienceLocale, /not claiming Connect is linked/);
    assert.match(stage, /ex\.noShareTitle|ex\.unavailableTitle/);
    assert.match(stage, /publicCanvaEmbedUrl/);
    assert.match(stage, /pages.length > 1/);
    assert.doesNotMatch(stage, /\["cover"\]/);
    assert.ok(stage.indexOf('if (state === "fallback" || !embed)') < stage.indexOf("<iframe"));
    const demoStage = readFileSync(
      new URL("../../../src/components/experience/LiveDemoStage.tsx", import.meta.url),
      "utf8",
    );
    assert.ok(demoStage.indexOf('if (state === "embed" && demo.url') < demoStage.indexOf("<iframe"));
    const processMap = readFileSync(
      new URL("../../../src/components/experience/modes/ProcessMap.tsx", import.meta.url),
      "utf8",
    );
    assert.match(processMap, /ArrowRight|useRovingTabs/);
    assert.match(processMap, /node.githubPath/);
    assert.match(processMap, /ex\.processDefaultIntro|useExperienceView/);
    assert.match(experienceLocale, /不是線上產品控制台/);
    const timeline = readFileSync(
      new URL("../../../src/components/experience/modes/FrameTimeline.tsx", import.meta.url),
      "utf8",
    );
    assert.match(timeline, /ex\.onionSkin|useExperienceView/);
    assert.match(experienceLocale, /Onion skin/);
    assert.match(experienceLocale, /not GPU model output/);
    const defaultsSrc = readFileSync(
      new URL("../../../src/lib/experiences/defaults.ts", import.meta.url),
      "utf8",
    );
    assert.match(defaultsSrc, /不是 GPU 模型輸出/);
    const folioWalk = readFileSync(
      new URL("../../../src/components/experience/modes/FolioWalkthrough.tsx", import.meta.url),
      "utf8",
    );
    assert.match(folioWalk, /data-walkthrough-stage/);
    assert.match(folioWalk, /walkthroughStageKind/);
    assert.match(folioWalk, /CanvasStage/);
    assert.match(folioWalk, /不是空白計數器|ex\.folioNotCounter/);
    assert.match(experienceLocale, /不是空白計數器/);
    const canvas = readFileSync(
      new URL("../../../src/components/experience/ExperienceCanvas.tsx", import.meta.url),
      "utf8",
    );
    assert.match(canvas, /spatial-preview/);
    assert.match(canvas, /LiveDemoStage/);
    assert.match(canvas, /DuigaoBoard/);
    const poster = readFileSync(
      new URL("../../../src/components/experience/modes/PosterVision.tsx", import.meta.url),
      "utf8",
    );
    assert.match(poster, /regionCenter/);
    assert.match(poster, /onLoad/);
    assert.match(poster, /posterLoading/);
    assert.match(experienceLocale, /不是眼動追蹤/);
    assert.match(experienceLocale, /not eye-tracking/);
    const planform = readFileSync(
      new URL("../../../src/components/experience/modes/PlanformSpace.tsx", import.meta.url),
      "utf8",
    );
    assert.match(planform, /法規符合|規範符合|ex\.planformAria|complianceDisclaimer/);
    assert.match(experienceLocale, /not a code-compliance calculation/);
    const settings = readFileSync(new URL("../../../src/routes/admin/settings.tsx", import.meta.url), "utf8");
    assert.doesNotMatch(settings, /homepage_json: \{\}/);
    assert.match(settings, /highlightSlugs/);
    assert.match(settings, /localeZhSeoTitle/);
    assert.match(settings, /localeEnSeoDescription/);
    assert.match(settings, /localeEnSubhead/);
    assert.match(settings, /localeZhSubhead/);
    const index = readFileSync(new URL("../../../src/routes/index.tsx", import.meta.url), "utf8");
    assert.match(index, /resolveHomepageCopy/);
    assert.match(index, /seoTitle/);
    assert.match(index, /resolveHomepageCopy\(site, fallbackSite, lang\)/);
    assert.match(index, /overlayProject/);
    assert.match(header, /md:hidden/);
    assert.doesNotMatch(toggle, /dark:/);
    const about = readFileSync(new URL("../../../src/routes/about.tsx", import.meta.url), "utf8");
    assert.match(about, /getPublicSiteFn/);
    assert.match(about, /resolveHomepageCopy/);
    const publicFn = readFileSync(new URL("../../../src/lib/cms/public-fn.ts", import.meta.url), "utf8");
    assert.match(publicFn, /locale:/);
    const jsonldView = readFileSync(new URL("../../../src/components/work/CaseStudyView.tsx", import.meta.url), "utf8");
    assert.match(jsonldView, /publishedCreativeWorkJsonLd/);
    const form = readFileSync(new URL("../../../src/components/admin/ProjectForm.tsx", import.meta.url), "utf8");
    assert.match(form, /GithubSyncDiff/);
    assert.match(form, /ExperienceEditor/);
    assert.match(form, /互動展示模式/);
    assert.match(form, /來源證據/);
    assert.doesNotMatch(form, /experience_config JSON/);
    assert.match(form, /canva_page_ids/);
    assert.match(form, /修訂紀錄/);
    assert.match(form, /尚無修訂/);
    assert.match(form, /年份/);
    assert.match(form, /listRevisionsFn/);
    assert.match(form, /\/d\/ 短網址/);
    assert.match(form, /canva.com\/design\/\{id\}/);
    assert.match(form, /目前沒有 Canva 分享連結/);
    assert.match(form, /不要虛構設計編號/);
    assert.doesNotMatch(form, /明天的分享連結/);
    assert.match(form, /localeKey/);
    assert.match(form, /中文 SEO 標題/);
    assert.match(form, /英文 SEO 描述/);
    assert.match(form, /英文決策（一行一項）/);
    assert.match(form, /英文限制（一行一項）/);
    assert.match(form, /英文流程（一行一項）/);
    assert.match(form, /英文多模態（一行一項）/);
    assert.match(form, /英文技術（一行一項）/);
    assert.match(form, /封面說明/);
    assert.match(form, /影片封面/);
    assert.match(form, /其他圖片/);
    assert.match(form, /GitHub branch/);
    assert.match(form, /patchMediaItem/);
    assert.match(form, /persistDemoVerify|verifyDemoFn/);
    const seedSource = readFileSync(new URL("../../../src/lib/cms/seed.ts", import.meta.url), "utf8");
    assert.match(seedSource, /fillLocaleJsonGaps/);
    assert.match(seedSource, /fillArchiveLocaleGaps/);
    assert.match(seedSource, /fillSiteLocaleGaps/);
    assert.doesNotMatch(seedSource, /experienceCopyEn/);
    const schemaSource = readFileSync(new URL("../../../src/lib/cms/schema.ts", import.meta.url), "utf8");
    assert.match(schemaSource, /localeListSchema/);
    assert.match(schemaSource, /decisions: localeListSchema/);
    const localeEn = readFileSync(new URL("../../../src/content/locale-en.ts", import.meta.url), "utf8");
    assert.match(localeEn, /featuredProjectLocaleEn/);
    assert.match(localeEn, /siteLocaleEn/);
    assert.match(localeEn, /Each frame is a graph node/);
    assert.match(localeEn, /Fal\.ai is the only vendor/);
    assert.match(localeEn, /archiveLocaleEn/);
    assert.match(localeEn, /Landscapes and sunrise/);
    assert.match(localeEn, /Image sequence/);
    assert.doesNotMatch(localeEn, /DAGx/);
    const archiveForm = readFileSync(
      new URL("../../../src/components/admin/ArchiveForm.tsx", import.meta.url),
      "utf8",
    );
    assert.match(archiveForm, /beforeunload/);
    assert.match(archiveForm, /publication_status/);
    assert.match(archiveForm, /origin_note/);
    assert.match(archiveForm, /媒體路徑/);
    assert.match(archiveForm, /canva.com\/design\/\{id\}/);
    assert.match(archiveForm, /目前沒有 Canva 分享連結/);
    assert.match(archiveForm, /英文標題/);
    assert.match(archiveForm, /英文摘要/);
    assert.match(archiveForm, /英文媒體說明/);
    assert.match(archiveForm, /locale_json/);
    assert.match(archiveForm, /canva_page_ids/);
    assert.match(archiveForm, /媒體類型/);
    assert.match(archiveForm, /canva_thumbnail_url/);
    const privacy = readFileSync(new URL("../../../src/routes/privacy.tsx", import.meta.url), "utf8");
    assert.match(privacy, /privacyHidden/);
    assert.match(localeView, /不會公開的/);
    assert.match(localeView, /電話/);
    const siteNav = readFileSync(new URL("../../../src/content/site.ts", import.meta.url), "utf8");
    assert.match(siteNav, /\/privacy/);
    const editor = readFileSync(
      new URL("../../../src/components/admin/ExperienceEditor.tsx", import.meta.url),
      "utf8",
    );
    assert.match(editor, /互動展示內容/);
    assert.match(editor, /進階 JSON（只讀預覽）/);
    assert.match(editor, /FrameLab 時間軸/);
    assert.match(editor, /PLANFORM 物件與動線/);
    assert.match(editor, /不要加頁面標籤或虛構頁面 ID/);
    assert.match(editor, /Demo 說明/);
    assert.match(editor, /Canva 說明/);
    assert.match(editor, /GitHub 說明/);
    assert.match(editor, /廊說明/);
    assert.match(editor, /英文 overlay/);
    assert.match(editor, /英文標籤/);
    assert.match(editor, /英文 Canva 說明/);
    assert.match(editor, /英文示範說明/);
    assert.match(editor, /英文名稱/);
    assert.match(editor, /英文用途/);
    assert.match(editor, /英文版本標籤/);
    assert.match(editor, /英文開場白/);
    assert.match(editor, /英文免責／誠實聲明/);
    assert.match(editor, /英文走查說明/);
    assert.match(editor, /patchEn/);
    assert.match(editor, /locale\?\.en/);
    assert.match(form, /beforeunload/);
    assert.match(form, /toast\.success/);
    assert.match(form, /有未儲存的修改/);
    assert.match(schemaSource, /experienceLocaleOverlaySchema/);
    const defaultsSource = readFileSync(new URL("../../../src/lib/experiences/defaults.ts", import.meta.url), "utf8");
    assert.match(defaultsSource, /locale: current.locale/);
    const field = readFileSync(
      new URL("../../../src/components/home/ExplorationField.tsx", import.meta.url),
      "utf8",
    );
    assert.match(field, /constellationLayout/);
    assert.match(field, /useRovingTabs/);
    assert.match(field, /ui\.explorationAria/);
    assert.match(localeView, /explorationAria: "作品與模態"/);
    assert.match(field, /hidden /);
    assert.match(field, /lg:block/);
    assert.match(field, /overflow-visible/);
    assert.match(field, /availableFilters/);
    assert.doesNotMatch(field, /particle/);
    assert.match(archive, /overlayArchive/);
    assert.match(archive, /CanvaStage/);
    assert.match(archive, /archiveEmbedNote/);
    assert.match(localeView, /尚未提供分享連結/);
    assert.match(archive, /parseCanvaDesign/);
    assert.match(archive, /ArchiveLocalCover/);
    assert.match(archive, /pageIds: item.canva.pageIds/);
    assert.doesNotMatch(archive, /直接可翻頁/);
    assert.doesNotMatch(archive, /有 Canva 嵌入的會/);
    const migration3 = readFileSync(new URL("../../../migrations/0003_archive_locale.sql", import.meta.url), "utf8");
    assert.match(migration3, /alter table archive_items/);
    assert.match(migration3, /locale_json/);
    const migration2 = readFileSync(new URL("../../../migrations/0002_portfolio_cms.sql", import.meta.url), "utf8");
    assert.doesNotMatch(migration2, /archive_items[\s\S]*locale_json jsonb not null default/);
    const integrations = readFileSync(
      new URL("../../../src/routes/admin/integrations.tsx", import.meta.url),
      "utf8",
    );
    const integrationsCard = readFileSync(
      new URL("../../../src/components/admin/IntegrationWorkCard.tsx", import.meta.url),
      "utf8",
    );
    assert.match(integrations, /Notion/);
    assert.match(integrations, /not_configured/);
    assert.match(integrations, /不會標記為成功/);
    assert.match(integrations, /目前沒有 Canva Connect/);
    assert.match(integrations, /canva.com\/design\/\{id\}/);
    assert.match(integrations, /IntegrationWorkCard/);
    assert.match(integrations, /已發布作品/);
    assert.doesNotMatch(integrations, /Notion 已連線/);
    assert.match(integrationsCard, /rate_limited/);
    assert.match(integrationsCard, /saveProjectFn/);
    assert.match(integrationsCard, /testCanvaEmbedFn/);
    assert.match(integrationsCard, /verifyDemoFn/);
    assert.match(integrationsCard, /previewGithubFn/);
    assert.match(integrationsCard, /applyGithubFn/);
    assert.match(integrationsCard, /GithubSyncDiff/);
    assert.match(integrationsCard, /有未儲存的修改/);
    assert.match(integrationsCard, /beforeunload/);
    assert.match(integrationsCard, /experience_mode/);
    assert.match(integrationsCard, /測試嵌入/);
    assert.match(integrationsCard, /開啟原稿/);
    assert.doesNotMatch(integrationsCard, /status:\s*"verified"/);
    const preview = readFileSync(new URL("../../../src/routes/admin/preview.tsx", import.meta.url), "utf8");
    assert.match(preview, /CaseStudyView/);
    assert.match(preview, /includeJsonLd=\{false\}/);
    assert.match(preview, /previewDraftFn/);
    const draft = readFileSync(new URL("../../../src/routes/admin/draft.$slug.tsx", import.meta.url), "utf8");
    assert.match(draft, /CaseStudyView/);
    assert.match(draft, /includeJsonLd=\{false\}/);
    assert.doesNotMatch(editor, /GITHUB_READ_TOKEN/);
  });
});

