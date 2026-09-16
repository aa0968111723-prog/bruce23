import type { LocaleCopy } from "../cms/schema.ts";
import type { PublicProject } from "../cms/privacy.ts";

export const VIEWER_LANGS = ["zh", "en"] as const;
export type ViewerLang = (typeof VIEWER_LANGS)[number];

/** Preference only. CMS copy stays in Postgres. */
export const VIEWER_LANG_STORAGE_KEY = "luminous-studio-lang";

export function parseViewerLang(value: unknown): ViewerLang {
  return value === "en" ? "en" : "zh";
}

export function readStoredViewerLang(): ViewerLang {
  if (typeof window === "undefined") return "zh";
  try {
    return parseViewerLang(window.localStorage.getItem(VIEWER_LANG_STORAGE_KEY));
  } catch {
    return "zh";
  }
}

export function writeStoredViewerLang(lang: ViewerLang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VIEWER_LANG_STORAGE_KEY, lang);
  } catch {
    /* quota / private mode */
  }
}

type LocaleBag = { zh?: Record<string, unknown>; en?: Record<string, unknown> };

function trimCopy(copy: LocaleCopy | Record<string, unknown> | undefined, key: string): string {
  const value = copy ? (copy as Record<string, unknown>)[key] : undefined;
  return typeof value === "string" ? value.trim() : "";
}

export function localeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

/** en uses saved overlay then zh; zh stays on zh/row and does not pull en. */
export function pickLocaleField(
  lang: ViewerLang,
  locale: LocaleBag | PublicProject["locale"] | undefined,
  key: string,
  row: string | null | undefined,
  fallback = "",
): string {
  const zh = trimCopy(locale?.zh, key);
  const en = trimCopy(locale?.en, key);
  const base = typeof row === "string" ? row.trim() : "";
  if (lang === "en") return en || zh || base || fallback;
  return zh || base || fallback;
}

/** en uses saved list overlay then zh; zh stays on zh/row and does not pull en. */
export function pickLocaleList(
  lang: ViewerLang,
  locale: LocaleBag | PublicProject["locale"] | undefined,
  key: string,
  row: string[] | null | undefined,
): string[] {
  const zh = localeStringList(locale?.zh ? (locale.zh as Record<string, unknown>)[key] : undefined);
  const en = localeStringList(locale?.en ? (locale.en as Record<string, unknown>)[key] : undefined);
  const base = localeStringList(row);
  if (lang === "en") return en.length ? en : zh.length ? zh : base;
  return zh.length ? zh : base;
}

export function overlayProject(project: PublicProject, lang: ViewerLang): PublicProject {
  if (lang === "zh") return project;
  const locale = project.locale ?? {};
  const pick = (key: keyof LocaleCopy, current: string) =>
    pickLocaleField(lang, locale, key, current, current);
  return {
    ...project,
    title: pick("title", project.title),
    subtitle: pick("subtitle", project.subtitle),
    summary: pick("summary", project.summary),
    problem: pick("problem", project.problem),
    role: pick("role", project.role),
    seoTitle: pickLocaleField(lang, locale, "seoTitle", project.seoTitle ?? "") || project.seoTitle,
    seoDescription:
      pickLocaleField(lang, locale, "seoDescription", project.seoDescription ?? "") || project.seoDescription,
    decisions: pickLocaleList(lang, locale, "decisions", project.decisions),
    process: pickLocaleList(lang, locale, "process", project.process),
    outputs: pickLocaleList(lang, locale, "outputs", project.outputs),
    limitations: pickLocaleList(lang, locale, "limitations", project.limitations),
    modalities: pickLocaleList(lang, locale, "modalities", project.modalities),
    stack: pickLocaleList(lang, locale, "stack", project.stack),
  };
}

