import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXPERIENCE_MODES } from "../cms/status.ts";
import {
  experienceConfigSchema,
  parseExperienceConfig,
  roundTripExperienceConfig,
} from "../cms/schema.ts";
import { defaultExperienceConfig, mergeExperienceConfig } from "./defaults.ts";
import { howItWorksSteps } from "./resolve.ts";
import { walkthroughStageKind } from "./walkthrough.ts";

const MODE_FIXTURES: Record<(typeof EXPERIENCE_MODES)[number], unknown> = {
  "live-demo": {
    honestyLabel: "作品集互動展示",
    intro: "即時 Demo 引言",
    demoNote: "沒有已驗證的公開 Demo。",
    fileHints: [{ path: "README.md", purpose: "說明", stage: "來源" }],
  },
  "github-explorer": {
    honestyLabel: "公開檔案樹",
    githubIntro: "檔案樹來自伺服器同步。",
    fileHints: [{ path: "src/lib/zen.ts", purpose: "本地引擎", stage: "對話" }],
  },
  "canva-embed": {
    canvaNote: "公開嵌入模式。",
    canvaPageLabels: [{ id: "cover", label: "封面" }],
  },
  "interactive-walkthrough": {
    walkthrough: [{ title: "畫布", body: "文件模型", path: "src/editor.ts" }],
    fileHints: [{ path: "src/editor.ts", purpose: "畫布", stage: "畫布" }],
  },
  "image-comparison": {
    comparison: {
      variant: "annotate",
      versions: [{ id: "v1", label: "v1", filter: "none" }],
      seedPins: [{ id: "p1", x: 20, y: 30, note: "主標" }],
      prompt: "這位置要改什麼？",
    },
  },
  timeline: {
    timeline: {
      frames: [
        { i: 0, kind: "key", x: 24, y: 110 },
        { i: 1, kind: "generated", x: 80, y: 54, problem: true },
      ],
      onionDefault: true,
      compareDefault: false,
      demoDisclaimer: "示範，不是 GPU 輸出。",
    },
  },
  "process-map": {
    processNodes: [
      {
        id: "project",
        label: "專案",
        summary: "建立專案",
        githubPath: "server/services/projectCore.ts",
        purpose: "專案核心",
        stage: "專案",
      },
    ],
    locale: {
      en: {
        processNodes: [{ id: "project", label: "Project" }],
      },
    },
  },
  "spatial-preview": {
    spatial: {
      objects: [{ id: "desk", label: "報到桌", use: "報到", size: "180×60 cm", x: 18, y: 42 }],
      circulationNote: "示意動線",
      complianceDisclaimer: "非法規符合計算",
      tiltDefault: 18,
    },
  },
  "conversation-preview": {
    conversation: {
      engine: "zen-local",
      disclaimer: "不是雲端 LLM",
      starter: "本地引擎",
      placeholder: "輸入一句心情",
      replies: [{ match: "壓力", reply: "先停下來呼吸。" }],
    },
  },
  "media-gallery": {
    galleryNote: "只顯示已發布媒體。",
  },
};

describe("experience config round-trip", () => {
  for (const mode of EXPERIENCE_MODES) {
    it(`parses and serializes ${mode}`, () => {
      const parsed = parseExperienceConfig(MODE_FIXTURES[mode]);
      const again = roundTripExperienceConfig(parsed);
      assert.deepEqual(again, parsed);
    });
  }

  it("round-trips catalog defaults for each featured slug", () => {
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
    for (const slug of slugs) {
      const defaults = defaultExperienceConfig(slug);
      const once = roundTripExperienceConfig(defaults);
      const twice = roundTripExperienceConfig(once);
      assert.deepEqual(once, twice);
    }
  });
});

describe("experience config validation", () => {
  it("rejects an empty process node id", () => {
    assert.throws(() =>
      experienceConfigSchema.parse({
        processNodes: [{ id: "", label: "節點", summary: "", githubPath: "", purpose: "", stage: "" }],
      }),
    );
  });

  it("rejects an unknown timeline kind", () => {
    assert.throws(() =>
      experienceConfigSchema.parse({
        timeline: { frames: [{ i: 0, kind: "oops", x: 10, y: 10 }] },
      }),
    );
  });

  it("rejects spatial coordinates outside 0–100", () => {
    assert.throws(() =>
      experienceConfigSchema.parse({
        spatial: {
          objects: [{ id: "desk", label: "桌", use: "", size: "", x: 140, y: 10 }],
        },
      }),
    );
  });

  it("rejects empty conversation replies", () => {
    assert.throws(() =>
      experienceConfigSchema.parse({
        conversation: { replies: [{ match: "", reply: "" }] },
      }),
    );
  });
});

