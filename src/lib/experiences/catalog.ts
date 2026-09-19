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
      { path: "server/services/projectCore.ts", purpose: "專案核心狀態", stage: "專案" },
      { path: "shared/worldview.ts", purpose: "世界觀資料結構", stage: "世界觀" },
      { path: "server/db/schema/generation.ts", purpose: "素材與生成表", stage: "素材" },
      { path: "server/services/generationCore.ts", purpose: "生成指揮", stage: "生成" },
      { path: "server/services/fal.ts", purpose: "Fal.ai 供應商接線", stage: "生成" },
      { path: "shared/storyboardScript.ts", purpose: "分鏡腳本", stage: "分鏡" },
      { path: "server/services/aiQualityReview.ts", purpose: "品質審批", stage: "審批" },
      { path: "server/services/projectShare.ts", purpose: "專案分享", stage: "交付" },
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
      { path: "src/lib/domain/inbetween.ts", purpose: "中間幀策略", stage: "時間軸" },
      { path: "src/lib/domain/keyframe-pair.ts", purpose: "關鍵幀對", stage: "時間軸" },
      { path: "src/lib/domain/regeneration-planner.ts", purpose: "局部重產規劃", stage: "修復" },
      { path: "src/lib/domain/region-repair.ts", purpose: "局部修復", stage: "修復" },
      { path: "src/components/workstation/visual-timeline.tsx", purpose: "視覺時間軸", stage: "工作站" },
      { path: "src/lib/domain/context-engine.ts", purpose: "Context Engine", stage: "上下文" },
      { path: "src/lib/commands/execute.ts", purpose: "UI／REST／MCP 同一套指令", stage: "指令" },
      { path: "src/lib/ai/registry.ts", purpose: "模型註冊；未載入時不可用", stage: "限制" },
    ],
  },
  "poster-vision-ai": {
    mode: "image-comparison",
    honestyLabel: "熱圖是像素／AI 推估，不是眼動儀",
    fileHints: [
      { path: "src/lib/vision/ts-engine.ts", purpose: "JS 顯著性引擎", stage: "分析" },
      { path: "src/lib/vision/pipeline.ts", purpose: "分析管線", stage: "分析" },
      { path: "src/lib/vision/scoring.ts", purpose: "計分", stage: "分析" },
      { path: "src/lib/vision/python-engine.ts", purpose: "Python 引擎橋", stage: "分析" },
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
      { path: "src/core/boothCatalog.ts", purpose: "攤位物件目錄", stage: "場佈" },
      { path: "src/core/simulation.ts", purpose: "人流模擬", stage: "動線" },
      { path: "src/core/simSpatial.ts", purpose: "空間動線", stage: "動線" },
      { path: "src/core/eventFlow.ts", purpose: "活動動線", stage: "動線" },
      { path: "src/core/venues.ts", purpose: "教室模板", stage: "場地" },
      { path: "src/core/validation.ts", purpose: "設計提醒（非法規認證）", stage: "限制" },
    ],
  },
  duigao: {
    mode: "image-comparison",
    honestyLabel: PORTFOLIO_DEMO,
    fileHints: [
      { path: "src/components/RoomWorkspace.tsx", purpose: "對稿工作區", stage: "討論" },
      { path: "src/components/UniversalIntake.tsx", purpose: "素材收件", stage: "討論" },
      { path: "src/components/ShareSheet.tsx", purpose: "分享面板（無邀請明文）", stage: "權限" },
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
        title: "畫板",
        body: "一份文件可以有多張畫板。MCP 的 list_artboards / get_artboard 走同一套文件模型。",
        path: "src/components/editor/artboard-strip.tsx",
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
      { path: "src/components/editor/artboard-strip.tsx", purpose: "多畫板列", stage: "畫板" },
      { path: "src/components/editor/canvas-stage.tsx", purpose: "畫布舞台", stage: "畫布" },
      { path: "src/components/editor/command-palette.tsx", purpose: "指令面板", stage: "指令" },
      { path: "src/components/editor/audit-panel.tsx", purpose: "設計檢查", stage: "檢查" },
      { path: "src/components/editor/mcp-panel.tsx", purpose: "MCP 寫入邊界", stage: "限制" },
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
      { path: "app/api/chat/route.ts", purpose: "聊天入口", stage: "工作區" },
      { path: "app/api/ready/route.ts", purpose: "就緒檢查", stage: "狀態" },
      { path: "app/api/mcp-registry/route.ts", purpose: "MCP 登錄", stage: "工具" },
      { path: "app/api/health/route.ts", purpose: "健康檢查", stage: "狀態" },
      { path: "lib/server/canva.ts", purpose: "Canva Connect 適配；未設定時不可用", stage: "限制" },
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
  "tamkang-world": {
    mode: "interactive-walkthrough",
    honestyLabel: PORTFOLIO_DEMO,
    walkthrough: [
      { title: "開始巡禮", body: "公開站 forge-bloom-k7xq。點「開始巡禮」進 3D；「校園圖鑑」看建築。WASD 移動、滑鼠視角。" },
      { title: "逛五虎崗", body: "在瀏覽器裡走校園，辨認建築與山勢。效能依裝置而變。" },
      { title: "對照現場", body: "巡禮是身體感，不是完整數位雙生。回到淡水現場再對一次。" },
    ],
  },
  "tamsui-drama": {
    mode: "interactive-walkthrough",
    honestyLabel: PORTFOLIO_DEMO,
    walkthrough: [
      { title: "載入世界", body: "打開 tku-tamsui-drama-world-k4x9。等「淡江·淡水世界」載入，不是 FrameLab。" },
      { title: "第一集", body: "從宮燈下的迎新開始，依關卡走校園闖關。" },
      { title: "關卡", body: "把淡江／淡水當成可持續開發的劇本，而不是一次導覽 PDF。" },
    ],
  },
  skatehub: {
    mode: "interactive-walkthrough",
    honestyLabel: PORTFOLIO_DEMO,
    walkthrough: [
      { title: "打開基地", body: "公開站 dd-k3f9。標題是「走向健康，走向陽光」，不是 Folio。" },
      { title: "裝備圖鑑", body: "看直排輪款式與配件。" },
      { title: "里程", body: "記錄滑行里程，回到自己的基地。" },
    ],
  },
  "zen-studio": {
    mode: "interactive-walkthrough",
    honestyLabel: PORTFOLIO_DEMO,
    walkthrough: [
      { title: "今天可以創作什麼", body: "打開 delta-horizon-k7f2。先看今日靈感與近期活動。" },
      { title: "生成", body: "從 IG 貼文／Carousel／Story／畫布開始，不要先開雲端硬碟。" },
      { title: "月曆", body: "到期內容在月曆裡改。未接 IG 時只在工作室內排程。" },
    ],
  },
  "focus-challenge": {
    mode: "interactive-walkthrough",
    honestyLabel: "現場遊戲，不是心理測驗",
    walkthrough: [
      { title: "打開", body: "公開站 leader-dna-mcp-a7k2。標題「淡江大學禪學社｜專注力挑戰賽」。首頁是登記畫面，不是立刻開打。" },
      { title: "教學／練習", body: "兩題教學與 15 秒練習不計分、不登記。正式賽前仍要先填關主與基本資料。" },
      { title: "60 秒", body: "正式 Stroop 會 POST /api/register 與 /api/result。作品集未送出個資，也未操作這一局。" },
      { title: "排行榜", body: "GET /api/leaderboard?scope=history 回 67 筆遮罩姓名。今日 0 筆。電話與完整名冊只在 /admin。" },
    ],
  },
  lumen: {
    mode: "conversation-preview",
    honestyLabel: PORTFOLIO_DEMO,
    walkthrough: [
      { title: "想做什麼", body: "打開 ai-chat-8rq3。點一下開始聽，或按住說話。" },
      { title: "入口", body: "做海報、拍照、開始做影片、長任務。" },
      { title: "最近", body: "從最近專案繼續，不要把未生成的結果假裝完成。" },
    ],
  },
  xiaocai: {
    mode: "media-gallery",
    honestyLabel: "公開站是小財記帳，不是 Folio 編輯器",
    walkthrough: [
      { title: "打開帳本", body: "公開站 untitled-5.zeabur.app。2026-09-19 探測 HTTP 200，標題「小財記帳」。" },
      { title: "記一筆", body: "記收支、看分類。作品集尚未驗證這一步是否真的寫入。" },
      { title: "這個月", body: "看這個月花到哪。不是作品集後台。" },
    ],
  },
  "tku-zen-agent": {
    mode: "conversation-preview",
    honestyLabel: "需授權碼的社團工作台，不是本地 tku-zen-ai，也不是 Hermes",
    walkthrough: [
      { title: "Ask 模式", body: "打開 tku-zen-agent-k7f2.zeabur.app/?mode=ask。HTTP 200，不是 502。" },
      { title: "授權邊界", body: "未輸入授權碼時只看得到「請輸入授權碼 進入工作台」。" },
      { title: "草稿", body: "頁面標示草稿模式，不會自動發布。與本地 tku-zen-ai 不是同一個產品。" },
    ],
  },
  cutos: {
    mode: "interactive-walkthrough",
    honestyLabel: PORTFOLIO_DEMO,
    walkthrough: [
      { title: "打開 CUTOS", body: "公開站 cutos.zeabur.app。標題 CUTOS — Conversational Video Editor。" },
      { title: "匯入", body: "匯入一支影片。作品集這一頁沒有代替你上傳。" },
      { title: "計畫", body: "用一句話產生可檢查的 Edit Plan，再套用非破壞時間軸。" },
    ],
  },
  "hermes-agent": {
    mode: "conversation-preview",
    honestyLabel: "需登入的 Dashboard，不是免登入 Console",
    walkthrough: [
      { title: "Dashboard", body: "打開 hermes-agent-k7q2.zeabur.app。未登入會到 Sign in — Hermes Agent。" },
      { title: "執行層", body: "這是 Hermes Agent Dashboard，不是 344 的 Console。" },
      { title: "登入邊界", body: "作品集訪客只能看到登入頁，看不到會話內容。" },
    ],
  },
};

export function experienceForSlug(slug: string): ExperienceCatalogEntry | null {
  return experienceCatalog[slug] ?? null;
}

/** Paths the public GitHub tree must keep, even after depth/entry limits. */
export function catalogSourcePaths(slug?: string | null): string[] {
  if (!slug) return [];
  const entry = experienceCatalog[slug];
  if (!entry) return [];
  const paths = new Set<string>();
  for (const hint of entry.fileHints ?? []) {
    if (hint.path) paths.add(hint.path);
  }
  for (const node of entry.processNodes ?? []) {
    if (node.githubPath) paths.add(node.githubPath);
  }
  for (const step of entry.walkthrough ?? []) {
    if (step.path) paths.add(step.path);
  }
  return [...paths];
}

export const modalityFilters: Array<{ id: string; label: string; slugs: string[] }> = [
  { id: "image", label: "圖像", slugs: ["poster-vision-ai", "folio", "duigao", "ai-director-os", "skatehub", "zen-studio", "lumen"] },
  { id: "video", label: "影片", slugs: ["framelab", "ai-director-os", "cutos"] },
  { id: "space", label: "空間", slugs: ["planform", "tamkang-world", "tamsui-drama"] },
  { id: "poster", label: "文宣", slugs: ["poster-vision-ai", "duigao", "tku-zen-ai", "folio", "zen-studio"] },
  { id: "interactive", label: "互動", slugs: ["duigao", "tku-zen-ai", "hermes-console", "planform", "skatehub", "focus-challenge", "lumen", "xiaocai"] },
];

/** Map CMS modality strings onto homepage hubs. Slug lists are only a fallback. */
export const MODALITY_HUB_TOKENS: Array<{ id: string; label: string; tokens: string[] }> = [
  { id: "image", label: "圖像", tokens: ["圖像", "畫布", "熱圖", "OCR", "嵌入"] },
  { id: "video", label: "影片", tokens: ["影片", "影像序列", "時間軸", "姿勢殘影"] },
  { id: "space", label: "空間", tokens: ["3D", "平面圖", "動線", "物資", "空間"] },
  { id: "poster", label: "文宣", tokens: ["文宣", "海報", "設計 token", "日曆"] },
  { id: "interactive", label: "互動", tokens: ["互動", "對話", "MCP", "註記", "任務", "審批", "自然語言", "LINE", "呼吸", "現場", "語音", "數字", "敘事"] },
];

export function projectHubIds(project: { slug: string; modalities: string[] }): string[] {
  const fromModalities = MODALITY_HUB_TOKENS.filter((hub) =>
    project.modalities.some((mod) => hub.tokens.some((token) => mod.includes(token))),
  ).map((hub) => hub.id);
  if (fromModalities.length) return fromModalities;
  return modalityFilters.filter((item) => item.slugs.includes(project.slug)).map((item) => item.id);
}
