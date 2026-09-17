import type { ArchiveItem } from "./types.ts";

export const archiveKinds = [
  { id: "all", label: "全部" },
  { id: "photography", label: "攝影" },
  { id: "graphic", label: "平面" },
  { id: "event", label: "活動" },
  { id: "club-visual", label: "社團文宣" },
  { id: "interactive", label: "現場互動" },
] as const;

export const archiveItems: ArchiveItem[] = [
  {
    id: "landscape-series",
    title: "風景與日出",
    kind: "photography",
    year: "2018–2025",
    summary: "風景、日出與河邊光線。這裡是光線方向的 SVG 轉譯，不是原作照片，也不是 Canva 嵌入。",
    media: {
      src: "/media/archive/landscape-translation.svg",
      alt: "晨霧河岸風景的光線轉譯，不是原作照片，也不是 Canva 嵌入",
      kind: "image",
      caption: "SVG 轉譯 · 不是原作照片",
    },
    originNote: "原作來自既有作品集攝影分類（風景／日出），本輪不托管大型原始檔，也沒有公開嵌入。",
  },
  {
    id: "flashmob-813",
    title: "813 正向之光 · 老街快閃",
    kind: "event",
    year: "現場紀錄",
    summary: "街頭音樂快閃：場地、表演者協調到現場執行。畫面為活動氣氛的 SVG 轉譯，不是原作照片，也不是 Canva 嵌入。",
    media: {
      src: "/media/archive/event-flashmob.svg",
      alt: "老街快閃活動的明亮氣氛轉譯，不是原作照片",
      kind: "image",
      caption: "SVG 轉譯 · 不是原作照片",
    },
    originNote: "事件名稱與職責來自既有作品集 Events 頁，未使用未授權人像，也沒有公開嵌入。",
  },
  {
    id: "tku-zen-poster",
    title: "淡大禪學社文宣",
    kind: "club-visual",
    year: "Canva",
    summary: "社團識別與活動視覺。本站是本地 SVG 轉譯，不是 Canva 嵌入、也不能翻頁。",
    media: {
      src: "/media/archive/tku-zen-poster.svg",
      alt: "淡大禪學社文宣的本地 SVG 轉譯，不是公開嵌入",
      kind: "image",
      caption: "本地 SVG 轉譯 · 尚未提供分享連結",
    },
    originNote: "原作在 Canva 設計「淡大禪學社」。沒有公開分享連結，所以不嵌入、也不能翻頁。",
  },
  {
    id: "tku-zen-brand-deck",
    title: "淡大禪學社 TKU Zen",
    kind: "club-visual",
    year: "Canva",
    summary: "簡報首頁視覺，用於社團敘事與活動說明。本站是本地 SVG 轉譯，沒有公開分享連結，所以不能翻頁。",
    media: {
      src: "/media/archive/tku-zen-brand.svg",
      alt: "淡大禪學社 TKU Zen 簡報首頁的本地 SVG 轉譯",
      kind: "image",
      caption: "本地 SVG 轉譯 · 尚未提供分享連結",
    },
    originNote: "原作在 Canva 簡報「淡大禪學社 TKU Zen」。沒有公開分享連結，所以不嵌入、也不能翻頁。",
  },
  {
    id: "tku-zen-page2",
    title: "禪學社活動頁",
    kind: "social",
    year: "Canva",
    summary: "同一份簡報的內頁。本站是本地 SVG 轉譯，沒有公開分享連結，所以不能翻頁。",
    media: {
      src: "/media/archive/tku-zen-page2.svg",
      alt: "禪學社活動簡報內頁的本地 SVG 轉譯",
      kind: "image",
      caption: "本地 SVG 轉譯 · 尚未提供分享連結",
    },
    originNote: "原作在同一 Canva 簡報第 2 頁。沒有公開分享連結，所以不嵌入、也不能翻頁。",
  },
  {
    id: "leader-quiz",
    title: "探索你的領袖特質",
    kind: "interactive",
    year: "2026",
    summary:
      "社博現場 10 題情境，算出遠見／同理／決策／應變傾向。這是互動探索，不是正式心理測驗。畫面為 SVG 轉譯，不是 Canva 嵌入。",
    media: {
      src: "/media/archive/booth-quiz.svg",
      alt: "社博攤位平板與四維雷達圖的現場氣氛轉譯，不是 Canva 嵌入",
      kind: "image",
      caption: "SVG 轉譯 · 現場氣氛",
    },
    href: "https://github.com/aa0968111723-prog/urban-green-rose-pixel",
    originNote: "公開 repo urban-green-rose-pixel。本站不收集、不展示電話或抽獎個資。",
  },
  {
    id: "stroop-challenge",
    title: "60 秒專注力挑戰",
    kind: "interactive",
    year: "2026",
    summary:
      "社博 stroop 挑戰：掃碼、遊玩、看稱號。排行榜只顯示姓名／系級／分數。本站畫面不是現場成績截圖，也不是 Canva。",
    media: {
      src: "/media/archive/stroop-challenge.svg",
      alt: "社博 stroop 挑戰的光線轉譯，不是現場成績截圖，也不是 Canva",
      kind: "image",
      caption: "SVG 轉譯 · 不是現場成績截圖",
    },
    href: "https://github.com/aa0968111723-prog/ever-marble-flora-clover",
    originNote: "公開 repo ever-marble-flora-clover。本站不放任何成績資料。",
  },
  {
    id: "graphic-portfolio",
    title: "平面設計作品集",
    kind: "graphic",
    year: "2025",
    summary: "Google 簡報形式的平面作品整理。這裡是 SVG 轉譯，不是原作掃描，也不是 Canva 嵌入。",
    media: {
      src: "/media/archive/graphic-portfolio.svg",
      alt: "平面作品集的紙面與色票轉譯，不是原作掃描，也不是 Canva 嵌入",
      kind: "image",
      caption: "SVG 轉譯 · 不是原作掃描",
    },
    originNote: "Drive 檔案「平面設計作品集」僅作來源索引，未把內部資料夾公開，也沒有公開嵌入。",
  },
];
