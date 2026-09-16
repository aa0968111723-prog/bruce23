import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, _ as createRootRoute, b as require_jsx_runtime, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useRouter, z as notFound } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Mail, n as TriangleAlert, r as Menu, s as Github, t as X } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects-B00uUehD.js
var vis = "工作室視覺轉譯，不是產品截圖。";
var statusLabel = {
	completed: "已完成",
	"in-progress": "開發中",
	prototype: "原型",
	concept: "概念驗證",
	planned: "規劃中"
};
var projects = [
	{
		slug: "ai-director-os",
		title: "AI Director OS",
		subtitle: "團隊向的 AI 創作與協作作業系統",
		category: "AI Product",
		year: "2026",
		status: "in-progress",
		featured: true,
		summary: "專案、素材、生成、分鏡、審批與交付放在同一套作業系統裡，讓世界觀與角色卡自動進入生成，而不是反覆貼提示詞。",
		problem: "多模態創作一拆成圖、影、音、分鏡與審核，上下文就斷掉。團隊需要的是能協作、能審批、能交付的作業系統，不是單次生成頁。",
		role: "產品建構者 / AI Director：定義世界觀注入、生成台、審批與交付流程。",
		decisions: [
			"可行實用優先，供應商只接 Fal.ai；沒有金鑰時進入假生成模式，用來測完整流程而不是假裝已生成。",
			"世界觀、角色與素材庫自動帶進提示詞，減少複製貼上。",
			"先扣點數預估、失敗退回；外部引文只當草稿，重要內容需組長審核。",
			"MCP 使用可撤銷、可到期、綁定個人的連線金鑰，不用共用超管金鑰當正式站預設。"
		],
		modalities: [
			"文字",
			"圖像",
			"影片",
			"音訊",
			"審批流程"
		],
		process: [
			"建立專案與世界觀快速層",
			"多模態生成（圖／影／音／文字）並自動入素材庫",
			"分鏡排序、短影音母版複製",
			"組長審批三態機",
			"匯出時間軸與素材包給剪輯軟體"
		],
		outputs: [
			"公開儲存庫 ai_os（創作系統）",
			"前身 Healing Studio 多模態工作室",
			"交付包：視頻／圖像／腳本鏡頭表與 FCP／Premiere 時間軸"
		],
		stack: [
			"React",
			"Express",
			"tRPC",
			"Drizzle",
			"Postgres",
			"Fal.ai",
			"MCP"
		],
		limitations: [
			"素材知識庫（RAG）尚未完成。",
			"資料庫層 RLS 第二道隔離尚未完成。",
			"公開部署網址狀態會隨環境變動，不在此宣稱穩定 SLA 或使用者數。",
			"開發期假身分與種子帳號不會出現在本站。"
		],
		links: {
			github: "https://github.com/aa0968111723-prog/ai_os",
			live: "https://ai-os-ten.vercel.app"
		},
		media: [{
			src: "/media/covers/ai-director-os.jpg",
			alt: "AI Director OS 光域工作室視覺：玻璃控制台與分鏡卡片漂在晨光中",
			kind: "image",
			caption: vis
		}],
		sourceReferences: [{
			label: "GitHub README · ai_os",
			href: "https://github.com/aa0968111723-prog/ai_os",
			note: "功能完成項與未完成項直接取自 README 路線圖。"
		}, {
			label: "GitHub · healing-studio",
			href: "https://github.com/aa0968111723-prog/healing-studio",
			note: "多模態工作室前身，描述取自公開 repo description。"
		}],
		visibility: "public"
	},
	{
		slug: "framelab",
		title: "FrameLab",
		subtitle: "視覺優先的 AI 逐幀動畫工作站",
		category: "Multimodal",
		year: "2026",
		status: "prototype",
		featured: true,
		summary: "不是剪輯軟體，也不是通用影片分析站。核心是 Frame Graph、時間軸、Context Engine、對話與 MCP，讓壞幀只修壞幀。",
		problem: "動畫問題是局部的。F122 接觸點斷了，不該重產 F100–F200。需要看得到手跳、看得到 onion skin，而不是一個 0.72 的 JSON 分數。",
		role: "互動體驗與工具設計：工作站視覺中心、時間軸、修復迴路與 MCP 指令層。",
		decisions: [
			"每個 frame 是圖節點：類型、鄰居、角色、運動、修訂。",
			"Inbetween 先給 Motion Plan，再用 linear-blend 產生候選，只重產壞幀。",
			"Wan / RIFE 等 GPU 適配器未載入時回報 PROVIDER_NOT_AVAILABLE，不給假深度或假姿勢。",
			"UI、REST、MCP 都走同一套 application commands。"
		],
		modalities: [
			"影像序列",
			"時間軸",
			"姿勢殘影",
			"對話",
			"MCP"
		],
		process: [
			"匯入影片或圖序",
			"時間軸標記 key / breakdown / generated",
			"onion skin、pose ghost、motion path",
			"框選區域後 Ask / Repair",
			"Accept 候選或只重產問題窗"
		],
		outputs: [
			"可跑的工作站 UI 與 REST / MCP",
			"像素指標（MAE、histogram、luma flicker）",
			"CPU 模式可用的 linear-blend inbetween"
		],
		stack: [
			"TanStack Start",
			"TypeScript",
			"Postgres / PGLite",
			"FFmpeg",
			"MCP"
		],
		limitations: [
			"SAM 2、RTMPose、SEA-RAFT、RIFE、Wan 僅適配器，模型未註冊時不可用。",
			"不是 NLE，也不輸出完整製片管線。",
			"Grok vision 需 XAI_API_KEY，且僅使用者主動送出的幀。"
		],
		links: { github: "https://github.com/aa0968111723-prog/FrameLab" },
		media: [{
			src: "/media/covers/framelab.jpg",
			alt: "FrameLab 視覺：明亮畫布上的 onion skin 彈跳球與時間軸",
			kind: "image",
			caption: vis
		}],
		sourceReferences: [{
			label: "GitHub README · FrameLab",
			href: "https://github.com/aa0968111723-prog/FrameLab",
			note: "能力邊界與模型表直接取自公開 README。"
		}],
		visibility: "public"
	},
	{
		slug: "poster-vision-ai",
		title: "Poster Vision AI",
		subtitle: "文宣視覺檢測中心",
		category: "Visual AI",
		year: "2026",
		status: "prototype",
		featured: true,
		summary: "上傳海報後，用真實像素運算加上可選的 Grok Vision，推估人物與標題比重，並給帶數字的修改建議。視線與熱圖一律標示為 AI 推估。",
		problem: "社團與活動文宣常常「自己覺得很大」，印出來或縮成 IG 縮圖才發現主標看不見。需要可執行的修改建議，而不是空泛美學評語。",
		role: "視覺 AI 產品設計：檢測流程、目的計分、前後比較與回饋紀錄。",
		decisions: [
			"面積、顯著性、對比、構圖用像素運算；語意／OCR 才走視覺模型。",
			"熱圖與第一眼標記明確寫成推估，不是眼動儀。",
			"分數當次計算，模型失敗寫入 degraded[]，不假裝成功。",
			"預設不永久保存原圖。"
		],
		modalities: [
			"圖像",
			"熱圖",
			"OCR",
			"修改建議"
		],
		process: [
			"上傳海報並選擇文宣目的",
			"幾何引擎偵測元素與文字區",
			"可選語意標籤",
			"輸出問題與建議",
			"修改前後比較與回饋"
		],
		outputs: ["分析 JSON：元素、面積比、可讀性、手機縮圖指標", "REST API 供後續系統接入"],
		stack: [
			"TanStack Start",
			"Python OpenCV",
			"YuNet",
			"Grok Vision",
			"SQLite"
		],
		limitations: [
			"熱圖不是真實眼動追蹤。",
			"第一版回饋只存資料庫，尚未自我訓練。",
			"沒有 API key 時 OCR 降級為文字區域框。",
			"Vercel 若無 Python 會改用 JS 顯著性引擎。"
		],
		links: { github: "https://github.com/aa0968111723-prog/poster-vision-ai" },
		media: [{
			src: "/media/covers/poster-vision-ai.jpg",
			alt: "Poster Vision AI 視覺：海報上的柔和熱圖與構圖引導",
			kind: "image",
			caption: vis
		}],
		sourceReferences: [{
			label: "GitHub README · poster-vision-ai",
			href: "https://github.com/aa0968111723-prog/poster-vision-ai",
			note: "功能與限制原文來自 README。"
		}],
		visibility: "public"
	},
	{
		slug: "planform",
		title: "PLANFORM",
		subtitle: "活動空間彩排 · 3D 等角場佈",
		category: "Spatial Design",
		year: "2026",
		status: "in-progress",
		featured: true,
		summary: "先排好，再上場。把教室、道具、人流與互動在場前彩排完，再把場刊圖交給夥伴。可安裝 PWA，不上架商店。",
		problem: "淡江教室與禪學社茶會／演講／新生場，現場才發現報到桌擋門、地墊不夠走道。需要不用 CAD 的場佈工具。",
		role: "空間體驗設計與產品建構：預設模板、動線、人流模擬與分享圖。",
		decisions: [
			"Preset-first，但一切可自訂。一場活動一份專案，不會互相覆蓋。",
			"AI 只負責理解句子與目標；座標、碰撞、走道、容量由程式計算。",
			"沒有雲端金鑰時，本機結構化解析器仍可用，結果可重現。",
			"涉及消防或無障礙的條目只顯示設計提醒，程式禁止寫「已符合所有法規」。"
		],
		modalities: [
			"3D",
			"平面圖",
			"動線",
			"物資清單",
			"自然語言"
		],
		process: [
			"選教室模板與人數",
			"排地墊與區域",
			"畫動線",
			"本地 DES 模擬排隊",
			"分享場刊圖與夥伴唯讀視圖"
		],
		outputs: [
			"可安裝 PWA",
			"場佈／動線／地墊／工作分區／物資清單圖",
			"印刷品同時帶公尺與公釐尺寸"
		],
		stack: [
			"Vite",
			"TypeScript",
			"Three.js",
			"PWA",
			"localStorage / IndexedDB"
		],
		limitations: [
			"不做容留人數或避難寬度法定計算。",
			"不上架 App Store。",
			"本工具是場前彩排，不是現場指揮系統。"
		],
		links: { github: "https://github.com/aa0968111723-prog/planform-iso" },
		media: [{
			src: "/media/covers/planform.jpg",
			alt: "PLANFORM 視覺：等角教室模型、地墊與薄荷色動線",
			kind: "image",
			caption: vis
		}],
		sourceReferences: [{
			label: "GitHub README · planform-iso",
			href: "https://github.com/aa0968111723-prog/planform-iso",
			note: "產品原則與限制取自公開 README。"
		}],
		visibility: "public"
	},
	{
		slug: "duigao",
		title: "對稿",
		subtitle: "社團活動文宣討論區",
		category: "Interaction",
		year: "2026",
		status: "in-progress",
		featured: true,
		summary: "把做好的海報變成一條連結。夥伴不改原稿，只在畫面上指出哪裡要調。海報是主畫面，討論比編輯更快。",
		problem: "文宣修改散落在 LINE 群組，對不到位置、對不到版本。需要手機優先、點位置就能說一句話的對稿。",
		role: "互動設計與產品建構：手機工作區、版本切換、邀請權限與分享預覽。",
		decisions: [
			"看稿永遠是乾淨原稿，註記是覆蓋層。",
			"分享連結用 #room + invite 高熵秘密；資料庫只存雜湊。",
			"前端只放 publishable key，不放 service role。",
			"雲端房間建立失敗時直接說暫時無法分享，不退回「看起來成功但其實要主辦方開著頁面」的連結。"
		],
		modalities: [
			"圖像",
			"影片時間點",
			"註記",
			"LINE 分享"
		],
		process: [
			"上傳文宣版本",
			"點位置或圈範圍留意見",
			"待修改／已完成",
			"可選視覺提案層",
			"複製連結傳到 LINE"
		],
		outputs: [
			"手機與桌機同一套狀態、不同外殼",
			"彩色／黑白／對切比較",
			"Open Graph 分享卡由 Edge Function 組裝，invite 留在瀏覽器 fragment"
		],
		stack: [
			"Vite",
			"React",
			"TypeScript",
			"Supabase",
			"PWA"
		],
		limitations: [
			"影片單次上傳、無續傳；上限刻意保守。",
			"HEVC 的 .mov 在部分瀏覽器播不出，會說明而不是給黑畫面。",
			"本作品集不會讀取對稿的私人資料表或 token。"
		],
		links: { github: "https://github.com/aa0968111723-prog/duigao" },
		media: [{
			src: "/media/covers/duigao.jpg",
			alt: "對稿視覺：玻璃桌上的海報與薄荷色註記圖釘",
			kind: "image",
			caption: vis
		}],
		sourceReferences: [{
			label: "GitHub README · duigao",
			href: "https://github.com/aa0968111723-prog/duigao",
			note: "權限模型與雲端層取自 README。"
		}],
		visibility: "public"
	},
	{
		slug: "folio",
		title: "Folio",
		subtitle: "專精設計編輯器，可內嵌、可給代理操作",
		category: "Creative Tool",
		year: "2026",
		status: "in-progress",
		featured: true,
		summary: "畫布、快捷鍵、外部網站橋接、MCP server 與 client 走同一套 typed command layer，沒有第二份文件模型。",
		problem: "海報、社群、投影片與 UI 草稿需要專精編輯器，而且要讓代理用同一套指令操作，而不是另做一套自動化 API。",
		role: "創意工具設計：指令層、設計檢查、發布／內嵌與 MCP 安全邊界。",
		decisions: [
			"未安裝 SDK 的跨來源網站只提供 Live iframe 或 Snapshot，不假裝讀 DOM。",
			"MCP 寫入預設 dry-run，未發布文件不會出現在公開 /mcp/$id。",
			"密鑰只留伺服器；SSRF 拒絕內網、本機與 metadata。",
			"本產品預設不開帳號，編輯稿在裝置 IndexedDB。"
		],
		modalities: [
			"畫布",
			"設計 token",
			"嵌入",
			"MCP"
		],
		process: [
			"在畫布建立文字／形狀／元件",
			"設計檢查（對比、溢出、安全區）",
			"可選匯入外部網站三種模式",
			"發布後取得 embed 與 MCP"
		],
		outputs: [
			"公開儲存庫 canva2（Folio 編輯器）",
			"folio-design-bridge v1 SDK",
			"單元與 golden-path 測試紀錄寫在 README（此處不另報使用量）"
		],
		stack: [
			"TypeScript",
			"MCP",
			"IndexedDB",
			"PGLite / Postgres"
		],
		limitations: [
			"沒有獨立點陣圖片物件型別，圖片以 pixel layer 或 Snapshot 存在。",
			"寫入 token 不會自動過期，需重新發布才輪替。",
			"外部 MCP 連線在單一 Node 行程記憶體，多實例不共享。"
		],
		links: { github: "https://github.com/aa0968111723-prog/canva2" },
		media: [{
			src: "/media/covers/folio.jpg",
			alt: "Folio 視覺：明亮畫板上的幾何色塊與玻璃屬性面板",
			kind: "image",
			caption: vis
		}],
		sourceReferences: [{
			label: "GitHub README · canva2 / Folio",
			href: "https://github.com/aa0968111723-prog/canva2",
			note: "完成功能與限制取自公開 README。"
		}],
		visibility: "public"
	},
	{
		slug: "hermes-console",
		title: "Hermes Console",
		subtitle: "明亮的單一創作情報工作區",
		category: "AI Product",
		year: "2026",
		status: "in-progress",
		featured: true,
		summary: "打開即可使用，不登入、不輸入電子信箱。Hermes 執行工具；Console 保存會話、任務、活動與文案版本，並可接 Lumen、FrameLab、對稿的 MCP。",
		problem: "代理、專案目錄與工具入口分散。需要一個明亮工作區，讓聊天、任務與 MCP 連線待在同一處，且秘密不進瀏覽器。",
		role: "AI 產品與控制台設計：免登入工作區、連線探測、工具入口。",
		decisions: [
			"首頁直接進工作區；寫入仍驗證 Origin 與限流。",
			"未設定 HERMES_API_URL 時仍應開啟，並顯示尚未連線。",
			"GitHub 倉庫網址不是 MCP。連線頁填真實 HTTPS endpoint 與 token 後才探測。",
			"後端拒絕瀏覽器傳入的服務網址或金鑰。"
		],
		modalities: [
			"對話",
			"任務",
			"MCP 工具"
		],
		process: [
			"開啟工作區",
			"設定 Hermes 連線（可選）",
			"探測 Lumen / FrameLab / 對稿 MCP",
			"把海報、動畫、對稿意圖交給對應工具"
		],
		outputs: ["公開儲存庫 hermes-console", "工作區 API 與就緒檢查"],
		stack: [
			"TypeScript",
			"Node",
			"SQLite / Postgres",
			"MCP"
		],
		limitations: [
			"需要持久化磁碟與長駐 Node，不適用無狀態 serverless。",
			"契約測試不是第三方服務的實機驗證。",
			"此頁不展示任何金鑰、邀請碼或內部控制台截圖中的秘密。"
		],
		links: { github: "https://github.com/aa0968111723-prog/hermes-console" },
		media: [{
			src: "/media/covers/hermes-console.jpg",
			alt: "Hermes Console 視覺：明亮工作區、對話欄與漂浮專案卡片",
			kind: "image",
			caption: vis
		}],
		sourceReferences: [{
			label: "GitHub README · hermes-console",
			href: "https://github.com/aa0968111723-prog/hermes-console",
			note: "產品不變量取自 README。"
		}],
		visibility: "public"
	},
	{
		slug: "tku-zen-ai",
		title: "TKU Zen AI",
		subtitle: "給忙碌心智的本地禪意陪伴",
		category: "Real-world Experience",
		year: "2026",
		status: "prototype",
		featured: true,
		summary: "小型對話介面，回覆帶意圖、訊息與呼吸提示。所謂 AI 是本地、可重現的回應引擎，不需要 API key，也不把雲端模型假扮成已接上。",
		problem: "校園現場需要一個可立即使用的平靜對話入口，但不能把社團資料或個資送進外部模型。",
		role: "真實場域體驗設計：語氣、呼吸提示與完全本地的回應邊界。",
		decisions: [
			"回應引擎寫在 src/lib/zen.ts，同輸入同輸出。",
			"全程無網路呼叫。",
			"只展示公開產品行為，不放社團名冊或測試帳號。"
		],
		modalities: ["文字", "呼吸提示"],
		process: [
			"輸入一句心情",
			"對應意圖",
			"回覆訊息與呼吸",
			"可重測"
		],
		outputs: ["Next.js 應用與 /api/chat", "單元測試覆蓋回應引擎"],
		stack: [
			"Next.js",
			"React",
			"TypeScript",
			"Tailwind",
			"Vitest"
		],
		limitations: ["不是大型語言模型，不會假裝有長期記憶或多輪推理。", "與 tku-zen-agent（社團文書代理，私有）不是同一個產品，本頁只展示公開的 tku-zen-ai。"],
		links: { github: "https://github.com/aa0968111723-prog/tku-zen-ai" },
		media: [{
			src: "/media/covers/tku-zen-ai.jpg",
			alt: "TKU Zen AI 視覺：晨光庭園、紙燈與呼吸圓",
			kind: "image",
			caption: vis
		}],
		sourceReferences: [{
			label: "GitHub README · tku-zen-ai",
			href: "https://github.com/aa0968111723-prog/tku-zen-ai",
			note: "本地引擎說明取自 README。"
		}],
		visibility: "public"
	}
];
var workCategories = [
	"All",
	"AI Product",
	"Multimodal",
	"Interaction",
	"Visual AI",
	"Spatial Design",
	"Creative Tool",
	"Real-world Experience"
];
function getProject(slug) {
	return projects.find((p) => p.slug === slug);
}
function featuredProjects() {
	return projects.filter((p) => p.featured);
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-D55OF8cm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
function NotFoundView() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-mint-deep",
				children: "找不到這一頁"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl font-semibold",
				children: "這頁還沒被放進光域"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: "連結可能打錯，或內容還在下一輪。回到首頁或作品總覽。"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-wrap justify-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground",
					children: "首頁"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/work",
					className: "inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm font-medium shadow-card",
					children: "作品"
				})]
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var site = {
	nameZh: "柏能 · 光域工作室",
	nameEn: "Luminous Studio",
	person: "陳柏能 / Bruce Chen",
	role: "AI Designer · Multimodal Design Creator · AI Product Builder",
	headline: "把 AI、設計與多模態創作，轉化成可使用的體驗。",
	subhead: "Designing bright, usable experiences with AI and multimodal creativity.",
	narrative: "我把 AI、設計、影像、動畫、3D、互動與真實工作流程，轉化成看得懂、用得上的數位體驗。",
	email: "aa0968111723@gmail.com",
	github: "https://github.com/aa0968111723-prog",
	githubHandle: "aa0968111723-prog",
	location: "Taipei"
};
var processSteps = [
	{
		n: "01",
		title: "釐清真實問題",
		body: "先對現場：社團文宣、教室場佈、逐幀動畫或協作審稿，而不是先選模型。"
	},
	{
		n: "02",
		title: "編排多模態",
		body: "文字、圖像、影片、聲音、3D 與互動各自負責什麼，先畫清楚再進工具。"
	},
	{
		n: "03",
		title: "讓 AI 做它能驗證的事",
		body: "像素運算、結構化解析、MCP 工具、生成候選。模型沒接上就標示不可用，不給假分數。"
	},
	{
		n: "04",
		title: "回到現場驗證",
		body: "手機、教室、LINE 分享、夥伴是否 10 秒看懂。能用才算完成，不是畫面好看。"
	}
];
var modalities = [
	{
		label: "文字",
		note: "腳本、對稿意見、指令層、結構化提示"
	},
	{
		label: "圖像",
		note: "海報、文宣、畫布、熱圖與構圖分析"
	},
	{
		label: "影片",
		note: "分鏡、逐幀、時間軸、對稿時間座標"
	},
	{
		label: "聲音",
		note: "多模態生成鏈中的音訊節點，不假裝已完成配樂產品"
	},
	{
		label: "3D / 空間",
		note: "等角場佈、教室尺度、動線與碰撞"
	},
	{
		label: "互動",
		note: "社博遊戲、手機工作區、MCP 代理操作"
	}
];
var nav = [
	{
		to: "/",
		label: "首頁"
	},
	{
		to: "/work",
		label: "作品"
	},
	{
		to: "/archive",
		label: "Archive"
	},
	{
		to: "/about",
		label: "關於"
	}
];
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t border-line/80 bg-surface-blue/50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg font-semibold",
					children: site.nameZh
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xs text-sm text-muted",
					children: site.narrative
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold text-ink",
					children: "導覽"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2",
					children: nav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						className: "text-sm text-muted hover:text-mint-deep",
						children: item.label
					}) }, item.to))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-ink",
						children: "公開聯絡"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `mailto:${site.email}`,
						className: "mt-3 block break-all text-sm text-muted hover:text-mint-deep",
						children: site.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: site.github,
						className: "mt-2 block text-sm text-muted hover:text-mint-deep",
						rel: "noreferrer",
						target: "_blank",
						children: ["github.com/", site.githubHandle]
					})
				] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "border-t border-line/70 py-5 text-center text-xs text-muted",
			children: [
				"© ",
				(/* @__PURE__ */ new Date()).getFullYear(),
				" ",
				site.person,
				". 亮色光域 · 不作深色模式。"
			]
		})]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function SiteHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex min-h-11 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-8 place-items-center rounded-lg bg-surface-mint shadow-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 rounded-full bg-mint" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-base font-semibold tracking-tight text-ink",
						children: site.nameZh
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "hidden items-center gap-1 md:flex",
					"aria-label": "主要",
					children: [nav.map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							className: cn("inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-medium transition-colors duration-150", active ? "bg-surface-mint text-mint-deep" : "text-muted hover:bg-surface-blue hover:text-ink"),
							children: item.label
						}, item.to);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: site.github,
						className: "inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-medium text-muted hover:bg-surface-blue hover:text-ink",
						rel: "noreferrer",
						target: "_blank",
						children: "GitHub"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex size-11 items-center justify-center rounded-xl text-ink md:hidden",
					"aria-expanded": open,
					"aria-controls": "mobile-nav",
					onClick: () => setOpen((v) => !v),
					children: [open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: open ? "關閉選單" : "開啟選單"
					})]
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			id: "mobile-nav",
			className: "border-t border-line/70 bg-bg px-4 py-3 md:hidden",
			"aria-label": "行動",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "flex flex-col gap-1",
				children: [nav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: item.to,
					className: "flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink hover:bg-surface-blue",
					onClick: () => setOpen(false),
					children: item.label
				}) }, item.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: site.github,
					className: "flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink hover:bg-surface-blue",
					rel: "noreferrer",
					target: "_blank",
					children: "GitHub"
				}) })]
			})
		}) : null]
	});
}
function SiteShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#content",
				className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2",
				children: "跳到內容"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				id: "content",
				className: "flex-1",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
