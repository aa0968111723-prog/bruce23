import type { ExperienceConfig, ExperienceLocaleOverlay } from "../cms/schema.ts";
import { DEFAULT_EXPERIENCE_NOTES, PORTFOLIO_DEMO } from "../experiences/defaults.ts";
import type { ViewerLang } from "./view.ts";

export function fillChrome(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

/** Join chrome sentences so EN does not jam `console.Left`. */
export function joinSentences(...parts: Array<string | undefined | null>): string {
  return parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ");
}

/** Label/value chrome: ASCII colon in en, fullwidth in zh. */
export function labeledLine(lang: ViewerLang, label: string, value: string): string {
  return lang === "en" ? `${label}: ${value}` : `${label}：${value}`;
}

export function wrapPathNote(lang: ViewerLang, line: string, path?: string): string {
  if (!path) return line;
  return lang === "en" ? `${line} (${path})` : `${line}（${path}）`;
}

export const experienceChrome = {
  zh: {
    tabPlay: "立即體驗",
    tabVisual: "視覺展示",
    tabGithub: "GitHub 專案",
    tabCanva: "Canva 原作",
    tabHow: "如何運作",
    tabSource: "技術來源",
    tabsAria: "作品體驗",
    closeExperience: "關閉體驗",
    emptyMedia: "這件作品還沒有已發布的媒體。不會放空白畫面。",
    emptySource: "尚未登錄技術來源。公開 GitHub 仍可在「GitHub 專案」分頁打開。",
    canvaEmptyNote:
      "這件作品還沒有公開的 Canva 分享或嵌入網址。目前是公開嵌入模式，沒有 Canva Connect 憑證，不會顯示空白 iframe，也不會假裝已連上 Canva API。後台可貼 canva.com/design 或 /d/ 短網址；短網址由伺服器跟隨轉址後才嵌入。",
    unavailableTitle: "Canva 原作目前無法公開嵌入",
    noShareTitle: "Canva 原作沒有公開分享連結",
    unavailableBody: "可能需要登入、權限不是公開分享，或短網址沒有轉到 /design/{id}。站內只放縮圖，不嵌入空白 iframe。",
    noShareBody: "站內只放已匯出的縮圖。沒有 canva.com 分享／嵌入網址，所以不嵌入空白 iframe。",
    openOriginal: "在 Canva 開啟原作",
    sourcePublicEmbed: "來源標記：公開嵌入模式 · 狀態 {status} · 未宣稱 Connect 已連線",
    sourceCanvaEmbed: "來源標記：Canva 公開嵌入 · 狀態 {status} · 未宣稱 Connect 已連線",
    pendingTitle: "Canva 短網址還沒有公開設計可嵌入",
    embedFailTitle: "Canva 嵌入無法顯示",
    pendingBody: "伺服器還沒有從 canva.com 轉址得到 /design/{id}。不會嵌入空白 iframe，也不會標成已驗證。",
    embedFailBody: "可能是失效短網址、Cloudflare 驗證頁、登入牆，或瀏覽器擋住嵌入。沒有空白 iframe。",
    fullscreen: "全螢幕",
    pageN: "第 {n} 頁",
    iframeTitle: "{title} Canva 原作",
    noGithub: "還沒有公開 GitHub 來源。不會顯示虛構架構圖。",
    noDescription: "尚無公開 description。",
    updated: "更新",
    notSynced: "尚未同步",
    status: "狀態",
    noTopics: "這個儲存庫目前沒有 GitHub topics。",
    latestCommit: "最新提交",
    openGithub: "開 GitHub",
    treeTitle: "有限檔案樹",
    treeAria: "有限檔案樹",
    treePending: "檔案樹還在從公開 GitHub REST 同步。沒有寫入金鑰；完成前不會顯示虛構路徑。",
    treeFailed: "這次公開同步失敗。不會顯示虛構檔案樹。",
    treeEmpty: "這次沒有讀到可公開的檔案樹。不會顯示虛構路徑。",
    defaultPurpose: "公開儲存庫路徑，用途以 README 與檔名為準。",
    stageLabel: "流程階段",
    defaultStage: "來源",
    openOnGithub: "在 GitHub 開啟",
    readmeSummary: "README 摘要",
    readmeMissing: "README 尚未同步，或這個儲存庫沒有公開 README。",
    hintNote: "精選來源路徑對齊公開 repo HEAD。有在這次同步檔案樹裡的會標示；沒讀到的仍可到 GitHub 開啟，不會假裝在樹裡。",
    hintTreeAria: "來源路徑",
    hintInTree: "在同步樹中",
    hintMissingFromTree: "不在這次有限檔案樹裡",
    emptyDemo: "沒有已驗證的公開 Demo。GitHub 仍可展開，但這裡不會放假的產品畫面。",
    publicUrl: "公開網址",
    pendingEmbed: "這個網址還沒驗證能不能嵌入。",
    cannotEmbed: "無法在頁內嵌入。請開新分頁查看，狀態可能隨部署變動。",
    newTab: "開新分頁",
    liveStatus: "Live Demo · 狀態 {status}",
    openSite: "開原站",
    noEmbedUrl: "沒有可嵌入的網址。不會放空白 iframe。",
    timelineAria: "FrameLab 時間軸",
    timelineKeyboard: "左右鍵換幀，O 切 onion-skin，C 比較。",
    demoMark: "示範",
    comparePrev: "比較 · 前一幀（示範，不是真實輸出）",
    framesAria: "幀",
    onionSkin: "Onion skin",
    frameCompare: "幀比較",
    on: "開",
    off: "關",
    currentFrame: "目前",
    problemNote: "接觸點不穩，概念上只重產這一窗，不重跑整段。",
    emptyFrames: "尚未設定時間軸幀。",
    timelineDefaultIntro: "作品集示範時間軸。",
    emptyNodes: "尚未設定流程節點。",
    processDefaultIntro: "這是作品集互動展示，把公開 repo 的流程串成可點的節點。不是線上產品控制台。",
    processKeyboard: "鍵盤左右鍵可換節點。",
    nodesAria: "流程節點",
    githubSource: "GitHub 來源",
    openSourceFile: "開啟原始檔",
    reducedMotion: "已依系統設定關閉多餘動態。",
    emptyObjects: "尚未設定空間物件。",
    planformDefaultIntro: "公開站首屏是「我的專案」與「＋ 新建專案」。這裡是作品集場佈示意，不是線上專案，也不假裝已經拖過物件。",
    planformKeyboard: "上下鍵旋轉，Shift＋左右移動選取物件。",
    planformAria: "PLANFORM 場佈",
    rotate: "旋轉",
    useLabel: "用途",
    sizeLabel: "尺寸",
    sourceLabel: "來源",
    emptyVersions: "尚未設定對稿版本。",
    duigaoDefaultIntro: "公開站首屏是「今天要對什麼？」；可選做一張圖或建立活動房。這裡是作品集對稿示意，不是真實房間。",
    duigaoPrivateNote: "這裡不連真實房間、不放邀請連結或私人討論。",
    compare: "比較",
    addNote: "加上註記",
    clickToAnnotate: "點海報上的位置即可註記，不用跳出對話框。",
    posterAlt: "{label} 對稿海報",
    annotatePrompt: "這位置要改什麼？",
    send: "送出",
    silence: "（沉默）",
    localKeyword: "本地關鍵詞回覆 · 不是雲端 LLM",
    zenPlaceholder: "輸入一句心情",
    zenStarter: "這是本地回應引擎，不是雲端 LLM。同一句話會得到同一組回覆。",
    hermesPlaceholder: "輸入一句話",
    hermesStarter: "這是作品集互動展示，沒有連到 Hermes 執行期。",
    hermesUnmatched: "收到「{value}」。沒有雲端模型，也不會假裝工具已執行。來源：{repo}。",
    uploadPoster: "上傳海報",
    samplePoster: "樣本海報",
    analyze: "分析",
    posterAltPending: "待分析海報",
    brightArea: "高亮面積約 {n}%（推估）",
    contrastStat: "對比（標準差）{n}（推估）",
    textBands: "疑似文字列 {n} 帶（推估）",
    posterLoading: "樣本載入後會自動畫熱圖。也可再按分析。計算有解析度上限，細節會被縮小。",
    regionCenter: "中央顯著性（推估）",
    regionBright: "高亮面積（推估）",
    regionText: "文字帶（推估）",
    canvasUnavailable: "畫布不可用",
    estimateDisclaimer: "熱圖與區域是像素對比推估，不是眼動追蹤。",
    emptyWalkthrough: "尚未設定走查步驟。",
    walkDefaultIntro: "這是作品集逐步走查，不是線上產品本身。",
    walkDemoCanvas: "作品集走查畫面 · 不是線上產品",
    folioDefaultIntro: "公開站首屏是「文件櫃」。存在這台裝置，不必登入。這裡是作品集走查，不是線上編輯器。",
    folioNotCounter: "左右鍵換步驟。畫面依儲存的走查步驟繪製，不是空白計數器。",
    walkAria: "Folio 走查",
    walkStepsAria: "走查步驟",
    openSource: "開原始檔",
    prevStep: "上一步",
    nextStep: "下一步",
    folioDemoCanvas: "Folio 示範畫布 · 不是線上編輯器",
    folioText: "文字",
    folioSameModel: "同一文件模型 · 文字／形狀／元件",
    folioCommand: "⌘K 指令",
    folioAudit: "檢查",
    folioContrast: "對比不足",
    folioOverflow: "文字溢出",
    folioSafe: "安全區",
    folioUnpublished: "未發布文件",
    folioNotPublicMcp: "不出現在公開 MCP",
    folioNotWritten: "未寫入",
    zenLocalBadge: "本地引擎 · 無網路",
    zenTitle: "TKU Zen AI",
    zenSubtitle: "給忙碌心智的本地禪意陪伴",
    zenBreath: "呼吸",
    hermesDisconnected: "尚未連線",
    hermesWorkspace: "工作區預覽",
    previewWorkspace: "作品集預覽",
    previewOffline: "未接上產品執行期",
    frameKindKey: "關鍵幀",
    frameKindBreakdown: "中間幀",
    frameKindGenerated: "生成幀",
    heatmapBadge: "像素推估 · 非眼動儀",
    pinIndex: "{n}",
    processPipelineAria: "流程地圖",
    folioBack: "回到文件櫃",
    folioPublish: "發布",
    folioSaved: "暫存",
    folioInsertText: "插入文字區塊",
    folioAddShape: "加入形狀",
    folioPreview: "預覽",
    folioDocumentLayer: "文件層",
    folioArtboards: "畫板",
    folioNewDoc: "新增文件",
    folioOnDevice: "存在這台裝置",
    folioNoLogin: "不必登入",
  },
  en: {
    tabPlay: "Play",
    tabVisual: "Visual",
    tabGithub: "GitHub",
    tabCanva: "Canva original",
    tabHow: "How it works",
    tabSource: "Sources",
    tabsAria: "Work experience",
    closeExperience: "Close experience",
    emptyMedia: "This work has no published media yet. A blank frame is not shown.",
    emptySource: "No technical sources are listed yet. The public GitHub tab still opens the repo.",
    canvaEmptyNote:
      "This work has no public Canva share or embed URL. This is public embed mode: there are no Canva Connect credentials, no empty iframe, and the app does not pretend the Canva API is linked. Admin can paste a canva.com/design or /d/ short link; a short link embeds only after the server follows the redirect.",
    unavailableTitle: "The Canva original cannot be publicly embedded right now",
    noShareTitle: "The Canva original has no public share URL",
    unavailableBody:
      "It may need a sign-in, the permission may not be public share, or the short link did not resolve to /design/{id}. The site shows a thumb only — no empty iframe.",
    noShareBody: "Only an exported thumb is shown. There is no canva.com share/embed URL, so no empty iframe is embedded.",
    openOriginal: "Open original in Canva",
    sourcePublicEmbed: "Source mark: public embed mode · status {status} · not claiming Connect is linked",
    sourceCanvaEmbed: "Source mark: Canva public embed · status {status} · not claiming Connect is linked",
    pendingTitle: "This Canva short link has no public design to embed yet",
    embedFailTitle: "The Canva embed cannot be shown",
    pendingBody:
      "The server has not yet resolved a canva.com redirect to /design/{id}. No empty iframe is embedded, and it is not marked verified.",
    embedFailBody:
      "It may be a dead short link, a Cloudflare challenge, a sign-in wall, or the browser blocking the embed. No empty iframe.",
    fullscreen: "Fullscreen",
    pageN: "Page {n}",
    iframeTitle: "{title} Canva original",
    noGithub: "There is no public GitHub source. A fictional architecture diagram is not shown.",
    noDescription: "No public description yet.",
    updated: "Updated",
    notSynced: "not synced",
    status: "Status",
    noTopics: "This repository has no GitHub topics yet.",
    latestCommit: "Latest commit",
    openGithub: "Open GitHub",
    treeTitle: "Limited file tree",
    treeAria: "Limited file tree",
    treePending:
      "The file tree is still syncing from public GitHub REST. No write token is used; fictional paths are not shown until it finishes.",
    treeFailed: "This public sync failed. A fictional file tree is not shown.",
    treeEmpty: "No public file tree was read this time. Fictional paths are not shown.",
    defaultPurpose: "A public repository path; purpose follows the README and the file name.",
    stageLabel: "Process stage",
    defaultStage: "source",
    openOnGithub: "Open on GitHub",
    readmeSummary: "README excerpt",
    readmeMissing: "The README has not synced, or this repository has no public README.",
    hintNote:
      "Curated source paths aligned with the public repo HEAD. Paths present in this sync are marked; missing ones can still open on GitHub and are not pretended to be in the tree.",
    hintTreeAria: "Source paths",
    hintInTree: "In the synced tree",
    hintMissingFromTree: "Not in this limited file tree",
    emptyDemo: "There is no verified public demo. GitHub can still expand, but a fake product screen is not shown.",
    publicUrl: "Public URL",
    pendingEmbed: "This URL has not been verified as embeddable yet.",
    cannotEmbed: "It cannot embed on the page. Open a new tab; status can change with deploys.",
    newTab: "Open in a new tab",
    liveStatus: "Live Demo · status {status}",
    openSite: "Open the site",
    noEmbedUrl: "There is no embeddable URL. An empty iframe is not shown.",
    timelineAria: "FrameLab timeline",
    timelineKeyboard: "Left and right change frames. O toggles onion-skin. C compares.",
    demoMark: "Demo",
    comparePrev: "Compare · previous frame (demo, not a real model output)",
    framesAria: "Frames",
    onionSkin: "Onion skin",
    frameCompare: "Frame compare",
    on: "on",
    off: "off",
    currentFrame: "Now",
    problemNote: "Contact is unstable — conceptually regenerate this window, not the whole shot.",
    emptyFrames: "No timeline frames are set yet.",
    timelineDefaultIntro: "A portfolio demo timeline.",
    emptyNodes: "No process nodes are set yet.",
    processDefaultIntro:
      "This is a portfolio interactive demo that turns the public repo flow into tappable nodes. It is not a live product console.",
    processKeyboard: "Left and right keys move between nodes.",
    nodesAria: "Process nodes",
    githubSource: "GitHub source",
    openSourceFile: "Open source file",
    reducedMotion: "Extra motion is off per system settings.",
    emptyObjects: "No spatial objects are set yet.",
    planformDefaultIntro: "The public first screen is “My projects” and “+ New project”. This is a portfolio layout sketch, not a live project, and it does not pretend objects were already dragged.",
    planformKeyboard: "Up/down rotate. Shift+left/right move the selected object.",
    planformAria: "PLANFORM layout",
    rotate: "Rotate",
    useLabel: "Use",
    sizeLabel: "Size",
    sourceLabel: "Source",
    emptyVersions: "No review versions are set yet.",
    duigaoDefaultIntro: "The public first screen is “What are we reviewing today?” — pick Make an image or Create an event room. This is a portfolio review sketch, not a live room.",
    duigaoPrivateNote: "This does not connect to a real room, invite link, or private thread.",
    compare: "Compare",
    addNote: "Add note",
    clickToAnnotate: "Click a spot on the poster to annotate — no extra dialog.",
    posterAlt: "{label} review poster",
    annotatePrompt: "What should change here?",
    send: "Send",
    silence: "(silence)",
    localKeyword: "Local keyword reply · not a cloud LLM",
    zenPlaceholder: "Type a mood line",
    zenStarter: "This is a local reply engine, not a cloud LLM. The same line gets the same replies.",
    hermesPlaceholder: "Type a line",
    hermesStarter: "This is a portfolio interactive demo; it is not connected to the Hermes runtime.",
    hermesUnmatched: "Got “{value}”. There is no cloud model, and no tool is pretended to have run. Source: {repo}.",
    uploadPoster: "Upload poster",
    samplePoster: "Sample poster",
    analyze: "Analyze",
    posterAltPending: "Poster to analyze",
    brightArea: "Bright area about {n}% (estimate)",
    contrastStat: "Contrast (std. dev.) {n} (estimate)",
    textBands: "Likely text rows: {n} bands (estimate)",
    posterLoading: "A heatmap draws when the sample loads. You can also press Analyze. Resolution is capped, so detail shrinks.",
    regionCenter: "Center salience (estimate)",
    regionBright: "Bright area (estimate)",
    regionText: "Text band (estimate)",
    canvasUnavailable: "Canvas unavailable",
    estimateDisclaimer: "Heatmaps and regions are pixel-contrast estimates, not eye-tracking.",
    emptyWalkthrough: "No walkthrough steps are set yet.",
    walkDefaultIntro: "This is a portfolio walkthrough, not the live product.",
    walkDemoCanvas: "Portfolio walkthrough stage · not the live product",
    folioDefaultIntro: "The public first screen is the file cabinet. It lives on this device; no sign-in. This is a portfolio walkthrough, not the live editor.",
    folioNotCounter: "Left and right change steps. The stage is drawn from saved walkthrough steps, not a blank counter.",
    walkAria: "Folio walkthrough",
    walkStepsAria: "Walkthrough steps",
    openSource: "Open source file",
    prevStep: "Previous",
    nextStep: "Next",
    folioDemoCanvas: "Folio demo canvas · not a live editor",
    folioText: "Text",
    folioSameModel: "One document model · text / shape / component",
    folioCommand: "⌘K command",
    folioAudit: "Audit",
    folioContrast: "Low contrast",
    folioOverflow: "Text overflow",
    folioSafe: "Safe area",
    folioUnpublished: "Unpublished document",
    folioNotPublicMcp: "Not on public MCP",
    folioNotWritten: "Not written",
    zenLocalBadge: "Local engine · no network",
    zenTitle: "TKU Zen AI",
    zenSubtitle: "A calm companion for a busy mind",
    zenBreath: "Breath",
    hermesDisconnected: "Not connected",
    hermesWorkspace: "Workspace preview",
    previewWorkspace: "Portfolio preview",
    previewOffline: "Not connected to the live product",
    frameKindKey: "Key",
    frameKindBreakdown: "Breakdown",
    frameKindGenerated: "Generated",
    heatmapBadge: "Pixel estimate · not eye-tracking",
    pinIndex: "{n}",
    processPipelineAria: "Process map",
    folioBack: "Back to cabinet",
    folioPublish: "Publish",
    folioSaved: "Draft",
    folioInsertText: "Insert text block",
    folioAddShape: "Add shape",
    folioPreview: "Preview",
    folioDocumentLayer: "document layer",
    folioArtboards: "Artboards",
    folioNewDoc: "New document",
    folioOnDevice: "On this device",
    folioNoLogin: "No sign-in",
  },
} as const;

export type ExperienceChrome = (typeof experienceChrome)[ViewerLang];

export function experienceChromeFor(lang: ViewerLang): ExperienceChrome {
  return experienceChrome[lang];
}

export const PORTFOLIO_DEMO_EN = "Portfolio interactive demo";

export const commonExperienceCopyEn = {
  honestyLabel: PORTFOLIO_DEMO_EN,
  githubIntro:
    "The file tree comes from public GitHub metadata synced on the server. Paths that were not read are not invented.",
  canvaNote:
    "This is public embed mode. Without a public /design/{id} or a server-resolved /d/ short link, no empty iframe is embedded. A short link embeds only after it resolves to a design. That is not marked verified, and Connect is not claimed as linked.",
  demoNote: "When there is no verified public demo, a fake product screen is not shown.",
  galleryNote:
    "Only published media. Files marked as GitHub exports are copies of public repo files; studio SVGs are translations. No embed without a public Canva /design/{id}.",
} as const;

type NodeEn = { id: string; label?: string; summary?: string; purpose?: string; stage?: string };
type HintEn = { path: string; purpose?: string; stage?: string };
type WalkEn = { title: string; body?: string; path?: string };
type ObjectEn = { id: string; label?: string; use?: string; size?: string };
type VersionEn = { id: string; label?: string };
type PinEn = { id: string; note?: string };
type ReplyEn = { matchZh: string; match: string; reply: string };

export type ExperienceCopyEn = {
  honestyLabel?: string;
  intro?: string;
  githubIntro?: string;
  canvaNote?: string;
  demoNote?: string;
  galleryNote?: string;
  processNodes?: NodeEn[];
  walkthrough?: WalkEn[];
  fileHints?: HintEn[];
  timeline?: { demoDisclaimer?: string };
  spatial?: {
    objects?: ObjectEn[];
    circulationNote?: string;
    complianceDisclaimer?: string;
  };
  comparison?: {
    versions?: VersionEn[];
    seedPins?: PinEn[];
    prompt?: string;
    estimateDisclaimer?: string;
  };
  conversation?: {
    disclaimer?: string;
    starter?: string;
    placeholder?: string;
    sourceNote?: string;
    replies?: ReplyEn[];
    suggestions?: string[];
  };
  canvaPageLabels?: Array<{ id: string; label: string }>;
};

export const experienceCopyEn: Record<string, ExperienceCopyEn> = {
  "ai-director-os": {
    honestyLabel: PORTFOLIO_DEMO_EN,
    intro:
      "The public site opens on a landing page: “Turn an idea into a plan the team can actually finish.” Entering the workbench requires sign-in. These nodes are the public repo flow, not a live console.",
    processNodes: [
      {
        id: "project",
        label: "Project",
        summary: "Create the project and permissions so worldview and assets share one context.",
        purpose: "Project core state",
        stage: "Project",
      },
      {
        id: "world",
        label: "Worldview",
        summary: "Character cards and worldview enter generation automatically instead of being pasted as prompts.",
        purpose: "Worldview data",
        stage: "Worldview",
      },
      {
        id: "assets",
        label: "Assets",
        summary: "Generated results go into the library so later shots reuse the same batch.",
        purpose: "Asset and generation tables",
        stage: "Assets",
      },
      {
        id: "gen",
        label: "Generate",
        summary: "The only vendor is Fal.ai; without a key, a fake-generate mode tests the flow.",
        purpose: "Generation desk",
        stage: "Generate",
      },
      {
        id: "storyboard",
        label: "Storyboard",
        summary: "Storyboard order and a short-form master; the shot list can export.",
        purpose: "Storyboard script",
        stage: "Storyboard",
      },
      {
        id: "review",
        label: "Review",
        summary: "Lead review and quality lookback; outside quotes stay drafts.",
        purpose: "Quality review",
        stage: "Review",
      },
      {
        id: "delivery",
        label: "Delivery",
        summary: "Share links and a delivery pack — internal accounts stay private.",
        purpose: "Project share",
        stage: "Delivery",
      },
    ],
    fileHints: [
      { path: "README.md", purpose: "Public capabilities and unfinished work", stage: "Source" },
      { path: "server/services/projectCore.ts", purpose: "Project core state", stage: "Project" },
      { path: "shared/worldview.ts", purpose: "Worldview data", stage: "Worldview" },
      { path: "server/db/schema/generation.ts", purpose: "Asset and generation tables", stage: "Assets" },
      { path: "server/services/generationCore.ts", purpose: "Generation desk", stage: "Generate" },
      { path: "server/services/fal.ts", purpose: "Fal.ai vendor wiring", stage: "Generate" },
      { path: "shared/storyboardScript.ts", purpose: "Storyboard script", stage: "Storyboard" },
      { path: "server/services/aiQualityReview.ts", purpose: "Quality review", stage: "Review" },
      { path: "server/services/projectShare.ts", purpose: "Project share", stage: "Delivery" },
      { path: "shared/mcpCatalog.ts", purpose: "MCP tool catalog", stage: "Delivery" },
    ],
  },
  framelab: {
    honestyLabel: PORTFOLIO_DEMO_EN,
    intro: "The public site opens on a landing page: “Give it keyframes. Repair only the frames that break.” The studio needs sign-in. This is a portfolio demo timeline, not the live workstation.",
    timeline: {
      demoDisclaimer: "Frames labeled “demo” are not GPU model output. Real Wan / RIFE / SAM adapters are not loaded.",
    },
    fileHints: [
      { path: "src/lib/domain/timeline-engine.ts", purpose: "Timeline engine", stage: "Timeline" },
      { path: "src/lib/domain/frame-graph.ts", purpose: "Frame Graph", stage: "Graph" },
      { path: "src/lib/domain/sample-ball.ts", purpose: "Sample bouncing-ball sequence", stage: "Sample" },
      { path: "src/lib/domain/inbetween.ts", purpose: "In-between strategy", stage: "Timeline" },
      { path: "src/lib/domain/keyframe-pair.ts", purpose: "Keyframe pair", stage: "Timeline" },
      { path: "src/lib/domain/regeneration-planner.ts", purpose: "Local regen planner", stage: "Repair" },
      { path: "src/lib/domain/region-repair.ts", purpose: "Region repair", stage: "Repair" },
      { path: "src/components/workstation/visual-timeline.tsx", purpose: "Visual timeline", stage: "Workstation" },
      { path: "src/lib/domain/context-engine.ts", purpose: "Context Engine", stage: "Context" },
      { path: "src/lib/commands/execute.ts", purpose: "One execute path for UI / REST / MCP", stage: "Commands" },
      { path: "src/lib/ai/registry.ts", purpose: "Model registry; unavailable until loaded", stage: "Limits" },
    ],
  },
  "poster-vision-ai": {
    honestyLabel: "Heatmaps are pixel / AI estimates, not eye-tracking",
    intro: "Upload or use the sample poster. Area, contrast, and text bands are on-device pixel math.",
    comparison: {
      estimateDisclaimer: "Heatmaps and regions are pixel-contrast estimates, not eye-tracking.",
    },
    fileHints: [
      { path: "src/lib/vision/ts-engine.ts", purpose: "JS salience engine", stage: "Analyze" },
      { path: "src/lib/vision/pipeline.ts", purpose: "Analyze pipeline", stage: "Analyze" },
      { path: "src/lib/vision/scoring.ts", purpose: "Scoring", stage: "Analyze" },
      { path: "src/lib/vision/python-engine.ts", purpose: "Python engine bridge", stage: "Analyze" },
      { path: "engine/analyze.py", purpose: "OpenCV / YuNet engine", stage: "Analyze" },
      { path: "src/components/poster/overlay-stage.tsx", purpose: "Overlay stage", stage: "Show" },
      { path: "src/lib/vision/compare.ts", purpose: "Before/after compare", stage: "Compare" },
    ],
  },
  planform: {
    honestyLabel: "Pre-event rehearsal, not a code-compliance calculation",
    intro: "The public first screen is “My projects” and “+ New project”. This is a portfolio layout sketch, not a live project, and it does not pretend objects were already dragged.",
    spatial: {
      objects: [
        { id: "desk", label: "Check-in desk", use: "Check-in / materials", size: "180×60 cm" },
        { id: "mats", label: "Floor-mat area", use: "Sit on the floor", size: "360×360 cm" },
        { id: "path", label: "Aisle", use: "In/out path", size: "90 cm wide (sketch)" },
        { id: "poster", label: "Poster stand", use: "Print display", size: "60×160 cm" },
        { id: "power", label: "Power point", use: "Equipment power", size: "Sketch location" },
      ],
      circulationNote: "The mint curve is a sketched path, not a legal egress width.",
      complianceDisclaimer: "This is a portfolio space preview. It does not compute occupancy or fire-code compliance.",
    },
    fileHints: [
      { path: "src/scene/SceneManager.ts", purpose: "3D scene", stage: "Space" },
      { path: "src/core/placement.ts", purpose: "Placement and collision", stage: "Layout" },
      { path: "src/core/boothCatalog.ts", purpose: "Booth object catalog", stage: "Layout" },
      { path: "src/core/simulation.ts", purpose: "Crowd simulation", stage: "Circulation" },
      { path: "src/core/simSpatial.ts", purpose: "Spatial circulation", stage: "Circulation" },
      { path: "src/core/eventFlow.ts", purpose: "Event flow", stage: "Circulation" },
      { path: "src/core/venues.ts", purpose: "Classroom templates", stage: "Venue" },
      { path: "src/core/validation.ts", purpose: "Design reminders (not a code certificate)", stage: "Limits" },
    ],
  },
  duigao: {
    honestyLabel: PORTFOLIO_DEMO_EN,
    intro: "The public first screen is “What are we reviewing today?” — pick Make an image or Create an event room. This is a portfolio review sketch, not a live room.",
    comparison: {
      versions: [
        { id: "v1", label: "v1 color" },
        { id: "v2", label: "v2 contrast" },
        { id: "bw", label: "Black and white" },
      ],
      seedPins: [{ id: "p1", note: "Make the headline a bit larger" }],
      prompt: "What should change here?",
    },
    fileHints: [
      { path: "src/components/RoomWorkspace.tsx", purpose: "Review workspace", stage: "Discuss" },
      { path: "src/components/UniversalIntake.tsx", purpose: "Asset intake", stage: "Discuss" },
      { path: "src/components/ShareSheet.tsx", purpose: "Share sheet (no invite secrets)", stage: "Access" },
      { path: "src/cloud/invite.ts", purpose: "Invite hashes, no plaintext secrets", stage: "Access" },
      { path: "README.md", purpose: "Permission model", stage: "Source" },
    ],
  },
  folio: {
    honestyLabel: PORTFOLIO_DEMO_EN,
    intro: "The public first screen is the file cabinet. It lives on this device; no sign-in. This is a portfolio walkthrough, not the live editor.",
    walkthrough: [
      {
        title: "File cabinet",
        body: "The public canva2-k7qm first screen is the file cabinet. It lives on this device; no sign-in.",
      },
      {
        title: "Canvas",
        body: "Text, shapes, and components share one document model.",
        path: "src/components/editor/canvas-stage.tsx",
      },
      {
        title: "Artboards",
        body: "One document can hold several artboards. MCP list_artboards / get_artboard use the same document model.",
        path: "src/components/editor/artboard-strip.tsx",
      },
      {
        title: "Command layer",
        body: "Shortcuts, the command palette, and MCP writes hit the same typed command layer.",
        path: "src/components/editor/command-palette.tsx",
      },
      {
        title: "Design audit",
        body: "Contrast, overflow, and the safe area show up before publish.",
        path: "src/components/editor/audit-panel.tsx",
      },
      {
        title: "MCP boundary",
        body: "Writes default to dry-run; unpublished documents do not appear on public MCP.",
        path: "src/components/editor/mcp-panel.tsx",
      },
    ],
    fileHints: [
      { path: "src/components/editor/editor-shell.tsx", purpose: "Editor shell", stage: "Canvas" },
      { path: "src/components/editor/artboard-strip.tsx", purpose: "Multi-artboard strip", stage: "Artboard" },
      { path: "src/components/editor/canvas-stage.tsx", purpose: "Canvas stage", stage: "Canvas" },
      { path: "src/components/editor/command-palette.tsx", purpose: "Command palette", stage: "Command" },
      { path: "src/components/editor/audit-panel.tsx", purpose: "Design audit", stage: "Audit" },
      { path: "src/components/editor/mcp-panel.tsx", purpose: "MCP write boundary", stage: "Limits" },
      { path: "README.md", purpose: "Shipped features and limits", stage: "Source" },
    ],
  },
  "hermes-console": {
    honestyLabel: "Portfolio interactive demo; not connected to the Hermes runtime",
    intro:
      "The public first screen is “What do you want to do today?” plus Quick start (Research / Create / Analyze). This page is a local note, not an Agent execution.",
    conversation: {
      disclaimer: "This is a portfolio interactive demo; it is not connected to the Hermes runtime.",
      starter:
        "The public first screen is “What do you want to do today?” Quick start is Research, Create, Analyze. This page does not pretend a task was sent.",
      placeholder: "Type Research, Create, or Analyze",
      sourceNote: "Offline. Every reply is a local note, not an agent execution result.",
      suggestions: ["Research", "Create", "Analyze"],
      replies: [
        {
          matchZh: "研究",
          match: "research",
          reply:
            "On the live site, Research fills “Help me find flyer inspiration.” This page is not connected to the Agent, so it will not actually search.",
        },
        {
          matchZh: "創作",
          match: "create",
          reply: "On the live site, Create fills “Help me make a flyer poster.” This page will not generate a poster.",
        },
        {
          matchZh: "分析",
          match: "analyze",
          reply:
            "On the live site, Analyze fills “Please analyze this flyer.” There is no flyer here, and the page does not pretend it analyzed one.",
        },
      ],
    },
    walkthrough: [
      {
        title: "Workspace",
        body: "Public host 344 needs no sign-in. First screen h1 is “What do you want to do today?” plus Quick start (Research / Create / Analyze). This portfolio page is still a local note, not Agent execution.",
        path: "app/api/chat/route.ts",
      },
      {
        title: "Ready check",
        body: "A connection probe is not treating a GitHub URL as MCP.",
        path: "app/api/ready/route.ts",
      },
      {
        title: "MCP registry",
        body: "Only a real HTTPS endpoint and token are probed.",
        path: "app/api/mcp-registry/route.ts",
      },
    ],
    fileHints: [
      { path: "README.md", purpose: "Product invariants", stage: "Source" },
      { path: "app/api/chat/route.ts", purpose: "Chat entry", stage: "Workspace" },
      { path: "app/api/ready/route.ts", purpose: "Ready check", stage: "Status" },
      { path: "app/api/mcp-registry/route.ts", purpose: "MCP registry", stage: "Tools" },
      { path: "app/api/health/route.ts", purpose: "Health check", stage: "Status" },
      { path: "lib/server/canva.ts", purpose: "Canva Connect adapter; unavailable until configured", stage: "Limits" },
    ],
  },
  "tku-zen-ai": {
    honestyLabel: "Local reply engine, not a cloud LLM",
    intro: "The public chat first screen is the English welcome “Welcome to TKU Zen AI. Take a breath, and share whatever is on your mind.” This page runs the same local engine, not a cloud LLM.",
    conversation: {
      disclaimer: "This is a local reply engine, not a cloud LLM. The same line gets the same replies.",
      starter: "Welcome to TKU Zen AI. Take a breath, and share whatever is on your mind.",
      placeholder: "Share what's on your mind…",
      sourceNote: "Aligned with public src/app/page.tsx and src/lib/zen.ts. No network calls. No public Zeabur host.",
      suggestions: ["I feel stressed about my exams", "Help me focus", "I can't sleep", "Thank you"],
    },
    walkthrough: [
      {
        title: "Welcome",
        body: "Public src/app/page.tsx first screen h1 “TKU Zen AI”, subtitle “A calm companion for a busy mind”. Welcome Take a breath. No public Zeabur host.",
      },
      {
        title: "Suggestions",
        body: "Four English chips match page.tsx: I feel stressed about my exams / Help me focus / I can't sleep / Thank you. Not Chinese chips.",
      },
      {
        title: "Local engine",
        body: "Submit goes through src/lib/zen.ts. Same input, same output. Not a cloud LLM. This portfolio has not sent a real mood line.",
      },
    ],
    fileHints: [
      { path: "src/lib/zen.ts", purpose: "Reproducible local engine", stage: "Talk" },
      { path: "src/app/api/chat/route.ts", purpose: "POST /api/chat", stage: "API" },
      { path: "src/lib/zen.test.ts", purpose: "Unit tests", stage: "Check" },
      { path: "src/app/page.tsx", purpose: "Public chat first screen", stage: "Talk" },
    ],
  },
};

function trimEn(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstEn(...values: Array<string | undefined>): string {
  for (const value of values) {
    const next = trimEn(value);
    if (next) return next;
  }
  return "";
}

/** Saved overlay, then dictionary, then zh. Empty saved strings fall through. */
function overlayField(zh: string | undefined, saved?: string, dict?: string): string | undefined {
  return firstEn(saved, dict) || zh;
}

function overlayCommonNote(
  current: string | undefined,
  zhDefault: string,
  enDefault: string,
  saved?: string,
  dict?: string,
): string | undefined {
  const picked = firstEn(saved, dict);
  if (picked) return picked;
  if (!current || current === zhDefault) return enDefault;
  return current;
}

type OverlayRow = { id: string } & Record<string, string | undefined>;

function overlayNodes<T extends { id: string }>(
  current: T[] | undefined,
  saved: OverlayRow[] | undefined,
  dict: OverlayRow[] | undefined,
  fields: (keyof T)[],
): T[] | undefined {
  if (!current?.length) return current;
  if (!saved?.length && !dict?.length) return current;
  const savedMap = new Map((saved ?? []).map((item) => [item.id, item]));
  const dictMap = new Map((dict ?? []).map((item) => [item.id, item]));
  return current.map((item) => {
    const savedHit = savedMap.get(item.id);
    const dictHit = dictMap.get(item.id);
    if (!savedHit && !dictHit) return item;
    const next = { ...item };
    for (const field of fields) {
      if (field === "id") continue;
      const value = firstEn(
        savedHit?.[field as string],
        dictHit?.[field as string],
      );
      if (value) (next as Record<string, unknown>)[field as string] = value;
    }
    return next;
  });
}

function overlayHints(
  current: NonNullable<ExperienceConfig["fileHints"]> | undefined,
  saved: HintEn[] | undefined,
  dict: HintEn[] | undefined,
): ExperienceConfig["fileHints"] {
  if (!current?.length) return current;
  if (!saved?.length && !dict?.length) return current;
  const savedMap = new Map((saved ?? []).map((item) => [item.path, item]));
  const dictMap = new Map((dict ?? []).map((item) => [item.path, item]));
  return current.map((item) => {
    const savedHit = savedMap.get(item.path);
    const dictHit = dictMap.get(item.path);
    if (!savedHit && !dictHit) return item;
    return {
      ...item,
      path: item.path,
      purpose: firstEn(savedHit?.purpose, dictHit?.purpose) || item.purpose,
      stage: firstEn(savedHit?.stage, dictHit?.stage) || item.stage,
    };
  });
}

type WalkOverlay = { title?: string; body?: string; path?: string };

function walkHit(rows: WalkOverlay[] | undefined, item: WalkOverlay, index: number): WalkOverlay | undefined {
  if (!rows?.length) return undefined;
  return (item.path ? rows.find((row) => row.path === item.path) : undefined) ?? rows[index];
}

function overlayWalk(
  current: NonNullable<ExperienceConfig["walkthrough"]> | undefined,
  saved: WalkOverlay[] | undefined,
  dict: WalkOverlay[] | undefined,
): ExperienceConfig["walkthrough"] {
  if (!current?.length) return current;
  if (!saved?.length && !dict?.length) return current;
  return current.map((item, index) => {
    const savedHit = walkHit(saved, item, index);
    const dictHit = walkHit(dict, item, index);
    if (!savedHit && !dictHit) return item;
    return {
      ...item,
      title: firstEn(savedHit?.title, dictHit?.title) || item.title,
      body: firstEn(savedHit?.body, dictHit?.body) || item.body,
      path: item.path,
    };
  });
}

function overlayStringList(
  current: string[] | undefined,
  saved: string[] | undefined,
  dict: string[] | undefined,
): string[] | undefined {
  const savedList = (saved ?? []).map((item) => item.trim()).filter(Boolean);
  if (savedList.length) return savedList;
  const dictList = (dict ?? []).map((item) => item.trim()).filter(Boolean);
  if (dictList.length) return dictList;
  return current;
}

function replyHit(rows: Array<{ matchZh?: string; match?: string; reply?: string }> | undefined, match: string) {
  if (!rows?.length) return undefined;
  return rows.find((row) => row.matchZh === match) ?? rows.find((row) => row.match === match);
}

function overlayReplies(
  current: NonNullable<NonNullable<ExperienceConfig["conversation"]>["replies"]> | undefined,
  saved: Array<{ matchZh?: string; match?: string; reply?: string }> | undefined,
  dict: ReplyEn[] | undefined,
) {
  if (!current?.length) return current;
  if (!saved?.length && !dict?.length) return current;
  return current.map((item) => {
    const savedHit = replyHit(saved, item.match);
    const dictHit = replyHit(dict, item.match);
    if (!savedHit && !dictHit) return item;
    return {
      ...item,
      match: firstEn(savedHit?.match, dictHit?.match) || item.match,
      reply: firstEn(savedHit?.reply, dictHit?.reply) || item.reply,
    };
  });
}

/** Viewer overlay only. Catalog/defaults Chinese strings stay the CMS source. */
export function overlayExperienceConfig(
  config: ExperienceConfig,
  slug: string,
  lang: ViewerLang,
): ExperienceConfig {
  if (lang !== "en") return config;
  const savedEn: ExperienceLocaleOverlay = config.locale?.en ?? {};
  const slugEn = experienceCopyEn[slug] ?? {};
  const honesty =
    firstEn(savedEn.honestyLabel, slugEn.honestyLabel) ||
    (config.honestyLabel === PORTFOLIO_DEMO ? commonExperienceCopyEn.honestyLabel : config.honestyLabel);

  const next: ExperienceConfig = {
    ...config,
    honestyLabel: honesty,
    intro: overlayField(config.intro, savedEn.intro, slugEn.intro),
    githubIntro: overlayCommonNote(
      config.githubIntro,
      DEFAULT_EXPERIENCE_NOTES.githubIntro,
      commonExperienceCopyEn.githubIntro,
      savedEn.githubIntro,
      slugEn.githubIntro,
    ),
    canvaNote: overlayCommonNote(
      config.canvaNote,
      DEFAULT_EXPERIENCE_NOTES.canvaNote,
      commonExperienceCopyEn.canvaNote,
      savedEn.canvaNote,
      slugEn.canvaNote,
    ),
    demoNote: overlayCommonNote(
      config.demoNote,
      DEFAULT_EXPERIENCE_NOTES.demoNote,
      commonExperienceCopyEn.demoNote,
      savedEn.demoNote,
      slugEn.demoNote,
    ),
    galleryNote: overlayCommonNote(
      config.galleryNote,
      DEFAULT_EXPERIENCE_NOTES.galleryNote,
      commonExperienceCopyEn.galleryNote,
      savedEn.galleryNote,
      slugEn.galleryNote,
    ),
    processNodes: overlayNodes(
      config.processNodes,
      savedEn.processNodes,
      slugEn.processNodes,
      ["label", "summary", "purpose", "stage"],
    ),
    walkthrough: overlayWalk(config.walkthrough, savedEn.walkthrough, slugEn.walkthrough),
    fileHints: overlayHints(config.fileHints, savedEn.fileHints, slugEn.fileHints),
    canvaPageLabels: overlayNodes(config.canvaPageLabels, savedEn.canvaPageLabels, slugEn.canvaPageLabels, ["label"]),
  };

  if (config.timeline || savedEn.timeline || slugEn.timeline) {
    next.timeline = {
      ...config.timeline,
      frames: config.timeline?.frames ?? [],
      demoDisclaimer: overlayField(
        config.timeline?.demoDisclaimer,
        savedEn.timeline?.demoDisclaimer,
        slugEn.timeline?.demoDisclaimer,
      ),
    };
  }
  if (config.spatial || savedEn.spatial || slugEn.spatial) {
    next.spatial = {
      ...config.spatial,
      objects:
        overlayNodes(config.spatial?.objects, savedEn.spatial?.objects, slugEn.spatial?.objects, [
          "label",
          "use",
          "size",
        ]) ??
        config.spatial?.objects ??
        [],
      circulationNote: overlayField(
        config.spatial?.circulationNote,
        savedEn.spatial?.circulationNote,
        slugEn.spatial?.circulationNote,
      ),
      complianceDisclaimer: overlayField(
        config.spatial?.complianceDisclaimer,
        savedEn.spatial?.complianceDisclaimer,
        slugEn.spatial?.complianceDisclaimer,
      ),
    };
  }
  if (config.comparison || savedEn.comparison || slugEn.comparison) {
    next.comparison = {
      ...config.comparison,
      versions: overlayNodes(
        config.comparison?.versions,
        savedEn.comparison?.versions,
        slugEn.comparison?.versions,
        ["label"],
      ),
      seedPins: overlayNodes(
        config.comparison?.seedPins,
        savedEn.comparison?.seedPins,
        slugEn.comparison?.seedPins,
        ["note"],
      ),
      prompt: overlayField(config.comparison?.prompt, savedEn.comparison?.prompt, slugEn.comparison?.prompt),
      estimateDisclaimer: overlayField(
        config.comparison?.estimateDisclaimer,
        savedEn.comparison?.estimateDisclaimer,
        slugEn.comparison?.estimateDisclaimer,
      ),
    };
  }
  if (config.conversation || savedEn.conversation || slugEn.conversation) {
    next.conversation = {
      ...config.conversation,
      disclaimer: overlayField(
        config.conversation?.disclaimer,
        savedEn.conversation?.disclaimer,
        slugEn.conversation?.disclaimer,
      ),
      starter: overlayField(config.conversation?.starter, savedEn.conversation?.starter, slugEn.conversation?.starter),
      placeholder: overlayField(
        config.conversation?.placeholder,
        savedEn.conversation?.placeholder,
        slugEn.conversation?.placeholder,
      ),
      sourceNote: overlayField(
        config.conversation?.sourceNote,
        savedEn.conversation?.sourceNote,
        slugEn.conversation?.sourceNote,
      ),
      replies: overlayReplies(config.conversation?.replies, savedEn.conversation?.replies, slugEn.conversation?.replies),
      suggestions: overlayStringList(
        config.conversation?.suggestions,
        savedEn.conversation?.suggestions,
        slugEn.conversation?.suggestions,
      ),
    };
  }
  return next;
}
