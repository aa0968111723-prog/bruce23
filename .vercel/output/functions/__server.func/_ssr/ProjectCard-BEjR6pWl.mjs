import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { t as MediaFrame } from "./MediaFrame-NA5Zpa73.mjs";
import { t as StatusBadge } from "./StatusBadge-A6Uyf9GO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ProjectCard-BEjR6pWl.js
var import_jsx_runtime = require_jsx_runtime();
function ProjectCard({ project, featured = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/work/$slug",
		params: { slug: project.slug },
		className: "group block rounded-2xl p-1.5 shadow-card transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-float focus-visible:outline-offset-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "overflow-hidden rounded-[1.15rem] bg-surface",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: featured ? "relative aspect-[4/3] overflow-hidden bg-surface-blue" : "relative aspect-[16/10] overflow-hidden bg-surface-blue",
				children: project.media[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaFrame, {
					media: project.media[0],
					className: "h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
				}) : null
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium tracking-wide text-muted",
							children: project.category
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: project.status })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl font-semibold text-ink",
						children: project.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: project.subtitle
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "line-clamp-3 text-sm leading-relaxed text-ink/80",
						children: project.summary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 text-sm font-medium text-mint-deep",
						children: ["看個案", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4 transition-transform duration-150 group-hover:translate-x-0.5" })]
					})
				]
			})]
		})
	});
}
//#endregion
export { ProjectCard as t };
