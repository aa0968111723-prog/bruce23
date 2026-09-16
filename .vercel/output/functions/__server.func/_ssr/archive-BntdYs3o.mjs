import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as cn } from "./router-D55OF8cm.mjs";
import { t as MediaFrame } from "./MediaFrame-NA5Zpa73.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/archive-BntdYs3o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var archiveKinds = [
	{
		id: "all",
		label: "全部"
	},
	{
		id: "photography",
		label: "攝影"
	},
	{
		id: "graphic",
		label: "平面"
	},
	{
		id: "event",
		label: "活動"
	},
	{
		id: "club-visual",
		label: "社團文宣"
	},
	{
		id: "interactive",
		label: "現場互動"
	}
];
var archiveItems = [
	{
		id: "landscape-series",
		title: "風景與日出",
		kind: "photography",
		year: "2018–2025",
		summary: "風景、日出與河邊光線。原始檔尚未放到公開 CDN，這裡只用光線方向的視覺轉譯，不冒充原作。",
		media: {
			src: "/media/archive/landscape-translation.jpg",
			alt: "晨霧河岸風景的光線轉譯，不是原作照片",
			kind: "image",
			caption: "視覺轉譯 · 原作待公開媒體層"
		},
		originNote: "原作來自既有作品集攝影分類（風景／日出），本輪不托管大型原始檔。"
	},
	{
		id: "flashmob-813",
		title: "813 正向之光 · 老街快閃",
		kind: "event",
		year: "現場紀錄",
		summary: "街頭音樂快閃：場地、表演者協調到現場執行。畫面為活動氣氛轉譯，未放可識別臉孔的原始活動照。",
		media: {
			src: "/media/archive/event-flashmob.jpg",
			alt: "老街快閃活動的明亮氣氛轉譯",
			kind: "image",
			caption: "現場氣氛轉譯 · 原作待公開媒體層"
		},
		originNote: "事件名稱與職責來自既有作品集 Events 頁，未使用未授權人像。"
	},
	{
		id: "tku-zen-poster",
		title: "淡大禪學社文宣",
		kind: "club-visual",
		year: "Canva",
		summary: "社團識別與活動視覺。縮圖來自 Canva 原作匯出，不是生成圖。",
		media: {
			src: "/media/archive/tku-zen-poster.jpg",
			alt: "淡大禪學社文宣原作縮圖",
			kind: "image",
			caption: "Canva 原作縮圖"
		},
		originNote: "來源：Canva 設計「淡大禪學社」。"
	},
	{
		id: "tku-zen-brand-deck",
		title: "淡大禪學社 TKU Zen",
		kind: "club-visual",
		year: "Canva",
		summary: "簡報首頁視覺，用於社團敘事與活動說明。",
		media: {
			src: "/media/archive/tku-zen-brand.jpg",
			alt: "淡大禪學社 TKU Zen 簡報首頁",
			kind: "image",
			caption: "Canva 原作縮圖"
		},
		originNote: "來源：Canva 簡報「淡大禪學社 TKU Zen」。"
	},
	{
		id: "tku-zen-page2",
		title: "禪學社活動頁",
		kind: "social",
		year: "Canva",
		summary: "同一份簡報的內頁，保留為社群與活動敘事素材。",
		media: {
			src: "/media/archive/tku-zen-page2.jpg",
			alt: "禪學社活動簡報內頁",
			kind: "image",
			caption: "Canva 原作縮圖"
		},
		originNote: "來源：同一 Canva 簡報第 2 頁。"
	},
	{
		id: "leader-quiz",
		title: "探索你的領袖特質",
		kind: "interactive",
		year: "2026",
		summary: "社博現場 10 題情境，算出遠見／同理／決策／應變傾向。這是互動探索，不是正式心理測驗。",
		media: {
			src: "/media/archive/booth-quiz.jpg",
			alt: "社博攤位平板與四維雷達圖的現場氣氛",
			kind: "image",
			caption: "現場氣氛轉譯"
		},
		href: "https://github.com/aa0968111723-prog/urban-green-rose-pixel",
		originNote: "公開 repo urban-green-rose-pixel。本站不收集、不展示電話或抽獎個資。"
	},
	{
		id: "stroop-challenge",
		title: "60 秒專注力挑戰",
		kind: "interactive",
		year: "2026",
		summary: "社博 stroop 挑戰：掃碼、遊玩、看稱號。排行榜只顯示姓名／系級／分數，本站不放任何成績資料。",
		href: "https://github.com/aa0968111723-prog/ever-marble-flora-clover",
		originNote: "公開 repo ever-marble-flora-clover。"
	},
	{
		id: "graphic-portfolio",
		title: "平面設計作品集",
		kind: "graphic",
		year: "2025",
		summary: "Google 簡報形式的平面作品整理。原檔留在 Drive，本站不公開整個資料夾。",
		originNote: "Drive 檔案「平面設計作品集」僅作來源索引，未把內部資料夾公開。"
	}
];
function Archive() {
	const [kind, setKind] = (0, import_react.useState)("all");
	const visible = (0, import_react.useMemo)(() => {
		if (kind === "all") return archiveItems;
		if (kind === "graphic") return archiveItems.filter((item) => item.kind === "graphic" || item.kind === "social");
		return archiveItems.filter((item) => item.kind === kind);
	}, [kind]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-6xl px-4 py-14 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl font-semibold",
				children: "Archive"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-muted",
				children: "攝影、平面、活動、社團文宣與招生活動互動。原始大檔與私人 Drive 資料夾不公開；能放原作縮圖的會標示來源。"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 flex gap-2 overflow-x-auto pb-2",
				role: "tablist",
				"aria-label": "Archive 分類",
				children: archiveKinds.map((item) => {
					const active = item.id === kind;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						role: "tab",
						"aria-selected": active,
						className: cn("inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium", active ? "bg-ink text-bg" : "bg-surface text-muted shadow-card"),
						onClick: () => setKind(item.id),
						children: item.label
					}, item.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
				children: visible.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "overflow-hidden rounded-2xl bg-surface shadow-card",
					children: [item.media ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "aspect-[4/3] overflow-hidden bg-surface-blue",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaFrame, { media: item.media })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex aspect-[4/3] items-center justify-center bg-surface-mint px-6 text-center text-sm text-muted",
						children: "原件在私人來源，尚未放入公開媒體層"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-wide text-muted",
								children: item.year
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 font-display text-xl font-semibold",
								children: item.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted",
								children: item.summary
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs text-muted",
								children: item.originNote
							}),
							item.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: item.href,
								className: "mt-3 inline-flex min-h-11 items-center text-sm font-medium text-mint-deep",
								rel: "noreferrer",
								target: "_blank",
								children: "GitHub"
							}) : null
						]
					})]
				}, item.id))
			})
		]
	});
}
//#endregion
export { Archive as component };
