import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { experienceCatalog } from "./catalog.ts";

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
    assert.match(panel, /howItWorksSteps/);
    assert.match(header, /mobile-nav/);
    const roving = readFileSync(
      new URL("../../../src/components/site/useRovingTabs.ts", import.meta.url),
      "utf8",
    );
    assert.match(roving, /ArrowRight/);
    const work = readFileSync(new URL("../../../src/routes/work/index.tsx", import.meta.url), "utf8");
    assert.match(work, /useRovingTabs/);
    const archive = readFileSync(new URL("../../../src/routes/archive.tsx", import.meta.url), "utf8");
    assert.match(archive, /useRovingTabs/);
    const stage = readFileSync(
      new URL("../../../src/components/experience/CanvaStage.tsx", import.meta.url),
      "utf8",
    );
    assert.match(stage, /沒有公開分享連結/);
    assert.match(stage, /空白 iframe/);
    assert.match(stage, /全螢幕/);
    assert.match(stage, /在 Canva 開啟原作/);
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
    const form = readFileSync(new URL("../../../src/components/admin/ProjectForm.tsx", import.meta.url), "utf8");
    assert.match(form, /GithubSyncDiff/);
    assert.match(form, /ExperienceEditor/);
    assert.match(form, /互動展示模式/);
    assert.match(form, /來源證據/);
    assert.doesNotMatch(form, /experience_config JSON/);
    assert.match(form, /canva_page_ids/);
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

