import type { ExperienceConfig } from "../cms/schema.ts";
import { experienceCatalog } from "./catalog.ts";

export const PORTFOLIO_DEMO = "作品集互動展示";

/** Canonical Chinese defaults. English overlays live in `src/lib/locale/experience.ts`. */
export const DEFAULT_EXPERIENCE_NOTES = {
  githubIntro: "檔案樹來自伺服器同步的公開 GitHub 中繼資料。沒有讀到的路徑不會虛構。",
  canvaNote:
    "目前是公開嵌入模式。沒有公開 /design/{id} 或伺服器可轉址的 /d/ 短網址就不會嵌入空白 iframe。短網址成功轉到設計後才嵌入，不會標成已驗證，也不會宣稱 Connect 已連線。",
  demoNote: "沒有已驗證的公開 Demo 時，不會放假的產品畫面。",
  galleryNote:
    "只顯示已發布媒體。標成 GitHub 匯出的是公開 repo 檔的複本；工作室 SVG 是轉譯。沒有公開 Canva /design/{id} 就不嵌入。",
} as const;

const DEFAULT_FRAMES: NonNullable<ExperienceConfig["timeline"]>["frames"] = [
  { i: 0, kind: "key", x: 24, y: 110 },
  { i: 1, kind: "breakdown", x: 52, y: 78 },
  { i: 2, kind: "generated", x: 80, y: 54 },
  { i: 3, kind: "generated", x: 108, y: 42 },
  { i: 4, kind: "key", x: 136, y: 48 },
  { i: 5, kind: "generated", x: 164, y: 70 },
  { i: 6, kind: "breakdown", x: 192, y: 102, problem: true },
  { i: 7, kind: "generated", x: 220, y: 128 },
  { i: 8, kind: "key", x: 248, y: 138 },
];

const DEFAULT_SPATIAL: NonNullable<ExperienceConfig["spatial"]>["objects"] = [
  { id: "desk", label: "報到桌", use: "報到／資料", size: "180×60 cm", x: 18, y: 42 },
  { id: "mats", label: "地墊區", use: "席地而坐", size: "360×360 cm", x: 48, y: 38 },
  { id: "path", label: "走道", use: "進出動線", size: "90 cm 寬（示意）", x: 78, y: 55 },
  { id: "poster", label: "海報架", use: "文宣展示", size: "60×160 cm", x: 32, y: 22 },
  { id: "power", label: "電源點", use: "設備用電", size: "示意點位", x: 64, y: 68 },
];