describe("experience config merge", () => {
  it("lets stored fields win over catalog defaults", () => {
    const merged = mergeExperienceConfig("framelab", {
      honestyLabel: "saved-label",
      timeline: {
        frames: [{ i: 9, kind: "key", x: 12, y: 12 }],
        onionDefault: false,
      },
    });
    assert.equal(merged.honestyLabel, "saved-label");
    assert.equal(merged.timeline?.frames[0]?.i, 9);
    assert.equal(merged.timeline?.onionDefault, false);
    assert.ok((merged.fileHints?.length ?? 0) > 0);
  });

  it("fills missing or empty nested arrays from catalog defaults", () => {
    const filled = mergeExperienceConfig("framelab", {
      timeline: { onionDefault: false } as never,
    });
    assert.equal(filled.timeline?.onionDefault, false);
    assert.ok((filled.timeline?.frames.length ?? 0) >= 3);

    const emptied = mergeExperienceConfig("framelab", {
      timeline: { frames: [], onionDefault: true },
    });
    assert.ok((emptied.timeline?.frames.length ?? 0) >= 3);
    assert.equal(emptied.timeline?.onionDefault, true);

    const emptyNodes = mergeExperienceConfig("ai-director-os", { processNodes: [] });
    assert.ok((emptyNodes.processNodes?.length ?? 0) > 0);
  });

  it("keeps saved locale.en overlays and does not seed dictionary English", () => {
    const withSaved = mergeExperienceConfig("ai-director-os", {
      locale: { en: { processNodes: [{ id: "project", label: "Studio Project" }] } },
    });
    assert.equal(withSaved.locale?.en?.processNodes?.[0]?.label, "Studio Project");
    assert.equal(withSaved.processNodes?.find((node) => node.id === "project")?.label, "專案");

    const without = mergeExperienceConfig("framelab", { honestyLabel: "saved-label" });
    assert.equal(without.locale, undefined);
  });

  it("points Poster Vision sample at the public GitHub fixture", () => {
    const config = defaultExperienceConfig("poster-vision-ai");
    assert.equal(config.comparison?.sampleSrc, "/media/github-exports/poster-vision-ai/demo-event.png");
    const stale = mergeExperienceConfig("poster-vision-ai", {
      comparison: { variant: "poster-analysis", sampleSrc: "/media/samples/poster.svg" },
    });
    assert.equal(stale.comparison?.sampleSrc, "/media/github-exports/poster-vision-ai/demo-event.png");
  });

  it("seeds local chat suggestions for Zen and Hermes", () => {
    const zen = defaultExperienceConfig("tku-zen-ai");
    assert.equal(zen.conversation?.suggestions?.length, 4);
    assert.ok(zen.conversation?.suggestions?.includes("I feel stressed about my exams"));
    assert.match(zen.intro ?? "", /Welcome to TKU Zen AI/);
    assert.match(zen.conversation?.starter ?? "", /Take a breath/);
    assert.doesNotMatch(zen.conversation?.starter ?? "", /輸入一句心情/);
    const hermes = defaultExperienceConfig("hermes-console");
    assert.ok(hermes.conversation?.suggestions?.includes("海報"));
    const zenDesk = defaultExperienceConfig("tku-zen-agent");
    assert.match(zenDesk.conversation?.starter ?? "", /授權碼/);
    assert.doesNotMatch(zenDesk.conversation?.starter ?? "", /Hermes 執行期/);
    const lumen = defaultExperienceConfig("lumen");
    assert.match(lumen.conversation?.starter ?? "", /想做什麼/);
    assert.doesNotMatch(lumen.conversation?.starter ?? "", /Hermes 執行期/);
    const agent = defaultExperienceConfig("hermes-agent");
    assert.match(agent.conversation?.starter ?? "", /Sign in — Hermes Agent/);
    assert.doesNotMatch(agent.conversation?.starter ?? "", /輸入關鍵詞看說明/);
    assert.doesNotMatch(agent.intro ?? "", /輸入關鍵詞看說明/);
    const ledger = defaultExperienceConfig("xiaocai");
    assert.match(ledger.intro ?? "", /小財記帳/);
    assert.doesNotMatch(ledger.intro ?? "", /Folio 指令層/);
    const review = defaultExperienceConfig("duigao");
    assert.match(review.intro ?? "", /今天要對什麼/);
    assert.doesNotMatch(review.intro ?? "", /立刻上傳/);
    const filled = mergeExperienceConfig("tku-zen-ai", { conversation: { engine: "zen-local", suggestions: [] } });
    assert.equal(filled.conversation?.suggestions?.length, 4);
  });

  it("how-it-works reads saved steps, then experience_config, then process copy", () => {
    assert.deepEqual(
      howItWorksSteps({
        slug: "folio",
        experienceConfig: {},
        interactionSteps: ["看幀", "開 onion-skin"],
        process: ["fallback"],
      }),
      ["看幀", "開 onion-skin"],
    );

    const walk = howItWorksSteps({
      slug: "folio",
      experienceConfig: {
        walkthrough: [{ title: "畫布", body: "文件模型", path: "src/editor.ts" }],
      },
      interactionSteps: [],
      process: ["fallback"],
    });
    assert.ok(walk.length >= 1);
    assert.ok(walk.some((step) => step.includes("src/editor.ts")));
    assert.match(walk.find((step) => step.includes("src/editor.ts")) ?? "", /畫布/);
    assert.ok(walk.some((step) => step.includes("artboard-strip") || step.includes("畫板")));

    const nodes = howItWorksSteps({
      slug: "ai-director-os",
      experienceConfig: {},
      interactionSteps: [],
      process: ["fallback"],
    });
    assert.ok(nodes.some((step) => step.includes("專案")));
    assert.notEqual(nodes[0], "fallback");

    const uncustomizedSeed = howItWorksSteps({
      slug: "folio",
      experienceConfig: {},
      interactionSteps: ["在畫布建立文字／形狀／元件", "設計檢查（對比、溢出、安全區）"],
      process: ["在畫布建立文字／形狀／元件", "設計檢查（對比、溢出、安全區）"],
    });
    assert.ok(uncustomizedSeed.some((step) => step.includes("畫布")));
    assert.ok(
      uncustomizedSeed[0]?.includes("文件櫃") ||
        uncustomizedSeed[0]?.includes("文件模型") ||
        uncustomizedSeed[0]?.includes("畫布"),
    );
  });

  it("maps Folio walkthrough steps onto distinct visual stages from config", () => {
    assert.equal(walkthroughStageKind({ title: "畫布", path: "src/components/editor/canvas-stage.tsx" }), "canvas");
    assert.equal(walkthroughStageKind({ title: "指令層", path: "src/components/editor/command-palette.tsx" }), "command");
    assert.equal(walkthroughStageKind({ title: "設計檢查", path: "src/components/editor/audit-panel.tsx" }), "audit");
    assert.equal(walkthroughStageKind({ title: "MCP 邊界", path: "src/components/editor/mcp-panel.tsx" }), "mcp");
    assert.equal(walkthroughStageKind({ title: "畫板", path: "src/components/editor/artboard-strip.tsx" }), "artboard");
    assert.equal(walkthroughStageKind({ title: "Artboards", path: "src/components/editor/artboard-strip.tsx" }), "artboard");
    assert.equal(walkthroughStageKind({ title: "匯出", path: "src/lib/export.ts" }), "document");
  });

  it("keeps saved walkthrough and fileHints and appends missing catalog paths", () => {
    const folio = mergeExperienceConfig("folio", {
      walkthrough: [
        { title: "畫布", body: "saved-canvas", path: "src/components/editor/canvas-stage.tsx" },
        { title: "指令層", body: "saved-command", path: "src/components/editor/command-palette.tsx" },
      ],
    });
    assert.equal(
      folio.walkthrough?.find((step) => step.path === "src/components/editor/canvas-stage.tsx")?.body,
      "saved-canvas",
    );
    assert.ok(folio.walkthrough?.some((step) => step.path === "src/components/editor/artboard-strip.tsx"));
    const folioPaths = (folio.walkthrough ?? []).map((step) => step.path);
    const artboardAt = folioPaths.indexOf("src/components/editor/artboard-strip.tsx");
    const canvasAt = folioPaths.indexOf("src/components/editor/canvas-stage.tsx");
    const commandAt = folioPaths.indexOf("src/components/editor/command-palette.tsx");
    assert.ok(canvasAt >= 0 && artboardAt > canvasAt);
    assert.ok(commandAt > artboardAt);
    assert.ok(folio.fileHints?.some((item) => item.path === "src/components/editor/artboard-strip.tsx"));

    const frame = mergeExperienceConfig("framelab", {
      fileHints: [{ path: "src/lib/domain/timeline-engine.ts", purpose: "saved-engine", stage: "時間軸" }],
    });
    assert.equal(
      frame.fileHints?.find((item) => item.path === "src/lib/domain/timeline-engine.ts")?.purpose,
      "saved-engine",
    );
    assert.ok(frame.fileHints?.some((item) => item.path === "src/lib/domain/context-engine.ts"));
    assert.ok(frame.fileHints?.some((item) => item.path === "src/lib/commands/execute.ts"));

    const hermes = mergeExperienceConfig("hermes-console", {
      fileHints: [{ path: "README.md", purpose: "saved-readme", stage: "來源" }],
    });
    assert.equal(hermes.fileHints?.find((item) => item.path === "README.md")?.purpose, "saved-readme");
    assert.ok(hermes.fileHints?.some((item) => item.path === "lib/server/canva.ts"));
  });
});
