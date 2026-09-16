import type { ExperienceMode } from "./constants.ts";

export type ExperienceSeed = {
  slug: string;
  mode: ExperienceMode;
  label: string;
  config: {
    showcaseLabel: string;
    isProduct: boolean;
    nodes?: Array<{ id: string; label: string; githubPath?: string; note?: string }>;
    steps?: Array<{ id: string; title: string; body: string }>;
    filePurpose?: Record<string, string>;
    pipelineStage?: Record<string, string>;
  };
  steps: Array<{ id: string; title: string; body: string }>;
};

const showcase = "作品集互動展示";

export const experienceSeeds: ExperienceSeed[] = [
  {
    slug: "ai-director-os",
    mode: "process-map",
    label: showcase,
    config: {
      showcaseLabel: showcase,
      isProduct: false,
      nodes: [
        { id: "project", label: "專案", githubPath: "README.md", note: "建立專案與世界觀快速層" },
        { id: "world", label: "世界觀", githubPath: "src", note: "世界觀與角色卡進入生成" },
        { id: "assets", label: "素材", githubPath: "src", note: "生成結果自動入素材庫" },
        { id: "gen", label: "生成", githubPath: "src", note: "只接 Fal.ai；沒金鑰時是假生成模式" },
        { id: "storyboard", label: "分鏡", githubPath: "src", note: "分鏡排序與短影音母版" },
        { id: "review", label: "審批", githubPath: "src", note: "組長審批三態機" },
        { id: "delivery", label: "交付", githubPath: "README.md", note: "匯出時間軸與素材包" },
      ],
      filePurpose: {
        "README.md": "產品完成項與未完成項",
        src: "創作系統應用程式",
      },
      pipelineStage: {
        "README.md": "delivery",
        src: "gen",
      },
    },
    steps: [
      { id: "p1", title: "專案", body: "先建立專案，而不是先貼提示詞。" },
      { id: "p2", title: "世界觀", body: "角色與世界設定自動帶進生成。" },
      { id: "p3", title: "生成", body: "圖／影／音進素材庫；沒金鑰就標示假生成。" },
      { id: "p4", title: "審批與交付", body: "重要內容需組長審核後才能交付。" },
    ],
  },
  {
    slug: "framelab",
    mode: "timeline",
    label: showcase,
    config: {
      showcaseLabel: showcase,
      isProduct: false,
      filePurpose: {
        "README.md": "能力邊界與模型表",
        "src/lib/commands/execute.ts": "UI / REST / MCP 共用指令層",
      },
      pipelineStage: {
        "README.md": "review",
        "src/lib/commands/execute.ts": "repair",
      },
    },
    steps: [
      { id: "f1", title: "匯入", body: "影片或圖序變成 Frame Graph。" },
      { id: "f2", title: "時間軸", body: "key / breakdown / generated 都看得到。" },
      { id: "f3", title: "只修壞幀", body: "F122 斷了，不該重產 F100–F200。" },
    ],
  },
  {
    slug: "poster-vision-ai",
    mode: "image-comparison",
    label: showcase,
    config: {
      showcaseLabel: showcase,
      isProduct: false,
      filePurpose: {
        "README.md": "熱圖與限制原文",
      },
    },
    steps: [
      { id: "v1", title: "上傳或選樣張", body: "用真實像素算面積與對比。" },
      { id: "v2", title: "熱圖", body: "標示為 AI 推估，不是眼動儀。" },
      { id: "v3", title: "建議", body: "給帶數字的修改方向，模型失敗會寫 degraded。" },
    ],
  },
  {
    slug: "planform",
    mode: "spatial-preview",
    label: showcase,
    config: {
      showcaseLabel: showcase,
      isProduct: false,
      filePurpose: {
        "README.md": "產品原則與法規限制",
        "src/core/spatialKnowledge.ts": "可引用的設計依據",
      },
    },
    steps: [
      { id: "s1", title: "選教室", body: "Preset-first，一場活動一份專案。" },
      { id: "s2", title: "排物件", body: "報到桌、地墊、動線可點選查看用途與尺寸。" },
      { id: "s3", title: "提醒", body: "程式禁止宣稱已符合所有法規。" },
    ],
  },
  {
    slug: "duigao",
    mode: "image-comparison",
    label: showcase,
    config: {
      showcaseLabel: showcase,
      isProduct: false,
      filePurpose: {
        "README.md": "權限模型與雲端層",
      },
    },
    steps: [
      { id: "d1", title: "海報是主畫面", body: "討論覆蓋在原稿上，不改檔。" },
      { id: "d2", title: "點位置", body: "手機也能在圖上留一句話。" },
      { id: "d3", title: "版本", body: "可切版本、對切比較。" },
    ],
  },
  {
    slug: "folio",
    mode: "interactive-walkthrough",
    label: showcase,
    config: {
      showcaseLabel: showcase,
      isProduct: false,
      filePurpose: {
        "README.md": "完成功能與限制",
      },
      steps: [
        { id: "fo1", title: "畫布", body: "文字／形狀／元件走同一套文件模型。" },
        { id: "fo2", title: "設計檢查", body: "對比、溢出、安全區。" },
        { id: "fo3", title: "MCP", body: "寫入預設 dry-run；未發布文件不會出現在公開 /mcp。" },
      ],
    },
    steps: [
      { id: "fo1", title: "畫布", body: "文字／形狀／元件走同一套文件模型。" },
      { id: "fo2", title: "設計檢查", body: "對比、溢出、安全區。" },
      { id: "fo3", title: "MCP", body: "寫入預設 dry-run；密鑰只留伺服器。" },
    ],
  },
  {
    slug: "hermes-console",
    mode: "conversation-preview",
    label: showcase,
    config: {
      showcaseLabel: showcase,
      isProduct: false,
      filePurpose: {
        "README.md": "產品不變量",
      },
    },
    steps: [
      { id: "h1", title: "打開即用", body: "不登入、不輸入電子信箱。" },
      { id: "h2", title: "未連線就說未連線", body: "GitHub 網址不是 MCP。" },
      { id: "h3", title: "秘密不進瀏覽器", body: "後端拒絕瀏覽器傳入的服務網址或金鑰。" },
    ],
  },
  {
    slug: "tku-zen-ai",
    mode: "conversation-preview",
    label: "本地回應引擎 · 不是雲端 LLM",
    config: {
      showcaseLabel: "本地回應引擎 · 不是雲端 LLM",
      isProduct: true,
      filePurpose: {
        "src/lib/zen.ts": "可重現的本地回應引擎",
        "README.md": "本地引擎說明",
      },
    },
    steps: [
      { id: "z1", title: "輸入心情", body: "同輸入同輸出。" },
      { id: "z2", title: "意圖", body: "對應呼吸提示，全程無網路呼叫。" },
    ],
  },
];

export function experienceSeedBySlug(slug: string) {
  return experienceSeeds.find((item) => item.slug === slug);
}
