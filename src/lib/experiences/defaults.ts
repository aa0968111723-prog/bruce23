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
      intro: "作品集示範時間軸，概念對齊 FrameLab 的 sample-ball / timeline-engine。",
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
      intro: "等角場佈示意：旋轉、拖動物件、看用途與尺寸。",
      spatial: {
        objects: DEFAULT_SPATIAL,
        circulationNote: "薄荷色曲線是示意動線，不是法定避難寬度。",
        complianceDisclaimer: "這是作品集空間預覽，不做容留或消防法規符合計算。",
        tiltDefault: 18,
      },
    };
  }

  if (slug === "duigao") {
    return {
      ...base,
      intro: "作品集對稿示意：點位置留言、切版本、比較。",
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
      intro: "來源對齊 tku-zen-ai 的 src/lib/zen.ts。全程無網路呼叫。",
      conversation: {
        engine: "zen-local",
        disclaimer: "這是本地回應引擎，不是雲端 LLM。同一句話會得到同一組回覆。",
        starter: "這是本地回應引擎，不是雲端 LLM。同一句話會得到同一組回覆。",
        placeholder: "輸入一句心情",
        sourceNote: "來源對齊 tku-zen-ai 的 src/lib/zen.ts。全程無網路呼叫。",
      },
    };
  }

  if (slug === "hermes-console") {
    return {
      ...base,
      intro: "未連線。任何回覆都是本地說明，不是 Agent 執行結果。",
      conversation: {
        engine: "hermes-preview",
        disclaimer: "這是作品集互動展示，沒有連到 Hermes 執行期。",
        starter: "這是作品集互動展示，沒有連到 Hermes 執行期。輸入關鍵詞看說明。",
        placeholder: "輸入一句話",
        sourceNote: "未連線。任何回覆都是本地說明，不是 Agent 執行結果。",
        replies: [
          {
            match: "海報",
            reply: "這會是對稿或 Poster Vision 的事。Hermes Console 若連上 MCP，才會把意圖交給工具。這裡沒有連線。",
          },
          {
            match: "連線",
            reply: "未設定 HERMES_API_URL 時，工作區仍應開啟，並顯示尚未連線。GitHub 網址不是 MCP。",
          },
          {
            match: "任務",
            reply: "Console 保存會話與任務版本；秘密不進瀏覽器。本頁是作品集對話預覽。",
          },
        ],
      },
    };
  }

  if (slug === "folio") {
    return {
      ...base,
      intro: "依公開 canva2／Folio 指令層走一遍。不是站內 Canva 編輯器。",
    };
  }

  if (slug === "ai-director-os") {
    return {
      ...base,
      intro: "這是作品集互動展示，把公開 repo 的流程串成可點的節點。不是線上產品控制台。",
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
    processNodes: coalesceList(current.processNodes, fallback.processNodes),
    walkthrough: coalesceList(current.walkthrough, fallback.walkthrough),
    fileHints: coalesceList(current.fileHints, fallback.fileHints),
    canvaPageLabels: current.canvaPageLabels ?? fallback.canvaPageLabels,
    timeline: mergeObject(fallback.timeline, current.timeline, ["frames"]),
    spatial: mergeObject(fallback.spatial, current.spatial, ["objects"]),
    comparison: mergeObject(fallback.comparison, current.comparison, ["versions", "seedPins"]),
    conversation: mergeObject(fallback.conversation, current.conversation, ["replies"]),
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