export function defaultExperienceConfig(slug: string): ExperienceConfig {
  const catalog = experienceCatalog[slug];
  const base: ExperienceConfig = {
    honestyLabel: catalog?.honestyLabel ?? PORTFOLIO_DEMO,
    intro: undefined,
    processNodes: catalog?.processNodes ?? [],
    walkthrough: catalog?.walkthrough ?? [],
    fileHints: catalog?.fileHints ?? [],
    githubIntro: DEFAULT_EXPERIENCE_NOTES.githubIntro,
    canvaNote: DEFAULT_EXPERIENCE_NOTES.canvaNote,
    demoNote: DEFAULT_EXPERIENCE_NOTES.demoNote,
    galleryNote: DEFAULT_EXPERIENCE_NOTES.galleryNote,
  };

  if (slug === "framelab") {
    return {
      ...base,
      intro: "公開站首屏是登陸頁「給它關鍵影格。只修壞掉的那幾格。」進入工作室要登入。這裡是作品集示範時間軸，不是線上工作室。",
      timeline: {
        frames: DEFAULT_FRAMES,
        onionDefault: true,
        compareDefault: false,
        demoDisclaimer: "標成「示範」的畫面不是 GPU 模型輸出。真實 Wan / RIFE / SAM 適配器未載入。",
      },
    };
  }

  if (slug === "planform") {
    return {
      ...base,
      intro: "公開站首屏是「我的專案」與「＋ 新建專案」。這裡是作品集場佈示意，不是線上專案，也不假裝已經拖過物件。",
      spatial: {
        objects: DEFAULT_SPATIAL,
        circulationNote: "薄荷色曲線是示意動線，不是法定避難寬度。",
        complianceDisclaimer: "這是作品集空間預覽，不做容留或消防法規符合計算。",
        tiltDefault: 18,
      },
    };
  }

  if (slug === "tamsui-drama") {
    return {
      ...base,
      intro: "公開站首屏是「載入淡江·淡水世界…」，標題「安倢的校園闖關」。這是作品集走查，不是闖關本體。",
    };
  }

  if (slug === "tamkang-world") {
    return {
      ...base,
      intro: "公開站 `/` 標題「淡江世界」。首屏 3D 世界有「開始巡禮」「校園圖鑑」「登入」。校園通行證在 /login。這是作品集走查，不是 3D 校園本體。",
    };
  }

  if (slug === "zen-studio") {
    return {
      ...base,
      intro: "公開站首屏是「今天可以創作什麼？」。到期內容沒有審核人、打開會自動發。這是作品集走查，不是 IG 後台。",
    };
  }

  if (slug === "skatehub") {
    return {
      ...base,
      intro: "公開站首屏 slogan 要人穿上輪鞋出發、記錄里程。這是作品集走查，不是線上基地。",
    };
  }

  if (slug === "duigao") {
    return {
      ...base,
      intro: "公開站首屏是「今天要對什麼？」；可選做一張圖或建立活動房。這裡是作品集對稿示意，不是真實房間。",
      comparison: {
        variant: "annotate",
        versions: [
          { id: "v1", label: "v1 彩色", filter: "none" },
          { id: "v2", label: "v2 對比", filter: "contrast(1.15) saturate(1.1)" },
          { id: "bw", label: "黑白", filter: "grayscale(1)" },
        ],
        seedPins: [{ id: "p1", x: 32, y: 28, note: "主標再大一點" }],
        prompt: "這位置要改什麼？",
      },
    };
  }

  if (slug === "poster-vision-ai") {
    return {
      ...base,
      intro: "上傳或使用樣本海報。面積、對比、文字帶是本機像素運算。",
      comparison: {
        variant: "poster-analysis",
        sampleSrc: "/media/github-exports/poster-vision-ai/demo-event.png",
        estimateDisclaimer: "熱圖與區域是像素對比推估，不是眼動追蹤。",
      },
    };
  }

  if (slug === "tku-zen-ai") {
    return {
      ...base,
      intro: "公開對話頁首屏是英文歡迎句「Welcome to TKU Zen AI. Take a breath, and share whatever is on your mind.」。這裡跑同一套本地引擎，不是雲端 LLM。",
      conversation: {
        engine: "zen-local",
        disclaimer: "這是本地回應引擎，不是雲端 LLM。同一句話會得到同一組回覆。",
        starter: "Welcome to TKU Zen AI. Take a breath, and share whatever is on your mind.",
        placeholder: "Share what's on your mind…",
        sourceNote: "來源對齊公開 src/app/page.tsx 與 src/lib/zen.ts。全程無網路呼叫。沒有 Zeabur 公開站。",
        suggestions: [
          "I feel stressed about my exams",
          "Help me focus",
          "I can't sleep",
          "Thank you",
        ],
      },
    };
  }

  if (slug === "hermes-console") {
    return {
      ...base,
      intro: "公開站首屏是「今天想做什麼？」與快速開始（研究／創作／分析）。這裡是作品集本地說明，不是 Agent 執行結果。",
      conversation: {
        engine: "hermes-preview",
        disclaimer: "這是作品集互動展示，沒有連到 Hermes 執行期。",
        starter: "公開站首屏是「今天想做什麼？」。快速開始是研究、創作、分析。這裡不會假裝已經送出任務。",
        placeholder: "輸入研究、創作、分析",
        sourceNote: "未連線。任何回覆都是本地說明，不是 Agent 執行結果。",
        suggestions: ["研究", "創作", "分析"],
        replies: [
          {
            match: "研究",
            reply: "公開站快速開始「研究」會填「幫我找網宣靈感。」。作品集這一頁沒有連到 Agent，不會真的去找。",
          },
          {
            match: "創作",
            reply: "公開站「創作」會填「幫我做一張網宣海報。」。這裡不會生成海報。",
          },
          {
            match: "分析",
            reply: "公開站「分析」會填「請分析這張文宣。」。這裡沒有文宣，也不會假裝已分析畫面。",
          },
        ],
      },
    };
  }

  if (slug === "lumen") {
    return {
      ...base,
      intro: "公開站首屏是「想做什麼？」。這是作品集說明，沒有接上麥克風，也不是 Hermes。",
      conversation: {
        engine: "hermes-preview",
        disclaimer: "這是作品集預覽，不是 Lumen 語音執行期，也不是 Hermes Agent。",
        starter: "公開站是「想做什麼？ 點一下開始聽 · 按住說話」。這裡不會假裝已經在聽。",
        placeholder: "輸入做海報、拍照、做影片",
        sourceNote: "作品集沒有接麥克風。雲端模型依金鑰；沒有金鑰應誠實降級。",
        suggestions: ["做海報", "拍照", "做影片"],
        replies: [
          {
            match: "海報",
            reply: "公開站有「做海報」入口。作品集這一頁沒有生成海報。",
          },
          {
            match: "拍照",
            reply: "公開站有「拍照開始」。這裡沒有相機權限。",
          },
          {
            match: "影片",
            reply: "公開站有「開始做影片」。未生成的結果不會假裝完成。",
          },
        ],
      },
    };
  }

  if (slug === "folio") {
    return {
      ...base,
      intro: "公開站首屏是「文件櫃」。存在這台裝置，不必登入。這裡是作品集走查，不是線上編輯器。",
    };
  }

  if (slug === "xiaocai") {
    return {
      ...base,
      intro: "公開站是小財記帳 untitled-5。這是作品集說明，不是 Folio 編輯器，也不是作品集後台。",
      galleryNote: "公開站首屏「點我一下，快速記一筆吧」。這是作品集媒體廊，不是記帳本體。",
    };
  }

  if (slug === "tku-zen-agent") {
    return {
      ...base,
      intro: "公開站未授權首屏是授權門：h1「淡江大學領袖禪學社」、請輸入授權碼、進入工作台。不是工作台聊天。",
      conversation: {
        engine: "hermes-preview",
        disclaimer: "這是作品集預覽，沒有連到社團資料庫，也不是 Hermes Agent。",
        starter: "公開站未授權只看得到 h1「淡江大學領袖禪學社」與「請輸入授權碼」「進入工作台」。這裡不會假裝已經進入，也不展示社團文件樹。",
        placeholder: "輸入授權碼、草稿、來源",
        sourceNote: "與本站 tku-zen-ai 本地陪伴不是同一個產品。來源連結暫不公開，也不複製來源文件。",
        suggestions: ["授權碼", "草稿", "來源"],
        replies: [
          {
            match: "授權",
            reply: "GET /api/auth 是 token 模式且未登入。作品集不會幫你送授權碼，也不會讀社團資料。",
          },
          {
            match: "草稿",
            reply: "授權後的草稿列寫「目前為草稿模式——不會自動發布任何內容」。那不是訪客首屏。",
          },
          {
            match: "來源",
            reply: "來源儲存庫的可見性與自身隱私規則衝突。完成擁有者審查前，作品集不提供原始碼連結，也不複製或展示檔案樹。",
          },
        ],
      },
    };
  }

  if (slug === "hermes-agent") {
    return {
      ...base,
      intro: "公開站 hermes-agent-k7q2 未登入會轉到 /login。標題「Sign in — Hermes Agent」。這是作品集說明，不是 Dashboard 執行期。",
      conversation: {
        engine: "hermes-preview",
        disclaimer: "這是作品集預覽，沒有連到 Hermes Agent 執行期，也不是免登入 Console。",
        starter: "公開站首屏是「Sign in — Hermes Agent」。選帳密登入才能進 Dashboard。這裡不會假裝已經登入。",
        placeholder: "輸入登入、Dashboard、Console",
        sourceNote: "作品集訪客只能看到登入頁。455.zeabur.app 是舊站，不要再開。",
        suggestions: ["登入", "Dashboard", "Console"],
        replies: [
          {
            match: "登入",
            reply: "公開站轉到 /login，標題「Sign in — Hermes Agent」。帳密登入。作品集這一頁不會幫你登入。",
          },
          {
            match: "Dashboard",
            reply: "登入後才是 Dashboard。訪客看不到會話內容。",
          },
          {
            match: "Console",
            reply: "免登入工作區是 344 的 Hermes Console，不是這個 Dashboard。",
          },
        ],
      },
    };
  }

  if (slug === "ai-director-os") {
    return {
      ...base,
      intro: "公開站首屏是登陸頁「把想法，變成團隊真正能完成的計畫」。進入工作台要登入。這裡是 GitHub 流程節點，不是線上控制台。",
    };
  }

  if (slug === "cutos") {
    return {
      ...base,
      intro: "公開站首屏是「AI 對話式影片剪輯」與「匯入影片」。可載入示範影片或上傳。這裡是作品集走查，不是線上剪輯器。",
    };
  }

  if (slug === "focus-challenge") {
    return {
      ...base,
      intro: "公開站攤位首屏有「60 秒」「看指令選顏色」「現場手搖杯」，入口「正式參賽」與「怎麼玩」。表單是關主、本名、科系、年級、電話；正式按鈕「開始練習」。這是作品集走查，不是現場 60 秒。",
    };
  }

  return base;
}

