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

  it("points Poster Vision sample at the public GitHub fixture", () => {
    const config = defaultExperienceConfig("poster-vision-ai");
    assert.equal(config.comparison?.sampleSrc, "/media/github-exports/poster-vision-ai/demo-event.png");
    const stale = mergeExperienceConfig("poster-vision-ai", {
      comparison: { variant: "poster-analysis", sampleSrc: "/media/samples/poster.svg" },
    });
    assert.equal(stale.comparison?.sampleSrc, "/media/github-exports/poster-vision-ai/demo-event.png");
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
    assert.equal(walk.length, 1);
    assert.match(walk[0] ?? "", /畫布/);
    assert.match(walk[0] ?? "", /src\/editor\.ts/);

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
    assert.ok(uncustomizedSeed[0]?.includes("文件模型") || uncustomizedSeed[0]?.includes("畫布"));
  });

  it("maps Folio walkthrough steps onto distinct visual stages from config", () => {
    assert.equal(walkthroughStageKind({ title: "畫布", path: "src/components/editor/canvas-stage.tsx" }), "canvas");
    assert.equal(walkthroughStageKind({ title: "指令層", path: "src/components/editor/command-palette.tsx" }), "command");
    assert.equal(walkthroughStageKind({ title: "設計檢查", path: "src/components/editor/audit-panel.tsx" }), "audit");
    assert.equal(walkthroughStageKind({ title: "MCP 邊界", path: "src/components/editor/mcp-panel.tsx" }), "mcp");
    assert.equal(walkthroughStageKind({ title: "匯出", path: "src/lib/export.ts" }), "document");
  });
});
