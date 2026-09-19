import { projects } from "../../content/projects.ts";

export interface ConciergeAction {
  label: string;
  href?: string;
  slug?: string;
}

export interface ConciergeMessage {
  id: string;
  sender: "user" | "concierge";
  text: string;
  actions?: ConciergeAction[];
  timestamp: number;
}

export const SUGGESTED_QUESTIONS = [
  "介紹陳柏能的 8 大精選 AI 專案",
  "FrameLab 逐幀動畫修復原理是什麼？",
  "對稿 (DuiGao) 如何串接 Supabase？",
  "Hermes Agent 與 Console 的 MCP 架構",
  "PLANFORM 3D 等角空間如何彩排？",
  "有哪些作品需要登入？如何體驗？",
] as const;

export function getConciergeWelcome(): ConciergeMessage {
  return {
    id: "welcome",
    sender: "concierge",
    text: "您好！我是 Luminous Studio 的 AI 作品集導覽代理。我能為您詳細解說陳柏能（Bruce Chen）所構建的 17 個公開作品、多模態 AI 管道、MCP 工具協定，以及各服務的實際運作架構。請問今天想先了解哪一個專案？",
    actions: [
      { label: "🌟 查看 8 大精選案例", slug: "featured" },
      { label: "🎬 AI Director OS (Vexlark)", slug: "ai-director-os" },
      { label: "🎞️ FrameLab 逐幀工作站", slug: "framelab" },
      { label: "🛠️ Hermes Agent & MCP", slug: "hermes-console" },
    ],
    timestamp: Date.now(),
  };
}