var styles_default = "/assets/styles-0sfiyIuj.css";
var APP_NAME = "Luminous Studio · 柏能";
var Route$6 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "把 AI、設計與多模態創作，轉化成可使用的體驗。陳柏能的光域 AI 創作實驗室。"
			},
			{
				name: "theme-color",
				content: "#F7FBFF"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Noto+Sans+TC:wght@400;500;600;700&family=Noto+Serif+TC:wght@600;700&display=swap"
			}
		]
	}),
	notFoundComponent: NotFoundView,
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "zh-Hant",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-bg text-ink",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$4 = () => import("./routes-D9aKPiLP.mjs");
var Route$5 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("../_-Cik_CxHo.mjs");
var Route$4 = createFileRoute("/$")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var Route$3 = createFileRoute("/about")({ component: About });
var beliefs = [
	"人的意圖是起點，AI 是可驗證的加速器，不是自動完成的導演。",
	"沒接上的模型要寫「不可用」，不要給假分數或假成效。",
	"跨媒介經驗要能回到現場：教室、LINE、手機、社團文宣。",
	"作品集只放整理過的公開敘事。"
];
var publicWork = [
	"AI 產品與創作作業系統",
	"逐幀動畫與視覺 AI 工具",
	"空間場佈與 3D 彩排",
	"文宣對稿與設計編輯器",
	"校園現場互動體驗",
	"平面、攝影與活動紀錄（Archive）"
];
function About() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "bg-surface-blue/50",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-3xl px-4 py-16 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-mint-deep",
					children: site.nameEn
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-4xl font-semibold sm:text-5xl",
					children: "關於我"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-lg text-muted",
					children: [
						"我是",
						site.person,
						"，",
						site.role,
						"。"
					]
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto w-full max-w-3xl space-y-10 px-4 py-14 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-semibold",
					children: "公開定位"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 leading-relaxed text-ink/85",
					children: site.narrative
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 leading-relaxed text-muted",
					children: "目標觀眾是 AI 產品團隊、設計主管、多模態創作者與合作夥伴。這個網站要讓人快速看出我正在做什麼、解決什麼、AI 扮演什麼角色，以及作品能不能被使用。"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-semibold",
				children: "為什麼這樣做"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 leading-relaxed text-muted",
				children: "從活動現場、平面與攝影走到 AI 產品，問題從來不是「會不會生成」，而是如何把文字、圖像、影片、聲音、3D 與互動編成一條別人真的走得完的工作流。"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-semibold",
				children: "核心信念"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-3",
				children: beliefs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-2xl bg-surface px-4 py-3 text-sm leading-relaxed shadow-card",
					children: item
				}, item))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-semibold",
				children: "公開工作面向"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2",
				children: publicWork.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-xl bg-surface-mint/70 px-4 py-3 text-sm",
					children: item
				}, item))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl bg-surface p-6 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-semibold",
						children: "聯絡"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "只提供已公開的 GitHub 與 Email。不會在這裡放電話、住址或內部社團資料。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `mailto:${site.email}`,
								className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), "寄信"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: site.github,
								className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg",
								rel: "noreferrer",
								target: "_blank",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { className: "size-4" }), "GitHub"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/work",
								className: "inline-flex min-h-11 items-center rounded-full bg-surface-blue px-5 text-sm font-medium",
								children: "看作品"
							})
						]
					})
				]
			})
		]
	})] });
}
var $$splitComponentImporter$2 = () => import("./archive-BntdYs3o.mjs");
var Route$2 = createFileRoute("/archive")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./work-CCtTYUy7.mjs");
var Route$1 = createFileRoute("/work/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("../_slug-D5AEh347.mjs");
var $$splitNotFoundComponentImporter = () => import("../_slug-DOwE0czW.mjs");
var Route = createFileRoute("/work/$slug")({
	loader: ({ params }) => {
		const project = getProject(params.slug);
		if (!project) throw notFound();
		return project;
	},
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$6
});
var SplatRoute = Route$4.update({
	id: "/$",
	path: "/$",
	getParentRoute: () => Route$6
});
var AboutRoute = Route$3.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$6
});
var ArchiveRoute = Route$2.update({
	id: "/archive",
	path: "/archive",
	getParentRoute: () => Route$6
});
var WorkIndexRoute = Route$1.update({
	id: "/work/",
	path: "/work/",
	getParentRoute: () => Route$6
});
var rootRouteChildren = {
	IndexRoute,
	SplatRoute,
	AboutRoute,
	ArchiveRoute,
	WorkSlugRoute: Route.update({
		id: "/work/$slug",
		path: "/work/$slug",
		getParentRoute: () => Route$6
	}),
	WorkIndexRoute
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent,
		defaultNotFoundComponent: NotFoundView
	});
}
//#endregion
export { processSteps as a, featuredProjects as c, workCategories as d, modalities as i, projects as l, Route as n, site as o, cn as r, NotFoundView as s, router_exports as t, statusLabel as u };
