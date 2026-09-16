import type { ExperienceMode } from "../cms/status.ts";

export type ProcessNode = {
  id: string;
  label: string;
  summary: string;
  githubPath: string;
  purpose: string;
  stage: string;
};

export type ExperienceCatalogEntry = {
  mode: ExperienceMode;
  honestyLabel: string;
  processNodes?: ProcessNode[];
  walkthrough?: Array<{ title: string; body: string; path?: string }>;
  fileHints?: Array<{ path: string; purpose: string; stage: string }>;
};

const PORTFOLIO_DEMO = "作品集互動展示";

export const experienceCatalog: Record<string, ExperienceCatalogEntry> = {
  "ai-director-os": {
    mode: "process-map",
    honestyLabel: PORTFOLIO_DEMO,
    processNodes: [
      {
        id: "project",
        label: "專案",
        summary: "建立專案與權限，世界觀與素材綁在同一份上下文。",
        githubPath: "server/services/projectCore.ts",
        purpose: "專案核心狀態",
        stage: "專案",
      },
      {
        id: "world",
        label: "世界觀",
        summary: "角色卡與世界觀自動進入生成，而不是反覆貼提示詞。",
        githubPath: "shared/worldview.ts",
        purpose: "世界觀資料結構",
        stage: "世界觀",
      },
      {
        id: "assets",
        label: "素材",
        summary: "生成結果入庫，後續鏡頭沿用同一批素材。",
        githubPath: "server/db/schema/generation.ts",
        purpose: "素材與生成表",
        stage: "素材",
      },
      {
        id: "gen",
        label: "生成",
        summary: "供應商只接 Fal.ai；沒有金鑰時走假生成模式測流程。",
        githubPath: "server/services/generationCore.ts",
        purpose: "生成指揮",
        stage: "生成",
      },
      {
        id: "storyboard",
        label: "分鏡",
        summary: "分鏡排序與短影音母版，鏡頭表可匯出。",
        githubPath: "shared/storyboardScript.ts",
        purpose: "分鏡腳本",
        stage: "分鏡",
      },
      {
        id: "review",
        label: "審批",
        summary: "組長審批與品質回顧，外部引文只當草稿。",
        githubPath: "server/services/aiQualityReview.ts",
        purpose: "品質審批",
        stage: "審批",
      },
      {
        id: "delivery",
        label: "交付",
        summary: "分享連結與交付包，不是把內部帳號公開。",
        githubPath: "server/services/projectShare.ts",
        purpose: "專案分享",
        stage: "交付",
      },
    ],
    fileHints: [
      { path: "README.md", purpose: "公開能力與未完成項", stage: "來源" },
      { path: "server/routers/projects.ts", purpose: "專案 API", stage: "專案" },
      { path: "server/routers/generation.ts", purpose: "生成 API", stage: "生成" },
      { path: "shared/mcpCatalog.ts", purpose: "MCP 工具目錄", stage: "交付" },
    ],
  },
  framelab: {
    mode: "timeline",
    honestyLabel: PORTFOLIO_DEMO,
    fileHints: [
      { path: "src/lib/domain/timeline-engine.ts", purpose: "時間軸引擎", stage: "時間軸" },
      { path: "src/lib/domain/frame-graph.ts", purpose: "Frame Graph", stage: "圖節點" },
      { path: "src/lib/domain/sample-ball.ts", purpose: "示範彈跳球序列", stage: "樣本" },
      { path: "src/components/workstation/visual-timeline.tsx", purpose: "視覺時間軸", stage: "工作站" },
      { path: "src/lib/domain/region-repair.ts", purpose: "局部修復", stage: "修復" },
      { path: "src/lib/ai/registry.ts", purpose: "模型註冊；未載入時不可用", stage: "限制" },
    ],
  },
  "poster-vision-ai": {
    mode: "image-comparison",
    honestyLabel: "熱圖是像素／AI 推估，不是眼動儀",
    fileHints: [
      { path: "src/lib/vision/ts-engine.ts", purpose: "JS 顯著性引擎", stage: "分析" },
      { path: "src/lib/vision/scoring.ts", purpose: "計分", stage: "分析" },
      { path: "engine/analyze.py", purpose: "OpenCV／YuNet 引擎", stage: "分析" },
      { path: "src/components/poster/overlay-stage.tsx", purpose: "疊圖舞台", stage: "展示" },
      { path: "src/lib/vision/compare.ts", purpose: "修改前後比較", stage: "比較" },
    ],
  },
  planform: {
    mode: "spatial-preview",
    honestyLabel: "場前彩排，不是法規符合計算",
    fileHints: [
      { path: "src/scene/SceneManager.ts", purpose: "3D 場景", stage: "空間" },
      { path: "src/core/placement.ts", purpose: "擺放與碰撞", stage: "場佈" },
      { path: "src/core/simulation.ts", purpose: "人流模擬", stage: "動線" },
      { path: "src/core/venues.ts", purpose: "教室模板", stage: "場地" },
      { path: "src/core/validation.ts", purpose: "設計提醒（非法規認證）", stage: "限制" },
    ],
  },
  duigao: {
    mode: "image-comparison",
    honestyLabel: PORTFOLIO_DEMO,
    fileHints: [
      { path: "src/components/RoomWorkspace.tsx", purpose: "對稿工作區", stage: "討論" },
      { path: "src/cloud/invite.ts", purpose: "邀請雜湊，不存明文秘密", stage: "權限" },
      { path: "README.md", purpose: "權限模型", stage: "來源" },
    ],
  },
  folio: {
    mode: "interactive-walkthrough",
    honestyLabel: PORTFOLIO_DEMO,
    walkthrough: [
      {
        title: "畫布",
        body: "文字、形狀與元件走同一套文件模型。",
        path: "src/components/editor/canvas-stage.tsx",
      },
      {
        title: "指令層",
        body: "快捷鍵、命令面板與 MCP 寫入同一 typed command layer。",
        path: "src/components/editor/command-palette.tsx",
      },
      {
        title: "設計檢查",
        body: "對比、溢出與安全區，在發布前先看見問題。",
        path: "src/components/editor/audit-panel.tsx",
      },
      {
        title: "MCP 邊界",
        body: "寫入預設 dry-run；未發布文件不會出現在公開 MCP。",
        path: "src/components/editor/mcp-panel.tsx",
      },
    ],
    fileHints: [
      { path: "src/components/editor/editor-shell.tsx", purpose: "編輯器外殼", stage: "畫布" },
      { path: "README.md", purpose: "完成功能與限制", stage: "來源" },
    ],
  },
  "hermes-console": {
    mode: "conversation-preview",
    honestyLabel: "作品集互動展示，未連到 Hermes 執行期",
    walkthrough: [
      {
        title: "工作區",
        body: "聊天、任務與工具入口同一處。未設定 HERMES_API_URL 時仍應開啟並顯示尚未連線。",
        path: "app/api/chat/route.ts",
      },
      {
        title: "就緒檢查",
        body: "連線探測不是把 GitHub 網址當成 MCP。",
        path: "app/api/ready/route.ts",
      },
      {
        title: "MCP 登錄",
        body: "真實 HTTPS endpoint 與 token 才探測。",
        path: "app/api/mcp-registry/route.ts",
      },
    ],
    fileHints: [
      { path: "README.md", purpose: "產品不變量", stage: "來源" },
      { path: "app/api/health/route.ts", purpose: "健康檢查", stage: "狀態" },
    ],
  },
  "tku-zen-ai": {
    mode: "conversation-preview",
    honestyLabel: "本地回應引擎，不是雲端 LLM",
    fileHints: [
      { path: "src/lib/zen.ts", purpose: "可重現的本地引擎", stage: "對話" },
      { path: "src/app/api/chat/route.ts", purpose: "POST /api/chat", stage: "API" },
      { path: "src/lib/zen.test.ts", purpose: "單元測試", stage: "驗證" },
    ],
  },
};

export function experienceForSlug(slug: string): ExperienceCatalogEntry | null {
  return experienceCatalog[slug] ?? null;
}

export const modalityFilters = [
  { id: "image", label: "圖像", slugs: ["poster-vision-ai", "folio", "duigao", "ai-director-os"] },
  { id: "video", label: "影片", slugs: ["framelab", "ai-director-os"] },
  { id: "space", label: "空間", slugs: ["planform"] },
  { id: "poster", label: "文宣", slugs: ["poster-vision-ai", "duigao", "tku-zen-ai", "folio"] },
  { id: "interactive", label: "互動", slugs: ["duigao", "tku-zen-ai", "hermes-console", "planform"] },
] as const;
