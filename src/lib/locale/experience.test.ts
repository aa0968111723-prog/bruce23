import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultExperienceConfig, mergeExperienceConfig } from "../experiences/defaults.ts";
import { experienceCatalog } from "../experiences/catalog.ts";
import { howItWorksSteps } from "../experiences/resolve.ts";
import {
  experienceChromeFor,
  overlayExperienceConfig,
  PORTFOLIO_DEMO_EN,
} from "./experience.ts";

describe("experience playable chrome", () => {
  it("switches tab names and onion-skin controls with lang", () => {
    const zh = experienceChromeFor("zh");
    const en = experienceChromeFor("en");
    assert.equal(zh.tabPlay, "立即體驗");
    assert.equal(en.tabPlay, "Play");
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
    assert.equal(frameEn.honestyLabel, PORTFOLIO_DEMO_EN);
    assert.match(frameEn.timeline?.demoDisclaimer ?? "", /not GPU/i);
    const posterEn = overlayExperienceConfig(defaultExperienceConfig("poster-vision-ai"), "poster-vision-ai", "en");
    assert.match(posterEn.honestyLabel ?? "", /not eye-tracking/i);
    assert.match(posterEn.comparison?.estimateDisclaimer ?? "", /not eye-tracking/i);
    const planEn = overlayExperienceConfig(defaultExperienceConfig("planform"), "planform", "en");
    assert.match(planEn.honestyLabel ?? "", /not a code-compliance/i);
    const zenEn = overlayExperienceConfig(defaultExperienceConfig("tku-zen-ai"), "tku-zen-ai", "en");
    assert.match(zenEn.honestyLabel ?? "", /not a cloud LLM/i);
    const zenZh = overlayExperienceConfig(defaultExperienceConfig("tku-zen-ai"), "tku-zen-ai", "zh");
    assert.match(zenZh.honestyLabel ?? "", /不是雲端/);
    const hermesEn = overlayExperienceConfig(defaultExperienceConfig("hermes-console"), "hermes-console", "en");
    assert.match(hermesEn.honestyLabel ?? "", /not connected to the Hermes runtime/i);
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
    assert.equal(en.processNodes?.[0]?.label, "自訂節點");
    assert.equal(en.processNodes?.[0]?.githubPath, "server/custom.ts");
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
    assert.ok(zh.some((step) => step.includes("畫布")));
    assert.ok(en.some((step) => step.includes("Canvas")));
    assert.ok(en.some((step) => step.includes("src/components/editor/canvas-stage.tsx")));
    const director = howItWorksSteps(
      { slug: "ai-director-os", experienceConfig: {}, interactionSteps: [], process: [] },
      "en",
    );
    assert.ok(director.some((step) => step.startsWith("Project：")));
  });
});
