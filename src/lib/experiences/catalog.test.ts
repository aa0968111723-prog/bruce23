import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { experienceCatalog, projectHubIds } from "./catalog.ts";

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
    assert.match(shell, /跳到內容/);
    const panel = readFileSync(
      new URL("../../../src/components/experience/ExperiencePanel.tsx", import.meta.url),
      "utf8",
    );
    assert.match(panel, /role="tab"/);
    assert.match(panel, /tabIndex/);
    assert.match(panel, /useRovingTabs/);
    assert.match(panel, /onKeyDown/);
    assert.match(panel, /Escape/);
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
    assert.match(explorer, /來源路徑/);
    assert.match(css, /animation:\s*none/);
    assert.match(panel, /howItWorksSteps/);
    assert.match(panel, /galleryNote/);
    assert.match(panel, /MediaFrame/);
    assert.match(panel, /inline-flex min-h-11 items-center font-medium text-mint-deep/);
    assert.match(header, /mobile-nav/);
    const roving = readFileSync(
      new URL("../../../src/components/site/useRovingTabs.ts", import.meta.url),
      "utf8",
    );
    assert.match(roving, /ArrowRight/);
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
    assert.match(stage, /沒有公開分享連結/);
    assert.match(stage, /空白 iframe/);
    assert.match(stage, /全螢幕/);
    assert.match(stage, /在 Canva 開啟原作/);
    assert.match(stage, /publicCanvaEmbedUrl/);
    const processMap = readFileSync(
      new URL("../../../src/components/experience/modes/ProcessMap.tsx", import.meta.url),
      "utf8",
    );
    assert.match(processMap, /ArrowRight|useRovingTabs/);
    const timeline = readFileSync(
      new URL("../../../src/components/experience/modes/FrameTimeline.tsx", import.meta.url),
      "utf8",
    );
    assert.match(timeline, /示範/);
    assert.match(timeline, /不是 GPU/);
    const poster = readFileSync(
      new URL("../../../src/components/experience/modes/PosterVision.tsx", import.meta.url),
      "utf8",
    );
    assert.match(poster, /推估/);
    const planform = readFileSync(
      new URL("../../../src/components/experience/modes/PlanformSpace.tsx", import.meta.url),
      "utf8",
    );
    assert.match(planform, /法規符合|規範符合/);
    const settings = readFileSync(new URL("../../../src/routes/admin/settings.tsx", import.meta.url), "utf8");
    assert.doesNotMatch(settings, /homepage_json: \{\}/);
    assert.match(settings, /highlightSlugs/);
    assert.match(settings, /localeZhSeoTitle/);
    assert.match(settings, /localeEnSeoDescription/);
    const index = readFileSync(new URL("../../../src/routes/index.tsx", import.meta.url), "utf8");
    assert.match(index, /resolveHomepageCopy/);
    assert.match(index, /seoTitle/);
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
    assert.match(form, /localeKey/);
    assert.match(form, /中文 SEO 標題/);
    assert.match(form, /英文 SEO 描述/);
    const seedSource = readFileSync(new URL("../../../src/lib/cms/seed.ts", import.meta.url), "utf8");
    assert.match(seedSource, /fillLocaleJsonGaps/);
    const archiveForm = readFileSync(
      new URL("../../../src/components/admin/ArchiveForm.tsx", import.meta.url),
      "utf8",
    );
    assert.match(archiveForm, /beforeunload/);
    assert.match(archiveForm, /publication_status/);
    assert.match(archiveForm, /origin_note/);
    assert.match(archiveForm, /媒體路徑/);
    const privacy = readFileSync(new URL("../../../src/routes/privacy.tsx", import.meta.url), "utf8");
    assert.match(privacy, /不會公開的/);
    assert.match(privacy, /電話/);
    const siteNav = readFileSync(new URL("../../../src/content/site.ts", import.meta.url), "utf8");
    assert.match(siteNav, /\/privacy/);
    const editor = readFileSync(
      new URL("../../../src/components/admin/ExperienceEditor.tsx", import.meta.url),
      "utf8",
    );
    assert.match(editor, /互動展示內容/);
    assert.match(editor, /進階 JSON/);
    assert.match(editor, /FrameLab 時間軸/);
    assert.match(editor, /PLANFORM 物件與動線/);
    const field = readFileSync(
      new URL("../../../src/components/home/ExplorationField.tsx", import.meta.url),
      "utf8",
    );
    assert.match(field, /constellationLayout/);
    assert.match(field, /useRovingTabs/);
    assert.match(field, /作品與模態/);
    assert.match(field, /hidden /);
    assert.match(field, /lg:block/);
    assert.match(field, /overflow-visible/);
    assert.match(field, /availableFilters/);
    assert.doesNotMatch(field, /particle/);
    assert.match(archive, /尚未提供分享連結/);
    assert.match(archive, /parseCanvaDesign/);
    assert.match(archive, /ArchiveLocalCover/);
    assert.doesNotMatch(archive, /直接可翻頁/);
    assert.doesNotMatch(archive, /有 Canva 嵌入的會/);
    const integrations = readFileSync(
      new URL("../../../src/routes/admin/integrations.tsx", import.meta.url),
      "utf8",
    );
    assert.match(integrations, /Notion/);
    assert.match(integrations, /not_configured/);
    assert.match(integrations, /rate_limited/);
    assert.match(integrations, /不會標記為成功/);
    assert.doesNotMatch(integrations, /Notion 已連線/);
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

