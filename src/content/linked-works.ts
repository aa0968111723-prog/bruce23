import type { Project, ProjectMedia } from "./types.ts";

const vis = "工作室視覺轉譯，不是產品截圖。";
const shotNote = "公開站實際畫面。狀態會隨部署變動。";

function cover(file: string, alt: string): ProjectMedia {
  return { src: `/media/covers/${file}`, alt, kind: "image", caption: vis };
}

function shot(file: string, alt: string): ProjectMedia {
  return { src: `/media/shots/${file}`, alt, kind: "image", caption: shotNote };
}

/** Zeabur-linked works beyond the eight featured case studies. */
export const linkedWorks: Project[] = [
  {
    slug: "tamkang-world",
    title: "淡江世界",
    subtitle: "五虎崗上的 3D 校園巡禮",
    category: "Spatial Design",
    year: "2026",
    status: "prototype",
    featured: false,
    summary: "在瀏覽器裡走一趟淡江。樸實剛毅的五虎崗做成可逛的 3D 校園，不是導覽 PDF，也不是 Google Earth 截圖。",
    problem: "新生與訪客對校園空間沒有身體感。需要一個立刻能開的 3D 巡禮，而不是先下載 App。",
    role: "空間體驗設計：場景節奏、校園識別與可立即操作的瀏覽器巡禮。",
    decisions: [
      "公開站標題就是「淡江世界」，一句話講完五虎崗。",
      "公開入口是「校園通行證」：訪客可直接遊覽；Google / X 登入後巡禮蓋章才跟著帳號保存。",
      "部署在 Zeabur 服務 forge-bloom-quiet-falcon。GitHub 倉庫已完全公開開放查閱。",
    ],
    modalities: ["3D", "空間", "互動"],
    process: [
      "打開 forge-bloom-k7xq.zeabur.app（標題「淡江世界」）",
      "公開入口是「校園通行證」：訪客可直接遊覽五虎崗，或使用 Google／X 繼續",
      "點「先以訪客巡禮」回首頁 3D 世界",
    ],
    outputs: ["可逛的 3D 校園公開站"],
    stack: ["WebGL / 3D", "Zeabur"],
    limitations: [
      "效能依裝置而變，不宣稱完整數位雙生。",
      "2026-09-19 GET / HTTP 200，標題「淡江世界」。description「以淡江大學淡水校園真實地標打造的 3D 巡禮世界：克難坡、宮燈大道、海事博物館與覺生紀念圖書館」。og「五虎崗上的 3D 校園巡禮。樸實剛毅。」",
      "GET /login HTTP 200，h1「校園通行證」。訪客可直接遊覽；登入後保存巡禮蓋章。公開 JS 沒有「開始巡禮」「校園圖鑑」「WASD」。作品集未走完訪客 3D 巡禮，coreFlow 未過。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/forge-bloom-quiet-falcon",
      live: "https://forge-bloom-k7xq.zeabur.app",
    },
    media: [
      cover("tamkang-world.jpg", "淡江世界光域靜物：晨光中的玻璃校園模型"),
      shot("tamkang-world.jpg", "淡江世界校園通行證：訪客巡禮與登入保存蓋章"),
    ],
    sourceReferences: [
      {
        label: "公開站 · forge-bloom-k7xq.zeabur.app",
        href: "https://forge-bloom-k7xq.zeabur.app",
        note: "2026-09-19 HTTP 200，標題「淡江世界」。og「五虎崗上的 3D 校園巡禮。樸實剛毅。」/login h1「校園通行證」：訪客可直接遊覽五虎崗，或 Google／X 登入保存巡禮蓋章。公開 JS 沒有「開始巡禮」「校園圖鑑」「WASD」。",
      },
      {
        label: "GitHub · forge-bloom-quiet-falcon",
        href: "https://github.com/aa0968111723-prog/forge-bloom-quiet-falcon",
        note: "公開儲存庫，3D 場景與瀏覽器巡禮原始碼完整公開。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "tamsui-drama",
    title: "淡江新生導覽",
    subtitle: "校園闖關 · 戲劇虛擬世界",
    category: "Real-world Experience",
    year: "2026",
    status: "prototype",
    featured: false,
    summary: "把淡江／淡水寫成可持續開發的劇本、場景與角色。公開站是柏能的校園闖關，不是 FrameLab。",
    problem: "迎新資料是 PDF 與路線圖，身體感不夠。需要一個能闖關、能走進場景的入口。",
    role: "敘事與互動設計：關卡節奏、角色與淡水場景。",
    decisions: [
      "獨立網域 tku-tamsui-drama-world-k4x9，不要跟 FrameLab 的 lunar-falcon 混用。",
      "開場是「安倢的校園闖關」，先玩再講系統。",
    ],
    modalities: ["互動", "敘事", "3D"],
    process: [
      "打開 tku-tamsui-drama-world-k4x9.zeabur.app",
      "標題「淡江新生導覽 — 安倢的校園闖關」",
      "首屏「載入淡江·淡水世界…」",
      "公開 JS 寫走訪宮燈大道、圖書館與驚聲大樓",
    ],
    outputs: ["校園闖關公開站"],
    stack: ["Web", "Zeabur"],
    limitations: [
      "內容會隨學期更新，不宣稱完整學年劇本。",
      "2026-09-19 GET / HTTP 200，標題「淡江新生導覽 — 安倢的校園闖關」。HTML 首屏「載入淡江·淡水世界…」。公開 JS 沒有「第一集」。作品集未走完闖關，coreFlow 未過。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/tku-tamsui-drama-world",
      live: "https://tku-tamsui-drama-world-k4x9.zeabur.app",
    },
    media: [
      cover("tamsui-drama.jpg", "淡江新生導覽光域靜物：宮燈、闖關地圖與玻璃角色"),
      shot("tamsui-drama.jpg", "淡江·淡水虛擬劇本世界：宮燈與闖關地圖"),
    ],
    sourceReferences: [
      {
        label: "公開站 · tku-tamsui-drama-world-k4x9.zeabur.app",
        href: "https://tku-tamsui-drama-world-k4x9.zeabur.app",
        note: "2026-09-19 HTTP 200，標題「淡江新生導覽 — 安倢的校園闖關」。首屏「載入淡江·淡水世界…」。公開 JS 沒有「第一集」。不是 FrameLab。",
      },
      {
        label: "GitHub · tku-tamsui-drama-world",
        href: "https://github.com/aa0968111723-prog/tku-tamsui-drama-world",
        note: "公開儲存庫。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "skatehub",
    title: "直排輪基地 SkateHub",
    subtitle: "走向健康，走向陽光",
    category: "Interaction",
    year: "2026",
    status: "prototype",
    featured: false,
    summary: "直排輪款式與配件圖鑑，管理裝備、記錄滑行里程。公開站是 dd-k3f9，不是 Folio。",
    problem: "裝備散落在聊天室與雲端相簿。需要一個能看款式、記里程的小站。",
    role: "互動產品：圖鑑、裝備與里程紀錄。",
    decisions: [
      "公開站標題寫「走向健康，走向陽光」。",
      "網域是 dd-k3f9，不要跟 canva2（Folio）混用。",
    ],
    modalities: ["圖像", "互動"],
    process: ["打開 dd-k3f9.zeabur.app", "逛裝備圖鑑", "記錄滑行里程", "回來看自己的基地"],
    outputs: ["直排輪基地公開站"],
    stack: ["Web", "Zeabur"],
    limitations: [
      "個人紀錄依部署資料庫，不在此公開他人資料。",
      "2026-09-19 GET / HTTP 200，標題「直排輪基地 SkateHub｜走向健康，走向陽光」。JS 首屏 slogan「收錄市售直排輪款式與配件圖鑑…不要在家玩手機，穿上輪鞋出發吧！」。沒有登入殼。作品集未記錄真實里程，coreFlow 未過。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/dd",
      live: "https://dd-k3f9.zeabur.app",
    },
    media: [
      cover("skatehub.jpg", "直排輪基地光域靜物：白色直排輪與晨光水瓶"),
      shot("skatehub.jpg", "直排輪基地 SkateHub：走向健康走向陽光、裝備圖鑑與里程"),
    ],
    sourceReferences: [
      {
        label: "公開站 · dd-k3f9.zeabur.app",
        href: "https://dd-k3f9.zeabur.app",
        note: "2026-09-19 HTTP 200，標題「直排輪基地 SkateHub｜走向健康，走向陽光」。JS 首屏 slogan 含圖鑑與里程。不是 Folio。",
      },
      {
        label: "GitHub · dd",
        href: "https://github.com/aa0968111723-prog/dd",
        note: "公開儲存庫。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "zen-studio",
    title: "禪學社 Studio",
    subtitle: "社團現場的明亮工作台",
    category: "Creative Tool",
    year: "2026",
    status: "in-progress",
    featured: false,
    summary: "給淡江禪學社用的工作室殼：文宣、場次與日常作業放在同一盞燈下，而不是再開一個雲端硬碟資料夾。",
    problem: "社團文宣、場次與靈感散落。需要一個「今天可以創作什麼」的工作台。",
    role: "社團工具設計：日曆、活動、生成入口與素材庫。",
    decisions: [
      "首頁先問今天可以創作什麼，而不是先給後台選單。",
      "公開站是 delta-horizon-k7f2，GitHub 是 delta-horizon-cliff-fern。",
    ],
    modalities: ["圖像", "文宣", "日曆"],
    process: [
      "打開 delta-horizon-k7f2.zeabur.app",
      "首屏「今天可以創作什麼？」",
      "看近期活動與 AI 建議",
      "到期內容沒有審核人，打開工作室會自動發",
    ],
    outputs: ["禪學社 Studio 公開站"],
    stack: ["Web", "Zeabur"],
    limitations: [
      "連 IG 官方發布需額外授權，未接上時只在工作室內排程。",
      "2026-09-19 GET / HTTP 200，標題「禪學社 Studio」。首屏「今天可以創作什麼？」。頁面寫「沒有審核人。打開工作室會自動發到期內容」。作品集未生成一則貼文，coreFlow 未過。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/delta-horizon-cliff-fern",
      live: "https://delta-horizon-k7f2.zeabur.app",
    },
    media: [cover("zen-studio.jpg", "禪學社 Studio 光域靜物：茶碗、紙條與晨光窗")],
    sourceReferences: [
      {
        label: "公開站 · delta-horizon-k7f2.zeabur.app",
        href: "https://delta-horizon-k7f2.zeabur.app",
        note: "2026-09-19 HTTP 200，標題「禪學社 Studio」。首屏「今天可以創作什麼？」。到期內容寫明沒有審核人、打開會自動發。",
      },
      {
        label: "GitHub · delta-horizon-cliff-fern",
        href: "https://github.com/aa0968111723-prog/delta-horizon-cliff-fern",
        note: "公開儲存庫。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "focus-challenge",
    title: "專注力挑戰賽",
    subtitle: "淡江禪學社現場 60 秒",
    category: "Real-world Experience",
    year: "2026",
    status: "in-progress",
    featured: false,
    summary: "社博現場 60 秒 Stroop：首頁先填關主與基本資料，再兩題教學與 15 秒練習（不登記），再正式 60 秒。這是現場遊戲，不是心理測驗，也不是活動狀態儀表板。",
    problem: "攤位需要能立刻玩的 60 秒遊戲。正式賽仍要先填關主、姓名、科系、年級、電話，不是「完全不填表就能開打」。",
    role: "現場體驗設計：登記、教學、計時、成績寫入與公開排行榜。",
    decisions: [
      "公開站標題寫「淡江大學禪學社｜專注力挑戰賽」。首頁是登記畫面，不是立刻開打。",
      "GitHub 是 ty；Zeabur 服務 leader-dna-sheet-sync。",
      "試玩與 15 秒練習不登記、不抽獎。公開排行榜不是得獎公告。作品集不送出姓名或電話。",
    ],
    modalities: ["互動", "現場"],
    process: [
      "打開 leader-dna-mcp-a7k2.zeabur.app（首頁是登記畫面）",
      "填關主、姓名、科系、年級、電話後才進入教學（作品集不送出）",
      "兩題新手教學與 15 秒練習（不計分、不登記）",
      "開始 60 秒正式 Stroop（會 POST /api/register 與 /api/result）",
      "看分數與公開排行榜（遮罩姓名）",
    ],
    outputs: ["現場挑戰公開站", "公開排行榜（遮罩姓名）"],
    stack: ["Web", "Google Sheets", "Zeabur"],
    limitations: [
      "2026-09-19 GET /api/health 回 ok，sheets true，smtp false。",
      "GET /api/leaderboard?scope=history 回 67 筆公開列：遮罩姓名、分數、正確率、稱號、時間。不含電話或完整姓名。今日 scope 為 0 筆。",
      "正式 60 秒需先填表並寫入遊戲分頁。作品集未送出個資，也未完成一次正式 60 秒黑箱操作，coreFlow 未過。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/ty",
      live: "https://leader-dna-mcp-a7k2.zeabur.app",
    },
    media: [cover("focus-challenge.jpg", "專注力挑戰光域靜物：計時器與攤位平板")],
    sourceReferences: [
      {
        label: "公開站 · leader-dna-mcp-a7k2.zeabur.app",
        href: "https://leader-dna-mcp-a7k2.zeabur.app",
        note: "Zeabur 服務 leader-dna-sheet-sync。2026-09-19 HTTP 200，標題「淡江大學禪學社｜專注力挑戰賽」。/api/health ok。公開排行榜 history 67 筆遮罩姓名，今日 0 筆。首頁是登記畫面。",
      },
      {
        label: "GitHub · ty",
        href: "https://github.com/aa0968111723-prog/ty",
        note: "公開儲存庫。PRODUCT_CONTRACT.md 寫現場 60 秒挑戰。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "lumen",
    title: "Lumen",
    subtitle: "口袋裡的多模態語音創作球",
    category: "AI Product",
    year: "2026",
    status: "prototype",
    featured: false,
    summary: "說話就能設計、搜尋、生成，手指直接整理。公開站是 ai-chat-8rq3，GitHub 是 wood-ivory-blaze-maple。",
    problem: "創作入口太散。需要一個按住說話就能開始的球。",
    role: "語音介面與多模態入口設計。",
    decisions: [
      "首頁只有「想做什麼？」與按住說話，不做控制台。",
      "公開站 ai-chat-8rq3；GitHub wood-ivory-blaze-maple。",
    ],
    modalities: ["語音", "圖像", "影片"],
    process: [
      "打開 ai-chat-8rq3.zeabur.app",
      "點一下開始聽，或按住說話",
      "選做海報／拍照／開始做影片／長任務",
      "從最近專案繼續",
    ],
    outputs: ["Lumen 公開站"],
    stack: ["TanStack Start", "Postgres", "Zeabur"],
    limitations: [
      "雲端模型依金鑰；沒有金鑰時應誠實降級，不假裝已生成。",
      "2026-09-19 GET / HTTP 200，標題 Lumen。首屏「想做什麼？」「點一下開始聽 · 按住說話」。作品集未按住說話，coreFlow 未過。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/wood-ivory-blaze-maple",
      live: "https://ai-chat-8rq3.zeabur.app",
    },
    media: [cover("lumen.jpg", "Lumen 光域靜物：玻璃桌上的語音光球")],
    sourceReferences: [
      {
        label: "公開站 · ai-chat-8rq3.zeabur.app",
        href: "https://ai-chat-8rq3.zeabur.app",
        note: "2026-09-19 HTTP 200，標題 Lumen。首屏「想做什麼？」「點一下開始聽 · 按住說話」。不是 Hermes。",
      },
      {
        label: "GitHub · wood-ivory-blaze-maple",
        href: "https://github.com/aa0968111723-prog/wood-ivory-blaze-maple",
        note: "公開儲存庫。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "xiaocai",
    title: "小財記帳",
    subtitle: "個人收支的明亮小帳本",
    category: "Interaction",
    year: "2026",
    status: "prototype",
    featured: false,
    summary: "記一筆、看分類、知道這個月花到哪。公開站 untitled-5.zeabur.app。不是作品集後台。",
    problem: "個人收支不需要完整會計系統，需要一個開得起的小帳本。",
    role: "個人工具：記帳、分類、月覽。",
    decisions: ["公開站 untitled-5；GitHub 倉庫名是 -1。"],
    modalities: ["互動", "數字"],
    process: [
      "打開 untitled-5.zeabur.app",
      "首屏是「點我一下，快速記一筆吧」",
      "沒有網路也能記，資料先存在裝置",
      "登入後才與帳號同步",
    ],
    outputs: ["小財記帳公開站"],
    stack: ["Web", "Zeabur"],
    limitations: [
      "公開站 HTTP 200、標題「小財記帳」。",
      "2026-09-20 JS 首屏「點我一下，快速記一筆吧」。離線可記；登入後同步。作品集未記一筆真實收支，coreFlow 未過。",
      "不是作品集後台。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/-1",
      live: "https://untitled-5.zeabur.app",
    },
    media: [cover("xiaocai.jpg", "小財記帳光域靜物：玻璃帳本與硬幣")],
    sourceReferences: [
      {
        label: "公開站 · untitled-5.zeabur.app",
        href: "https://untitled-5.zeabur.app",
        note: "2026-09-20 HTTP 200，標題「小財記帳」。JS 首屏「點我一下，快速記一筆吧」。離線可記。不是 502，也不是 Folio。",
      },
      {
        label: "GitHub · -1",
        href: "https://github.com/aa0968111723-prog/-1",
        note: "公開儲存庫。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "tku-zen-agent",
    title: "禪學社工作台",
    subtitle: "淡江大學領袖禪學社 · Ask 模式",
    category: "Real-world Experience",
    year: "2026",
    status: "in-progress",
    featured: false,
    summary:
      "社團文書與現場問答的工作台。公開站 tku-zen-agent-k7f2，預設可帶 ?mode=ask。與本站展示的本地 tku-zen-ai 不是同一個產品。",
    problem: "社團文書、問答與現場需要一個代理工作台，不能跟本地禪意陪伴混成同一個產品。",
    role: "社團代理介面：Ask 模式與文書入口。",
    decisions: [
      "公開操作建議帶 ?mode=ask。",
      "與 tku-zen-ai（本地引擎）分開寫，避免假裝已接上雲端模型。",
      "未輸入授權碼時只看得到工作台殼與授權邊界，不假裝已進入社團資料。",
    ],
    modalities: ["對話", "文書"],
    process: [
      "打開 tku-zen-agent-k7f2.zeabur.app/?mode=ask",
      "未授權時會看到「請輸入授權碼 進入工作台」",
      "草稿模式不會自動發布",
      "不要把產出當成已審核公告",
    ],
    outputs: ["禪學社工作台公開站"],
    stack: ["Web", "Zeabur"],
    limitations: [
      "2026-09-19 探測 HTTP 200，標題「淡江大學領袖禪學社 · 工作台」。不是 502。",
      "進入工作台需要授權碼。作品集訪客看不到社團資料。",
      "與本地 tku-zen-ai 不是同一個產品。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/tku-zen-agent",
      live: "https://tku-zen-agent-k7f2.zeabur.app/?mode=ask",
    },
    media: [cover("tku-zen-agent.jpg", "禪學社工作台光域靜物：玻璃控制台與蓮花")],
    sourceReferences: [
      {
        label: "公開站 · tku-zen-agent-k7f2.zeabur.app",
        href: "https://tku-zen-agent-k7f2.zeabur.app/?mode=ask",
        note: "2026-09-19 探測 HTTP 200。標題「淡江大學領袖禪學社 · 工作台」。未授權會看到授權碼入口。不是 502。建議 ?mode=ask。",
      },
      {
        label: "GitHub · tku-zen-agent",
        href: "https://github.com/aa0968111723-prog/tku-zen-agent",
        note: "公開儲存庫。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "cutos",
    title: "CUTOS",
    subtitle: "用對話剪影片",
    category: "Multimodal",
    year: "2026",
    status: "prototype",
    featured: false,
    summary: "Conversational Video Editor：用句子找精華、看時間軸、產出剪輯計畫。公開站 cutos.zeabur.app，與 AI Director 同專案叢集。",
    problem: "粗剪仍要自己拖時間軸。需要先用句子找出精華。",
    role: "剪輯入口設計：對話、時間軸、計畫。",
    decisions: ["與 AI Director OS 同 Zeabur 專案叢集，但產品頁分開。"],
    modalities: ["影片", "對話", "時間軸"],
    process: [
      "打開 cutos.zeabur.app",
      "匯入一支影片",
      "用一句話描述要剪的意圖",
      "檢查 Edit Plan 後套用非破壞時間軸",
    ],
    outputs: ["CUTOS 公開站"],
    stack: ["Next.js", "FFmpeg", "SQLite", "Zeabur"],
    limitations: [
      "2026-09-19 GET / 標題 CUTOS — Conversational Video Editor。/api/health ok，/api/ready ready。不是 502。",
      "作品集尚未匯入真實影片跑完 import→plan→export，coreFlow 未過。",
    ],
    links: {
      github: "https://github.com/aa0968111723-prog/CUTOS",
      live: "https://cutos.zeabur.app",
    },
    media: [cover("cutos.jpg", "CUTOS 光域靜物：漂浮的影片格與光之剪刀")],
    sourceReferences: [
      {
        label: "公開站 · cutos.zeabur.app",
        href: "https://cutos.zeabur.app",
        note: "Zeabur 服務 cutos。2026-09-19 HTTP 200，標題 CUTOS — Conversational Video Editor。/api/health ok，/api/ready ready。不是 502。",
      },
      {
        label: "GitHub · CUTOS",
        href: "https://github.com/aa0968111723-prog/CUTOS",
        note: "公開儲存庫。",
      },
    ],
    visibility: "public",
  },
  {
    slug: "hermes-agent",
    title: "Hermes Agent - Dashboard",
    subtitle: "代理儀表板（需登入）",
    category: "AI Product",
    year: "2026",
    status: "in-progress",
    featured: false,
    summary:
      "Nous Research Hermes Agent 的 Dashboard：會話與登入入口。公開網域 hermes-agent-k7q2.zeabur.app。未登入會到 Sign in — Hermes Agent。",
    problem: "Console 是工作區；真正跑工具的是 Agent Dashboard。兩者要分開講，避免把控制台當成大腦。",
    role: "AI 產品架構：執行層與控制台分層。",
    decisions: [
      "公開站是 Zeabur 服務 hermes-agent（Dashboard），不是本作品集的原始碼。",
      "本頁不展示 API key、Dashboard 密碼或 GitHub PAT。",
      "未登入只看得到 Sign in，不假裝已經進入 Dashboard。",
    ],
    modalities: ["對話", "任務", "MCP 工具"],
    process: [
      "打開 hermes-agent-k7q2.zeabur.app（未登入轉到 /login）",
      "標題「Sign in — Hermes Agent」；h1 Sign in；Username & Password",
      "登入（擁有者）後才進 Dashboard",
      "作品集不送出帳密，看不到 sessions",
    ],
    outputs: ["公開網域 hermes-agent-k7q2.zeabur.app（Dashboard）"],
    stack: ["Hermes Agent", "Docker", "Zeabur"],
    limitations: [
      "需要登入。作品集訪客看不到 Dashboard 內容。",
      "2026-09-20 GET / 轉到 /login?next=/，HTTP 200，標題「Sign in — Hermes Agent」。h1 Sign in。Username & Password。作品集未登入，coreFlow 未過。",
    ],
    links: {
      live: "https://hermes-agent-k7q2.zeabur.app/",
    },
    media: [
      cover("hermes-agent.jpg", "Hermes Agent Dashboard 光域靜物：玻璃終端與鑰匙卡"),
      shot("hermes-agent.jpg", "Hermes Agent Dashboard 公開站未登入：Sign in — Hermes Agent"),
    ],
    sourceReferences: [
      {
        label: "Dashboard · hermes-agent-k7q2.zeabur.app",
        href: "https://hermes-agent-k7q2.zeabur.app/",
        note: "2026-09-20 GET / 轉到 /login?next=/，HTTP 200，標題「Sign in — Hermes Agent」。h1 Sign in。Username & Password。不是 344 Console，也不是 455 舊站。作品集未登入。",
      },
    ],
    visibility: "public",
  },
];
