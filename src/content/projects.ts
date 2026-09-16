import type { Project, ProjectCategory, ProjectMedia, ProjectStatus, SourceReference } from "./types.ts";

const vis = "工作室視覺轉譯，不是產品截圖。";

function githubExport(
  slug: string,
  file: string,
  alt: string,
  repo: string,
  path: string,
  extra = "",
): ProjectMedia {
  return {
    src: `/media/github-exports/${slug}/${file}`,
    alt,
    kind: "image",
    caption: `公開 GitHub 匯出（${repo} · ${path}）。不是 Canva 原作，也不是 Drive 私有檔。${extra}`.trim(),
  };
}

function githubExportEvidence(repo: string, note: string): SourceReference {
  return {
    label: `GitHub 公開畫面 · ${repo}`,
    href: `https://github.com/aa0968111723-prog/${repo}`,
    note,
  };
}

function studioReconstruction(
  file: string,
  alt: string,
  source: string,
  extra = "",
): ProjectMedia {
  return {
    src: `/media/studio/${file}`,
    alt,
    kind: "image",
    caption:
      `光域工作室重建（對齊公開 ${source}）。不是產品操作截圖，不是 Canva 嵌入，也不是 Drive 私有檔。${extra}`.trim(),
  };
}

export const statusLabel: Record<ProjectStatus, string> = {
  completed: "已完成",
  "in-progress": "開發中",
  prototype: "原型",
  concept: "概念驗證",
  planned: "規劃中",
};

export const categoryLabel: Record<ProjectCategory, string> = {
  "AI Product": "AI Product",
  Multimodal: "Multimodal",
  Interaction: "Interaction",
  "Visual AI": "Visual AI",
  "Spatial Design": "Spatial Design",
  "Creative Tool": "Creative Tool",
  "Real-world Experience": "Real-world Experience",
};