const STALE_POSTER_SAMPLE = "/media/samples/poster.svg";
const POSTER_SAMPLE = "/media/github-exports/poster-vision-ai/demo-event.png";

function isEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length === 0;
}

function coalesceList<T>(current: T[] | undefined, fallback: T[] | undefined): T[] | undefined {
  if (current == null || current.length === 0) return fallback;
  return current;
}

function unionByKey<T>(
  current: T[] | undefined,
  fallback: T[] | undefined,
  keyOf: (item: T) => string,
): T[] | undefined {
  if (fallback == null || fallback.length === 0) return coalesceList(current, fallback);
  if (current == null || current.length === 0) return fallback;
  const currentMap = new Map<string, T>();
  const extras: T[] = [];
  for (const item of current) {
    const key = keyOf(item);
    if (!key) {
      extras.push(item);
      continue;
    }
    if (!currentMap.has(key)) currentMap.set(key, item);
  }
  const out: T[] = [];
  const seen = new Set<string>();
  for (const item of fallback) {
    const key = keyOf(item);
    if (!key) continue;
    out.push(currentMap.get(key) ?? item);
    seen.add(key);
  }
  for (const [key, item] of currentMap) {
    if (!seen.has(key)) out.push(item);
  }
  return extras.length ? [...out, ...extras] : out;
}