export function answerQuestion(query: string): ConciergeMessage {
  const q = query.trim().toLowerCase();
  const id = `msg-${Date.now()}`;

  // 1. 詢問精選專案
  if (q.includes("8大") || q.includes("精選") || q.includes("有哪些專案") || q.includes("全部作品") || q.includes("featured")) {
    return {
      id,
      sender: "concierge",
      text: "陳柏能的核心作品集涵蓋 8 大精選案例與 10 大關聯作品，橫跨多模態 AI、空間運算與互動工具：\n\n1. AI Director OS：影視多模態創作作業系統 (Vexlark)\n2. FrameLab：視覺優先逐幀動畫修復工作站\n3. Poster Vision AI：文宣視覺檢測與熱圖推估\n4. PLANFORM：3D 等角活動空間彩排 PWA\n5. 對稿 (DuiGao)：活動文宣線上討論白板 (自建 Supabase)\n6. Folio：Typed 指令層設計編輯器 & MCP Server\n7. Hermes Console：免登入 AI 情報工作區與 MCP 探測\n8. TKU Zen AI：完全本地化平靜對話陪伴引擎\n\n所有專案的 GitHub 倉庫均已完全公開，且 Zeabur 節點全部 100% 在線運作中！",
      actions: [
        { label: "體驗 AI Director OS", href: "https://vexlark.co" },
        { label: "開啟 FrameLab 工作站", href: "https://cabin-shale-k7q2.zeabur.app" },
        { label: "探索 PLANFORM", href: "https://planform-iso-k7d2.zeabur.app" },
      ],
      timestamp: Date.now(),
    };
  }

  // 2. 詢問 FrameLab
  if (q.includes("framelab") || q.includes("逐幀") || q.includes("動畫") || q.includes("修復") || q.includes("lunar") || q.includes("cabin")) {
    return {
      id,
      sender: "concierge",
      text: "【FrameLab 逐幀動畫工作站】的核心理念是「壞幀只修壞幀」！\n\n傳統生成動畫一旦局部崩壞（如 F122 接觸點斷裂），往往被迫整段重產。FrameLab 將每一幀視為圖節點（Frame Graph），提供 Onion Skin、Pose Ghost 與 Motion Path，並以 Linear-blend 與 Motion Plan 局部修復，支援外部 MCP 指令控制。\n\n目前擁有中文工作站與英文展示首頁，GitHub 倉庫已完全公開！",
      actions: [
        { label: "進入 FrameLab 中文工作站", href: "https://cabin-shale-k7q2.zeabur.app" },
        { label: "英文展示頁", href: "https://lunar-falcon-8p2r.zeabur.app" },
        { label: "查看 GitHub 倉庫", href: "https://github.com/aa0968111723-prog/FrameLab" },
      ],
      timestamp: Date.now(),
    };
  }

  // 3. 詢問對稿 / Supabase
  if (q.includes("對稿") || q.includes("duigao") || q.includes("supabase")) {
    return {
      id,
      sender: "concierge",
      text: "【對稿 DuiGao】是為社團文宣與海報討論打造的即時協作工具：\n\n- 特色：原圖保持乾淨，討論註記作為半透明覆蓋層，支援圖釘留言、黑白/彩色對切、多版本切換。\n- 架構：後端以私有化 Supabase 為骨幹，整合 Kong API 閘道、GoTrue 認證、PostgREST、Realtime 廣播與 MinIO S3 物件儲存。\n- 分享機制：分享連結使用 URL fragment (#room+invite) 高熵秘密，前端僅帶 publishable key，後端安全隔離。",
      actions: [
        { label: "打開對稿白板", href: "https://duigao-k7q2.zeabur.app" },
        { label: "查看 GitHub 原始碼", href: "https://github.com/aa0968111723-prog/duigao" },
      ],
      timestamp: Date.now(),
    };
  }

  // 4. 詢問 MCP / Hermes Agent
  if (q.includes("mcp") || q.includes("hermes") || q.includes("代理") || q.includes("console") || q.includes("344")) {
    return {
      id,
      sender: "concierge",
      text: "【Hermes Agent 與 MCP 體系】是本作品集的代理執行核心：\n\n1. Hermes Agent (Docker)：NousResearch 代理執行層，具備 Sessions 管理、xAI Grok API 與 MCP 工具調用能力。\n2. Hermes Console (344.zeabur.app)：免登入情報工作區，具備任務記憶、文案版本庫與 MCP 連線探測器。\n3. TKU MCP (tku-mcp.zeabur.app)：將淡江校園與社團問答、公文處理封裝成標準 MCP 協定，供 LLM 即時查詢。\n4. Folio Design Bridge MCP：提供 typed command layer，使 AI 代理能直接編程操作向量畫布！",
      actions: [
        { label: "打開 Hermes Console (344)", href: "https://344.zeabur.app" },
        { label: "Hermes Agent 登入入口", href: "https://hermes-agent-k7q2.zeabur.app/sessions" },
        { label: "查看 Console 原始碼", href: "https://github.com/aa0968111723-prog/hermes-console" },
      ],
      timestamp: Date.now(),
    };
  }

  // 5. 詢問 PLANFORM
  if (q.includes("planform") || q.includes("場佈") || q.includes("空間彩排") || q.includes("等角")) {
    return {
      id,
      sender: "concierge",
      text: "【PLANFORM 活動空間彩排】是一款專為活動與教室設計的 3D 等角場佈工具：\n\n- 理念：先排好，再上場。不用打開笨重的 CAD，即可在瀏覽器中快速排好桌椅、地墊、報到動線與物資配置。\n- 模擬：本地內建離散事件模擬 (DES)，可直接推估排隊人流與瓶頸。\n- 技術：Three.js + Vite + PWA，支援離線操作，一鍵匯出帶毫米/公尺尺寸的場刊配置圖！",
      actions: [
        { label: "打開 PLANFORM 空間彩排", href: "https://planform-iso-k7d2.zeabur.app" },
        { label: "查看 GitHub 倉庫 (已公開)", href: "https://github.com/aa0968111723-prog/planform-iso" },
      ],
      timestamp: Date.now(),
    };
  }

  // 6. 詢問登入與公開性
  if (q.includes("登入") || q.includes("權限") || q.includes("公開") || q.includes("密碼") || q.includes("login")) {
    return {
      id,
      sender: "concierge",
      text: "【全專案公開性與登入指引說明】：\n\n1. GitHub 倉庫：陳柏能名下所有專案倉庫（包含原本私有的 forge-bloom、cabin-shale、CUTOS、tku-zen-agent 等）已全數設為 Public 公開！\n2. 需登入/授權碼之服務：\n   - Hermes Agent (455 / k7q2)：後台會話需管理者憑證，未登入者會看到安全的 Auth Required 邊界。\n   - 禪學社工作台 (tku-zen-agent)：預設可帶 ?mode=ask 進入諮詢模式，社團公文操作帶授權碼防護。\n   - 主作品集後台 (/admin)：採 Google Fail-closed 白名單保護。\n3. 其餘 14+ 個公開站點（如 Vexlark、FrameLab、PLANFORM、對稿、淡江世界、SkateHub、小財記帳等）均可直接點擊體驗，無需任何登入！",
      actions: [
        { label: "淡江世界 3D", href: "https://forge-bloom-k7xq.zeabur.app" },
        { label: "禪學社工作台 Ask 模式", href: "https://tku-zen-agent-k7f2.zeabur.app/?mode=ask" },
      ],
      timestamp: Date.now(),
    };
  }

  // 7. 詢問 AI Director OS / Vexlark
  if (q.includes("ai director") || q.includes("ai_os") || q.includes("vexlark") || q.includes("導演")) {
    return {
      id,
      sender: "concierge",
      text: "【AI Director OS (Vexlark)】是團隊向的 AI 影視與協作作業系統：\n\n- 解決痛點：過去生成圖、影、音、分鏡與審核是斷裂的，Vexlark 把世界觀、角色卡與提示詞綁定，自動注入生成管線。\n- 特色：組長審批三態機、點數預扣與失敗退回、以及直接匯出 FCP / Premiere 時間軸剪輯交付包。\n- 整合：串接 Fal.ai、Gemini、OpenAI、NVIDIA NIM、Redis 隊列與 S3 儲存。",
      actions: [
        { label: "造訪 Vexlark.co", href: "https://vexlark.co" },
        { label: "Web 應用端點", href: "https://ai-os-app.zeabur.app" },
        { label: "查看 ai_os 倉庫", href: "https://github.com/aa0968111723-prog/ai_os" },
      ],
      timestamp: Date.now(),
    };
  }

  // 8. 詢問淡江世界 3D
  if (q.includes("淡江世界") || q.includes("五虎崗") || q.includes("forge-bloom") || q.includes("校園通行證")) {
    return {
      id,
      sender: "concierge",
      text: "【淡江世界 3D 校園巡禮 (forge-bloom)】：\n\n- 特色：在瀏覽器中直接還原淡江五虎崗真實地標（克難坡、宮燈大道、海事博物館、覺生紀念圖書館）。\n- 通行證機制：公開入口為「校園通行證」，訪客點擊「先以訪客巡禮」即可立即免登入暢遊；登入後可保存巡禮蓋章足跡。\n- 技術：WebGL + 3D 空間體驗，GitHub 倉庫已完全公開開放查閱！",
      actions: [
        { label: "進入淡江世界 3D", href: "https://forge-bloom-k7xq.zeabur.app" },
        { label: "查看 GitHub 倉庫", href: "https://github.com/aa0968111723-prog/forge-bloom-quiet-falcon" },
      ],
      timestamp: Date.now(),
    };
  }

  // 9. 詢問 SkateHub / 直排輪
  if (q.includes("skatehub") || q.includes("直排輪") || q.includes("輪鞋") || q.includes("skate")) {
    return {
      id,
      sender: "concierge",
      text: "【SkateHub 直排輪同好平台 (dd)】：\n\n- 理念：專為直排輪社團與同好打造的專業款式圖鑑與里程記錄工具。\n- 特色：標語「輪滑的世界，從這裡開始」，提供鞋款分類、輪徑與硬度比對、個人輪鞋收藏櫃及路溜活動發起。\n- 公開性：線上服務正常運行，GitHub 倉庫已公開！",
      actions: [
        { label: "打開 SkateHub", href: "https://dd-k3f9.zeabur.app" },
        { label: "查看 GitHub 倉庫", href: "https://github.com/aa0968111723-prog/dd" },
      ],
      timestamp: Date.now(),
    };
  }

  // 10. 詢問 CUTOS 影片剪輯
  if (q.includes("cutos") || q.includes("影片剪輯") || q.includes("對話剪輯")) {
    return {
      id,
      sender: "concierge",
      text: "【CUTOS 對話式影片剪輯 (CUTOS)】：\n\n- 理念：透過對話直接剪輯影片，不用在複雜的 NLE 時間軸上慢慢拉剪刀！\n- 特色：自然語言指示（如「把開頭無聲的部分切掉」、「保留兩個人對話的高潮段落」），自動生成時間軸草稿。\n- 公開性：線上服務已排除舊 502 標註，正常運行，GitHub 倉庫完全公開！",
      actions: [
        { label: "打開 CUTOS", href: "https://cutos.zeabur.app" },
        { label: "查看 GitHub 倉庫", href: "https://github.com/aa0968111723-prog/CUTOS" },
      ],
      timestamp: Date.now(),
    };
  }

  // 通用匹配專案
  const matched = projects.find((p) => q.includes(p.slug) || q.includes(p.title.toLowerCase()));
  if (matched) {
    return {
      id,
      sender: "concierge",
      text: `【${matched.title}】（${matched.subtitle}）\n\n類別：${matched.category} · ${matched.year}\n\n${matched.summary}\n\n核心產出：${matched.outputs.join("、")}\n技術堆疊：${matched.stack.join(", ")}\n\n目前線上正常運行，GitHub 倉庫已完全公開！`,
      actions: [
        ...(matched.links.live ? [{ label: `打開 ${matched.title} 正式站`, href: matched.links.live }] : []),
        ...(matched.links.github ? [{ label: "查看 GitHub 倉庫", href: matched.links.github }] : []),
      ],
      timestamp: Date.now(),
    };
  }

  // 兜底回覆
  return {
    id,
    sender: "concierge",
    text: `感謝您的提問！關於「${query}」，陳柏能的作品集涵蓋 17 個公開專案與多模態 AI / MCP 代理架構。您可以點選下方的快捷按鈕，或告訴我想了解「動畫修復」、「空間彩排」、「影視生成」或「MCP 協定」！`,
    actions: [
      { label: "介紹 8 大精選案例", slug: "featured" },
      { label: "FrameLab 動畫修復", slug: "framelab" },
      { label: "Hermes Agent & MCP", slug: "hermes-console" },
      { label: "全部網站公開狀態", slug: "public-status" },
    ],
    timestamp: Date.now(),
  };
}
