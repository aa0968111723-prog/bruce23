import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as workCategories, l as projects, r as cn } from "./router-D55OF8cm.mjs";
import { t as ProjectCard } from "./ProjectCard-BEjR6pWl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/work-CCtTYUy7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WorkIndex() {
	const [category, setCategory] = (0, import_react.useState)("All");
	const visible = (0, import_react.useMemo)(() => category === "All" ? projects : projects.filter((p) => p.category === category), [category]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-6xl px-4 py-14 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl font-semibold",
				children: "作品總覽"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-muted",
				children: "依 GitHub 真實儲存庫挑選。分類可篩選，狀態沒有寫成已完成的，就還不是已完成。"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 flex gap-2 overflow-x-auto pb-2",
				role: "tablist",
				"aria-label": "作品分類",
				children: workCategories.map((item) => {
					const active = item === category;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						role: "tab",
						"aria-selected": active,
						className: cn("inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-150", active ? "bg-ink text-bg" : "bg-surface text-muted shadow-card hover:text-ink"),
						onClick: () => setCategory(item),
						children: item === "All" ? "全部" : item
					}, item);
				})
			}),
			visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-12 text-sm text-muted",
				children: "這個分類目前沒有公開作品。"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
				children: visible.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, { project }, project.slug))
			})
		]
	});
}
//#endregion
export { WorkIndex as component };