function mergeObject<T extends object>(
  fallback: T | undefined,
  current: T | undefined,
  arrayKeys: (keyof T)[],
): T | undefined {
  if (current == null) return fallback;
  if (fallback == null) return current;
  const next = { ...fallback, ...current };
  for (const key of arrayKeys) {
    const value = current[key];
    if (value === undefined || isEmptyArray(value)) next[key] = fallback[key];
  }
  return next;
}

export function mergeExperienceConfig(slug: string, stored: ExperienceConfig | null | undefined): ExperienceConfig {
  const fallback = defaultExperienceConfig(slug);
  const current = stored ?? {};
  const merged: ExperienceConfig = {
    ...fallback,
    ...current,
    processNodes: unionByKey(current.processNodes, fallback.processNodes, (item) => item.id),
    walkthrough: unionByKey(current.walkthrough, fallback.walkthrough, (item) => item.path || item.title),
    fileHints: unionByKey(current.fileHints, fallback.fileHints, (item) => item.path),
    canvaPageLabels: current.canvaPageLabels ?? fallback.canvaPageLabels,
    timeline: mergeObject(fallback.timeline, current.timeline, ["frames"]),
    spatial: mergeObject(fallback.spatial, current.spatial, ["objects"]),
    comparison: mergeObject(fallback.comparison, current.comparison, ["versions", "seedPins"]),
    conversation: mergeObject(fallback.conversation, current.conversation, ["replies", "suggestions"]),
    // Saved EN overlays stay as stored. Do not fill locale.en from the dictionary.
    locale: current.locale,
  };
  if (
    slug === "poster-vision-ai" &&
    merged.comparison &&
    (!merged.comparison.sampleSrc || merged.comparison.sampleSrc === STALE_POSTER_SAMPLE)
  ) {
    merged.comparison = { ...merged.comparison, sampleSrc: POSTER_SAMPLE };
  }
  return merged;
}
