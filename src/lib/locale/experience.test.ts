import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultExperienceConfig, mergeExperienceConfig } from "../experiences/defaults.ts";
import { experienceCatalog } from "../experiences/catalog.ts";
import { howItWorksSteps } from "../experiences/resolve.ts";
import {
  experienceChromeFor,
  joinSentences,
  labeledLine,
  overlayExperienceConfig,
  PORTFOLIO_DEMO_EN,
  wrapPathNote,
} from "./experience.ts";

describe("experience playable chrome", () => {
  it("switches tab names and onion-skin controls with lang", () => {
    const zh = experienceChromeFor("zh");
    const en = experienceChromeFor("en");
    assert.equal(zh.tabPlay, "立即體驗");
    assert.equal(en.tabPlay, "Play");
    assert.match(zh.githubWithheld, /不提供 GitHub 連結/);
    assert.doesNotMatch(zh.githubWithheld, /還沒有公開 GitHub 來源/);
    assert.match(en.githubWithheld, /does not link to GitHub/i);
    assert.doesNotMatch(en.githubWithheld, /There is no public GitHub source/);
    assert.equal(zh.folioDocumentLayer, "文件層");
    assert.equal(en.folioDocumentLayer, "document layer");
    assert.equal(zh.folioArtboards, "畫板");
    assert.equal(en.folioArtboards, "Artboards");
    assert.equal(zh.folioNewDoc, "新增文件");
    assert.equal(en.folioNewDoc, "New document");
    assert.equal(zh.hintInTree, "在同步樹中");
    assert.equal(en.hintInTree, "In the synced tree");
    assert.equal(zh.hintMissingFromTree, "不在這次有限檔案樹裡");
    assert.equal(en.hintMissingFromTree, "Not in this limited file tree");
    assert.equal(zh.previewWorkspace, "作品集預覽");
    assert.equal(en.previewOffline, "Not connected to the live product");
    assert.match(zh.folioNotCounter, /空白計數器/);
    assert.match(en.folioNotCounter, /blank counter/i);
    assert.match(zh.walkKeyboard, /左右鍵換步驟/);
    assert.doesNotMatch(zh.walkKeyboard, /空白計數器/);
    assert.doesNotMatch(en.walkKeyboard, /blank counter/i);
    assert.equal(zh.walkDocumentLayer, "走查畫面");
    assert.equal(en.walkDocumentLayer, "walkthrough stage");
    assert.equal(zh.tabVisual, "視覺展示");
    assert.equal(en.tabVisual, "Visual");
    assert.notEqual(zh.tabGithub, en.tabGithub);
    assert.equal(zh.onionSkin, "Onion skin");
    assert.equal(zh.on, "開");
    assert.equal(en.on, "on");
    assert.equal(zh.off, "關");
    assert.equal(en.off, "off");
    assert.match(`${en.onionSkin} ${en.on}`, /Onion skin on/);
    assert.match(`${zh.onionSkin} ${zh.on}`, /Onion skin 開/);
  });

  it("localizes Canva unavailable fallback without claiming Connect", () => {
    const zh = experienceChromeFor("zh");
    const en = experienceChromeFor("en");
    assert.match(zh.unavailableTitle, /無法公開嵌入/);
    assert.match(en.unavailableTitle, /cannot be publicly embedded/i);
    assert.match(zh.noShareTitle, /沒有公開分享連結/);
    assert.match(en.noShareTitle, /no public share URL/i);
    assert.match(zh.sourcePublicEmbed, /未宣稱 Connect 已連線/);
    assert.match(en.sourcePublicEmbed, /not claiming Connect is linked/i);
    assert.doesNotMatch(zh.sourcePublicEmbed, /\{status\}|not_configured/);
    assert.doesNotMatch(en.sourcePublicEmbed, /\{status\}|not_configured/);
    assert.doesNotMatch(zh.liveStatus, /\{status\}/);
    assert.doesNotMatch(en.liveStatus, /\{status\}/);
    assert.doesNotMatch(en.unavailableTitle, /connected/i);
    assert.doesNotMatch(en.canvaEmptyNote, /Connect is linked/);
  });

  it("keeps honesty honest in both langs for featured modes", () => {
    const slugs = ["framelab", "poster-vision-ai", "planform", "tku-zen-ai", "hermes-console"] as const;
    for (const slug of slugs) {
      const zh = overlayExperienceConfig(defaultExperienceConfig(slug), slug, "zh");
      const en = overlayExperienceConfig(defaultExperienceConfig(slug), slug, "en");
      assert.ok(zh.honestyLabel);
      assert.ok(en.honestyLabel);
      assert.notEqual(zh.honestyLabel, en.honestyLabel);
    }
    const frameEn = overlayExperienceConfig(defaultExperienceConfig("framelab"), "framelab", "en");
    const frameZh = overlayExperienceConfig(defaultExperienceConfig("framelab"), "framelab", "zh");
    assert.equal(frameEn.honestyLabel, PORTFOLIO_DEMO_EN);
    assert.match(frameEn.timeline?.demoDisclaimer ?? "", /not GPU/i);
    assert.match(frameZh.intro ?? "", /登入工作室/);
    assert.match(frameZh.intro ?? "", /系統狀態/);
    assert.match(frameZh.intro ?? "", /不是生成網站/);
    assert.doesNotMatch(frameZh.intro ?? "", /進入工作室要登入/);
    assert.match(frameEn.intro ?? "", /landing page/i);
    assert.match(frameEn.intro ?? "", /generation website/i);
    const reviewZh = overlayExperienceConfig(defaultExperienceConfig("duigao"), "duigao", "zh");
    const reviewEn = overlayExperienceConfig(defaultExperienceConfig("duigao"), "duigao", "en");
    assert.match(reviewZh.intro ?? "", /今天要對什麼/);
    assert.match(reviewEn.intro ?? "", /What are we reviewing today/i);
    const posterEn = overlayExperienceConfig(defaultExperienceConfig("poster-vision-ai"), "poster-vision-ai", "en");
    assert.match(posterEn.honestyLabel ?? "", /not eye-tracking/i);
    assert.match(posterEn.comparison?.estimateDisclaimer ?? "", /not eye-tracking/i);
    const planEn = overlayExperienceConfig(defaultExperienceConfig("planform"), "planform", "en");
    assert.match(planEn.honestyLabel ?? "", /not a code-compliance/i);
    assert.match(planEn.intro ?? "", /My projects/i);
    assert.match(planEn.intro ?? "", /New project/i);
    assert.doesNotMatch(planEn.intro ?? "", /rotate, drag objects/i);
    const planZh = overlayExperienceConfig(defaultExperienceConfig("planform"), "planform", "zh");
    assert.match(planZh.intro ?? "", /我的專案/);
    assert.doesNotMatch(planZh.intro ?? "", /旋轉、拖動物件/);
    const folioZh = overlayExperienceConfig(defaultExperienceConfig("folio"), "folio", "zh");
    const folioEn = overlayExperienceConfig(defaultExperienceConfig("folio"), "folio", "en");
    assert.match(folioZh.intro ?? "", /文件櫃/);
    assert.match(folioZh.intro ?? "", /給 MCP 與內嵌網站/);
    assert.match(folioZh.intro ?? "", /開發者 SDK/);
    assert.doesNotMatch(folioZh.intro ?? "", /指令層走一遍/);
    assert.match(folioEn.intro ?? "", /file cabinet/i);
    assert.match(folioEn.intro ?? "", /Developer SDK/);
    assert.match(folioEn.intro ?? "", /MCP and embedded sites/);
    assert.doesNotMatch(folioEn.intro ?? "", /command layer/i);
    assert.equal(folioZh.walkthrough?.[0]?.title, "文件櫃");
    assert.equal(folioEn.walkthrough?.[0]?.title, "File cabinet");
    const cutosZh = overlayExperienceConfig(defaultExperienceConfig("cutos"), "cutos", "zh");
    const cutosEn = overlayExperienceConfig(defaultExperienceConfig("cutos"), "cutos", "en");
    assert.match(cutosZh.intro ?? "", /匯入影片/);
    assert.match(cutosZh.intro ?? "", /載入示範影片/);
    assert.doesNotMatch(cutosZh.intro ?? "", /這是作品集逐步走查，不是線上產品本身/);
    assert.match(cutosEn.intro ?? "", /Import video/i);
    assert.match(cutosEn.intro ?? "", /demo clip/i);
    assert.equal(cutosZh.walkthrough?.[0]?.title, "匯入影片");
    assert.equal(cutosEn.walkthrough?.[0]?.title, "Import video");
    const tyZh = overlayExperienceConfig(defaultExperienceConfig("focus-challenge"), "focus-challenge", "zh");
    const tyEn = overlayExperienceConfig(defaultExperienceConfig("focus-challenge"), "focus-challenge", "en");
    assert.match(tyZh.intro ?? "", /看指令選顏色/);
    assert.match(tyZh.intro ?? "", /正式參賽/);
    assert.match(tyZh.intro ?? "", /本名/);
    assert.match(tyZh.intro ?? "", /關主/);
    assert.doesNotMatch(tyZh.intro ?? "", /登記畫面/);
    assert.doesNotMatch(tyZh.intro ?? "", /這是作品集逐步走查，不是線上產品本身/);
    assert.match(tyEn.intro ?? "", /Official entry/i);
    assert.match(tyEn.intro ?? "", /real name/i);
    assert.match(tyEn.intro ?? "", /Start practice/i);
    assert.equal(tyZh.walkthrough?.[0]?.title, "攤位首屏");
    assert.equal(tyEn.walkthrough?.[0]?.title, "Booth home");
    const campusZh = overlayExperienceConfig(defaultExperienceConfig("tamkang-world"), "tamkang-world", "zh");
    const campusEn = overlayExperienceConfig(defaultExperienceConfig("tamkang-world"), "tamkang-world", "en");
    assert.match(campusZh.intro ?? "", /開始巡禮/);
    assert.match(campusZh.intro ?? "", /校園通行證在 \/login/);
    assert.doesNotMatch(campusZh.intro ?? "", /未登入是「校園通行證/);
    assert.equal(campusZh.walkthrough?.[0]?.title, "開始巡禮");
    assert.match(campusEn.intro ?? "", /Start tour/);
    assert.match(campusEn.intro ?? "", /\/login/);
    assert.equal(campusEn.walkthrough?.[0]?.title, "Start tour");
    assert.match(campusEn.walkthrough?.[1]?.body ?? "", /WASD move/);
    const zenEn = overlayExperienceConfig(defaultExperienceConfig("tku-zen-ai"), "tku-zen-ai", "en");
    assert.match(zenEn.honestyLabel ?? "", /not a cloud LLM/i);
    assert.match(zenEn.intro ?? "", /Take a breath/i);
    assert.match(zenEn.conversation?.starter ?? "", /Welcome to TKU Zen AI/);
    assert.deepEqual(zenEn.conversation?.suggestions, [
      "I feel stressed about my exams",
      "Help me focus",
      "I can't sleep",
      "Thank you",
    ]);
    const zenZh = overlayExperienceConfig(defaultExperienceConfig("tku-zen-ai"), "tku-zen-ai", "zh");
    assert.match(zenZh.honestyLabel ?? "", /不是雲端/);
    assert.match(zenZh.intro ?? "", /Welcome to TKU Zen AI/);
    assert.match(zenZh.conversation?.starter ?? "", /Take a breath/);
    const deskZh = overlayExperienceConfig(defaultExperienceConfig("tku-zen-agent"), "tku-zen-agent", "zh");
    const deskEn = overlayExperienceConfig(defaultExperienceConfig("tku-zen-agent"), "tku-zen-agent", "en");
    assert.match(deskZh.intro ?? "", /請輸入授權碼/);
    assert.ok(deskZh.conversation?.suggestions?.includes("來源"));
    assert.ok(!deskZh.conversation?.suggestions?.includes("GitHub"));
    assert.doesNotMatch(JSON.stringify(deskZh), /github\.com\/aa0968111723-prog\/tku-zen-agent/);
    assert.match(deskEn.intro ?? "", /access code/i);
    assert.deepEqual(deskEn.conversation?.suggestions, ["Access code", "Draft", "Source"]);
    assert.ok(!deskEn.conversation?.suggestions?.includes("GitHub"));
    assert.doesNotMatch(JSON.stringify(deskEn), /github\.com\/aa0968111723-prog\/tku-zen-agent/);
    assert.equal(deskEn.walkthrough?.[2]?.title, "Source boundary");
    assert.match(experienceChromeFor("zh").githubWithheld, /可見性與自身隱私規則衝突/);
    assert.match(experienceChromeFor("en").githubWithheld, /privacy rules/i);
    assert.match(experienceChromeFor("zh").treeFailed, /公開儲存庫仍可打開/);
    assert.doesNotMatch(experienceChromeFor("zh").treeFailed, /這次公開同步失敗/);
    assert.match(experienceChromeFor("en").treeFailed, /public repository still opens/i);
    assert.doesNotMatch(experienceChromeFor("en").treeFailed, /This public sync failed/);
    const lumenZh = overlayExperienceConfig(defaultExperienceConfig("lumen"), "lumen", "zh");
    const lumenEn = overlayExperienceConfig(defaultExperienceConfig("lumen"), "lumen", "en");
    assert.match(lumenZh.intro ?? "", /自動聽/);
    assert.match(lumenZh.intro ?? "", /拍照開始/);
    assert.match(lumenZh.intro ?? "", /長任務/);
    assert.doesNotMatch(lumenZh.intro ?? "", /首頁只有/);
    assert.ok(lumenZh.conversation?.suggestions?.includes("拍照開始"));
    assert.ok(!lumenZh.conversation?.suggestions?.includes("拍照"));
    assert.match(lumenEn.intro ?? "", /自動聽/);
    assert.match(lumenEn.intro ?? "", /拍照開始/);
    assert.equal(lumenEn.walkthrough?.[0]?.title, "What do you want to do?");
    assert.deepEqual(lumenEn.conversation?.suggestions, ["做海報", "拍照開始", "做影片", "長任務"]);
    const skateZh = overlayExperienceConfig(defaultExperienceConfig("skatehub"), "skatehub", "zh");
    const skateEn = overlayExperienceConfig(defaultExperienceConfig("skatehub"), "skatehub", "en");
    assert.match(skateZh.intro ?? "", /不要在家玩手機/);
    assert.match(skateZh.intro ?? "", /瀏覽裝備圖鑑/);
    assert.doesNotMatch(skateZh.intro ?? "", /slogan 要人穿上輪鞋出發/);
    assert.match(skateEn.intro ?? "", /Don’t stay home on your phone|Don't stay home on your phone/);
    assert.match(skateEn.intro ?? "", /Browse the gear catalog/);
    assert.equal(skateEn.walkthrough?.[0]?.title, "Open the hub");
    const hermesEn = overlayExperienceConfig(defaultExperienceConfig("hermes-console"), "hermes-console", "en");
    assert.match(hermesEn.honestyLabel ?? "", /not connected to the Hermes runtime/i);
    assert.match(hermesEn.intro ?? "", /What do you want to do today/i);
    assert.match(hermesEn.conversation?.starter ?? "", /What do you want to do today/i);
    assert.doesNotMatch(hermesEn.conversation?.starter ?? "", /Type a keyword/);
    assert.deepEqual(hermesEn.conversation?.suggestions, ["Research", "Create", "Analyze"]);
    assert.match(experienceCatalog["tku-zen-ai"].honestyLabel, /不是雲端/);
    assert.match(experienceCatalog["ai-director-os"].honestyLabel, /作品集/);
  });

  it("overlays AI Director node labels and leaves GitHub paths in Chinese-catalog form", () => {
    const zh = overlayExperienceConfig(defaultExperienceConfig("ai-director-os"), "ai-director-os", "zh");
    const en = overlayExperienceConfig(defaultExperienceConfig("ai-director-os"), "ai-director-os", "en");
    const zhNode = zh.processNodes?.find((node) => node.id === "project");
    const enNode = en.processNodes?.find((node) => node.id === "project");
    assert.equal(zhNode?.label, "專案");
    assert.equal(enNode?.label, "Project");
    assert.equal(enNode?.githubPath, "server/services/projectCore.ts");
    assert.equal(zhNode?.githubPath, enNode?.githubPath);
    assert.match(zh.intro ?? "", /進入工作台/);
    assert.match(zh.intro ?? "", /登入工作台/);
    assert.match(zh.intro ?? "", /看看怎麼運作/);
    assert.doesNotMatch(zh.intro ?? "", /進入工作台要登入/);
    assert.match(en.intro ?? "", /landing page/i);
    assert.match(en.intro ?? "", /See how it works/);
    assert.doesNotMatch(en.intro ?? "", /Entering the workbench requires sign-in/);
    const hint = en.fileHints?.find((item) => item.path === "shared/worldview.ts");
    assert.equal(hint?.path, "shared/worldview.ts");
    assert.match(hint?.purpose ?? "", /Worldview/i);
  });

  it("falls back to zh when a saved node has no English overlay", () => {
    const stored = mergeExperienceConfig("ai-director-os", {
      processNodes: [
        {
          id: "only-zh",
          label: "自訂節點",
          summary: "沒有英文",
          githubPath: "server/custom.ts",
          purpose: "測",
          stage: "測",
        },
      ],
    });
    const en = overlayExperienceConfig(stored, "ai-director-os", "en");
    const custom = en.processNodes?.find((node) => node.id === "only-zh");
    assert.equal(custom?.label, "自訂節點");
    assert.equal(custom?.githubPath, "server/custom.ts");
    assert.ok(en.processNodes?.some((node) => node.id === "project"));
  });

  it("prefers a saved locale.en process node label over the dictionary", () => {
    const stored = mergeExperienceConfig("ai-director-os", {
      locale: { en: { processNodes: [{ id: "project", label: "Studio Project" }] } },
    });
    assert.equal(stored.processNodes?.find((node) => node.id === "project")?.label, "專案");
    assert.equal(stored.locale?.en?.processNodes?.[0]?.label, "Studio Project");
    const en = overlayExperienceConfig(stored, "ai-director-os", "en");
    assert.equal(en.processNodes?.find((node) => node.id === "project")?.label, "Studio Project");
    const zh = overlayExperienceConfig(stored, "ai-director-os", "zh");
    assert.equal(zh.processNodes?.find((node) => node.id === "project")?.label, "專案");
    const howEn = howItWorksSteps(
      { slug: "ai-director-os", experienceConfig: stored, interactionSteps: [], process: [] },
      "en",
    );
    assert.ok(howEn.some((step) => step.startsWith("Studio Project: ")));
    assert.doesNotMatch(howEn.join("\n"), /：|（|）/);
  });

  it("falls back from empty saved en to dictionary then zh", () => {
    const stored = mergeExperienceConfig("ai-director-os", {
      locale: { en: { processNodes: [{ id: "project", label: "   " }] } },
    });
    const en = overlayExperienceConfig(stored, "ai-director-os", "en");
    assert.equal(en.processNodes?.find((node) => node.id === "project")?.label, "Project");

    const custom = mergeExperienceConfig("ai-director-os", {
      processNodes: [
        {
          id: "only-zh",
          label: "自訂節點",
          summary: "沒有英文",
          githubPath: "server/custom.ts",
          purpose: "測",
          stage: "測",
        },
      ],
      locale: { en: { processNodes: [{ id: "only-zh", label: "" }] } },
    });
    const emptySaved = overlayExperienceConfig(custom, "ai-director-os", "en");
    const onlyZh = emptySaved.processNodes?.find((node) => node.id === "only-zh");
    assert.equal(onlyZh?.label, "自訂節點");
    assert.equal(onlyZh?.githubPath, "server/custom.ts");
  });

  it("does not copy dictionary English into stored locale.en on merge", () => {
    const merged = mergeExperienceConfig("ai-director-os", { honestyLabel: "kept" });
    assert.equal(merged.locale, undefined);
    assert.equal(merged.processNodes?.find((node) => node.id === "project")?.label, "專案");
  });

  it("overlays how-it-works steps for English without translating paths", () => {
    const zh = howItWorksSteps(
      { slug: "folio", experienceConfig: {}, interactionSteps: [], process: [] },
      "zh",
    );
    const en = howItWorksSteps(
      { slug: "folio", experienceConfig: {}, interactionSteps: [], process: [] },
      "en",
    );
    assert.ok(zh.some((step) => step.includes("文件櫃")));
    assert.ok(zh.some((step) => step.includes("給 MCP 與內嵌網站")));
    assert.ok(zh.some((step) => step.includes("開發者 SDK")));
    assert.ok(zh.some((step) => step.includes("畫布")));
    assert.ok(zh.some((step) => step.includes("畫板")));
    assert.ok(en.some((step) => step.includes("File cabinet")));
    assert.ok(en.some((step) => step.includes("Canvas")));
    assert.ok(en.some((step) => step.includes("Artboards")));
    assert.ok(en.some((step) => step.includes("(src/components/editor/canvas-stage.tsx)")));
    assert.ok(en.some((step) => step.includes("artboard-strip.tsx")));
    assert.doesNotMatch(en.join("\n"), /：|（|）/);
    const director = howItWorksSteps(
      { slug: "ai-director-os", experienceConfig: {}, interactionSteps: [], process: [] },
      "en",
    );
    assert.ok(director.some((step) => step.startsWith("Project: ")));
    const directorZh = howItWorksSteps(
      { slug: "ai-director-os", experienceConfig: {}, interactionSteps: [], process: [] },
      "zh",
    );
    assert.ok(directorZh.some((step) => step.startsWith("專案：")));
  });

  it("joins chrome sentences with a space and labels with lang punctuation", () => {
    assert.equal(
      joinSentences("Not a live product console.", "Left and right keys move between nodes."),
      "Not a live product console. Left and right keys move between nodes.",
    );
    assert.equal(
      joinSentences("不是線上產品控制台。", "鍵盤左右鍵可換節點。"),
      "不是線上產品控制台。 鍵盤左右鍵可換節點。",
    );
    assert.equal(labeledLine("en", "GitHub source", "README.md"), "GitHub source: README.md");
    assert.equal(labeledLine("zh", "GitHub 來源", "README.md"), "GitHub 來源：README.md");
    assert.equal(wrapPathNote("en", "Canvas: body", "src/a.tsx"), "Canvas: body (src/a.tsx)");
    assert.equal(wrapPathNote("zh", "畫布：說明", "src/a.tsx"), "畫布：說明（src/a.tsx）");
  });
});