export function overlayArchive<T extends {
  title: string;
  summary: string;
  originNote: string;
  media: { alt: string; caption?: string; src: string; kind: "image" | "video"; poster?: string } | null;
  canva: { alt?: string | null; caption?: string | null };
  locale?: { zh?: Record<string, unknown>; en?: Record<string, unknown> };
}>(item: T, lang: ViewerLang): T {
  if (lang === "zh") return item;
  const locale = item.locale ?? {};
  const title = pickLocaleField(lang, locale, "title", item.title, item.title);
  const summary = pickLocaleField(lang, locale, "summary", item.summary, item.summary);
  const originNote = pickLocaleField(lang, locale, "originNote", item.originNote, item.originNote);
  const caption = pickLocaleField(
    lang,
    locale,
    "caption",
    item.media?.caption ?? item.canva.caption ?? "",
    item.media?.caption ?? item.canva.caption ?? "",
  );
  const alt = pickLocaleField(
    lang,
    locale,
    "alt",
    item.media?.alt ?? item.canva.alt ?? "",
    item.media?.alt ?? item.canva.alt ?? "",
  );
  return {
    ...item,
    title,
    summary,
    originNote,
    media: item.media
      ? { ...item.media, caption: caption || item.media.caption, alt: alt || item.media.alt }
      : item.media,
    canva: {
      ...item.canva,
      caption: caption || item.canva.caption,
      alt: alt || item.canva.alt,
    },
  };
}