export const projects: Project[] = [
  {
    slug: "ai-director-os",
    title: "AI Director OS",
    subtitle: "團隊向的 AI 創作與協作作業系統",
    category: "AI Product",
    year: "2026",
    status: "in-progress",
    featured: true,
    summary:
      "專案、素材、生成、分鏡、審批與交付放在同一套作業系統裡，讓世界觀與角色卡自動進入生成，而不是反覆貼提示詞。",
    problem:
      "多模態創作一拆成圖、影、音、分鏡與審核，上下文就斷掉。團隊需要的是能協作、能審批、能交付的作業系統，不是單次生成頁。",
    role: "產品建構者 / AI Director：定義世界觀注入、生成台、審批與交付流程。",
    decisions: [
      "可行實用優先，供應商只接 Fal.ai；沒有金鑰時進入假生成模式，用來測完整流程而不是假裝已生成。",
      "世界觀、角色與素材庫自動帶進提示詞，減少複製貼上。",
      "先扣點數預估、失敗退回；外部引文只當草稿，重要內容需組長審核。",
      "MCP 使用可撤銷、可到期、綁定個人的連線金鑰，不用共用超管金鑰當正式站預設。",
    ],
    modalities: ["文字", "圖像", "影片", "音訊", "審批流程"],
    process: [
      "建立專案與世界觀快速層",
      "多模態生成（圖／影／音／文字）並自動入素材庫",
      "分鏡排序、短影音母版複製",
      "組長審批三態機",
      "匯出時間軸與素材包給剪輯軟體",
    ],
    outputs: [
      "公開儲存庫 ai_os（創作系統）",
      "前身 Healing Studio 多模態工作室",
      "交付包：視頻／圖像／腳本鏡頭表與 FCP／Premiere 時間軸",
    ],
    stack: ["React", "Express", "tRPC", "Drizzle", "Postgres", "Fal.ai", "MCP"],
    limitations: [
      "素材知識庫（RAG）尚未完成。",
      "資料庫層 RLS 第二道隔離尚未完成。",
      "公開部署網址狀態會隨環境變動，不在此宣稱穩定 SLA 或使用者數。",
      "開發期假身分與種子帳號不會出現在本站。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/ai_os",
      live: "https://ai-os-app.zeabur.app",
    },
    media: [
      {
        src: "/media/covers/ai-director-os.svg",
        alt: "AI Director OS 光域工作室視覺：玻璃控制台與分鏡卡片漂在晨光中",
        kind: "image",
        caption: vis,
      },
      githubExport(
        "ai-director-os",
        "desktop-dashboard.png",
        "AI Director OS 公開截圖：建立新創作專案對話框",
        "ai_os",
        "client/public/screenshots/desktop-dashboard.png",
      ),
      githubExport(
        "ai-director-os",
        "desktop-mixed.png",
        "AI Director OS 公開證據截圖：桌面 Mixed Look 比較",
        "ai_os",
        "docs/evidence/visual-creative-ux-v3/desktop-mixed.png",
      ),
      githubExport(
        "ai-director-os",
        "mobile-390-compare.png",
        "AI Director OS 公開證據截圖：手機並排比較",
        "ai_os",
        "docs/evidence/visual-creative-ux-v3/mobile-390-compare.png",
      ),
    ],
    sourceReferences: [
      {
        label: "GitHub README · ai_os",
        href: "https://github.com/aa0968111723-prog/ai_os",
        note: "功能完成項與未完成項直接取自 README 路線圖。",
      },
      githubExportEvidence(
        "ai_os",
        "本站 /media/github-exports/ai-director-os 複製自公開 repo 的 screenshots 與 docs/evidence。不是 Canva 原作，也不是 Drive 私有檔。",
      ),
      {
        label: "GitHub 公開 PDF · Aios系統介紹-剪輯組長",
        href: "https://github.com/aa0968111723-prog/ai_os/blob/claude/healing-migration-ai-os-erewp2/docs/%E7%B0%A1%E5%A0%B1/Aios%E7%B3%BB%E7%B5%B1%E4%BB%8B%E7%B4%B9-%E5%89%AA%E8%BC%AF%E7%B5%84%E9%95%B7.pdf",
        note: "公開 repo 簡報 PDF。沒有複製進本站。不是 Canva 嵌入。",
      },
      {
        label: "GitHub · healing-studio",
        href: "https://github.com/aa0968111723-prog/healing-studio",
        note: "多模態工作室前身，描述取自公開 repo description。",
      },
      {
        label: "Canva 短網址 · healing-studio 品牌主視覺",
        href: "https://www.canva.com/d/ysK5sYZisVEjZFe",
        note: "來自 healing-studio docs/design-reference.md。短網址不是 design id。瀏覽器跟隨後仍停在 /d/（404），所以不嵌入、也不標成已驗證。",
      },
      {
        label: "公開站 · ai-os-app.zeabur.app",
        href: "https://ai-os-app.zeabur.app",
        note: "INSTALL.md 與 Capacitor 記載的 HTML 公開站。禁止嵌入時只開新分頁。",
      },
      {
        label: "GitHub homepage · ai-os-ten.vercel.app",
        href: "https://ai-os-ten.vercel.app",
        note: "GitHub 上的 homepage。目前回傳 JavaScript bundle，不是網頁，所以不當 Live Demo。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "framelab",
    title: "FrameLab",
    subtitle: "視覺優先的 AI 逐幀動畫工作站",
    category: "Multimodal",
    year: "2026",
    status: "prototype",
    featured: true,
    summary:
      "不是剪輯軟體，也不是通用影片分析站。核心是 Frame Graph、時間軸、Context Engine、對話與 MCP，讓壞幀只修壞幀。",
    problem:
      "動畫問題是局部的。F122 接觸點斷了，不該重產 F100–F200。需要看得到手跳、看得到 onion skin，而不是一個 0.72 的 JSON 分數。",
    role: "互動體驗與工具設計：工作站視覺中心、時間軸、修復迴路與 MCP 指令層。",
    decisions: [
      "每個 frame 是圖節點：類型、鄰居、角色、運動、修訂。",
      "Inbetween 先給 Motion Plan，再用 linear-blend 產生候選，只重產壞幀。",
      "Wan / RIFE 等 GPU 適配器未載入時回報 PROVIDER_NOT_AVAILABLE，不給假深度或假姿勢。",
      "UI、REST、MCP 都走同一套 application commands。",
    ],
    modalities: ["影像序列", "時間軸", "姿勢殘影", "對話", "MCP"],
    process: [
      "匯入影片或圖序",
      "時間軸標記 key / breakdown / generated",
      "onion skin、pose ghost、motion path",
      "框選區域後 Ask / Repair",
      "Accept 候選或只重產問題窗",
    ],
    outputs: [
      "可跑的工作站 UI 與 REST / MCP",
      "像素指標（MAE、histogram、luma flicker）",
      "CPU 模式可用的 linear-blend inbetween",
    ],
    stack: ["TanStack Start", "TypeScript", "Postgres / PGLite", "FFmpeg", "MCP"],
    limitations: [
      "SAM 2、RTMPose、SEA-RAFT、RIFE、Wan 僅適配器，模型未註冊時不可用。",
      "不是 NLE，也不輸出完整製片管線。",
      "Grok vision 需 XAI_API_KEY，且僅使用者主動送出的幀。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/FrameLab",
    },
    media: [
      {
        src: "/media/covers/framelab.svg",
        alt: "FrameLab 視覺：明亮畫布上的 onion skin 彈跳球與時間軸",
        kind: "image",
        caption: vis,
      },
      githubExport(
        "framelab",
        "zh-workstation.png",
        "FrameLab 公開截圖：經典彈跳球工作站",
        "FrameLab",
        "screenshots/zh-workstation.png",
      ),
      githubExport(
        "framelab",
        "zh-inbetween.png",
        "FrameLab 公開截圖：中間影格產生面板",
        "FrameLab",
        "screenshots/zh-inbetween.png",
      ),
    ],
    sourceReferences: [
      {
        label: "GitHub README · FrameLab",
        href: "https://github.com/aa0968111723-prog/FrameLab",
        note: "能力邊界與模型表直接取自公開 README。",
      },
      githubExportEvidence(
        "FrameLab",
        "本站 /media/github-exports/framelab 複製自公開 repo screenshots。不是 Canva 原作，也不是 Drive 私有檔。",
      ),
    ],
    visibility: "public",
  },
  {
    slug: "poster-vision-ai",
    title: "Poster Vision AI",
    subtitle: "文宣視覺檢測中心",
    category: "Visual AI",
    year: "2026",
    status: "prototype",
    featured: true,
    summary:
      "上傳海報後，用真實像素運算加上可選的 Grok Vision，推估人物與標題比重，並給帶數字的修改建議。視線與熱圖一律標示為 AI 推估。",
    problem:
      "社團與活動文宣常常「自己覺得很大」，印出來或縮成 IG 縮圖才發現主標看不見。需要可執行的修改建議，而不是空泛美學評語。",
    role: "視覺 AI 產品設計：檢測流程、目的計分、前後比較與回饋紀錄。",
    decisions: [
      "面積、顯著性、對比、構圖用像素運算；語意／OCR 才走視覺模型。",
      "熱圖與第一眼標記明確寫成推估，不是眼動儀。",
      "分數當次計算，模型失敗寫入 degraded[]，不假裝成功。",
      "預設不永久保存原圖。",
    ],
    modalities: ["圖像", "熱圖", "OCR", "修改建議"],
    process: [
      "上傳海報並選擇文宣目的",
      "幾何引擎偵測元素與文字區",
      "可選語意標籤",
      "輸出問題與建議",
      "修改前後比較與回饋",
    ],
    outputs: [
      "分析 JSON：元素、面積比、可讀性、手機縮圖指標",
      "REST API 供後續系統接入",
    ],
    stack: ["TanStack Start", "Python OpenCV", "YuNet", "Grok Vision", "SQLite"],
    limitations: [
      "熱圖不是真實眼動追蹤。",
      "第一版回饋只存資料庫，尚未自我訓練。",
      "沒有 API key 時 OCR 降級為文字區域框。",
      "Vercel 若無 Python 會改用 JS 顯著性引擎。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/poster-vision-ai",
    },
    media: [
      {
        src: "/media/covers/poster-vision-ai.svg",
        alt: "Poster Vision AI 視覺：海報上的柔和熱圖與構圖引導",
        kind: "image",
        caption: vis,
      },
      githubExport(
        "poster-vision-ai",
        "demo-event.png",
        "Poster Vision AI 公開樣本海報：活動文宣 fixture",
        "poster-vision-ai",
        "public/samples/demo-event.png",
        "這是 repo 裡的分析樣本，不是真實招生名冊。",
      ),
      githubExport(
        "poster-vision-ai",
        "demo-product.png",
        "Poster Vision AI 公開樣本海報：商品文宣 fixture",
        "poster-vision-ai",
        "public/samples/demo-product.png",
        "這是 repo 裡的分析樣本，不是真實商品拍攝。",
      ),
    ],
    sourceReferences: [
      {
        label: "GitHub README · poster-vision-ai",
        href: "https://github.com/aa0968111723-prog/poster-vision-ai",
        note: "功能與限制原文來自 README。",
      },
      githubExportEvidence(
        "poster-vision-ai",
        "本站 /media/github-exports/poster-vision-ai 複製自公開 repo public/samples。是分析用 fixture，不是 Canva 原作或 Drive 私有檔。",
      ),
    ],
    visibility: "public",
  },
  {
    slug: "planform",
    title: "PLANFORM",
    subtitle: "活動空間彩排 · 3D 等角場佈",
    category: "Spatial Design",
    year: "2026",
    status: "in-progress",
    featured: true,
    summary:
      "先排好，再上場。把教室、道具、人流與互動在場前彩排完，再把場刊圖交給夥伴。可安裝 PWA，不上架商店。",
    problem:
      "淡江教室與禪學社茶會／演講／新生場，現場才發現報到桌擋門、地墊不夠走道。需要不用 CAD 的場佈工具。",
    role: "空間體驗設計與產品建構：預設模板、動線、人流模擬與分享圖。",
    decisions: [
      "Preset-first，但一切可自訂。一場活動一份專案，不會互相覆蓋。",
      "AI 只負責理解句子與目標；座標、碰撞、走道、容量由程式計算。",
      "沒有雲端金鑰時，本機結構化解析器仍可用，結果可重現。",
      "涉及消防或無障礙的條目只顯示設計提醒，程式禁止寫「已符合所有法規」。",
    ],
    modalities: ["3D", "平面圖", "動線", "物資清單", "自然語言"],
    process: [
      "選教室模板與人數",
      "排地墊與區域",
      "畫動線",
      "本地 DES 模擬排隊",
      "分享場刊圖與夥伴唯讀視圖",
    ],
    outputs: [
      "可安裝 PWA",
      "場佈／動線／地墊／工作分區／物資清單圖",
      "印刷品同時帶公尺與公釐尺寸",
    ],
    stack: ["Vite", "TypeScript", "Three.js", "PWA", "localStorage / IndexedDB"],
    limitations: [
      "不做容留人數或避難寬度法定計算。",
      "不上架 App Store。",
      "本工具是場前彩排，不是現場指揮系統。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/planform-iso",
      live: "https://planform-iso-k7d2.zeabur.app",
    },
    media: [
      {
        src: "/media/covers/planform.svg",
        alt: "PLANFORM 視覺：等角教室模型、地墊與薄荷色動線",
        kind: "image",
        caption: vis,
      },
      githubExport(
        "planform",
        "e310-overview.png",
        "PLANFORM 公開場刊圖：E310 社課場佈總覽",
        "planform-iso",
        "docs/release-1.0/e310-overview.png",
      ),
      githubExport(
        "planform",
        "phone-editor.png",
        "PLANFORM 公開截圖：手機場佈編輯",
        "planform-iso",
        "docs/release-1.0/phone-editor.png",
      ),
    ],
    sourceReferences: [
      {
        label: "GitHub README · planform-iso",
        href: "https://github.com/aa0968111723-prog/planform-iso",
        note: "產品原則與限制取自公開 README。",
      },
      githubExportEvidence(
        "planform-iso",
        "本站 /media/github-exports/planform 複製自公開 repo docs/release-1.0。不是 Canva 原作，也不是 Drive 私有檔。",
      ),
      {
        label: "公開站 · planform-iso-k7d2.zeabur.app",
        href: "https://planform-iso-k7d2.zeabur.app",
        note: "AGENT_PROTOCOL.md 記載的 Zeabur 正式站。本次探測為 HTML，沒有 frame-bust，可當 Live Demo。狀態會隨部署變動。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "duigao",
    title: "對稿",
    subtitle: "社團活動文宣討論區",
    category: "Interaction",
    year: "2026",
    status: "in-progress",
    featured: true,
    summary:
      "把做好的海報變成一條連結。夥伴不改原稿，只在畫面上指出哪裡要調。海報是主畫面，討論比編輯更快。",
    problem:
      "文宣修改散落在 LINE 群組，對不到位置、對不到版本。需要手機優先、點位置就能說一句話的對稿。",
    role: "互動設計與產品建構：手機工作區、版本切換、邀請權限與分享預覽。",
    decisions: [
      "看稿永遠是乾淨原稿，註記是覆蓋層。",
      "分享連結用 #room + invite 高熵秘密；資料庫只存雜湊。",
      "前端只放 publishable key，不放 service role。",
      "雲端房間建立失敗時直接說暫時無法分享，不退回「看起來成功但其實要主辦方開著頁面」的連結。",
    ],
    modalities: ["圖像", "影片時間點", "註記", "LINE 分享"],
    process: [
      "上傳文宣版本",
      "點位置或圈範圍留意見",
      "待修改／已完成",
      "可選視覺提案層",
      "複製連結傳到 LINE",
    ],
    outputs: [
      "手機與桌機同一套狀態、不同外殼",
      "彩色／黑白／對切比較",
      "Open Graph 分享卡由 Edge Function 組裝，invite 留在瀏覽器 fragment",
    ],
    stack: ["Vite", "React", "TypeScript", "Supabase", "PWA"],
    limitations: [
      "影片單次上傳、無續傳；上限刻意保守。",
      "HEVC 的 .mov 在部分瀏覽器播不出，會說明而不是給黑畫面。",
      "本作品集不會讀取對稿的私人資料表或 token。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/duigao",
      live: "https://duigao-k7q2.zeabur.app",
    },
    media: [
      {
        src: "/media/covers/duigao.svg",
        alt: "對稿視覺：玻璃桌上的海報與薄荷色註記圖釘",
        kind: "image",
        caption: vis,
      },
      githubExport(
        "duigao",
        "desktop-1280-board-20.png",
        "對稿公開截圖：桌面視覺基準板",
        "duigao",
        "scripts/e2e/visual-baselines/desktop-1280-board-20.png",
      ),
      githubExport(
        "duigao",
        "phone-390-board-20.png",
        "對稿公開截圖：手機視覺基準板",
        "duigao",
        "scripts/e2e/visual-baselines/phone-390-board-20.png",
      ),
    ],
    sourceReferences: [
      {
        label: "GitHub README · duigao",
        href: "https://github.com/aa0968111723-prog/duigao",
        note: "權限模型與雲端層取自 README。",
      },
      githubExportEvidence(
        "duigao",
        "本站 /media/github-exports/duigao 複製自公開 repo scripts/e2e/visual-baselines。不是 Canva 原作，也不是私人對稿房間。",
      ),
      {
        label: "公開站 · duigao-k7q2.zeabur.app",
        href: "https://duigao-k7q2.zeabur.app",
        note: "BASELINE.md 記載的 production 站。狀態會隨部署變動。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "folio",
    title: "Folio",
    subtitle: "專精設計編輯器，可內嵌、可給代理操作",
    category: "Creative Tool",
    year: "2026",
    status: "in-progress",
    featured: true,
    summary:
      "畫布、快捷鍵、外部網站橋接、MCP server 與 client 走同一套 typed command layer，沒有第二份文件模型。",
    problem:
      "海報、社群、投影片與 UI 草稿需要專精編輯器，而且要讓代理用同一套指令操作，而不是另做一套自動化 API。",
    role: "創意工具設計：指令層、設計檢查、發布／內嵌與 MCP 安全邊界。",
    decisions: [
      "未安裝 SDK 的跨來源網站只提供 Live iframe 或 Snapshot，不假裝讀 DOM。",
      "MCP 寫入預設 dry-run，未發布文件不會出現在公開 /mcp/$id。",
      "密鑰只留伺服器；SSRF 拒絕內網、本機與 metadata。",
      "本產品預設不開帳號，編輯稿在裝置 IndexedDB。",
    ],
    modalities: ["畫布", "設計 token", "嵌入", "MCP"],
    process: [
      "在畫布建立文字／形狀／元件",
      "設計檢查（對比、溢出、安全區）",
      "可選匯入外部網站三種模式",
      "發布後取得 embed 與 MCP",
    ],
    outputs: [
      "公開儲存庫 canva2（Folio 編輯器）",
      "folio-design-bridge v1 SDK",
      "單元與 golden-path 測試紀錄寫在 README（此處不另報使用量）",
    ],
    stack: ["TypeScript", "MCP", "IndexedDB", "PGLite / Postgres"],
    limitations: [
      "沒有獨立點陣圖片物件型別，圖片以 pixel layer 或 Snapshot 存在。",
      "寫入 token 不會自動過期，需重新發布才輪替。",
      "外部 MCP 連線在單一 Node 行程記憶體，多實例不共享。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/canva2",
    },
    media: [
      {
        src: "/media/covers/folio.svg",
        alt: "Folio 視覺：明亮畫板上的幾何色塊與玻璃屬性面板",
        kind: "image",
        caption: vis,
      },
      githubExport(
        "folio",
        "og.jpg",
        "Folio 公開分享卡：深色桌面與幾何 F 字標",
        "canva2",
        "public/og.jpg",
        "這是 og.jpg 分享卡／字標，不是 Folio 編輯器操作截圖，也不是 Canva 嵌入。canva2 沒有產品操作 PNG。",
      ),
      studioReconstruction(
        "folio-editor.svg",
        "Folio 編輯器光域重建：頂列、工具軌、畫布與檢查器",
        "canva2 src/components/editor/editor-shell.tsx",
        "結構對齊桌面編輯器外殼（回到文件櫃、暫存、預覽、發布、工具軌、畫布、屬性／檢查）。canva2 公開 repo 沒有編輯器操作 PNG。",
      ),
    ],
    sourceReferences: [
      {
        label: "GitHub README · canva2 / Folio",
        href: "https://github.com/aa0968111723-prog/canva2",
        note: "完成功能與限制取自公開 README。",
      },
      githubExportEvidence(
        "canva2",
        "本站 /media/github-exports/folio/og.jpg 複製自公開 repo public/og.jpg。是分享卡／字標，不是編輯器截圖，不是 Canva 原作。",
      ),
      {
        label: "光域重建 · Folio editor-shell",
        href: "https://github.com/aa0968111723-prog/canva2/blob/main/src/components/editor/editor-shell.tsx",
        note: "本站 /media/studio/folio-editor.svg 依公開 editor-shell.tsx 桌面結構重建。不是操作截圖。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "hermes-console",
    title: "Hermes Console",
    subtitle: "明亮的單一創作情報工作區",
    category: "AI Product",
    year: "2026",
    status: "in-progress",
    featured: true,
    summary:
      "打開即可使用，不登入、不輸入電子信箱。Hermes 執行工具；Console 保存會話、任務、活動與文案版本，並可接 Lumen、FrameLab、對稿的 MCP。",
    problem:
      "代理、專案目錄與工具入口分散。需要一個明亮工作區，讓聊天、任務與 MCP 連線待在同一處，且秘密不進瀏覽器。",
    role: "AI 產品與控制台設計：免登入工作區、連線探測、工具入口。",
    decisions: [
      "首頁直接進工作區；寫入仍驗證 Origin 與限流。",
      "未設定 HERMES_API_URL 時仍應開啟，並顯示尚未連線。",
      "GitHub 倉庫網址不是 MCP。連線頁填真實 HTTPS endpoint 與 token 後才探測。",
      "後端拒絕瀏覽器傳入的服務網址或金鑰。",
    ],
    modalities: ["對話", "任務", "MCP 工具"],
    process: [
      "開啟工作區",
      "設定 Hermes 連線（可選）",
      "探測 Lumen / FrameLab / 對稿 MCP",
      "把海報、動畫、對稿意圖交給對應工具",
    ],
    outputs: ["公開儲存庫 hermes-console", "工作區 API 與就緒檢查"],
    stack: ["TypeScript", "Node", "SQLite / Postgres", "MCP"],
    limitations: [
      "需要持久化磁碟與長駐 Node，不適用無狀態 serverless。",
      "契約測試不是第三方服務的實機驗證。",
      "此頁不展示任何金鑰、邀請碼或內部控制台截圖中的秘密。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/hermes-console",
      live: "https://344.zeabur.app",
    },
    media: [
      {
        src: "/media/covers/hermes-console.svg",
        alt: "Hermes Console 視覺：明亮工作區、對話欄與漂浮專案卡片",
        kind: "image",
        caption: vis,
      },
      githubExport(
        "hermes-console",
        "home-desktop.png",
        "Hermes Console 公開截圖：桌面工作區首頁",
        "hermes-console",
        "docs/screenshots/visual-workspace/home-desktop.png",
      ),
      githubExport(
        "hermes-console",
        "canva-unconfigured.png",
        "Hermes Console 公開截圖：Canva 連線未設定",
        "hermes-console",
        "docs/screenshots/visual-workspace/canva-unconfigured.png",
        "畫面本身標未設定；本站也不宣稱 Canva 已連線。",
      ),
    ],
    sourceReferences: [
      {
        label: "GitHub README · hermes-console",
        href: "https://github.com/aa0968111723-prog/hermes-console",
        note: "產品不變量取自 README。",
      },
      githubExportEvidence(
        "hermes-console",
        "本站 /media/github-exports/hermes-console 複製自公開 repo docs/screenshots。含「Canva 未設定」畫面，不宣稱已連線。",
      ),
      {
        label: "公開站 · 344.zeabur.app",
        href: "https://344.zeabur.app",
        note: "FEATURE_AUDIT_EDU.md 記載的正式站。禁止嵌入時只開新分頁。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "tku-zen-ai",
    title: "TKU Zen AI",
    subtitle: "給忙碌心智的本地禪意陪伴",
    category: "Real-world Experience",
    year: "2026",
    status: "prototype",
    featured: true,
    summary:
      "小型對話介面，回覆帶意圖、訊息與呼吸提示。所謂 AI 是本地、可重現的回應引擎，不需要 API key，也不把雲端模型假扮成已接上。",
    problem:
      "校園現場需要一個可立即使用的平靜對話入口，但不能把社團資料或個資送進外部模型。",
    role: "真實場域體驗設計：語氣、呼吸提示與完全本地的回應邊界。",
    decisions: [
      "回應引擎寫在 src/lib/zen.ts，同輸入同輸出。",
      "全程無網路呼叫。",
      "只展示公開產品行為，不放社團名冊或測試帳號。",
    ],
    modalities: ["文字", "呼吸提示"],
    process: ["輸入一句心情", "對應意圖", "回覆訊息與呼吸", "可重測"],
    outputs: ["Next.js 應用與 /api/chat", "單元測試覆蓋回應引擎"],
    stack: ["Next.js", "React", "TypeScript", "Tailwind", "Vitest"],
    limitations: [
      "不是大型語言模型，不會假裝有長期記憶或多輪推理。",
      "與 tku-zen-agent（社團文書代理，私有）不是同一個產品，本頁只展示公開的 tku-zen-ai。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/tku-zen-ai",
    },
    media: [
      {
        src: "/media/covers/tku-zen-ai.svg",
        alt: "TKU Zen AI 視覺：晨光庭園、紙燈與呼吸圓",
        kind: "image",
        caption: vis,
      },
      githubExport(
        "tku-zen-ai",
        "club-illustration.jpg",
        "淡江禪學社公開插畫：女孩與烏龜坐在簷下，掛牌寫著淡江禪學社",
        "urban-green-rose-pixel",
        "attachments/淡江大學 禪學社 (1).png",
        "本站為公開 PNG 的壓縮 JPEG。這是社團插畫，不是 tku-zen-ai 對話截圖，不是 Canva 原作。tku-zen-ai 公開 repo 沒有產品操作畫面。",
      ),
      studioReconstruction(
        "tku-zen-chat.svg",
        "TKU Zen AI 對話光域重建：標題、氣泡、建議句、呼吸提示與輸入列",
        "tku-zen-ai src/app/page.tsx 與 src/lib/zen.ts",
        "結構對齊公開對話頁（歡迎句、左右氣泡、建議句、呼吸提示、送出）。原作是深色介面，這裡是亮色轉譯。tku-zen-ai 沒有對話操作 PNG。",
      ),
    ],
    sourceReferences: [
      {
        label: "GitHub README · tku-zen-ai",
        href: "https://github.com/aa0968111723-prog/tku-zen-ai",
        note: "本地引擎說明取自 README。公開 repo 只有 Next.js 預設 SVG／favicon，沒有產品操作截圖。",
      },
      githubExportEvidence(
        "urban-green-rose-pixel",
        "本站 /media/github-exports/tku-zen-ai/club-illustration.jpg 壓縮自公開 PNG attachments/淡江大學 禪學社 (1).png。是社團插畫，不是對話 UI，不是 Canva 嵌入。",
      ),
      {
        label: "光域重建 · TKU Zen 對話",
        href: "https://github.com/aa0968111723-prog/tku-zen-ai/blob/main/src/app/page.tsx",
        note: "本站 /media/studio/tku-zen-chat.svg 依公開 page.tsx／zen.ts 對話結構重建。亮色轉譯，不是產品截圖。",
      },
    ],
    visibility: "public",
  },
];

export const workCategories: Array<ProjectCategory | "All"> = [
  "All",
  "AI Product",
  "Multimodal",
  "Interaction",
  "Visual AI",
  "Spatial Design",
  "Creative Tool",
  "Real-world Experience",
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function featuredProjects() {
  return projects.filter((p) => p.featured);
}
