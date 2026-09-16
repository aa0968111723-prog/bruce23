import type { ExperienceMode, InteractionStep, JsonObject } from "./types";

export type ExperiencePreset = {
  mode: ExperienceMode;
  exhibitLabel: string;
  steps: InteractionStep[];
  config: JsonObject;
};

export const EXPERIENCE_PRESETS: Record<string, ExperiencePreset> = {
  "ai-director-os": {
    mode: "process-map",
    exhibitLabel: "作品集互動展示",
    steps: [
      {
        id: "project",
        title: "專案",
        body: "建立專案與格式骨架，上下文從此開始。",
        githubPath: "client",
        workflowStage: "project",
      },
      {
        id: "world",
        title: "世界觀",
        body: "世界觀、角色與禁語寫在前後端共用 schema，生成時自動注入。",
        githubPath: "shared",
        workflowStage: "world",
      },
      {
        id: "assets",
        title: "素材",
        body: "生成成品入庫；原圖在 assets-src，不把大圖直接塞進前端。",
        githubPath: "assets-src",
        workflowStage: "assets",
      },
      {
        id: "gen",
        title: "生成",
        body: "Fal queue；沒有金鑰時是假生成模式，用來測流程而不是假裝已生成。",
        githubPath: "server",
        workflowStage: "gen",
      },
      {
        id: "storyboard",
        title: "分鏡",
        body: "生成後加入分鏡並排序，短影音母版只填變數。",
        githubPath: "docs",
        workflowStage: "storyboard",
      },
      {
        id: "review",
        title: "審批",
        body: "送審 → 組長通過或退回。重要內容需審核後才能對外。",
        githubPath: "server",
        workflowStage: "review",
      },
      {
        id: "delivery",
        title: "交付",
        body: "匯出素材包與時間軸給剪輯軟體。",
        githubPath: "server/services/jianying.ts",
        workflowStage: "delivery",
      },
    ],
    config: {
      liveProduct: false,
      note: "若公開網址無法開啟，這裡仍是作品集互動展示，不是線上產品後台。",
    },
  },
  framelab: {
    mode: "timeline",
    exhibitLabel: "作品集互動展示",
    steps: [
      { id: "import", title: "匯入", body: "影片或圖序進入 Frame Graph。", workflowStage: "import" },
      { id: "keys", title: "Key / Breakdown", body: "標記關鍵幀與中間幀狀態。", workflowStage: "keys" },
      { id: "onion", title: "Onion skin", body: "比較相鄰幀，而不是看一個分數。", workflowStage: "compare" },
      { id: "repair", title: "修壞幀", body: "點問題幀看修復概念：只重產壞的窗。", workflowStage: "repair" },
    ],
    config: {
      liveProduct: false,
      gpuNote: "SAM / RIFE / Wan 未註冊時不可用，展示不會假裝有 GPU。",
    },
  },
  "poster-vision-ai": {
    mode: "image-comparison",
    exhibitLabel: "作品集互動展示",
    steps: [
      { id: "sample", title: "選海報", body: "上傳或使用樣本。運算在瀏覽器像素層完成。", workflowStage: "input" },
      { id: "regions", title: "區域", body: "顯示面積、對比與文字區。", workflowStage: "geometry" },
      { id: "heat", title: "熱圖", body: "熱圖是顯著性推估，不是眼動儀。", workflowStage: "estimate" },
    ],
    config: {
      heatmapDisclaimer: "AI 推估，不是真實眼動追蹤。",
    },
  },
  planform: {
    mode: "spatial-preview",
    exhibitLabel: "作品集互動展示",
    steps: [
      { id: "room", title: "教室", body: "等角空間，可旋轉與拖曳視角。", workflowStage: "space" },
      { id: "objects", title: "物件", body: "點選看用途與尺寸。", workflowStage: "props" },
      { id: "flow", title: "動線", body: "人流示意。不做法規符合宣稱。", workflowStage: "circulation" },
    ],
    config: {
      compliance: false,
    },
  },
  duigao: {
    mode: "image-comparison",
    exhibitLabel: "作品集互動展示",
    steps: [
      { id: "poster", title: "海報", body: "原稿保持乾淨。", workflowStage: "view" },
      { id: "pins", title: "對點", body: "點位置留下註記層。", workflowStage: "annotate" },
      { id: "versions", title: "版本", body: "切換版本與對切比較。", workflowStage: "compare" },
    ],
    config: {
      privateData: false,
    },
  },
  folio: {
    mode: "github-explorer",
    exhibitLabel: "GitHub 真實結構",
    steps: [
      { id: "commands", title: "指令層", body: "畫布、快捷鍵、MCP 走同一套 typed commands。", githubPath: "src" },
    ],
    config: {},
  },
  "hermes-console": {
    mode: "github-explorer",
    exhibitLabel: "GitHub 真實結構",
    steps: [
      { id: "workspace", title: "工作區", body: "聊天、任務與 MCP 入口。未設定連線時應顯示尚未連線。", githubPath: "src" },
    ],
    config: {
      fakeConnected: false,
    },
  },
  "tku-zen-ai": {
    mode: "conversation-preview",
    exhibitLabel: "本地回應引擎",
    steps: [
      { id: "type", title: "輸入", body: "打一句心情。", githubPath: "src/lib/zen.ts" },
      { id: "intent", title: "意圖", body: "對應本地意圖，不是雲端 LLM。", githubPath: "src/app/api/chat/route.ts" },
    ],
    config: {
      cloudLlm: false,
      enginePath: "src/lib/zen.ts",
    },
  },
};

export function presetForSlug(slug: string): ExperiencePreset | null {
  return EXPERIENCE_PRESETS[slug] ?? null;
}