export const chrome = {
  zh: {
    skip: "跳到內容",
    language: "語系",
    navHome: "首頁",
    navWork: "作品",
    navArchive: "Archive",
    navAbout: "關於",
    navPrivacy: "隱私",
    navLabel: "主要",
    mobileNav: "行動",
    menuOpen: "開啟選單",
    menuClose: "關閉選單",
    seeWorks: "看精選作品",
    aboutCta: "關於定位",
    featured: "精選作品",
    featuredNote: "只放已發布作品。狀態按真實進度標示。",
    allWorks: "全部作品",
    processTitle: "AI 創作流程",
    processLead: "先現場、再模態、再工具，最後問能不能被使用。",
    publicIntro: "公開簡介",
    publicIntroBody: "GitHub 是專案真實性來源。本站不放電話、住址或內部帳號。",
    heroCaption: "作品像漂在光場裡的展品。點下方節點即可操作。",
    heroAlt: "光域 AI 創作實驗室：晨光中漂浮的玻璃展品卡片",
    modalitiesAlt: "多模態節點：文字、圖像、影片、聲音、空間與互動",
    explorationTitle: "可操作的能力地圖",
    explorationBody:
      "約兩成畫面用來畫作品真正接到的模態。其餘八成是可讀的列表與卡片，不是裝飾粒子，也不用拖曳才能找到作品。",
    explorationAria: "作品與模態",
    constellationTitle: "作品與模態星圖",
    constellationAria: "作品與模態的空間關係",
    workNodes: "作品節點",
    all: "全部",
    workTitle: "作品總覽",
    workLead: "只列出已發布作品。分類可篩選，狀態沒有寫成已完成的，就還不是已完成。",
    workCats: "作品分類",
    workEmpty: "這個分類目前沒有公開作品。",
    workSeoTitle: "作品總覽 · 柏能",
    caseBack: "作品總覽",
    caseSummary: "一句話",
    caseEvidence: "來源與證據",
    caseOriginal: "Canva 原作",
    caseProblem: "問題",
    caseRole: "我的角色",
    caseDecisions: "設計決策",
    caseModalities: "AI 使用方式 / 多模態",
    caseProcess: "流程",
    caseOutputs: "產出",
    caseStack: "技術",
    caseLimits: "限制與尚未完成",
    caseOthers: "其他作品",
    caseView: "看個案",
    aboutTitle: "關於我",
    aboutIam: "我是",
    aboutPosition: "公開定位",
    aboutAudience:
      "目標觀眾是 AI 產品團隊、設計主管、多模態創作者與合作夥伴。這個網站要讓人快速看出我正在做什麼、解決什麼、AI 扮演什麼角色，以及作品能不能被使用。",
    aboutWhy: "為什麼這樣做",
    aboutWhyBody:
      "從活動現場、平面與攝影走到 AI 產品，問題從來不是「會不會生成」，而是如何把文字、圖像、影片、聲音、3D 與互動編成一條別人真的走得完的工作流。",
    aboutBeliefs: "核心信念",
    aboutWork: "公開工作面向",
    aboutContact: "聯絡",
    aboutContactNote: "只提供已公開的 GitHub 與 Email。不會在這裡放電話、住址或內部社團資料。",
    mail: "寄信",
    seeWork: "看作品",
    archiveTitle: "Archive",
    archiveLead:
      "攝影、平面、活動、社團文宣與招生活動互動。私人 Drive 不公開。目前沒有公開的 Canva 分享網址，所以沒有嵌入、也不能翻頁；有圖的是本地轉譯或匯出縮圖。",
    archiveCats: "Archive 分類",
    archiveEmbedNote: "公開嵌入模式 · 尚未提供分享連結",
    archiveEmptyMedia: "原件在私人來源，尚未放入公開媒體層",
    footerNav: "導覽",
    footerContact: "公開聯絡",
    footerLight: "亮色光域 · 不作深色模式。",
    privacyTitle: "隱私與公開範圍",
    privacyLead: "這是公開作品集，不是履歷資料庫，也不是後台儀表板。訪客看到的只有已發布列。",
    privacyPublic: "會公開的",
    privacyHidden: "不會公開的",
    privacyLogin: "登入",
    privacyLoginBody: "後台只用 Google，且必須在允許名單。未登入者看不到草稿。沒有密碼登入，也沒有公開的 session 鑄造路徑。",
    homeBack: "回首頁",
    privacyPublicItems: [
      "已發布作品的中文敘事、狀態、媒體與來源連結。",
      "公開 GitHub 儲存庫的 metadata、有限檔案樹與 README 摘要。",
      "已驗證可嵌入的 Demo，或開新分頁的公開網址。",
      "Canva 只在有公開 /design/{id} 時嵌入。沒有就放縮圖與「開啟原作」，不放空白 iframe。",
      "已公開的 Email 與 GitHub 帳號。",
    ],
    privacyHiddenItems: [
      "電話、住址、私人履歷細節、內部社團名冊。",
      "Google Drive 資料夾、原始大檔影片、未授權人像。",
      "GitHub、Canva、Notion 的 token、client secret 或 service role。",
      "草稿、封存列、後台修訂快照、整合密文。",
    ],
    notFoundKicker: "找不到這一頁",
    notFoundTitle: "這頁還沒被放進光域",
    notFoundBody: "連結可能打錯，或內容還在下一輪。回到首頁或作品總覽。",
    hub: {
      image: "圖像",
      video: "影片",
      space: "空間",
      poster: "文宣",
      interactive: "互動",
    },
    archiveKind: {
      all: "全部",
      photography: "攝影",
      graphic: "平面",
      event: "活動",
      "club-visual": "社團文宣",
      interactive: "現場互動",
    },
    productStatus: {
      completed: "已完成",
      "in-progress": "開發中",
      prototype: "原型",
      concept: "概念驗證",
      planned: "規劃中",
    },
    process: [
      { n: "01", title: "釐清真實問題", body: "先對現場：社團文宣、教室場佈、逐幀動畫或協作審稿，而不是先選模型。" },
      { n: "02", title: "編排多模態", body: "文字、圖像、影片、聲音、3D 與互動各自負責什麼，先畫清楚再進工具。" },
      { n: "03", title: "讓 AI 做它能驗證的事", body: "像素運算、結構化解析、MCP 工具、生成候選。模型沒接上就標示不可用，不給假分數。" },
      { n: "04", title: "回到現場驗證", body: "手機、教室、LINE 分享、夥伴是否 10 秒看懂。能用才算完成，不是畫面好看。" },
    ],
    beliefs: [
      "人的意圖是起點，AI 是可驗證的加速器，不是自動完成的導演。",
      "沒接上的模型要寫「不可用」，不要給假分數或假成效。",
      "跨媒介經驗要能回到現場：教室、LINE、手機、社團文宣。",
      "作品集只放整理過的公開敘事。",
    ],
    publicWork: [
      "AI 產品與創作作業系統",
      "逐幀動畫與視覺 AI 工具",
      "空間場佈與 3D 彩排",
      "文宣對稿與設計編輯器",
      "校園現場互動體驗",
      "平面、攝影與活動紀錄（Archive）",
    ],
  },
  en: {
    skip: "Skip to content",
    language: "Language",
    navHome: "Home",
    navWork: "Work",
    navArchive: "Archive",
    navAbout: "About",
    navPrivacy: "Privacy",
    navLabel: "Primary",
    mobileNav: "Mobile",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    seeWorks: "Selected work",
    aboutCta: "About",
    featured: "Selected work",
    featuredNote: "Published work only. Status follows real progress.",
    allWorks: "All work",
    processTitle: "How AI shows up",
    processLead: "Start from the site, then modality, then tools, then whether someone can actually use it.",
    publicIntro: "Public notes",
    publicIntroBody: "GitHub is the source of project truth. This site does not publish phone numbers, addresses, or internal accounts.",
    heroCaption: "Works sit in the light field like exhibits. Tap a node below.",
    heroAlt: "Luminous AI studio: glass exhibit cards floating in morning light",
    modalitiesAlt: "Modality nodes: text, image, video, sound, space, and interaction",
    explorationTitle: "A map you can operate",
    explorationBody:
      "About a fifth of the screen shows the modalities a work actually uses. The rest is a readable list and cards — not decorative particles, and you do not have to drag to find a work.",
    explorationAria: "Works and modalities",
    constellationTitle: "Works and modalities",
    constellationAria: "Spatial relation of works and modalities",
    workNodes: "Work nodes",
    all: "All",
    workTitle: "Work",
    workLead: "Published work only. Filters do not mark a piece complete unless its status says so.",
    workCats: "Work categories",
    workEmpty: "Nothing public in this category yet.",
    workSeoTitle: "Work · Luminous Studio",
    caseBack: "All work",
    caseSummary: "In one line",
    caseEvidence: "Sources",
    caseOriginal: "Canva original",
    caseProblem: "Problem",
    caseRole: "My role",
    caseDecisions: "Decisions",
    caseModalities: "How AI / modalities were used",
    caseProcess: "Process",
    caseOutputs: "Outputs",
    caseStack: "Stack",
    caseLimits: "Limits and unfinished work",
    caseOthers: "Other work",
    caseView: "Case study",
    aboutTitle: "About",
    aboutIam: "I am",
    aboutPosition: "Public position",
    aboutAudience:
      "This site is for AI product teams, design leads, multimodal makers, and partners. It should make it quick to see what I am building, what it solves, where AI sits, and whether the work can be used.",
    aboutWhy: "Why this way",
    aboutWhyBody:
      "From live events, print, and photography into AI products, the question was never only whether something can generate — it is how text, image, video, sound, 3D, and interaction become a path someone else can finish.",
    aboutBeliefs: "Beliefs",
    aboutWork: "Public work",
    aboutContact: "Contact",
    aboutContactNote: "Only the public GitHub and email. No phone, address, or internal club lists here.",
    mail: "Email",
    seeWork: "See work",
    archiveTitle: "Archive",
    archiveLead:
      "Photography, graphics, events, club print, and on-site interaction. Private Drive stays private. There is no public Canva share URL, so nothing embeds or pages; images here are local translations or export thumbs.",
    archiveCats: "Archive categories",
    archiveEmbedNote: "Public embed mode · no share URL yet",
    archiveEmptyMedia: "The original is in a private source and is not on the public media layer yet",
    footerNav: "Nav",
    footerContact: "Public contact",
    footerLight: "Light studio · no dark mode.",
    privacyTitle: "Privacy and what is public",
    privacyLead: "This is a public portfolio, not a résumé dump or an admin dashboard. Visitors only see published rows.",
    privacyPublic: "What is public",
    privacyHidden: "What stays private",
    privacyLogin: "Sign-in",
    privacyLoginBody: "Admin is Google-only and allowlisted. Unsigned visitors never see drafts. There is no password login and no public session mint.",
    homeBack: "Home",
    privacyPublicItems: [
      "Published work narrative, status, media, and source links.",
      "Public GitHub metadata, a limited file tree, and README excerpts.",
      "Demos that verified as embeddable, or public URLs that open in a new tab.",
      "Canva embeds only when a public /design/{id} exists. Otherwise a thumb and “open original” — never an empty iframe.",
      "The public email and GitHub account.",
    ],
    privacyHiddenItems: [
      "Phone numbers, addresses, private résumé detail, internal club lists.",
      "Google Drive folders, original large videos, unauthorized portraits.",
      "GitHub, Canva, or Notion tokens, client secrets, or service roles.",
      "Drafts, archived rows, admin revisions, integration secrets.",
    ],
    notFoundKicker: "Page not found",
    notFoundTitle: "This page is not in the light field yet",
    notFoundBody: "The link may be wrong, or the piece is still in a later pass. Back to home or work.",
    hub: {
      image: "Image",
      video: "Video",
      space: "Space",
      poster: "Print",
      interactive: "Play",
    },
    archiveKind: {
      all: "All",
      photography: "Photo",
      graphic: "Graphic",
      event: "Event",
      "club-visual": "Club print",
      interactive: "On-site",
    },
    productStatus: {
      completed: "Shipped",
      "in-progress": "In progress",
      prototype: "Prototype",
      concept: "Concept",
      planned: "Planned",
    },
    process: [
      { n: "01", title: "Name the real problem", body: "Start from the room: club print, classroom layout, frame-by-frame, or review — not from a model pick." },
      { n: "02", title: "Score the modalities", body: "Decide what text, image, video, sound, 3D, and interaction each own before opening tools." },
      { n: "03", title: "Let AI do what you can check", body: "Pixels, structured parse, MCP tools, generated candidates. If a model is not wired, mark it unavailable — no fake scores." },
      { n: "04", title: "Prove it on site", body: "Phone, classroom, LINE share, whether a partner gets it in ten seconds. Usable is done; pretty is not." },
    ],
    beliefs: [
      "Human intent is the start. AI is a checkable accelerator, not an autopilot director.",
      "An unwired model is written unavailable — no fake scores or fake outcomes.",
      "Cross-media work has to return to the room: classroom, LINE, phone, club print.",
      "The portfolio only publishes edited public narrative.",
    ],
    publicWork: [
      "AI products and creative operating systems",
      "Frame-by-frame and visual AI tools",
      "Spatial layout and 3D rehearsal",
      "Print review and design editors",
      "On-campus interactive work",
      "Print, photography, and event records (Archive)",
    ],
  },
} as const;

export type ChromeCopy = (typeof chrome)[ViewerLang];

export function chromeFor(lang: ViewerLang): ChromeCopy {
  return chrome[lang];
}

export function chromeHub(ui: ChromeCopy, id: string): string {
  return (ui.hub as Record<string, string>)[id] ?? id;
}

export function chromeArchiveKind(ui: ChromeCopy, id: string): string {
  return (ui.archiveKind as Record<string, string>)[id] ?? id;
}

export const publicNav = [
  { to: "/", key: "navHome" },
  { to: "/work", key: "navWork" },
  { to: "/archive", key: "navArchive" },
  { to: "/about", key: "navAbout" },
  { to: "/privacy", key: "navPrivacy" },
] as const;
